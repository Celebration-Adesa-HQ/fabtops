import { describe, expect, it } from 'vitest';
import {
  adaptRestProduct,
  adaptStoreProduct,
} from '../../lib/woocommerce/adapters';
import { liveVariableProduct, liveVariableVariations } from './fixtures/live-rest-product';

describe('WooCommerce product adapters', () => {
  it('maps a Store API product to the stable storefront shape', () => {
    const product = adaptStoreProduct({
      id: 42,
      name: 'Rose Top',
      slug: 'rose-top',
      description: '<p>Soft tailoring.</p>',
      short_description: '',
      type: 'simple',
      variation: '',
      parent: 0,
      permalink: 'https://shop.example.com/product/rose-top',
      sku: 'ROSE-1',
      prices: {
        price: '125000',
        regular_price: '125000',
        sale_price: '125000',
        price_range: null,
        currency_code: 'NGN',
        currency_symbol: '₦',
        currency_minor_unit: 2,
        currency_decimal_separator: '.',
        currency_thousand_separator: ',',
        currency_prefix: '₦',
        currency_suffix: '',
      },
      price_html: '',
      average_rating: '0',
      review_count: 0,
      images: [{ id: 7, src: 'https://shop.example.com/rose.jpg', thumbnail: '', srcset: '', sizes: '', name: 'Rose Top', alt: 'Rose Top' }],
      categories: [{ id: 3, name: 'Tops', slug: 'tops', link: '' }],
      tags: [],
      brands: [],
      attributes: [],
      variations: [],
      grouped_products: [],
      has_options: false,
      is_purchasable: true,
      is_in_stock: true,
      is_on_backorder: false,
      low_stock_remaining: null,
      sold_individually: false,
      add_to_cart: { text: 'Add to cart', description: '', url: '', minimum: 1, maximum: 99, multiple_of: 1 },
      extensions: {},
    });

    expect(product).toMatchObject({
      id: '42',
      handle: 'rose-top',
      title: 'Rose Top',
      availability: {
        inStock: true,
        purchasable: true,
        stockStatus: 'instock',
      },
      productType: 'Tops',
      brands: [],
      averageRating: 0,
      priceRange: { min: { amountMinor: '125000', currencyCode: 'NGN' } },
    });
    expect(product.gallery[0].url).toContain('rose.jpg');
    expect(product.variationIds).toEqual([]);
  });

  it('maps REST variations and marks out-of-stock options unavailable', () => {
    const product = adaptRestProduct({
      id: 10,
      name: 'Silk Set',
      slug: 'silk-set',
      type: 'variable',
      status: 'publish',
      description: '<p>Silk set.</p>',
      short_description: '',
      sku: '',
      price: '20000',
      regular_price: '20000',
      sale_price: '',
      price_html: '',
      on_sale: false,
      purchasable: true,
      total_sales: 0,
      virtual: false,
      downloadable: false,
      manage_stock: false,
      stock_quantity: null,
      stock_status: 'instock',
      backorders: 'no',
      backorders_allowed: false,
      backordered: false,
      sold_individually: false,
      categories: [{ id: 4, name: 'Sets', slug: 'sets' }],
      tags: [],
      images: [],
      attributes: [{ id: 1, name: 'Size', position: 0, visible: true, variation: true, options: ['S', 'M'] }],
      default_attributes: [],
      variations: [101, 102],
    }, [{
      id: 101,
      price: '20000',
      regular_price: '20000',
      sale_price: '',
      on_sale: false,
      purchasable: true,
      stock_status: 'outofstock',
      attributes: [{ id: 1, name: 'Size', option: 'S' }],
      image: null,
    }]);

    expect(product.options).toEqual([{ id: '1', name: 'Size', values: ['S', 'M'] }]);
    expect(product.variations?.[0]).toMatchObject({
      id: '101',
      availability: {
        stockStatus: 'outofstock',
      },
      selectedOptions: [{ name: 'Size', value: 'S' }],
    });
    expect(product).toMatchObject({
      brands: [],
      averageRating: 0,
    });
  });

  it('maps live wc/v3 product payloads and preserves attribute groups and selected options', () => {
    const product = adaptRestProduct(liveVariableProduct, liveVariableVariations);

    expect(product).toMatchObject({
      id: '632',
      handle: 'isla-satin-tie-midi-dress',
      title: 'Isla Satin Tie Midi Dress',
      brands: ['FabTops'],
      averageRating: 0,
      variationIds: ['652', '653', '654', '655', '656'],
      options: [
        { id: '2', name: 'Size', values: ['L', 'M', 'S', 'XL', 'XS'] },
        { id: '3', name: 'Color', values: ['Rose'] },
      ],
    });
    expect(product.variations?.[0]).toMatchObject({
      id: '654',
      title: 'M / Rose',
      selectedOptions: [
        { name: 'Size', value: 'M' },
        { name: 'Color', value: 'Rose' },
      ],
    });
  });

  it('resolves human-readable variation attribute names from parent product attributes when variation names are missing', () => {
    const product = adaptRestProduct(liveVariableProduct, [
      {
        ...liveVariableVariations[0],
        attributes: [
          { id: 2, name: '', slug: 'pa_size', option: 'M' },
          { id: 3, name: '', slug: 'pa_color', option: 'Rose' },
        ],
      },
    ]);

    expect(product.variations?.[0].selectedOptions).toEqual([
      { name: 'Size', value: 'M' },
      { name: 'Color', value: 'Rose' },
    ]);
  });
});
