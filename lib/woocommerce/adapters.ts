import { fromMinorUnits } from './store-api';
import type {
  RestProduct,
  RestProductVariation,
  StoreApiProduct,
  StorefrontMoney,
  StorefrontProduct,
  StorefrontVariant,
} from './types';

const FALLBACK_IMAGE = '/logo/Fab and Luxe Combined.png';

function money(amount: string, currencyCode: string): StorefrontMoney {
  return { amount: amount || '0', currencyCode };
}

function variantTitle(options: Array<{ name: string; value: string }>) {
  return options.length ? options.map((option) => option.value).join(' / ') : 'Default Title';
}

function plainText(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function adaptStoreProduct(product: StoreApiProduct): StorefrontProduct {
  const minAmount = product.prices.price_range?.min_amount || product.prices.price;
  const maxAmount = product.prices.price_range?.max_amount || product.prices.price;
  const toMajor = (amount: string) => fromMinorUnits(amount, product.prices.currency_minor_unit);
  const selectedOptions = product.variations[0]?.attributes || [];
  const variants: StorefrontVariant[] = product.variations.length
    ? product.variations.map((variation) => ({
        id: String(variation.id),
        title: variantTitle(variation.attributes || []),
        availableForSale: product.is_in_stock && product.is_purchasable,
        selectedOptions: variation.attributes || [],
        price: money(toMajor(product.prices.price), product.prices.currency_code),
      }))
    : [{
        id: String(product.id),
        title: variantTitle(selectedOptions),
        availableForSale: product.is_in_stock && product.is_purchasable,
        selectedOptions,
        price: money(toMajor(product.prices.price), product.prices.currency_code),
      }];
  const images = product.images.map((image) => ({ node: { url: image.src, altText: image.alt || product.name } }));
  const featuredImage = images[0]?.node || { url: FALLBACK_IMAGE, altText: product.name };

  return {
    id: String(product.id),
    handle: product.slug,
    title: product.name,
    description: plainText(product.description),
    descriptionHtml: product.description,
    availableForSale: product.is_in_stock && product.is_purchasable,
    productType: product.categories[0]?.name || '',
    tags: product.tags.map((tag) => tag.name),
    featuredImage,
    images: { edges: images.length ? images : [{ node: featuredImage }] },
    priceRange: {
      minVariantPrice: money(toMajor(minAmount), product.prices.currency_code),
      maxVariantPrice: money(toMajor(maxAmount), product.prices.currency_code),
    },
    options: product.attributes.map((attribute) => ({
      id: String(attribute.id),
      name: attribute.name,
      values: (attribute.terms || []).map((term) => term.name),
    })),
    variants: { edges: variants.map((node) => ({ node })) },
    categories: product.categories.map((category) => ({ id: String(category.id), handle: category.slug, title: category.name })),
  };
}

export function adaptRestProduct(product: RestProduct, variations: RestProductVariation[] = []): StorefrontProduct {
  const currencyCode = 'NGN';
  const productPrice = product.price || product.regular_price || '0';
  const variantNodes: StorefrontVariant[] = variations.length
    ? variations.map((variation) => {
        const selectedOptions = variation.attributes.map((attribute) => ({ name: attribute.name, value: attribute.option }));
        return {
          id: String(variation.id),
          title: variantTitle(selectedOptions),
          availableForSale: variation.purchasable && variation.stock_status !== 'outofstock',
          selectedOptions,
          price: money(variation.price || variation.regular_price || productPrice, currencyCode),
        };
      })
    : [{
        id: String(product.id),
        title: 'Default Title',
        availableForSale: product.purchasable && product.stock_status !== 'outofstock',
        selectedOptions: [],
        price: money(productPrice, currencyCode),
      }];
  const amounts = variantNodes.map((variant) => Number(variant.price.amount)).filter(Number.isFinite);
  const imageEdges = product.images.map((image) => ({ node: { url: image.src, altText: image.alt || product.name } }));
  const featuredImage = imageEdges[0]?.node || { url: FALLBACK_IMAGE, altText: product.name };

  return {
    id: String(product.id),
    handle: product.slug,
    title: product.name,
    description: plainText(product.description),
    descriptionHtml: product.description,
    availableForSale: variantNodes.some((variant) => variant.availableForSale),
    productType: product.categories[0]?.name || '',
    tags: product.tags.map((tag) => tag.name),
    featuredImage,
    images: { edges: imageEdges.length ? imageEdges : [{ node: featuredImage }] },
    priceRange: {
      minVariantPrice: money(String(amounts.length ? Math.min(...amounts) : Number(productPrice)), currencyCode),
      maxVariantPrice: money(String(amounts.length ? Math.max(...amounts) : Number(productPrice)), currencyCode),
    },
    options: product.attributes.filter((attribute) => attribute.variation).map((attribute) => ({
      id: String(attribute.id),
      name: attribute.name,
      values: attribute.options,
    })),
    variants: { edges: variantNodes.map((node) => ({ node })) },
    categories: product.categories.map((category) => ({ id: String(category.id), handle: category.slug, title: category.name })),
  };
}
