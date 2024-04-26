import { useState } from 'react';
import Swal from 'sweetalert2';

export const capitalizeFLetter = (string = '') => {
    if (string.length > 0) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    return string;
};

export const useSetState = (initialState: any) => {
    const [state, setState] = useState(initialState);

    const newSetState = (newState: any) => {
        setState((prevState: any) => ({ ...prevState, ...newState }));
    };
    return [state, newSetState];
};

export const getPrice = () => {
    let price;
};

export const shortData = (selectValue: any, products: any) => {
    if (!selectValue || !products?.length) {
        return null;
    }

    let product_items = [...products];

    if (selectValue === 'Low to High') {
        product_items.sort((a, b) => {
            const priceA = Number(a?.node?.pricing?.priceRange?.start?.gross?.amount) || 0;
            const priceB = Number(b?.node?.pricing?.priceRange?.start?.gross?.amount) || 0;
            return priceA - priceB;
        });
    } else if (selectValue === 'High to Low') {
        product_items.sort((a, b) => {
            const priceA = Number(a?.node?.pricing?.priceRange?.start?.gross?.amount) || 0;
            const priceB = Number(b?.node?.pricing?.priceRange?.start?.gross?.amount) || 0;
            return priceB - priceA;
        });
    } else if (selectValue === 'New Added') {
        product_items.sort((a, b) => {
            const dateA = new Date(a?.node?.created) || new Date();
            const dateB = new Date(b?.node?.created) || new Date();
            return dateB - dateA;
        });
    } else if (selectValue === 'On Sale') {
        product_items = products.filter((p) => p.node.pricing.discount > 0);
    }

    return product_items;
};

export const showDeleteAlert = (onConfirm: () => void, onCancel: () => void) => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-secondary',
            cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3',
            popup: 'sweet-alerts',
        },
        buttonsStyling: false,
    });

    swalWithBootstrapButtons
        .fire({
            title: 'Are you sure?',
            text: "You won't be able to Delete this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true,
            padding: '2em',
        })
        .then((result) => {
            if (result.isConfirmed) {
                onConfirm(); // Call the onConfirm function if the user confirms the deletion
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                onCancel(); // Call the onCancel function if the user cancels the deletion
            }
        });
};

export const sampleParams = {
    after: null,
    first: 100,
    query: '',
    channel:"india-channel",
    PERMISSION_HANDLE_CHECKOUTS: true,
    PERMISSION_HANDLE_PAYMENTS: true,
    PERMISSION_HANDLE_TAXES: true,
    PERMISSION_IMPERSONATE_USER: true,
    PERMISSION_MANAGE_APPS: true,
    PERMISSION_MANAGE_CHANNELS: true,
    PERMISSION_MANAGE_CHECKOUTS: true,
    PERMISSION_MANAGE_DISCOUNTS: true,
    PERMISSION_MANAGE_GIFT_CARD: true,
    PERMISSION_MANAGE_MENUS: true,
    PERMISSION_MANAGE_OBSERVABILITY: true,
    PERMISSION_MANAGE_ORDERS: true,
    PERMISSION_MANAGE_ORDERS_IMPORT: true,
    PERMISSION_MANAGE_PAGES: true,
    PERMISSION_MANAGE_PAGE_TYPES_AND_ATTRIBUTES: true,
    PERMISSION_MANAGE_PLUGINS: true,
    PERMISSION_MANAGE_PRODUCTS: true,
    PERMISSION_MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES: true,
    PERMISSION_MANAGE_SETTINGS: true,
    PERMISSION_MANAGE_SHIPPING: true,
    PERMISSION_MANAGE_STAFF: true,
    PERMISSION_MANAGE_TAXES: true,
    PERMISSION_MANAGE_TRANSLATIONS: true,
    PERMISSION_MANAGE_USERS: true,
};
