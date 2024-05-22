import IconPencil from '@/components/Icon/IconPencil';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import Modal from '@/components/Modal';
import {
    ADD_COUPEN,
    ADD_NEW_LINE,
    COUNTRY_LIST,
    CREATE_NOTES,
    CUSTOMER_ADDRESS,
    CUSTOMER_LIST,
    DELETE_LINE,
    DELETE_NOTES,
    FILTER_PRODUCT_LIST,
    FINALIZE_ORDER,
    GET_ORDER_DETAILS,
    STATES_LIST,
    UPDATE_COUPEN,
    UPDATE_DRAFT_ORDER,
    UPDATE_LINE,
    UPDATE_SHIPPING_COST,
} from '@/query/product';
import { productsDropdown, setBilling, setShipping } from '@/utils/commonFunction';
import { CountryDropdownData, NotesMsg, Success, UserDropdownData, billingAddress, checkChannel, isEmptyObject, profilePic, shippingAddress, showDeleteAlert, useSetState } from '@/utils/functions';
import { billingValidation } from '@/utils/validation';
import { useMutation, useQuery } from '@apollo/client';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import * as Yup from 'yup';

export default function Neworder() {
    const router = useRouter();

    const orderId = router?.query?.orderId;

    const [state, setState] = useSetState({
        loading: false,
        customerList: [],
        selectedCustomerId: '',
        currency: [
            {
                value: 'INR',
                label: 'INR',
            },
            {
                value: 'USD',
                label: 'USD',
            },
        ],
        selectedCurrency: '',
        billingAddress: billingAddress,
        shippingAddress: shippingAddress,
        showBillingInputs: false,
        showShippingInputs: false,
        countryList: [],
        stateList: [],
        shippingStateList: [],
        lineList: [],
        isOpenProductAdd: false,
        isOpenProductUpdate: false,
        productList: [],
        editProduct: {},
        isEditProduct: false,
        quantity: '',
        selectedProduct: [],
        isOpenCoupen: false,
        coupenOption: '',
        percentcoupenValue: '',
        fixedCoupenValue: '',
        notesList: [],
        productIsEdit: false,
        addProductOpen: false,
        selectedItems: {},
    });

    const [newAddLine] = useMutation(ADD_NEW_LINE);
    const [updateLine] = useMutation(UPDATE_LINE);
    const [deleteLine] = useMutation(DELETE_LINE);
    const [updateShippingCost] = useMutation(UPDATE_SHIPPING_COST);
    const [finalizeOrder] = useMutation(FINALIZE_ORDER);
    const [updateDraftOrder] = useMutation(UPDATE_DRAFT_ORDER);
    const [addCoupenAmt] = useMutation(ADD_COUPEN);
    const [updateCoupenAmt] = useMutation(UPDATE_COUPEN);

    const [addNotes] = useMutation(CREATE_NOTES);
    const [deleteNotes] = useMutation(DELETE_NOTES);

    const { data: customer } = useQuery(CUSTOMER_LIST, {
        variables: {
            after: null,
            first: 50,
            query: '',
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

    const { data: countryData } = useQuery(COUNTRY_LIST);

    const { data: customerAddress, refetch: addressRefetch } = useQuery(CUSTOMER_ADDRESS, {
        variables: {
            id: state.selectedCustomerId,
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

    const { data: stateData, refetch: stateRefetch } = useQuery(STATES_LIST, {
        variables: { code: state.billingAddress.country },
    });

    const { data: shippingStateData, refetch: shippingStateRefetch } = useQuery(STATES_LIST, {
        variables: { code: state.shippingAddress.country },
    });

    const { data: productDetails, refetch: getOrderData } = useQuery(GET_ORDER_DETAILS, {
        variables: {
            id: orderId,
            isStaffUser: true,
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

    // For get Customer list
    useEffect(() => {
        getCustomer();
    }, [customer]);

    const getCustomer = () => {
        try {
            setState({ loading: true });
            const funRes = UserDropdownData(customer);
            setState({ customerList: funRes, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const getCustomerAddress = () => {
        try {
            setState({ loading: true });
            const funRes = UserDropdownData(customer);
            setState({ customerList: funRes, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    // For get Country list
    useEffect(() => {
        getCountryList();
    }, [countryData]);

    const getCountryList = () => {
        try {
            setState({ loading: true });
            const funRes = CountryDropdownData(countryData);
            setState({ countryList: funRes, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    // For get Billing State list
    useEffect(() => {
        if (state.billingAddress.country) {
            setState({ stateList: stateData?.addressValidationRules?.countryAreaChoices });
        }
    }, [stateData]);

    // For get Shipping State list
    useEffect(() => {
        if (state.shippingAddress.country) {
            setState({ shippingStateList: shippingStateData?.addressValidationRules?.countryAreaChoices });
        }
    }, [shippingStateData]);

    // Get Specific Customer Address
    useEffect(() => {
        if (state.selectedCustomerId) {
            getCustomerAddress();
        }
    }, [customerAddress, state.selectedCustomerId]);

    // Get Order Details
    useEffect(() => {
        getOrderDetails();
    }, [orderId, productDetails]);

    const getOrderDetails = () => {
        setState({ loading: true });
        if (productDetails) {
            if (productDetails && productDetails?.order && productDetails?.order?.lines?.length > 0) {
                const list = productDetails?.order?.lines;
                setState({ lineList: list, loading: false });
            } else {
                setState({ loading: false });
            }

            if (productDetails && productDetails?.order && productDetails?.order?.events?.length > 0) {
                const list = productDetails?.order?.events;
                const filteredArray = list.filter(
                    (item) => item.type === 'CONFIRMED' || item.type === 'FULFILLMENT_FULFILLED_ITEMS' || item.type === 'NOTE_ADDED' || item.type === 'ORDER_MARKED_AS_PAID'
                );
                console.log('filteredArray: ', filteredArray);

                const result = filteredArray?.map((item) => {
                    const secondItem = NotesMsg.find((i) => i.type === item.type);
                    return {
                        type: item.type,
                        message: item.type === 'NOTE_ADDED' ? item.message : secondItem.message,
                        id: item.id,
                        date:item.date


                    };
                });
                console.log('result: ', result);

                setState({ notesList: result, loading: false });
            } else {
                setState({ loading: false });
            }
        } else {
            setState({ loading: false });
        }
    };

    // Get Product Details
    useEffect(() => {
        getProductList();
    }, [productData]);

    const getProductList = async () => {
        try {
            setState({ loading: true });
            const funRes = await productsDropdown(productData);
            setState({ productList: funRes, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    //Onchange for billing address
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');

        setState({
            billingAddress: {
                ...state.billingAddress,
                [field]: value,
            },
        });
    };

    //Onchange for shipping address
    const handleShippingChange = (e: any) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');

        setState({
            shippingAddress: {
                ...state.shippingAddress,
                [field]: value,
            },
        });
    };

    const setBillingAddress = async () => {
        try {
            if (state.selectedCustomerId != '' && state.selectedCustomerId != undefined) {
                const funRes: any = await setBilling(customerAddress);
                setState({ billingAddress: funRes });
                updateShippingAmount(funRes?.country);
            } else {
                alert('Please choose customer');
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const setShippingAddress = async () => {
        try {
            if (state.selectedCustomerId != '' && state.selectedCustomerId != undefined) {
                const funRes: any = await setShipping(customerAddress);
                setState({ shippingAddress: funRes });
                updateShippingAmount(funRes?.country);
            } else {
                alert('Please choose customer');
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const updateShippingAmount = async (country) => {
        try {
            const channel = checkChannel();
            const isINR = channel === 'INR';
            const shippingCountry = country || state.shippingAddress.country;
            const isIndia = shippingCountry === 'IN';

            let shippingMethod = '';
            if (isINR) {
                shippingMethod = isIndia ? 'U2hpcHBpbmdNZXRob2Q6Mw==' : 'U2hpcHBpbmdNZXRob2Q6NA==';
            } else {
                shippingMethod = isIndia ? 'U2hpcHBpbmdNZXRob2Q6OA==' : 'U2hpcHBpbmdNZXRob2Q6OQ==';
            }

            const res = await updateShippingCost({
                variables: {
                    id: orderId,
                    input: {
                        shippingMethod,
                    },
                },
            });
            getOrderData();
        } catch (error) {
            console.error(error);
        }
    };

    //Add new Product to this order
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

            const data = await newAddLine({
                variables: {
                    id: orderId,
                    input,
                },
            });

            Success('New Product Added Successfully');
            getOrderData();
            setState({ addProductOpen: false });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    //Update Product to this order
    const updateQuantity = async () => {
        try {
            const res = await updateLine({
                variables: {
                    id: state.editProduct.id,
                    input: {
                        quantity: state.quantity,
                    },
                },
            });
            getOrderData();
            setState({ isOpenProductAdd: false, isEditProduct: false, editProduct: {}, productQuantity: '', productIsEdit: false, addProductOpen: false });
            Success('Product Updated Successfully');
        } catch (error) {
            console.log('error: ', error);
        }
    };

    //Update Product to this order
    const deleteProduct = async (item: any) => {
        try {
            const res = await deleteLine({
                variables: {
                    id: item.id,
                },
            });
            getOrderData();
            setState({ isOpenProductAdd: false, isEditProduct: false, editProduct: {}, productQuantity: '' });
            Success('Product Deleted Successfully');
        } catch (error) {
            console.log('error: ', error);
        }
    };

    //Add discount to this order
    const addDiscount = async () => {
        try {
            const res = await addCoupenAmt({
                variables: {
                    orderId: orderId,
                    input: {
                        reason: '',
                        value: state.coupenOption == 'percentage' ? state.percentcoupenValue : state.fixedcoupenValue,
                        valueType: state.coupenOption == 'percentage' ? 'PERCENTAGE' : 'FIXED',
                    },
                },
            });
            getOrderData();
            setState({ coupenOption: 'percentage', isOpenCoupen: false, percentcoupenValue: '', fixedcoupenValue: '' });
            // setIsOpenCoupen(false);
            // setFixedCoupenValue('');
            // setPercentCoupenValue('');
        } catch (error) {
            console.log('error: ', error);
        }
    };

    //Update discount to this order
    const updateDiscount = async () => {
        try {
            console.log('state.percentcoupenValue: ', state.coupenOption, state.percentcoupenValue, state.fixedcoupenValue);

            const res = await updateCoupenAmt({
                variables: {
                    discountId: productDetails?.order?.discounts[0]?.id,

                    input: {
                        reason: '',
                        value: state.coupenOption == 'percentage' ? state.percentcoupenValue : state.fixedcoupenValue,
                        valueType: state.coupenOption == 'percentage' ? 'PERCENTAGE' : 'FIXED',
                    },
                },
            });
            getOrderData();
            setState({ selectedOption: 'percentage', isOpenCoupen: false, percentcoupenValue: '', fixedcoupenValue: '' });

            console.log('res: ', res);
            // refetch();
            // setIsOpenCoupen(false);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const SubmittedForm = Yup.object().shape({
        message: Yup.string().required('Please fill the message'),
    });

    const onSubmit = async (record: any, { resetForm }: any) => {
        try {
            const data = await addNotes({
                variables: { input: { message: record.message }, orderId, private_note: record.mail },
            });
            setState({ notesList: data?.data?.orderNoteAdd?.order?.events });
            Success('Notes Added Successfully');

            resetForm();
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const removeNotes = (item: any) => {
        showDeleteAlert(
            async () => {
                await deleteNotes({
                    variables: { noteId: item.id },
                });
                const filter = state.notesList?.filter((data: any) => data.id !== item.id);
                setState({ notesList: filter });
                Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Notes List is safe :)', 'error');
            }
        );
    };

    const createOrder = async () => {
        try {
            const data = await updateDraftOrder({
                variables: {
                    id: orderId,
                    input: {
                        user: state.selectedCustomerId,
                        billingAddress: {
                            city: state.billingAddress.city,
                            cityArea: '',
                            companyName: state.billingAddress.company,
                            country: state.billingAddress.country,
                            countryArea: state.billingAddress.state,
                            firstName: state.billingAddress.firstName,
                            lastName: state.billingAddress.lastName,
                            phone: state.billingAddress.phone,
                            postalCode: state.billingAddress.pincode,
                            streetAddress1: state.billingAddress.address_1,
                            streetAddress2: state.billingAddress.address_2,
                        },
                        shippingAddress: {
                            city: state.shippingAddress.city,
                            cityArea: '',
                            companyName: state.shippingAddress.company,
                            country: state.shippingAddress.country,
                            countryArea: state.shippingAddress.state,
                            firstName: state.shippingAddress.firstName,
                            lastName: state.shippingAddress.lastName,
                            phone: state.shippingAddress.phone,
                            postalCode: state.shippingAddress.pincode,
                            streetAddress1: state.shippingAddress.address_1,
                            streetAddress2: state.shippingAddress.address_2,
                        },
                    },
                },
            });
            console.log('createOrder: ', data);
            finalizeNewOrder();
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const finalizeNewOrder = async () => {
        try {
            const res = await finalizeOrder({
                variables: {
                    id: orderId,
                },
            });
            getOrderData();
            Success('Order Created Successfully');
            router.push(`/orders/editorder?id=${orderId}`);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    return (
        <>
            <div className="panel mb-5 flex items-center justify-between gap-3 p-5 ">
                <h3 className="text-lg font-semibold dark:text-white-light">Add new order</h3>
                {/* <button type="button" className="btn btn-primary">
        Add Order
    </button> */}
            </div>
            <div className="grid grid-cols-12 gap-5 ">
                <div className=" col-span-9 mb-5  ">
                    <div className="panel mb-5 p-5">
                        <div>
                            <h3 className="text-lg font-semibold">Order Details</h3>
                            {/* <p className=" pt-1 text-gray-500">Payment via Cash on delivery. Customer IP: 122.178.161.16</p> */}
                        </div>
                        <div className="mt-8">
                            <h5 className="mb-3 text-lg font-semibold">General</h5>
                            <div className="grid grid-cols-12 gap-5">
                                <div className="col-span-4">
                                    <div className=" flex  items-center justify-between">
                                        <label htmlFor="status" className="block pr-2 text-sm font-medium text-gray-700">
                                            Customer:
                                        </label>
                                    </div>

                                    <select
                                        className="form-select"
                                        value={state.selectedCustomer}
                                        onChange={(val) => {
                                            const selectedCustomerId: any = val.target.value;
                                            console.log('selectedCustomerId: ', selectedCustomerId);
                                            setState({ selectedCustomerId: selectedCustomerId });
                                            // setSelectedCustomer(selectedCustomerId);
                                            addressRefetch();
                                            // setShowBillingInputs(true);
                                            // setShowShippingInputs(true);
                                            // setBillingAddress(val);
                                            // setShippingAddress(val);
                                        }}
                                    >
                                        <option value="" disabled selected>
                                            Select a customer
                                        </option>
                                        {state.customerList?.map((item: any) => (
                                            <option key={item?.value} value={item?.value}>
                                                {item?.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-12 gap-5">
                        {/* Billing Address */}
                        <div className="col-span-6 mr-5">
                            <div className="flex w-52 items-center justify-between">
                                <h5 className="mb-3 text-lg font-semibold">Billing</h5>
                                <button type="button" onClick={() => setState({ showBillingInputs: !state.showBillingInputs })}>
                                    <IconPencil className="cursor-pointer" />
                                </button>
                            </div>
                            {state.showBillingInputs === false ? (
                                <>
                                    {isEmptyObject(state.billingAddress) ? (
                                        <>
                                            <p>Address :</p>
                                            <p>No billing address set. </p>
                                        </>
                                    ) : (
                                        <div className="mt-3 text-gray-500">
                                            <p>{`${state.billingAddress?.firstName} ${state.billingAddress?.lastName}`}</p>
                                            <p>{state.billingAddress?.company}</p>
                                            <p>
                                                {state.billingAddress?.address_1}
                                                <br />
                                                {state.billingAddress?.address_2}
                                                <br /> {state.billingAddress?.city}
                                                <br /> {state.billingAddress?.state}
                                                {/* <br /> {selectedCountry} */}
                                            </p>
                                            {state.billingAddress?.email && (
                                                <>
                                                    <p className="mt-3 font-semibold">Email Address:</p>
                                                    <p>
                                                        <a href="mailto:mail2inducs@gmail.com" className="text-primary underline">
                                                            {state.billingAddress?.email}
                                                        </a>
                                                    </p>
                                                </>
                                            )}
                                            {state.billingAddress?.phone && (
                                                <>
                                                    <p className="mt-3 font-semibold">Phone:</p>
                                                    <p>
                                                        <a href="tel:01803556656" className="text-primary underline">
                                                            {state.billingAddress?.phone}
                                                        </a>
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button className="text-primary underline" onClick={() => setBillingAddress()}>
                                        Load billing address
                                    </button>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-6">
                                            <label htmlFor="firstname" className=" text-sm font-medium text-gray-700">
                                                First Name
                                            </label>

                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.firstName'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.firstName"
                                                value={state.billingAddress?.firstName}
                                                onChange={handleChange}
                                            />
                                            {state.billingAddress['billing.firstName'] && <div className="mt-1 text-danger">{state.billingAddress['billing.firstName']}</div>}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="Lastname" className=" text-sm font-medium text-gray-700">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.lastName'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.lastName"
                                                value={state.billingAddress?.lastName}
                                                onChange={handleChange}
                                            />
                                            {state.billingAddress['billing.lastName'] && <div className="mt-1 text-danger">{state.billingAddress['billing.lastName']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-12">
                                            <label htmlFor="company" className=" text-sm font-medium text-gray-700">
                                                Company
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.company'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.company"
                                                value={state.billingAddress?.company}
                                                onChange={handleChange}
                                            />
                                            {state.billingAddress['billing.company'] && <div className="mt-1 text-danger">{state.billingAddress['billing.company']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-6">
                                            <label htmlFor="addressline1" className=" text-sm font-medium text-gray-700">
                                                Addres Line 1
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.address_1'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.address_1"
                                                value={state.billingAddress?.address_1}
                                                onChange={handleChange}
                                            />
                                            {state.billingAddress['billing.address_1'] && <div className="mt-1 text-danger">{state.billingAddress['billing.address_1']}</div>}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="addressline2" className=" text-sm font-medium text-gray-700">
                                                Addres Line 2
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.address_2'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.address_2"
                                                value={state.billingAddress?.address_2}
                                                onChange={handleChange}
                                            />
                                            {state.billingAddress['billing.address_2'] && <div className="mt-1 text-danger">{state.billingAddress['billing.address_2']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-6">
                                            <label htmlFor="country" className=" text-sm font-medium text-gray-700">
                                                Country / Region
                                            </label>
                                            <select
                                                className={`form-select mr-3 ${state.billingAddress['billing.country'] && 'border border-danger focus:border-danger'}`}
                                                id="billingcountry"
                                                name="billing.country"
                                                value={state.billingAddress?.country}
                                                onChange={(e) => {
                                                    console.log('e: ', e.target.value);
                                                    handleChange(e);
                                                    stateRefetch();
                                                }}
                                            >
                                                <option value="Select a country">Select a country</option>
                                                {state.countryList?.map((item: any) => (
                                                    <option key={item.code} value={item.code}>
                                                        {item.country}
                                                    </option>
                                                ))}
                                            </select>
                                            {state.billingAddress['billing.country'] && <div className="mt-1 text-danger">{state.billingAddress['billing.country']}</div>}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="state" className=" text-sm font-medium text-gray-700">
                                                State / Country
                                            </label>
                                            <select
                                                className={`form-select mr-3 ${state.billingAddress['billing.state'] && 'border border-danger focus:border-danger'}`}
                                                id="billingstate"
                                                name="billing.state"
                                                value={state.billingAddress?.state}
                                                onChange={(e) => {
                                                    console.log('e: ', e.target.value);
                                                    handleChange(e);
                                                }}
                                            >
                                                <option value="Select a state">Select a state</option>
                                                {state.stateList?.map((item: any) => (
                                                    <option key={item.raw} value={item.raw}>
                                                        {item.raw}
                                                    </option>
                                                ))}
                                            </select>
                                            {state.billingAddress['billing.state'] && <div className="mt-1 text-danger">{state.billingAddress['billing.state']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-6">
                                            <label htmlFor="city" className=" text-sm font-medium text-gray-700">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.city'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.city"
                                                value={state.billingAddress?.city}
                                                onChange={handleChange}
                                            />
                                            {state.billingAddress['billing.city'] && <div className="mt-1 text-danger">{state.billingAddress['billing.city']}</div>}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="pincode" className=" text-sm font-medium text-gray-700">
                                                Post Code / ZIP
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.pincode'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.pincode"
                                                value={state.billingAddress?.pincode}
                                                onChange={handleChange}
                                            />
                                            {state.billingAddress['billing.pincode'] && <div className="mt-1 text-danger">{state.billingAddress['billing.pincode']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-6">
                                            <label htmlFor="email" className=" text-sm font-medium text-gray-700">
                                                Email address
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.email'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.email"
                                                value={state.billingAddress?.email}
                                                maxLength={10}
                                                onChange={handleChange}
                                            />
                                            {state.billingAddress['billing.email'] && <div className="mt-1 text-danger">{state.billingAddress['billing.email']}</div>}
                                            {/* <input type="mail" className="form-input" name="billing.email" value={state.billingAddress?.email} onChange={handleChange} /> */}

                                            {/* <input type="mail" id="billingemail" name="billingemail" className="form-input" required /> */}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="phone" className=" text-sm font-medium text-gray-700">
                                                Phone
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.billingAddress['billing.phone'] && 'border border-danger focus:border-danger'}`}
                                                name="billing.phone"
                                                value={state.billingAddress?.phone}
                                                maxLength={10}
                                                onChange={handleChange}
                                            />
                                            {state.billingAddress['billing.phone'] && <div className="mt-1 text-danger">{state.billingAddress['billing.phone']}</div>}
                                        </div>
                                    </div>

                                    {/* <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-12">
                                            <label htmlFor="payments" className=" text-sm font-medium text-gray-700">
                                                Payment method:
                                            </label>
                                            <select className="form-select mr-3" id="billingpayments" name="billing.paymentMethod" value={state.billingAddress?.paymentMethod} onChange={handleChange}>
                                                <option value="private-note">Private note</option>
                                                <option value="note-customer">Note to customer</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-12">
                                            <label htmlFor="transaction" className=" text-sm font-medium text-gray-700">
                                                Transaction ID
                                            </label>
                                            <input type="text" className="form-input" name="billing.transactionId" value={state.billingAddress?.transactionId} onChange={handleChange} />
                                        </div>
                                    </div> */}
                                </>
                            )}
                        </div>

                        {/* Shipping Address */}
                        <div className="col-span-6 mr-5">
                            <div className="flex w-52 items-center justify-between">
                                <h5 className="mb-3 text-lg font-semibold">Shipping</h5>
                                <button type="button" onClick={() => setState({ showShippingInputs: !state.showShippingInputs })}>
                                    <IconPencil />
                                </button>
                            </div>

                            {state.showShippingInputs === false ? (
                                <>
                                    {isEmptyObject(state.shippingAddress) ? (
                                        <>
                                            <p>Address :</p>
                                            <p>No shipping address set. </p>
                                        </>
                                    ) : (
                                        <div className="mt-3 text-gray-500">
                                            <p>{`${state.shippingAddress?.firstName} ${state.shippingAddress?.lastName}`}</p>
                                            <p>{state.shippingAddress?.company}</p>
                                            <p>
                                                {`${state.shippingAddress?.address_1} - ${state.shippingAddress?.address_2}`}
                                                <br /> {state.shippingAddress?.city}
                                                <br /> {state.shippingAddress?.state}
                                                <br /> {state.shippingAddress?.countryArea}
                                            </p>
                                            {state.shippingAddress?.email && (
                                                <>
                                                    <p className="mt-3 font-semibold">Email Address:</p>
                                                    <p>
                                                        <a href="mailto:mail2inducs@gmail.com" className="text-primary underline">
                                                            {state.shippingAddress?.email}
                                                        </a>
                                                    </p>
                                                </>
                                            )}
                                            {state.shippingAddress?.phone && (
                                                <>
                                                    <p className="mt-3 font-semibold">Phone:</p>
                                                    <p>
                                                        <a href="tel:01803556656" className="text-primary underline">
                                                            {state.shippingAddress?.phone}
                                                        </a>
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setShippingAddress()} className="mr-3 text-primary underline">
                                        Load Shipping address
                                    </button>
                                    <button onClick={() => setState({ shippingAddress: state.billingAddress })} className="mr-3 text-primary underline">
                                        Copy Billing address
                                    </button>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-6">
                                            <label htmlFor="firstname" className=" text-sm font-medium text-gray-700">
                                                First Name
                                            </label>

                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.firstName'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.firstName"
                                                value={state.shippingAddress.firstName}
                                                onChange={handleShippingChange}
                                            />
                                            {state.shippingAddress['shipping.firstName'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.firstName']}</div>}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="Lastname" className=" text-sm font-medium text-gray-700">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.lastName'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.lastName"
                                                value={state.shippingAddress.lastName}
                                                onChange={handleShippingChange}
                                            />
                                            {state.shippingAddress['shipping.lastName'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.lastName']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-12">
                                            <label htmlFor="company" className=" text-sm font-medium text-gray-700">
                                                Company
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.company'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.company"
                                                value={state.shippingAddress.company}
                                                onChange={handleShippingChange}
                                            />
                                            {state.shippingAddress['shipping.company'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.company']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-6">
                                            <label htmlFor="addressline1" className=" text-sm font-medium text-gray-700">
                                                Addres Line 1
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.address_1'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.address_1"
                                                value={state.shippingAddress.address_1}
                                                onChange={handleShippingChange}
                                            />
                                            {state.shippingAddress['shipping.address_1'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.address_1']}</div>}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="addressline2" className=" text-sm font-medium text-gray-700">
                                                Addres Line 2
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.address_2'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.address_2"
                                                value={state.shippingAddress.address_2}
                                                onChange={handleShippingChange}
                                            />
                                            {state.shippingAddress['shipping.address_2'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.address_2']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-6">
                                            <label htmlFor="country" className=" text-sm font-medium text-gray-700">
                                                Country / Region
                                            </label>
                                            <select
                                                className={`form-select mr-3 ${state.shippingAddress['shipping.country'] && 'border border-danger focus:border-danger'}`}
                                                id="shippingcountry"
                                                name="shipping.country"
                                                value={state.shippingAddress.country}
                                                onChange={(e) => {
                                                    handleShippingChange(e);
                                                    shippingStateRefetch();
                                                    updateShippingAmount(e.target.value);
                                                }}
                                            >
                                                <option value="Select a country">Select a country</option>

                                                {state.countryList?.map((item: any) => (
                                                    <option key={item.code} value={item.code}>
                                                        {item.country}
                                                    </option>
                                                ))}
                                            </select>
                                            {state.shippingAddress['shipping.country'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.country']}</div>}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="state" className=" text-sm font-medium text-gray-700">
                                                State / Country
                                            </label>
                                            <select
                                                className={`form-select mr-3 ${state.shippingAddress['shipping.state'] && 'border border-danger focus:border-danger'}`}
                                                id="shippingstate"
                                                name="shipping.state"
                                                value={state.shippingAddress.state}
                                                onChange={handleShippingChange}
                                            >
                                                <option value="Select a state">Select a state</option>

                                                {state.shippingStateList?.map((item: any) => (
                                                    <option key={item.raw} value={item.raw}>
                                                        {item.raw}
                                                    </option>
                                                ))}
                                            </select>
                                            {state.shippingAddress['shipping.state'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.state']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-6">
                                            <label htmlFor="city" className=" text-sm font-medium text-gray-700">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.city'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.city"
                                                value={state.shippingAddress.city}
                                                onChange={handleShippingChange}
                                            />
                                            {state.shippingAddress['shipping.city'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.city']}</div>}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="pincode" className=" text-sm font-medium text-gray-700">
                                                Post Code / ZIP
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.pincode'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.pincode"
                                                value={state.shippingAddress.pincode}
                                                onChange={handleShippingChange}
                                            />
                                            {state.shippingAddress['shipping.pincode'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.pincode']}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-6">
                                            <label htmlFor="email" className=" text-sm font-medium text-gray-700">
                                                Email address
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-input ${state.shippingAddress['shipping.email'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.email"
                                                value={state.shippingAddress.email}
                                                maxLength={10}
                                                onChange={handleShippingChange}
                                            />
                                            {state.shippingAddress['shipping.email'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.email']}</div>}
                                        </div>
                                        <div className="col-span-6">
                                            <label htmlFor="phone" className=" text-sm font-medium text-gray-700">
                                                Phone
                                            </label>
                                            <input
                                                type="number"
                                                className={`form-input ${state.shippingAddress['shipping.phone'] && 'border border-danger focus:border-danger'}`}
                                                name="shipping.phone"
                                                value={state.shippingAddress.phone}
                                                maxLength={10}
                                                onChange={handleShippingChange}
                                            />
                                            {state.shippingAddress['shipping.phone'] && <div className="mt-1 text-danger">{state.shippingAddress['shipping.phone']}</div>}
                                        </div>
                                    </div>

                                    {/* <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-12">
                                            <label htmlFor="payments" className=" text-sm font-medium text-gray-700">
                                                Payment method:
                                            </label>
                                            <select
                                                className="form-select mr-3"
                                                id="shippingpayments"
                                                name="shipping.paymentMethod"
                                                value={state.shippingAddress.paymentMethod}
                                                onChange={handleShippingChange}
                                            >
                                                <option value="private-note">Private note</option>
                                                <option value="note-customer">Note to customer</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-12">
                                            <label htmlFor="transaction" className=" text-sm font-medium text-gray-700">
                                                Transaction ID
                                            </label>
                                            <input type="text" className="form-input" name="shipping.transactionId" value={state.shippingAddress.transactionId} onChange={handleChange} />

                                        </div>
                                    </div>
                                    <div className="mt-5 grid grid-cols-12 gap-3">
                                        <div className="col-span-12">
                                            <label htmlFor="phone" className=" text-sm font-medium text-gray-700">
                                                Customer Provided note:
                                            </label>
                                            <textarea className="form-input" name="note" id="note" cols="30" rows="2"></textarea>
                                        </div>
                                    </div> */}
                                </>
                            )}
                        </div>
                    </div>
                    {/* Product table  */}
                    <div className="panel p-5">
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Image</th>
                                        <th>SKU</th>
                                        <th className="w-1">Cost</th>
                                        <th className="w-1">Qty</th>
                                        <th>Total</th>
                                        <th>Action</th>
                                        <th className="w-1"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.lineList?.map((item: any, index: any) => (
                                        <tr className="align-top" key={index}>
                                            <td>{item?.productName}</td>
                                            <td>
                                                <img src={profilePic(item?.thumbnail?.url)} />
                                            </td>
                                            <td>{item?.productSku}</td>

                                            <td>
                                                {item?.totalPrice?.gross?.currency} {item?.totalPrice?.gross?.amount}
                                            </td>
                                            <td>{item?.quantity}</td>

                                            <td>
                                                {item?.totalPrice?.gross?.currency} {item?.totalPrice?.gross?.amount}
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        console.log('item: ', item);
                                                        setState({ editProduct: item, productIsEdit: true, addProductOpen: true, quantity: item?.quantity });
                                                    }}
                                                >
                                                    <IconPencil className="mr-3 h-5 w-5" />
                                                </button>
                                                <button type="button" onClick={() => deleteProduct(item)}>
                                                    <IconTrashLines className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
                            <div className="mb-6 sm:mb-0"></div>
                            <div className="sm:w-2/5">
                                <div className="flex items-center justify-between">
                                    <div>Subtotal</div>
                                    <div>
                                        {productDetails?.order?.subtotal?.gross?.currency} {productDetails?.order?.subtotal?.gross?.amount}
                                    </div>
                                </div>
                                {state.shippingAddress?.state !== '' &&
                                    (state.shippingAddress?.state == 'Tamil Nadu' ? (
                                        <>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div>SGST</div>
                                                <div>
                                                    {productDetails?.order?.subtotal?.gross?.currency} {productDetails?.order?.subtotal?.gross?.amount}
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div>CSGT</div>
                                                <div>
                                                    {productDetails?.order?.subtotal?.gross?.currency} {productDetails?.order?.subtotal?.gross?.amount}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="mt-4 flex items-center justify-between">
                                            <div>IGST</div>
                                            <div>
                                                {productDetails?.order?.subtotal?.gross?.currency} {productDetails?.order?.subtotal?.gross?.amount}
                                            </div>
                                        </div>
                                    ))}

                                {productDetails?.order?.shippingMethods > 0 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div>Shipping Rate</div>
                                        <div>
                                            {productDetails?.order?.shippingPrice?.gross?.currency} {productDetails?.order?.shippingPrice?.gross?.amount}
                                        </div>
                                    </div>
                                )}
                                {state.line?.length}
                                {productDetails?.order?.discounts?.length > 0 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div>Discount</div>
                                        {productDetails?.order?.discounts[0]?.calculationMode == 'PERCENTAGE' ? (
                                            <div>{`(${productDetails?.order?.discounts[0]?.value}%) ${productDetails?.order?.discounts[0]?.amount?.currency} ${productDetails?.order?.discounts[0]?.amount?.amount} `}</div>
                                        ) : (
                                            <div>{`${productDetails?.order?.discounts[0]?.amount?.currency} ${productDetails?.order?.discounts[0]?.amount?.amount}`}</div>
                                        )}
                                    </div>
                                )}
                                <div className="mt-4 flex items-center justify-between font-semibold">
                                    <div>Total</div>
                                    <div>
                                        {productDetails?.order?.total?.gross?.currency} {productDetails?.order?.total?.gross?.amount}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between  gap-2 border-t border-gray-200 pt-5">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => setState({ addProductOpen: true })}
                                    // setQuantity(0);
                                    // setProductIsEdit(false);
                                    // setAddProductOpen(true);
                                >
                                    Add Product
                                </button>
                                <button type="button" className="btn btn-outline-primary" onClick={() => setState({ isOpenCoupen: true })}>
                                    Apply coupon
                                </button>
                            </div>
                            <div>
                                <button type="button" className="btn btn-primary">
                                    Recalculate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className=" col-span-3 mb-5  ">
                    <div className="panel mb-5 p-5">
                        <div className="mb-5 border-b border-gray-200 pb-2 ">
                            <h3 className="text-lg font-semibold">Order Actions</h3>
                        </div>
                        <div>
                            <select className="form-select mr-3">
                                <option value="">Choose An Action</option>
                                <option value="Email Invoice">Email Invoice</option>
                            </select>
                        </div>
                        <div className="mt-5 border-t border-gray-200 pb-2 ">
                            <div className="flex flex-row-reverse items-center justify-between pt-3">
                                {/* <a href="#" className="text-danger underline">
                                            Move To Trash
                                        </a> */}
                                <button onClick={() => createOrder()} className="btn btn-outline-primary">
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="panel h-[520px] overflow-scroll p-5">
                        <div className="mb-5 border-b border-gray-200 pb-2 ">
                            <h3 className="text-lg font-semibold">Order Notes</h3>
                        </div>
                        <div className="mb-5 border-b border-gray-200 pb-2 ">
                            {state.notesList?.length > 0 ? (
                                state.notesList?.map((data: any) => {
                                    return (
                                        <div className="mb-5">
                                            <div className="text-gray-500">
                                                <div className=" mb-2 bg-gray-100  p-3 ">{data?.message}</div>
                                                <span className=" mr-1 border-b border-dotted border-gray-500">{moment(data?.date).format('MMMM DD, YYYY [at] HH:mm a')}</span>
                                                {data?.user && data?.user?.email && `by ${data.user.email}`}
                                                {data?.type == "NOTE_ADDED" &&
                                                <span className="ml-2 cursor-pointer text-danger" onClick={() => removeNotes(data)}>
                                                    Delete note
                                                </span>
                                                }
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <span className=" mr-1 border-b border-dotted border-gray-500">No data found</span>
                            )}

                            {/* <div className="mb-5">
                                <div className="text-gray-500">
                                    <div className="mb-2 bg-blue-200 p-3">Hi</div>
                                    <span className="mr-1 border-b border-dotted border-gray-500">April 20, 2024 at 11:26 am</span>- by prderepteamuser -{' '}
                                    <span className="ml-2 cursor-pointer text-danger ">Delete note</span>
                                </div>
                            </div>

                            <div className="mb-5">
                                <div className="text-gray-500">
                                    <div className="mb-2 bg-pink-200 p-3">Payment to be made upon delivery. Order status changed from Pending payment to Processing.</div>
                                    <span className="mr-1 border-b border-dotted border-gray-500">April 20, 2024 at 11:26 am</span>- by prderepteamuser -{' '}
                                    <span className="ml-2 cursor-pointer text-danger ">Delete note</span>
                                </div>
                            </div> */}
                        </div>

                        <Formik
                            initialValues={{ message: '', mail: false }}
                            validationSchema={SubmittedForm}
                            onSubmit={(values, { resetForm }) => {
                                onSubmit(values, { resetForm }); // Call the onSubmit function with form values and resetForm method
                            }}
                        >
                            {({ errors, submitCount, touched, setFieldValue, values }) => (
                                <Form>
                                    <label className="text-gray-700">Add note</label>
                                    <Field name="message" component="textarea" id="message" placeholder="Add a note" className="form-textarea" />

                                    {errors.message && touched.message && <div className="mt-1 text-danger">{errors.message}</div>}
                                    {/* <textarea className="form-textarea" rows="2" placeholder="Add a note"></textarea> */}

                                    <div className="mt-3 flex items-center justify-between">
                                        <select
                                            className="form-select mr-3"
                                            onChange={(e) => {
                                                const modeValue = e.target.value === 'private-note';
                                                setFieldValue('mail', modeValue);
                                            }}
                                        >
                                            <option value="private-note">Private note</option>
                                            <option value="note-customer">Note to customer</option>
                                        </select>
                                        <button type="submit" className="btn btn-outline-primary">
                                            Add
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>

            <Modal
                edit={state.productIsEdit}
                addHeader={'Add Product'}
                updateHeader={'Update Product'}
                open={state.addProductOpen}
                close={() => setState({ addProductOpen: false, productIsEdit: false })}
                renderComponent={() => (
                    <>
                        {state.productIsEdit ? (
                            <div className="p-5">
                                <div className="p-5">
                                    <input type="number" min={1} className="form-input" value={state.quantity} onChange={(e) => setState({ quantity: e.target.value })} />
                                </div>
                                <div className="flex justify-end gap-5">
                                    <button
                                        onClick={() => {
                                            setState({ selectedItems: {}, addProductOpen: false, productIsEdit: false });
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
                                <div className="p-3">
                                    <input type="text" className="form-input w-full p-3" placeholder="Search..." value={state.search} onChange={(e) => setState({ search: e.target.value })} />
                                </div>
                                {state.productList?.map(({ name, variants, thumbnail }) => (
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

            <Modal
                edit={state.isOpenCoupen}
                addHeader={'Discount this Order by:'}
                updateHeader={'Discount this Order by:'}
                open={state.isOpenCoupen}
                close={() => setState({ isOpenCoupen: false })}
                renderComponent={() => (
                    <>
                        <div className="overflow-scroll p-3">
                            <div className="flex items-center justify-center gap-5">
                                <div className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="radio"
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        checked={state.coupenOption === 'percentage'}
                                        onChange={() => setState({ ...state, coupenOption: 'percentage' })}
                                    />
                                    <span onClick={() => setState({ ...state, coupenOption: 'percentage' })}>Percentage</span>
                                </div>
                                <div className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="radio"
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        checked={state.coupenOption === 'fixed'}
                                        onChange={() => setState({ ...state, coupenOption: 'fixed' })}
                                    />
                                    <span onClick={() => setState({ coupenOption: 'fixed' })}>Fixed Amount</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-5">
                                <input
                                    type="number"
                                    className="form-input mb-5 mt-4"
                                    value={state.coupenOption === 'percentage' ? state.percentcoupenValue : state.fixedcoupenValue}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setState({
                                            percentcoupenValue: state.coupenOption === 'percentage' ? value : state.percentcoupenValue,
                                            fixedcoupenValue: state.coupenOption === 'fixed' ? value : state.fixedcoupenValue,
                                        });
                                    }}
                                />
                                <span>{state.coupenOption === 'percentage' ? '%' : 'INR'}</span>
                            </div>
                            <div className="flex justify-end gap-5">
                                <button className="rounded border border-black bg-transparent px-4 py-2 font-semibold text-black hover:border-transparent hover:bg-blue-500 hover:text-white">
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (productDetails?.order?.discounts?.length > 0) {
                                            updateDiscount();
                                        } else {
                                            addDiscount();
                                        }
                                    }}
                                    className="rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-500 hover:border-transparent hover:bg-blue-500 hover:text-white"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </>
                )}
            />
        </>
    );
}
