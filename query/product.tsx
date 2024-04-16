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

export const FINISH_LIST = gql`
    query GetProductFinished {
        productFinishes(first: 100) {
            edges {
                node {
                    name
                    slug
                    id
                }
            }
            totalCount
        }
    }
`;

export const CREATE_FINISH = gql`
    mutation ProductFinishCreate($input: ProductFinishInput!) {
        productFinishCreate(input: $input) {
            productFinish {
                name
                slug
                id
            }
        }
    }
`;

export const UPDATE_FINISH = gql`
    mutation ProductFinishUpdate($id: ID!, $input: ProductFinishInput!) {
        productFinishUpdate(id: $id, input: $input) {
            productFinish {
                id
                name
                slug
            }
        }
    }
`;

export const DELETE_FINISH = gql`
    mutation ProductFinishDelete($id: ID!) {
        productFinishDelete(id: $id) {
            productFinish {
                id
                name
                slug
            }
        }
    }
`;

export const DESIGN_LIST = gql`
    query MyQuery {
        productDesigns(first: 100) {
            totalCount
            edges {
                node {
                    id
                    name
                    slug
                }
            }
        }
    }
`;

export const CREATE_DESIGN = gql`
    mutation ProductDesignCreate($input: ProductDesignInput!) {
        productDesignCreate(input: $input) {
            productDesign {
                id
                name
                slug
            }
        }
    }
`;

export const UPDATE_DESIGN = gql`
    mutation ProductDesignUpdate($id: ID!, $input: ProductDesignInput!) {
        productDesignUpdate(id: $id, input: $input) {
            productDesign {
                id
                name
                slug
            }
        }
    }
`;

export const DELETE_DESIGN = gql`
    mutation ProductDesignDelete($id: ID!) {
        productDesignDelete(id: $id) {
            ok
            errors {
                values
                message
            }
        }
    }
`;

export const STONE_LIST = gql`
    query MyQuery {
        productStoneTypes(first: 100) {
            edges {
                node {
                    id
                    name
                    slug
                }
            }
        }
    }
`;

export const CREATE_STONE = gql`
    mutation CreateStoneType($input: ProductStoneTypeInput!) {
        productStoneTypeCreate(input: $input) {
            productStoneType {
                id
                name
                slug
            }
        }
    }
`;

export const UPDATE_STONE = gql`
    mutation UpdateStoneType($id: ID!, $input: ProductStoneTypeInput!) {
        productStoneTypeUpdate(id: $id, input: $input) {
            productStoneType {
                id
                name
                slug
            }
        }
    }
`;

export const DELETE_STONE = gql`
    mutation ProductStoneTypeDelete($id: ID!) {
        productStoneTypeDelete(id: $id) {
            ok
        }
    }
`;

export const STYLE_LIST = gql`
    query GetProductStyles {
        productStyles(first: 100) {
            edges {
                node {
                    id
                    name
                    slug
                }
            }
            totalCount
        }
    }
`;

export const CREATE_STYLE = gql`
    mutation ProductStyleCreate($input: ProductStyleInput!) {
        productStyleCreate(input: $input) {
            productStyle {
                id
                name
                slug
            }
        }
    }
`;

export const UPDATE_STYLE = gql`
    mutation ProductStyleUpdate($id: ID!, $input: ProductStyleInput!) {
        productStyleUpdate(id: $id, input: $input) {
            productStyle {
                id
                name
                slug
            }
        }
    }
`;

export const DELETE_STYLE = gql`
    mutation ProductStyleDelete($id: ID!) {
        productStyleDelete(id: $id) {
            errors {
                message
            }
        }
    }
`;
