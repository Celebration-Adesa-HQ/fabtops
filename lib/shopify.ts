// lib/shopify.ts
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_API_TOKEN;

// 🔍 DEBUG: Log env vars on server startup (only visible in terminal)
if (typeof window === "undefined") {
  console.log("🔐 Shopify Env Check:", {
    hasDomain: !!DOMAIN,
    domain: DOMAIN,
    hasToken: !!TOKEN,
    tokenPrefix: TOKEN?.slice(0, 7),
    tokenLength: TOKEN?.length,
  });
}
export async function shopifyFetch<T>({
  query,
  variables = {},
  isClient = false,
}: {
  query: string;
  variables?: any;
  isClient?: boolean;
}): Promise<T> {
  if (!DOMAIN || !TOKEN) {
    throw new Error(
      `❌ Missing env vars: DOMAIN=${!!DOMAIN}, TOKEN=${!!TOKEN}`,
    );
  }

  const endpoint = `https://${DOMAIN}/api/2026-04/graphql.json`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      ...(isClient ? {} : { next: { revalidate: 60 } }),
    });

    const json = await res.json();

    if (json.errors) {
      console.error(
        "🚨 Shopify GraphQL Errors:",
        JSON.stringify(json.errors, null, 2),
      );

      if (
        json.errors[0]?.extensions?.code === "UNAUTHORIZED" &&
        !json.errors[0].message
      ) {
        throw new Error(
          `🔑 UNAUTHORIZED: Your token is not valid for the Storefront API.`,
        );
      }

      throw new Error(json.errors[0].message || "Shopify GraphQL error");
    }

    return json.data as T;
  } catch (error: any) {
    console.error("💥 Fetch Error:", error.message || error);
    throw error;
  }
}

export async function testShopifyConnection() {
  return shopifyFetch<{ shop: { name: string; url: string } }>({
    query: `
      query TestConnection {
        shop {
          name
          url
        }
      }
    `,
  });
}

export const GET_COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

export async function getCollections(variables: { first?: number } = {}) {
  const first = variables.first || 10;
  const data: any = await shopifyFetch({
    query: GET_COLLECTIONS_QUERY,
    variables: { first },
  });
  return data.collections.edges.map((edge: any) => edge.node);
}

export const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          productType
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 2) {
            edges {
              node {
                url
                altText
              }
            }
          }
          options {
            name
            values
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function getProducts({ first = 24 }: { first?: number } = {}) {
  try {
    const data: any = await shopifyFetch({
      query: GET_PRODUCTS_QUERY,
      variables: { first },
    });

    return data.products.edges.map((e: any) => ({
      ...e.node,
      images: {
        edges: e.node.images.edges.map((img: any) => ({
          node: {
            url: img.node.url,
            alt: img.node.altText || "",
          },
        })),
      },
      options: e.node.options || [],
      variants: {
        edges: e.node.variants.edges.map((v: any) => ({
          node: {
            ...v.node,
          },
        })),
      },
    }));
  } catch (error) {
    console.error("Error in getProducts:", error);
    return [];
  }
}

export const SEARCH_PRODUCTS_QUERY = `
  query SearchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export async function searchProducts(searchTerm: string, first: number = 12) {
  try {
    const data: any = await shopifyFetch({
      query: SEARCH_PRODUCTS_QUERY,
      variables: { query: searchTerm, first },
    });

    return data.products.edges.map((e: any) => ({
      ...e.node,
      images: {
        edges: e.node.images.edges.map((img: any) => ({
          node: {
            url: img.node.url,
            alt: img.node.altText || "",
          },
        })),
      },
    }));
  } catch (error) {
    console.error("Error in searchProducts:", error);
    return [];
  }
}
export const GET_PRODUCT_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
      options {
        name
        values
      }
    }
  }
`;

export async function getProductByHandle(handle: string) {
  try {
    const data: any = await shopifyFetch({
      query: GET_PRODUCT_QUERY,
      variables: { handle },
    });

    if (!data.product) return null;

    return {
      ...data.product,
      images: {
        edges: data.product.images.edges.map((img: any) => ({
          node: {
            url: img.node.url,
            alt: img.node.altText || "",
            width: img.node.width,
            height: img.node.height,
          },
        })),
      },
      variants: {
        edges: data.product.variants.edges.map((v: any) => ({
          node: {
            ...v.node,
          },
        })),
      },
    };
  } catch (error) {
    console.error("Error in getProductByHandle:", error);
    return null;
  }
}
export const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
    }
  }
`;

export const ADD_CART_LINES_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const UPDATE_CART_LINES_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) {
          edges {
            node {
              id
              quantity
            }
          }
        }
      }
    }
  }
`;

export const REMOVE_CART_LINES_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        lines(first: 100) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`;

export const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                product {
                  title
                  handle
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
        totalTaxAmount {
          amount
          currencyCode
        }
      }
    }
  }
`;
