import { gql } from '@apollo/client';

export const PRODUCT_LIST_ITEM_FRAGMENT = gql`
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
        images {
            url
        }
        created
        description
    }
`;

export const PRODUCT_LIST = gql`
    query ProductListPaginated($channel: String!, $first: Int!, $after: String) {
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
`;

export const DELETE_PRODUCT = gql`
    mutation deleteCategory($id: ID!) {
        categoryDelete(id: $id) {
            errors {
                message
                values
            }
        }
    }
`;

export const CATEGORY_LIST = gql`
    query CategoryList($first: Int!, $after: String, $channel: String!) {
        categories(first: $first, after: $after) {
            edges {
                node {
                    id
                    name
                    description
                    products(channel: $channel) {
                        totalCount
                    }
                }
            }
        }
    }
`;

export const CREATE_CATEGORY = gql`
    mutation CategoryCreate($input: CategoryInput!) {
        categoryCreate(input: $input) {
            category {
                id
                name
                description
                slug
            }
        }
    }
`;

export const DELETE_CATEGORY = gql`
    mutation deleteCategory($id: ID!) {
        categoryDelete(id: $id) {
            errors {
                message
                values
            }
        }
    }
`;