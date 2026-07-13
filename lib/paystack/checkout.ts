import { createHash } from 'node:crypto';
import { getServerAuthSession } from '@/lib/auth/session';
import { convertFromNgn, getSupportedCurrency, toMinorUnits } from '@/lib/currency-config';
import type { CheckoutSchema } from '@/lib/schemas';
import { getCart, removeCartItem } from '@/lib/woocommerce/cart';
import {
  createPendingOrder,
  getOrderById,
  getOrderMetaValue,
  mergeOrderMetaData,
  paymentCompleteOrder,
  updateOrder,
  type WooOrder,
  type WooOrderMetaData,
} from '@/lib/woocommerce/orders';
import { getProductBySlug } from '@/lib/woocommerce/products';
import { getPaystackEnv } from './env';
import {
  initializeTransaction,
  verifyTransaction,
  type PaystackVerifyResponse,
} from './client';

export const DIRECT_PAYSTACK_PAYMENT_METHOD_ID = 'fabtops_paystack_direct';
export const DIRECT_PAYSTACK_PAYMENT_METHOD_TITLE = 'Paystack (FabTops)';
export const CART_TOKEN_COOKIE = 'woocommerce_cart_token';

const META_KEYS = {
  provider: 'fabtops_payment_provider',
  source: 'fabtops_checkout_source',
  state: 'fabtops_payment_state',
  selectedCurrency: 'fabtops_selected_currency',
  reference: 'fabtops_paystack_reference',
  amountMinor: 'fabtops_paystack_amount_minor',
  orderBaseAmountMinor: 'fabtops_order_amount_minor',
  orderBaseCurrency: 'fabtops_order_currency',
  orderKey: 'fabtops_order_key',
  cartTokenHash: 'fabtops_cart_token_hash',
  customerEmail: 'fabtops_customer_email',
  sessionUserId: 'fabtops_session_user_id',
  exchangeRate: 'fabtops_paystack_exchange_rate',
  paidAt: 'fabtops_paystack_paid_at',
  gatewayResponse: 'fabtops_paystack_gateway_response',
} as const;

type CheckoutStage =
  | 'session-load'
  | 'cart-load'
  | 'cart-validation'
  | 'totals-calculation'
  | 'woo-order-create'
  | 'paystack-initialize'
  | 'metadata-persist';

class CheckoutPreparationError extends Error {
  constructor(
    message: string,
    public readonly stage: CheckoutStage,
    public readonly status?: number,
    public readonly responseBody?: unknown,
    public readonly originalErrorName?: string,
  ) {
    super(message);
    this.name = originalErrorName || 'CheckoutPreparationError';
  }
}

export interface PreparedPaystackCheckout {
  orderId: number;
  reference: string;
  authorizationUrl: string;
}

export interface PaystackVerificationResult {
  orderId: number;
  orderNumber: string;
  status: string;
  reference: string;
  amountMinor: number;
  currency: string;
  redirectUrl: string;
}

function parseAmount(value: string | number | undefined) {
  const amount = typeof value === 'number' ? value : Number.parseFloat(value || '0');
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeCurrencyCode(code: string | undefined) {
  return (code || 'NGN').trim().toUpperCase();
}

function selectedShippingRate(cart: Awaited<ReturnType<typeof getCart>>['cart']) {
  const firstPackage = cart.shippingRates?.[0];
  const rate = firstPackage?.shipping_rates?.find((entry) => entry.selected) || firstPackage?.shipping_rates?.[0];

  return {
    package: firstPackage || null,
    rate: rate || null,
  };
}

function hashCartToken(cartToken: string) {
  return createHash('sha256').update(cartToken).digest('hex');
}

function normalizeCouponCodes(codes: string[]) {
  return codes.map((code) => code.trim().toUpperCase()).filter(Boolean).sort();
}

function normalizeOptionValue(value: string) {
  return value.trim().toLowerCase();
}

function normalizeOptionName(value: string) {
  return value.trim().replace(/^pa_/i, '').replace(/[-_]+/g, ' ').toLowerCase();
}

function parseWooCustomerId(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function toStageError(stage: CheckoutStage, error: unknown, fallbackMessage: string) {
  if (error instanceof CheckoutPreparationError) {
    return error;
  }

  const message =
    error instanceof Error && error.message.trim()
      ? error.message
      : fallbackMessage;
  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status?: unknown }).status === 'number'
      ? (error as { status: number }).status
      : undefined;
  const responseBody =
    typeof error === 'object' &&
    error !== null &&
    'responseBody' in error
      ? (error as { responseBody?: unknown }).responseBody
      : undefined;

  return new CheckoutPreparationError(
    message,
    stage,
    status,
    responseBody,
    error instanceof Error ? error.name : typeof error,
  );
}

function assertCartReadyForPayment(
  cart: Awaited<ReturnType<typeof getCart>>['cart'],
  input: CheckoutSchema,
  selectedCurrencyCode: string,
) {
  if (input.payment_method.trim().toLowerCase() !== 'paystack') {
    throw new Error('PAYMENT_METHOD_UNSUPPORTED');
  }

  if (!cart.items.length) {
    throw new Error('CART_EMPTY');
  }

  if (cart.totalAmount <= 0) {
    throw new Error('CART_TOTAL_INVALID');
  }

  const currency = getSupportedCurrency(selectedCurrencyCode);
  if (!currency) {
    throw new Error('UNSUPPORTED_CURRENCY');
  }

  if (!currency.paystackSupported) {
    throw new Error('PAYSTACK_UNSUPPORTED_CURRENCY');
  }

  const expectedCoupons = normalizeCouponCodes(input.coupon_codes || []);
  const actualCoupons = normalizeCouponCodes(cart.discountCodes.map((coupon) => coupon.code));
  if (
    expectedCoupons.length > 0 &&
    (expectedCoupons.length !== actualCoupons.length ||
      expectedCoupons.some((code, index) => code !== actualCoupons[index]))
  ) {
    throw new Error('COUPON_STATE_MISMATCH');
  }

  if (cart.needsShipping) {
    const { package: shippingPackage, rate } = selectedShippingRate(cart);
    if (!rate || !shippingPackage) {
      throw new Error('SHIPPING_METHOD_REQUIRED');
    }

    if (
      input.selected_shipping_rate &&
      (input.selected_shipping_rate.package_id !== shippingPackage.package_id ||
        input.selected_shipping_rate.rate_id !== rate.rate_id)
    ) {
      throw new Error('SHIPPING_RATE_MISMATCH');
    }
  }

  return currency;
}

function amountForCurrency(order: WooOrder, selectedCurrencyCode: string) {
  const baseAmount = parseAmount(order.total);
  const baseCurrency = normalizeCurrencyCode(order.currency);

  if (selectedCurrencyCode === baseCurrency) {
    return {
      amount: Number(baseAmount.toFixed(2)),
      baseAmount,
      baseCurrency,
      exchangeRate: 1,
    };
  }

  if (baseCurrency !== 'NGN') {
    throw new Error('ORDER_BASE_CURRENCY_UNSUPPORTED');
  }

  const selectedCurrency = getSupportedCurrency(selectedCurrencyCode);
  if (!selectedCurrency) {
    throw new Error('UNSUPPORTED_CURRENCY');
  }

  return {
    amount: convertFromNgn(baseAmount, selectedCurrencyCode),
    baseAmount,
    baseCurrency,
    exchangeRate: selectedCurrency.rate,
  };
}

function buildReference(orderId: number) {
  return `fabtops_${orderId}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

function numericMeta(metaData: WooOrderMetaData[] | undefined, key: string) {
  const value = getOrderMetaValue(metaData, key);
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringMeta(metaData: WooOrderMetaData[] | undefined, key: string) {
  const value = getOrderMetaValue(metaData, key);
  return typeof value === 'string' && value.trim() ? value : null;
}

function metadataOrderId(metadata: Record<string, unknown> | undefined) {
  const value = metadata?.woo_order_id;
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) ? parsed : null;
  }

  return null;
}

async function markOrderFailed(order: WooOrder, reason: string) {
  await updateOrder(order.id, {
    status: 'failed',
    meta_data: mergeOrderMetaData(order.meta_data, [
      { key: META_KEYS.state, value: 'failed' },
      { key: META_KEYS.gatewayResponse, value: reason },
    ]),
  });
}

async function finalizeSuccessfulVerification(
  order: WooOrder,
  verification: PaystackVerifyResponse['data'],
) {
  const completedOrder = await paymentCompleteOrder(order.id, {
    transaction_id: verification.reference,
    meta_data: mergeOrderMetaData(order.meta_data, [
      { key: META_KEYS.reference, value: verification.reference },
      { key: META_KEYS.gatewayResponse, value: verification.gateway_response || 'success' },
    ]),
  });

  const updated = await updateOrder(order.id, {
    transaction_id: verification.reference,
    meta_data: mergeOrderMetaData(completedOrder.meta_data || order.meta_data, [
      { key: META_KEYS.state, value: 'verified' },
      { key: META_KEYS.reference, value: verification.reference },
      { key: META_KEYS.paidAt, value: verification.paid_at || new Date().toISOString() },
      { key: META_KEYS.gatewayResponse, value: verification.gateway_response || 'success' },
    ]),
  });

  return {
    orderId: updated.id,
    orderNumber: updated.number,
    status: updated.status,
    reference: verification.reference,
    amountMinor: verification.amount,
    currency: normalizeCurrencyCode(verification.currency),
    redirectUrl: `/checkout/success?reference=${encodeURIComponent(verification.reference)}&order=${updated.id}`,
  } satisfies PaystackVerificationResult;
}

async function resolveOrderLineItems(cart: Awaited<ReturnType<typeof getCart>>['cart']) {
  const lineItems: Array<{
    product_id: number;
    variation_id?: number;
    quantity: number;
  }> = [];

  for (const item of cart.items) {
    const product = await getProductBySlug(item.handle);

    if (!product) {
      throw new Error(`PRODUCT_NOT_FOUND:${item.handle}`);
    }

    const productId = Number.parseInt(product.id, 10);
    if (!Number.isInteger(productId)) {
      throw new Error(`PRODUCT_ID_INVALID:${item.handle}`);
    }

    const hasSelectedOptions = item.selectedOptions.length > 0;
    if (!hasSelectedOptions) {
      lineItems.push({
        product_id: productId,
        quantity: item.quantity,
      });
      continue;
    }

    const variation = product.variations?.find((candidate) => (
      candidate.selectedOptions.length === item.selectedOptions.length &&
      candidate.selectedOptions.every((option) => (
        item.selectedOptions.some((selected) => (
          normalizeOptionName(selected.name) === normalizeOptionName(option.name) &&
          normalizeOptionValue(selected.value) === normalizeOptionValue(option.value)
        ))
      ))
    ));

    if (!variation) {
      throw new Error(`PRODUCT_VARIATION_MISMATCH:${item.handle}`);
    }

    const variationId = Number.parseInt(variation.id, 10);
    if (!Number.isInteger(variationId)) {
      throw new Error(`VARIATION_ID_INVALID:${item.handle}`);
    }

    lineItems.push({
      product_id: productId,
      variation_id: variationId,
      quantity: item.quantity,
    });
  }

  return lineItems;
}

async function loadSessionUser() {
  try {
    const session = await getServerAuthSession();
    return session?.user || null;
  } catch (error) {
    console.warn('Checkout session load failed; continuing as guest', {
      stage: 'session-load',
      message: error instanceof Error ? error.message : 'Unknown session error',
      errorName: error instanceof Error ? error.name : typeof error,
    });
    return null;
  }
}

export async function preparePaystackCheckout(
  cartToken: string,
  input: CheckoutSchema,
  bearerToken?: string | null,
) {
  const sessionUser = await loadSessionUser();
  const selectedCurrencyCode = normalizeCurrencyCode(input.selected_currency);

  const cartResult = await getCart(cartToken, bearerToken).catch((error) => {
    throw toStageError('cart-load', error, 'CART_LOAD_FAILED');
  });
  const activeCartToken = cartResult.cartToken || cartToken;
  const cart = cartResult.cart;

  const currency = (() => {
    try {
      return assertCartReadyForPayment(cart, input, selectedCurrencyCode);
    } catch (error) {
      throw toStageError('cart-validation', error, 'CART_VALIDATION_FAILED');
    }
  })();

  const lineItems = await resolveOrderLineItems(cart).catch((error) => {
    throw toStageError('totals-calculation', error, 'ORDER_LINE_RESOLUTION_FAILED');
  });

  const { rate } = selectedShippingRate(cart);
  const customerId = parseWooCustomerId((sessionUser as { wooCustomerId?: string | null } | null)?.wooCustomerId);

  const createdOrder = await createPendingOrder({
    status: 'pending',
    set_paid: false,
    payment_method: DIRECT_PAYSTACK_PAYMENT_METHOD_ID,
    payment_method_title: DIRECT_PAYSTACK_PAYMENT_METHOD_TITLE,
    customer_id: customerId,
    currency: normalizeCurrencyCode(cart.currencyCode),
    customer_note: input.customer_note?.trim() || undefined,
    billing: {
      ...input.billing_address,
    },
    shipping: {
      ...input.shipping_address,
    },
    line_items: lineItems,
    shipping_lines: rate
      ? [{
          method_id: rate.method_id,
          method_title: rate.name,
          total: Number.parseFloat(rate.price || '0') > 0
            ? (Number.parseFloat(rate.price || '0') / (10 ** rate.currency_minor_unit)).toFixed(rate.currency_minor_unit)
            : '0.00',
        }]
      : undefined,
    coupon_lines: cart.discountCodes.length
      ? cart.discountCodes.map((coupon) => ({ code: coupon.code }))
      : undefined,
    meta_data: [
      { key: META_KEYS.provider, value: 'paystack_direct' },
      { key: META_KEYS.source, value: 'nextjs_checkout' },
      { key: META_KEYS.state, value: 'pending_payment' },
      { key: META_KEYS.selectedCurrency, value: currency.code },
      { key: META_KEYS.cartTokenHash, value: hashCartToken(activeCartToken) },
      { key: META_KEYS.customerEmail, value: input.billing_address.email },
      ...(sessionUser?.id ? [{ key: META_KEYS.sessionUserId, value: sessionUser.id }] : []),
    ],
  }).catch((error) => {
    throw toStageError('woo-order-create', error, 'WOO_ORDER_CREATE_FAILED');
  });

  const amountInfo = (() => {
    try {
      return amountForCurrency(createdOrder, currency.code);
    } catch (error) {
      throw toStageError('totals-calculation', error, 'PAYMENT_AMOUNT_CALCULATION_FAILED');
    }
  })();

  const amountMinor = toMinorUnits(amountInfo.amount, currency.code);
  const orderBaseAmountMinor = toMinorUnits(amountInfo.baseAmount, amountInfo.baseCurrency);
  const reference = buildReference(createdOrder.id);
  const env = getPaystackEnv();

  const initialization = await initializeTransaction({
    email: input.billing_address.email,
    amount: amountMinor,
    currency: currency.code,
    reference,
    callback_url: `${env.siteUrl}/checkout/success?reference=${encodeURIComponent(reference)}&order=${createdOrder.id}`,
    metadata: {
      woo_order_id: createdOrder.id,
      woo_order_key: createdOrder.order_key || '',
      customer_email: input.billing_address.email,
      selected_currency: currency.code,
      payment_provider: 'paystack_direct',
      cart_token_hash: hashCartToken(activeCartToken),
    },
  }).catch((error) => {
    throw toStageError('paystack-initialize', error, 'PAYSTACK_INITIALIZATION_FAILED');
  });

  await updateOrder(createdOrder.id, {
    meta_data: mergeOrderMetaData(createdOrder.meta_data, [
      { key: META_KEYS.reference, value: reference },
      { key: META_KEYS.amountMinor, value: amountMinor },
      { key: META_KEYS.orderBaseAmountMinor, value: orderBaseAmountMinor },
      { key: META_KEYS.orderBaseCurrency, value: amountInfo.baseCurrency },
      { key: META_KEYS.orderKey, value: createdOrder.order_key || '' },
      { key: META_KEYS.exchangeRate, value: amountInfo.exchangeRate },
      { key: META_KEYS.state, value: 'initialized' },
    ]),
  }).catch((error) => {
    throw toStageError('metadata-persist', error, 'ORDER_METADATA_PERSIST_FAILED');
  });

  return {
    checkout: {
      orderId: createdOrder.id,
      reference,
      authorizationUrl: initialization.data.authorization_url,
    } satisfies PreparedPaystackCheckout,
    cartToken: activeCartToken,
  };
}

export async function verifyPaystackPayment(reference: string) {
  const verification = await verifyTransaction(reference);
  const metadata = verification.data.metadata && typeof verification.data.metadata === 'object'
    ? verification.data.metadata
    : undefined;
  const orderId = metadataOrderId(metadata);

  if (!orderId) {
    throw new Error('PAYSTACK_WOO_ORDER_MISSING');
  }

  const order = await getOrderById(orderId);
  const expectedReference = stringMeta(order.meta_data, META_KEYS.reference);
  const expectedCurrency = stringMeta(order.meta_data, META_KEYS.selectedCurrency);
  const expectedAmountMinor = numericMeta(order.meta_data, META_KEYS.amountMinor);
  const paymentState = stringMeta(order.meta_data, META_KEYS.state);

  if (paymentState === 'verified' && expectedReference === reference) {
    return {
      result: {
        orderId: order.id,
        orderNumber: order.number,
        status: order.status,
        reference,
        amountMinor: expectedAmountMinor || verification.data.amount,
        currency: expectedCurrency || normalizeCurrencyCode(verification.data.currency),
        redirectUrl: `/checkout/success?reference=${encodeURIComponent(reference)}&order=${order.id}`,
      } satisfies PaystackVerificationResult,
      order,
    };
  }

  if (verification.data.status !== 'success') {
    await markOrderFailed(order, verification.data.gateway_response || verification.data.status);
    throw new Error('PAYMENT_NOT_SUCCESSFUL');
  }

  if (!expectedReference || expectedReference !== reference) {
    await markOrderFailed(order, 'Reference mismatch');
    throw new Error('PAYMENT_REFERENCE_MISMATCH');
  }

  if (!expectedCurrency || expectedCurrency !== normalizeCurrencyCode(verification.data.currency)) {
    await markOrderFailed(order, 'Currency mismatch');
    throw new Error('PAYMENT_CURRENCY_MISMATCH');
  }

  if (!expectedAmountMinor || expectedAmountMinor !== verification.data.amount) {
    await markOrderFailed(order, 'Amount mismatch');
    throw new Error('PAYMENT_AMOUNT_MISMATCH');
  }

  return {
    result: await finalizeSuccessfulVerification(order, verification.data),
    order,
  };
}

export async function clearCheckoutCart(cartToken: string | null, bearerToken?: string | null) {
  if (!cartToken) {
    return null;
  }

  const cartResult = await getCart(cartToken, bearerToken).catch(() => null);

  if (!cartResult || !cartResult.cart.items.length) {
    return cartToken;
  }

  let activeCartToken = cartResult.cartToken || cartToken;

  for (const item of cartResult.cart.items) {
    const next = await removeCartItem(activeCartToken, item.id, bearerToken);
    activeCartToken = next.cartToken || activeCartToken;
  }

  return activeCartToken;
}

export function getPaystackMetaKeys() {
  return META_KEYS;
}
