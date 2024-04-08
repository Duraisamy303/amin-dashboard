


export const PRODUCT_LIST = ({ channel, first }) => {
  console.log("channel, first: ", channel, first);
  return JSON.stringify({
    query: `
      query ProductListPaginated($first: Int!, $after: String, $channel: String!) {
        products(first: $first, after: $after, channel: $channel) {
          totalCount
          edges {
            node {
              ...ProductListItem
            }
            cursor
          }
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
        }
      }
      ${PRODUCT_LIST_ITEM_FRAGMENT}
    `,
    variables: { channel, first },
  });
};

export const PRODUCT_LIST_ITEM_FRAGMENT = `
  fragment ProductListItem on Product {
    id
    name
    slug
    pricing {
      priceRange {
        start {
          gross {
            amount
            currency
          }
        }
        stop {
          gross {
            amount
            currency
          }
        }
       
      }
      discount {
        currency
      }
    }
   
    category {
      id
      name
    }
    thumbnail(size: 1024, format: WEBP) {
      url
      alt
    }
    variants {
      id
    }
    images{
      url
    }
    created
    description
  }
`;

