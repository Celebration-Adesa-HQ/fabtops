import { fromMinorUnits, storeApiRequest } from './store-api';

interface StoreCartMoney {
  currency_code: string;
  currency_minor_unit: number;
}

interface StoreApiCart {
  items: Array<{
    key: string;
    id: number;
    quantity: number;
    name: string;
    permalink: string;
    images: Array<{ src: string; alt: string }>;
    prices: StoreCartMoney & { price: string };
    variation: Array<{ attribute: string; value: string }>;
  }>;
  coupons: Array<{ code: string; totals: StoreCartMoney & { total_discount: string } }>;
  totals: StoreCartMoney & { total_items: string; total_price: string };
  shipping_rates: Array<{
    package_id: number;
    name: string;
    destination: Record<string, string>;
    shipping_rates: Array<{
      rate_id: string;
      name: string;
      description: string;
      delivery_time: string;
      price: string;
      taxes: string;
      instance_id: number;
      method_id: string;
      meta_data: Array<{ key: string; value: string }>;
      selected: boolean;
      currency_code: string;
      currency_minor_unit: number;
    }>;
  }>;
  payment_methods: string[];
  needs_shipping: boolean;
}

export interface StorefrontCart {
  items: Array<{
    id: string;
    variantId: string;
    title: string;
    handle: string;
    price: string;
    quantity: number;
    image: string;
    selectedOptions: Array<{ name: string; value: string }>;
  }>;
  subtotal: number;
  totalAmount: number;
  currencyCode: string;
  discountCodes: Array<{ code: string; applicable: boolean }>;
  shippingRates: StoreApiCart['shipping_rates'];
  paymentMethods: string[];
  needsShipping: boolean;
}

function productHandle(permalink: string) {
  try {
    const segments = new URL(permalink).pathname.split('/').filter(Boolean);
    const productIndex = segments.lastIndexOf('product');
    return productIndex >= 0 ? segments[productIndex + 1] || '' : segments.at(-1) || '';
  } catch {
    return '';
  }
}

export function mapStoreCart(cart: StoreApiCart): StorefrontCart {
  const minorUnit = cart.totals.currency_minor_unit;
  return {
    items: cart.items.map((item) => ({
      id: item.key,
      variantId: String(item.id),
      title: item.name,
      handle: productHandle(item.permalink),
      price: fromMinorUnits(item.prices.price, item.prices.currency_minor_unit),
      quantity: item.quantity,
      image: item.images[0]?.src || '/logo/Fab and Luxe Combined.png',
      selectedOptions: item.variation.map((option) => ({ name: option.attribute, value: option.value })),
    })),
    subtotal: Number(fromMinorUnits(cart.totals.total_items, minorUnit)),
    totalAmount: Number(fromMinorUnits(cart.totals.total_price, minorUnit)),
    currencyCode: cart.totals.currency_code,
    discountCodes: cart.coupons.map((coupon) => ({ code: coupon.code, applicable: true })),
    shippingRates: cart.shipping_rates,
    paymentMethods: cart.payment_methods,
    needsShipping: cart.needs_shipping,
  };
}

export interface CartResult {
  cart: StorefrontCart;
  cartToken: string | null;
}

async function cartRequest(path: string, cartToken: string | null, init?: RequestInit, bearerToken?: string | null): Promise<CartResult> {
  const result = await storeApiRequest<StoreApiCart>(path, {
    ...init,
    cartToken,
    bearerToken,
  });
  return { cart: mapStoreCart(result.data), cartToken: result.cartToken };
}

function post(body: unknown): RequestInit {
  return { method: 'POST', body: JSON.stringify(body) };
}

export function getCart(cartToken: string | null, bearerToken?: string | null) {
  return cartRequest('/cart', cartToken, undefined, bearerToken);
}

export function addCartItem(cartToken: string | null, productId: number, quantity: number, bearerToken?: string | null) {
  return cartRequest('/cart/add-item', cartToken, post({ id: productId, quantity }), bearerToken);
}

export function updateCartItem(cartToken: string | null, lineKey: string, quantity: number, bearerToken?: string | null) {
  return cartRequest('/cart/update-item', cartToken, post({ key: lineKey, quantity }), bearerToken);
}

export function removeCartItem(cartToken: string | null, lineKey: string, bearerToken?: string | null) {
  return cartRequest('/cart/remove-item', cartToken, post({ key: lineKey }), bearerToken);
}

export function applyCartCoupon(cartToken: string | null, code: string, bearerToken?: string | null) {
  return cartRequest('/cart/apply-coupon', cartToken, post({ code }), bearerToken);
}

export function removeCartCoupon(cartToken: string | null, code: string, bearerToken?: string | null) {
  return cartRequest('/cart/remove-coupon', cartToken, post({ code }), bearerToken);
}

export function updateCartCustomer(cartToken: string | null, billingAddress: unknown, shippingAddress: unknown, bearerToken?: string | null) {
  return cartRequest('/cart/update-customer', cartToken, post({
    billing_address: billingAddress,
    shipping_address: shippingAddress,
  }), bearerToken);
}

export function selectShippingRate(cartToken: string | null, packageId: number, rateId: string, bearerToken?: string | null) {
  return cartRequest('/cart/select-shipping-rate', cartToken, post({ package_id: packageId, rate_id: rateId }), bearerToken);
}
