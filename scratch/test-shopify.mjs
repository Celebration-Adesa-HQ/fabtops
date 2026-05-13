
async function test() {
  const domain = 'fabtops-qwir6708.myshopify.com';
  const token = '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';
  const endpoint = `https://${domain}/admin/api/2024-01/graphql.json`;

  const query = `
    query GetProducts($first: Int!) {
      products(first: $first) {
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
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables: { first: 3 } }),
    });

    const json = await res.json();
    console.log('Response:', JSON.stringify(json, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
