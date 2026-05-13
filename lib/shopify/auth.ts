import { shopifyFetch } from "../shopify";

export const CUSTOMER_CREATE_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const GET_CUSTOMER_QUERY = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      defaultAddress {
        address1
        city
        country
      }
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            processedAt
            totalPrice {
              amount
              currencyCode
            }
            financialStatus
            fulfillmentStatus
            successfulFulfillments(first: 5) {
              trackingInfo(first: 5) {
                number
                url
              }
            }
            lineItems(first: 20) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    image {
                      url
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

export async function createCustomer(input: any) {
  const data: any = await shopifyFetch({
    query: CUSTOMER_CREATE_MUTATION,
    variables: { input },
  });
  return data.customerCreate;
}

export async function createCustomerAccessToken(input: any) {
  const data: any = await shopifyFetch({
    query: CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
    variables: { input },
  });
  return data.customerAccessTokenCreate;
}

export async function getCustomer(customerAccessToken: string) {
  const data: any = await shopifyFetch({
    query: GET_CUSTOMER_QUERY,
    variables: { customerAccessToken },
  });
  return data.customer;
}
