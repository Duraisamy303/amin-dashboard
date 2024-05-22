import React, { useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import Modal from '@/components/Modal';
import { ADD_NEW_LINE, FILTER_PRODUCT_LIST } from '@/query/product';
import { useSetState } from '@mantine/hooks';
import { Success } from '@/utils/functions';

export default function Test() {
    const [state, setState] = useSetState({
        productIsEdit: false,
        addProductOpen: false,
        selectedItems: {},
        productList: [],
        loading: false,
        quantity: '',
        search: '',
    });

    const { data: productData } = useQuery(FILTER_PRODUCT_LIST, {
        variables: {
            after: null,
            first: 100,
            query: '',
            channel: 'india-channel',
            address: {
                country: 'IN',
            },
            isPublished: true,
            stockAvailability: 'IN_STOCK',
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
        },
    });

    const [newAddLine] = useMutation(ADD_NEW_LINE);

    useEffect(() => {
        if (productData) {
            getProductsList();
        }
    }, [productData]);

    const getProductsList = async () => {
        setState({ loading: true });
        try {
            if (productData && productData?.search && productData?.search?.edges?.length > 0) {
                const list = productData?.search?.edges?.map((item) => item.node);
                console.log('list: ', list);
                setState({ productList: list });
            }
        } catch (error) {
            console.error('Error fetching product list:', error);
        } finally {
            setState({ loading: false });
        }
    };

    const handleHeadingSelect = (heading) => {
        const isHeadingChecked = state.selectedItems[heading] && Object.values(state.selectedItems[heading]).every((value) => value);
        const newSelectedItems = {
            ...state.selectedItems,
            [heading]: Object.fromEntries(state.productList.find((item) => item.name === heading).variants.map(({ name }) => [name, !isHeadingChecked])),
        };
        setState({ selectedItems: newSelectedItems });
        // setState((prevState) => {
        //     const isHeadingChecked = prevState.selectedItems[heading] && Object.values(prevState.selectedItems[heading]).every((value) => value);
        //     const newSelectedItems = {
        //         ...prevState.selectedItems,
        //         [heading]: Object.fromEntries(
        //             prevState.productList.find((item) => item.name === heading).variants.map(({ name }) => [name, !isHeadingChecked])
        //         ),
        //     };
        //     return { selectedItems: newSelectedItems };
        // });
    };
    console.log('selectedItems: ', state.selectedItems);

    const handleSelect = (heading, subHeading) => {
        const newSelectedItems = { ...state.selectedItems };

        if (subHeading) {
            newSelectedItems[heading] = {
                ...state.selectedItems[heading],
                [subHeading]: !state.selectedItems[heading]?.[subHeading],
            };

            // Check if all children are selected or not
            const allSelected = Object.values(newSelectedItems[heading]).every((value) => value);
            const anySelected = Object.values(newSelectedItems[heading]).some((value) => value);

            if (allSelected) {
                newSelectedItems[heading] = Object.fromEntries(Object.entries(newSelectedItems[heading]).map(([name]) => [name, true]));
            }

            if (!anySelected) {
                delete newSelectedItems[heading];
            }
        } else {
            const isHeadingChecked = state.selectedItems[heading] && Object.values(state.selectedItems[heading]).every((value) => value);
            newSelectedItems[heading] = Object.fromEntries(state.productList.find((item) => item.name === heading).variants.map(({ name }) => [name, !isHeadingChecked]));
        }
        setState({ selectedItems: newSelectedItems });

        // setState((prevState) => {
        //     const newSelectedItems = { ...prevState.selectedItems };

        //     if (subHeading) {
        //         newSelectedItems[heading] = {
        //             ...prevState.selectedItems[heading],
        //             [subHeading]: !prevState.selectedItems[heading]?.[subHeading],
        //         };

        //         // Check if all children are selected or not
        //         const allSelected = Object.values(newSelectedItems[heading]).every((value) => value);
        //         const anySelected = Object.values(newSelectedItems[heading]).some((value) => value);

        //         if (allSelected) {
        //             newSelectedItems[heading] = Object.fromEntries(
        //                 Object.entries(newSelectedItems[heading]).map(([name]) => [name, true])
        //             );
        //         }

        //         if (!anySelected) {
        //             delete newSelectedItems[heading];
        //         }
        //     } else {
        //         const isHeadingChecked = prevState.selectedItems[heading] && Object.values(prevState.selectedItems[heading]).every((value) => value);
        //         newSelectedItems[heading] = Object.fromEntries(
        //             prevState.productList.find((item) => item.name === heading).variants.map(({ name }) => [name, !isHeadingChecked])
        //         );
        //     }

        //     return { selectedItems: newSelectedItems };
        // });
    };

    const handleSubHeadingSelect = (heading, subHeading) => {
        handleSelect(heading, subHeading);
    };

    const addProducts = async () => {
        try {
            const selectedSubheadingIds = [];
            state.productList.forEach(({ name, variants }) => {
                if (state.selectedItems[name]) {
                    variants.forEach(({ name: variantName, id }) => {
                        if (state.selectedItems[name][variantName]) {
                            selectedSubheadingIds.push(id);
                        }
                    });
                }
            });

            const input = selectedSubheadingIds.map((item) => ({
                quantity: 1,
                variantId: item,
            }));

            console.log('input: ', input);

            const data = await newAddLine({
                variables: {
                    id: 'T3JkZXI6YmYwYWQzZTYtNDI2Yi00MTJiLWI3YzEtNWYxMjZkNGU5NzBm',
                    input,
                },
            });

            Success('New Product Added Successfully');

            setState({ addProductOpen: false });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    return (
        <>
            <button type="button" className="btn btn-outline-primary" onClick={() => setState({ addProductOpen: true })}>
                Add Product
            </button>
            <Modal
                edit={state.productIsEdit}
                addHeader={'Add Product'}
                updateHeader={'Update Product'}
                open={state.addProductOpen}
                close={() => setState({ addProductOpen: false })}
                renderComponent={() => (
                    <>
                        <div className="p-3">
                            <input type="text" className="form-input w-full p-3" placeholder="Search..." value={state.search} onChange={(e) => setState({ search: e.target.value })} />
                        </div>
                        {state.productIsEdit ? (
                            <div className="p-5">
                                <div className="p-5">
                                    <input type="number" className="form-input" value={state.quantity} onChange={(e) => setState({ quantity: e.target.value })} />
                                </div>
                                <div className="flex justify-end gap-5">
                                    <button
                                        onClick={() => {
                                            setState({ selectedItems: {}, addProductOpen: false });
                                        }}
                                        className="rounded border border-black bg-transparent px-4 py-2 font-semibold text-black hover:border-transparent hover:bg-blue-500 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => updateQuantity()}
                                        className="rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-500 hover:border-transparent hover:bg-blue-500 hover:text-white"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-scroll p-5">
                                {state.productList.map(({ name, variants, thumbnail }) => (
                                    <div key={name}>
                                        <div className="flex gap-3">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                checked={state.selectedItems[name] && Object.values(state.selectedItems[name])?.every((value) => value)}
                                                onChange={() => handleHeadingSelect(name)}
                                            />
                                            <img src={thumbnail?.url} height={30} width={30} />
                                            <div>{name}</div>
                                        </div>
                                        <ul>
                                            {variants?.map(({ name: variantName, sku, costPrice, pricing }) => (
                                                <li key={variantName} style={{ paddingLeft: '10px', padding: '20px' }}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex">
                                                            <input
                                                                type="checkbox"
                                                                className="form-checkbox"
                                                                checked={state.selectedItems[name]?.[variantName]}
                                                                onChange={() => handleSubHeadingSelect(name, variantName)}
                                                            />
                                                            <div>
                                                                <div> {variantName}</div>
                                                                <div> {sku}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex">
                                                            <div>
                                                                <div> {costPrice}</div>
                                                                <div> {pricing?.price?.gross?.amount}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                                <div className="flex justify-end gap-5">
                                    <button
                                        onClick={() => {
                                            setState({ selectedItems: {}, addProductOpen: false });
                                        }}
                                        className="rounded border border-black bg-transparent px-4 py-2 font-semibold text-black hover:border-transparent hover:bg-blue-500 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => addProducts()}
                                        className="rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-500 hover:border-transparent hover:bg-blue-500 hover:text-white"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            />
        </>
    );
}
