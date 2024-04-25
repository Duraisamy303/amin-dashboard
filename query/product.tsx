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

export const UPDATE_CATEGORY = gql`
    mutation updateCategory($id: ID!, $input: CategoryInput!) {
        categoryUpdate(id: $id, input: $input) {
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

export const ORDER_LIST = gql`
    query GetOrdersList {
        orders(first: 10) {
            edges {
                node {
                    id
                    total {
                        gross {
                            currency
                            amount
                        }
                    }
                    user {
                        email
                        firstName
                        lastName
                        id
                    }
                    updatedAt
                    number
                    paymentStatus
                }
            }
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
            }
        }
    }
`;

export const SHIPPING_LIST = gql`
    query GetShippingCarrier {
        shippingCarriers(first: 100) {
            edges {
                node {
                    id
                    name
                    trackingUrl
                }
            }
        }
    }
`;

export const CUSTOMER_LIST = gql`
    query SearchCustomers($after: String, $first: Int!, $query: String!) {
        search: customers(after: $after, first: $first, filter: { search: $query }) {
            edges {
                node {
                    id
                    email
                    firstName
                    lastName
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const CREATE_SHIPPING = gql`
    mutation Shipping_CarrierCreate($input: Shipping_CarrierInput!) {
        shippingCarrierCreate(input: $input) {
            shippingCarrier {
                id
                name
                trackingUrl
            }
            errors {
                message
            }
        }
    }
`;

export const UPDATE_SHIPPING = gql`
    mutation Shipping_CarrierUpdate($id: ID!, $input: Shipping_CarrierInput!) {
        shippingCarrierUpdate(id: $id, input: $input) {
            shippingCarrier {
                id
                name
                trackingUrl
            }
        }
    }
`;

export const DELETE_SHIPPING = gql`
    mutation Shipping_CarrierDelete($id: ID!) {
        shippingCarrierDelete(id: $id) {
            errors {
                message
            }
        }
    }
`;

export const GET_ORDER_DETAILS = gql`
    query GetOrderDetails($id: ID!) {
        order(id: $id) {
            id
            isPaid
            isShippingRequired
            number
            shippingAddress {
                firstName
                lastName
                companyName
                streetAddress1
                streetAddress2
                phone
                postalCode
                city
                countryArea
                country {
                    code
                    country
                }
            }
            status
            billingAddress {
                city
                cityArea
                companyName
                country {
                    code
                    country
                }
                countryArea
                firstName
                lastName
                phone
                streetAddress2
                streetAddress1
            }
            lines {
                productName
                productSku
                allocations {
                    id
                    quantity
                }
                quantity
                thumbnail {
                    url
                    alt
                }
                totalPrice {
                    gross {
                        amount
                        currency
                    }
                }
            }
            paymentStatus
            paymentStatusDisplay
            events {
                id
                message
                type
                date
                user {
                    firstName
                    lastName
                    email
                }
            }
        }
    }
`;

export const CREATE_NOTES = gql`
    mutation OrderNoteAdd($input: OrderNoteInput!, $orderId: ID!, $private_note: Boolean!) {
        orderNoteAdd(input: $input, order: $orderId, private_note: $private_note) {
            order {
                id
                number
                user {
                    email
                    firstName
                    lastName
                }
                events {
                    id
                    message
                    type
                    date
                    user {
                        firstName
                        lastName
                        email
                    }
                }
            }
        }
    }
`;

export const UPDATE_NOTES = gql`
    mutation Shipping_CarrierUpdate($id: ID!, $input: Shipping_CarrierInput!) {
        shippingCarrierUpdate(id: $id, input: $input) {
            shippingCarrier {
                id
                name
                trackingUrl
            }
        }
    }
`;

export const DELETE_NOTES = gql`
    mutation OrderNoteDelete($noteId: ID!) {
        orderNoteDelete(id: $noteId) {
            errors {
                message
            }
        }
    }
`;

export const COUNTRY_LIST = gql`
    query CountryList {
        shop {
            countries {
                code
                country
            }
        }
    }
`;

export const STATES_LIST = gql`
    query CountryArea($code: CountryCode!) {
        addressValidationRules(countryCode: $code) {
            countryAreaChoices {
                raw
                verbose
            }
        }
    }
`;

export const CHANNEL_LIST = gql`
    query BaseChannels {
        channels {
            ...Channel
            __typename
        }
    }

    fragment Channel on Channel {
        id
        isActive
        name
        slug
        currencyCode
        defaultCountry {
            code
            country
            __typename
        }
        stockSettings {
            allocationStrategy
            __typename
        }
        __typename
    }
`;

export const PRODUCT_CAT_LIST = gql`
    query SearchCategories($after: String, $first: Int!, $query: String!) {
        search: categories(after: $after, first: $first, filter: { search: $query }) {
            edges {
                node {
                    id
                    name
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const COLLECTION_LIST = gql`
    query SearchCollections($after: String, $first: Int!, $query: String!, $channel: String) {
        search: collections(after: $after, first: $first, filter: { search: $query }, channel: $channel) {
            edges {
                node {
                    id
                    name
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const PRODUCT_TYPE_LIST = gql`
    query SearchProductTypes($after: String, $first: Int!, $query: String!) {
        search: productTypes(after: $after, first: $first, filter: { search: $query }) {
            edges {
                node {
                    id
                    name
                    __typename
                }
                __typename
            }
            pageInfo {
                ...PageInfo
                __typename
            }
            __typename
        }
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }
`;

export const CREATE_PRODUCT = gql`
    mutation ProductCreate($input: ProductCreateInput!) {
        productCreate(input: $input) {
            errors {
                ...ProductErrorWithAttributes
                __typename
            }
            product {
                id
                __typename
            }
            __typename
        }
    }

    fragment ProductErrorWithAttributes on ProductError {
        ...ProductError
        attributes
        __typename
    }

    fragment ProductError on ProductError {
        code
        field
        message
        __typename
    }
`;

export const UPDATE_PRODUCT_CHANNEL = gql`
    mutation ProductChannelListingUpdate($id: ID!, $input: ProductChannelListingUpdateInput!) {
        productChannelListingUpdate(id: $id, input: $input) {
            errors {
                ...ProductChannelListingError
                __typename
            }
            __typename
        }
    }

    fragment ProductChannelListingError on ProductChannelListingError {
        code
        field
        message
        channels
        __typename
    }
`;

export const CREATE_VARIANT = gql`
    mutation VariantCreate($input: ProductVariantCreateInput!, $firstValues: Int, $afterValues: String, $lastValues: Int, $beforeValues: String) {
        productVariantCreate(input: $input) {
            errors {
                ...ProductErrorWithAttributes
                __typename
            }
            productVariant {
                ...ProductVariant
                __typename
            }
            __typename
        }
    }

    fragment ProductErrorWithAttributes on ProductError {
        ...ProductError
        attributes
        __typename
    }

    fragment ProductError on ProductError {
        code
        field
        message
        __typename
    }

    fragment ProductVariant on ProductVariant {
        id
        ...Metadata
        selectionAttributes: attributes(variantSelection: VARIANT_SELECTION) {
            ...SelectedVariantAttribute
            __typename
        }
        nonSelectionAttributes: attributes(variantSelection: NOT_VARIANT_SELECTION) {
            ...SelectedVariantAttribute
            __typename
        }
        media {
            id
            url
            type
            oembedData
            __typename
        }
        name
        product {
            id
            defaultVariant {
                id
                __typename
            }
            media {
                ...ProductMedia
                __typename
            }
            name
            thumbnail {
                url
                __typename
            }
            channelListings {
                id
                publicationDate
                isPublished
                channel {
                    id
                    name
                    currencyCode
                    __typename
                }
                __typename
            }
            variants {
                id
                name
                sku
                media {
                    id
                    url(size: 200)
                    type
                    oembedData
                    __typename
                }
                __typename
            }
            defaultVariant {
                id
                __typename
            }
            __typename
        }
        channelListings {
            ...ChannelListingProductVariant
            __typename
        }
        sku
        stocks {
            ...Stock
            __typename
        }
        trackInventory
        preorder {
            ...Preorder
            __typename
        }
        weight {
            ...Weight
            __typename
        }
        quantityLimitPerCustomer
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }

    fragment SelectedVariantAttribute on SelectedAttribute {
        attribute {
            ...VariantAttribute
            __typename
        }
        values {
            ...AttributeValueDetails
            __typename
        }
        __typename
    }

    fragment VariantAttribute on Attribute {
        id
        name
        slug
        inputType
        entityType
        valueRequired
        unit
        choices(first: $firstValues, after: $afterValues, last: $lastValues, before: $beforeValues) {
            ...AttributeValueList
            __typename
        }
        __typename
    }

    fragment AttributeValueList on AttributeValueCountableConnection {
        pageInfo {
            ...PageInfo
            __typename
        }
        edges {
            cursor
            node {
                ...AttributeValueDetails
                __typename
            }
            __typename
        }
        __typename
    }

    fragment PageInfo on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
    }

    fragment AttributeValueDetails on AttributeValue {
        ...AttributeValue
        plainText
        richText
        __typename
    }

    fragment AttributeValue on AttributeValue {
        id
        name
        slug
        file {
            ...File
            __typename
        }
        reference
        boolean
        date
        dateTime
        value
        __typename
    }

    fragment File on File {
        url
        contentType
        __typename
    }

    fragment ProductMedia on ProductMedia {
        id
        alt
        sortOrder
        url(size: 1024)
        type
        oembedData
        __typename
    }

    fragment ChannelListingProductVariant on ProductVariantChannelListing {
        id
        channel {
            id
            name
            currencyCode
            __typename
        }
        price {
            ...Money
            __typename
        }
        costPrice {
            ...Money
            __typename
        }
        preorderThreshold {
            quantity
            soldUnits
            __typename
        }
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment Stock on Stock {
        id
        quantity
        quantityAllocated
        warehouse {
            ...Warehouse
            __typename
        }
        __typename
    }

    fragment Warehouse on Warehouse {
        id
        name
        __typename
    }

    fragment Preorder on PreorderData {
        globalThreshold
        globalSoldUnits
        endDate
        __typename
    }

    fragment Weight on Weight {
        unit
        value
        __typename
    }
`;

export const UPDATE_VARIANT_LIST = gql`
    mutation ProductVariantChannelListingUpdate($id: ID!, $input: [ProductVariantChannelListingAddInput!]!) {
        productVariantChannelListingUpdate(id: $id, input: $input) {
            variant {
                id
                channelListings {
                    ...ChannelListingProductVariant
                    __typename
                }
                product {
                    id
                    channelListings {
                        ...ChannelListingProductWithoutPricing
                        __typename
                    }
                    __typename
                }
                __typename
            }
            errors {
                ...ProductChannelListingError
                __typename
            }
            __typename
        }
    }

    fragment ChannelListingProductVariant on ProductVariantChannelListing {
        id
        channel {
            id
            name
            currencyCode
            __typename
        }
        price {
            ...Money
            __typename
        }
        costPrice {
            ...Money
            __typename
        }
        preorderThreshold {
            quantity
            soldUnits
            __typename
        }
        __typename
    }

    fragment Money on Money {
        amount
        currency
        __typename
    }

    fragment ChannelListingProductWithoutPricing on ProductChannelListing {
        isPublished
        publicationDate
        isAvailableForPurchase
        availableForPurchase
        visibleInListings
        channel {
            id
            name
            currencyCode
            __typename
        }
        __typename
    }

    fragment ProductChannelListingError on ProductChannelListingError {
        code
        field
        message
        channels
        __typename
    }
`;

export const UPDATE_META_DATA = gql`
    mutation UpdateMetadata($id: ID!, $input: [MetadataInput!]!, $keysToDelete: [String!]!) {
        updateMetadata(id: $id, input: $input) {
            errors {
                ...MetadataError
                __typename
            }
            item {
                ...Metadata
                ... on Node {
                    id
                    __typename
                }
                __typename
            }
            __typename
        }
        deleteMetadata(id: $id, keys: $keysToDelete) {
            errors {
                ...MetadataError
                __typename
            }
            item {
                ...Metadata
                ... on Node {
                    id
                    __typename
                }
                __typename
            }
            __typename
        }
    }

    fragment MetadataError on MetadataError {
        code
        field
        message
        __typename
    }

    fragment Metadata on ObjectWithMetadata {
        metadata {
            ...MetadataItem
            __typename
        }
        privateMetadata {
            ...MetadataItem
            __typename
        }
        __typename
    }

    fragment MetadataItem on MetadataItem {
        key
        value
        __typename
    }
`;
