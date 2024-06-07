import IconLoader from '@/components/Icon/IconLoader';
import { ADD_CUSTOMER, COUNTRY_LIST, CUSTOMER_DETAILS, STATES_LIST, UPDATE_CUSTOMER } from '@/query/product';
import { Failure, Success, useSetState } from '@/utils/functions';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import * as Yup from 'yup';

export default function Edit() {
    const router = useRouter();
    const { id } = router.query;
    const [state, setState] = useSetState({
        firstName: '',
        lastName: '',
        email: '',
        pFirstName: '',
        pLastName: '',
        company: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        postalCode: '',
        country: '',
        loading: false,
        countryList: [],
        errors: {},
        countryArea: '',
        countryAreaList: [],
        billingAddress: {
            firstName: '',
            lastName: '',
            email: '',
            companyName: '',
            streetAddress1: '',
            streetAddress2: '',
            city: '',
            countryArea: '',
            postalCode: '',
            phone: '',
            cityArea: '',
            country: '',
        },
        shippingAddress: {
            firstName: '',
            lastName: '',
            email: '',
            companyName: '',
            streetAddress1: '',
            streetAddress2: '',
            city: '',
            countryArea: '',
            postalCode: '',
            phone: '',
            cityArea: '',
            country: '',
        },
    });

    const { data: countryData } = useQuery(COUNTRY_LIST);
    const { data: customerData } = useQuery(CUSTOMER_DETAILS, {
        variables: {
            id,
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

    const [updateCustomers] = useMutation(UPDATE_CUSTOMER);

    const { data: stateData, refetch: countryAreaRefetch } = useQuery(STATES_LIST);

    const validationSchema = Yup.object().shape({
        firstName: Yup.string().required('First name is required'),
        lastName: Yup.string().required('Last name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        // Add more field validations as required
    });

    useEffect(() => {
        getCountryList();
    }, [countryData]);

    useEffect(() => {
        getCustomerData();
    }, [customerData]);

    const getCountryList = () => {
        if (countryData) {
            if (countryData && countryData?.shop && countryData?.shop?.countries?.length > 0) {
                setState({ loading: false, countryList: countryData?.shop?.countries });
            } else {
                setState({ loading: false });
            }
        } else {
            setState({ loading: false });
        }
    };

    const getCustomerData = async () => {
        if (customerData) {
            if (customerData && customerData?.user) {
                const data = customerData?.user;
                const billing = data?.defaultBillingAddress;
                const shipping = data?.defaultShippingAddress;

                if (billing) {
                    const res = await countryAreaRefetch({
                        code: billing?.country?.code,
                    });
                    setState({
                        countryAreaList: res?.data?.addressValidationRules?.countryAreaChoices,
                        billingAddress: { ...billing, countryArea: res?.data?.addressValidationRules?.countryAreaChoices },
                    });
                }

                if (shipping) {
                    const res = await countryAreaRefetch({
                        code: shipping?.country?.code,
                    });
                    setState({
                        countryAreaList: res?.data?.addressValidationRules?.countryAreaChoices,
                        shippingAddress: { ...shipping, countryArea: res?.data?.addressValidationRules?.countryAreaChoices },
                    });
                }
                setState({
                    firstName: data?.firstName,
                    lastName: data?.lastName,
                    email: data?.email,
                    billingAddress: { ...billing, country: billing?.country?.code },
                    shippingAddress: { ...shipping, country: shipping?.country?.code },
                });
            } else {
                setState({ loading: false });
            }
        } else {
            setState({ loading: false });
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setState({
            [name]: value,
        });
        // Yup.reach(validationSchema, name)
        //     .validate(value)
        //     .then(() => {
        //         // No validation error, clear the error message
        //         setState((prevState: any) => ({
        //             ...prevState,
        //             errors: {
        //                 ...prevState.errors,
        //                 [name]: '',
        //             },
        //         }));
        //     })
        //     .catch((error: any) => {
        //         // Validation error, set the error message
        //         setState((prevState: any) => ({
        //             ...prevState,
        //             errors: {
        //                 ...prevState.errors,
        //                 [name]: error.message,
        //             },
        //         }));
        //     });
    };

    const updateCustomer = async () => {
        try {
            const address = {
                city: state.city,
                cityArea: '',
                companyName: state.company,
                country: state.country,
                countryArea: state.countryArea,
                firstName: state.pFirstName,
                lastName: state.pLastName,
                phone: state.phone,
                postalCode: state.postalCode,
                streetAddress1: state.address1,
                streetAddress2: state.address2,
            };
            console.log('address: ', address);

            const res = await updateCustomers({
                variables: {
                    id,
                    input: {
                        // defaultBillingAddress: address,
                        // defaultShippingAddress: address,
                        email: state.email,
                        firstName: state.firstName,
                        lastName: state.lastName,
                        note: '',
                    },
                },
            });
            if (res.data?.customerCreate?.errors?.length > 0) {
                Failure(res.data?.customerCreate?.errors[0]?.message);
            } else {
                // router.push('/customer/customer');
                Success('Customer update successfully');
            }
        } catch (error) {
            // Failure(error);
            console.log('error: ', error);
        }
    };

    return (
        <>
            <div className="panel mb-5 flex items-center justify-between gap-3 p-5 ">
                <h3 className="text-lg font-semibold dark:text-white-light">Update Customer</h3>
                {/* <button type="button" className="btn btn-primary">
                            Add Order
                        </button> */}
            </div>
            <div className="panel mt-5 grid grid-cols-12 gap-3">
                <div className="col-span-6">
                    <label htmlFor="firstname" className=" text-sm font-medium text-gray-700">
                        First Name
                    </label>

                    <input type="text" className={`form-input`} name="firstName" value={state.firstName} onChange={handleChange} />
                    {state.errors.firstName && <div className="mt-1 text-danger">{state.errors.firstName}</div>}
                </div>
                <div className="col-span-6">
                    <label htmlFor="Lastname" className=" text-sm font-medium text-gray-700">
                        Last Name
                    </label>
                    <input type="text" className={`form-input ${state.errors.lastName && 'border border-danger focus:border-danger'}`} name="lastName" value={state.lastName} onChange={handleChange} />
                    {state.errors.lastName && <div className="mt-1 text-danger">{state.errors.lastName}</div>}
                </div>
                <div className="col-span-6">
                    <label htmlFor="email" className=" text-sm font-medium text-gray-700">
                        Email address
                    </label>
                    <input type="text" disabled className={`form-input ${state.errors.email && 'border border-danger focus:border-danger'}`} name="email" value={state.email} onChange={handleChange} />
                    {state.errors.email && <div className="mt-1 text-danger">{state.errors.email}</div>}
                    {/* <input type="mail" className="form-input" name="billing.email" value={formData.billing.email} onChange={handleChange} /> */}

                    {/* <input type="mail" id="billingemail" name="billingemail" className="form-input" required /> */}
                </div>
            </div>
            <div className="flex gap-3">
                <div className="col-span-6">
                    <div className=" mt-5">
                        <label htmlFor="firstname" className=" text-lg font-bold text-gray-700">
                            Billing Address
                        </label>
                    </div>
                    <div className="panel mt-8 grid grid-cols-12 gap-3">
                        <div className="col-span-6">
                            <label htmlFor="pFirstName" className=" text-sm font-medium text-gray-700">
                                First Name
                            </label>

                            <input
                                type="text"
                                className={`form-input ${state.errors.firstName && 'border border-danger focus:border-danger'}`}
                                name="billingAddress.firstName"
                                value={state.billingAddress.firstName}
                                onChange={handleChange}
                            />
                            {state.errors.pFirstName && <div className="mt-1 text-danger">{state.errors.firstName}</div>}
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="pLastName" className=" text-sm font-medium text-gray-700">
                                Last Name
                            </label>
                            <input
                                type="text"
                                className={`form-input ${state.errors.lastName && 'border border-danger focus:border-danger'}`}
                                name="billingAddress.lastName"
                                value={state.billingAddress.lastName}
                                onChange={handleChange}
                            />
                            {state.errors.pLastName && <div className="mt-1 text-danger">{state.errors.lastName}</div>}
                        </div>

                        <div className="col-span-6">
                            <label htmlFor="company" className=" text-sm font-medium text-gray-700">
                                Company
                            </label>
                            <input
                                type="text"
                                className={`form-input ${state.errors.company && 'border border-danger focus:border-danger'}`}
                                name="billingAddress.companyName"
                                value={state.billingAddress.companyName}
                                onChange={handleChange}
                            />
                            {state.errors.company && <div className="mt-1 text-danger">{state.errors.company}</div>}
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="phone" className=" text-sm font-medium text-gray-700">
                                Phone
                            </label>
                            <input
                                type="text"
                                className={`form-input ${state.errors.phone && 'border border-danger focus:border-danger'}`}
                                name="billingAddress.phone"
                                value={state.billingAddress.phone}
                                maxLength={10}
                                onChange={handleChange}
                            />
                            {state.errors.phone && <div className="mt-1 text-danger">{state.errors.phone}</div>}
                        </div>

                        <div className="col-span-6">
                            <label htmlFor="addressline1" className=" text-sm font-medium text-gray-700">
                                Addres Line 1
                            </label>
                            <input
                                type="text"
                                className={`form-input ${state.errors.address1 && 'border border-danger focus:border-danger'}`}
                                name="billingAddress.streetAddress1"
                                value={state.billingAddress.streetAddress1}
                                onChange={handleChange}
                            />
                            {state.errors.address1 && <div className="mt-1 text-danger">{state.errors.address1}</div>}
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="addressline2" className=" text-sm font-medium text-gray-700">
                                Addres Line 2
                            </label>
                            <input
                                type="text"
                                className={`form-input ${state.errors.address2 && 'border border-danger focus:border-danger'}`}
                                name="billingAddress.streetAddress2"
                                value={state.billingAddress.streetAddress2}
                                onChange={handleChange}
                            />
                            {state.errors.address2 && <div className="mt-1 text-danger">{state.errors.address2}</div>}
                        </div>

                        <div className="col-span-6">
                            <label htmlFor="city" className=" text-sm font-medium text-gray-700">
                                City
                            </label>
                            <input
                                type="text"
                                className={`form-input ${state.errors.city && 'border border-danger focus:border-danger'}`}
                                name="billingAddress.city"
                                value={state.billingAddress.city}
                                onChange={handleChange}
                            />
                            {state.errors.city && <div className="mt-1 text-danger">{state.errors.city}</div>}
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="pincode" className=" text-sm font-medium text-gray-700">
                                Post Code / ZIP
                            </label>
                            <input
                                type="number"
                                className={`form-input ${state.errors.postalCode && 'border border-danger focus:border-danger'}`}
                                name="billingAddress.postalCode"
                                value={state.billingAddress.postalCode}
                                onChange={handleChange}
                            />
                            {state.errors.postalCode && <div className="mt-1 text-danger">{state.errors.postalCode}</div>}
                        </div>

                        <div className="col-span-6">
                            <label htmlFor="country" className=" text-sm font-medium text-gray-700">
                                Country / Region
                            </label>
                            <select
                                className={`form-select mr-3 ${state.errors.country && 'border border-danger focus:border-danger'}`}
                                // className="form-select mr-3"
                                id="billingcountry"
                                name="billingAddress.country"
                                value={state.billingAddress.country}
                                onChange={async (e) => {
                                    handleChange(e);
                                    const selectedCountryCode = e.target.value;
                                    const selectedCountry: any = state.countryList.find((country: any) => country.code === selectedCountryCode);
                                    if (selectedCountry) {
                                        setState({ country: selectedCountry.code });
                                        // setSelectedCountry(selectedCountry.country);
                                    }
                                    const res = await countryAreaRefetch({
                                        code: selectedCountry.code,
                                    });
                                    console.log('res: ', res);

                                    setState({ countryAreaList: res?.data?.addressValidationRules?.countryAreaChoices });
                                }}
                                // value={selectedCountry}
                                // onChange={(e) => getStateList(e.target.value)}
                            >
                                <option value={''}>Select country</option>

                                {state.countryList?.map((item: any) => (
                                    <option key={item.code} value={item.code}>
                                        {item.country}
                                    </option>
                                ))}
                            </select>
                            {state.errors.country && <div className="mt-1 text-danger">{state.errors.country}</div>}
                        </div>

                        <div className="col-span-6">
                            <label htmlFor="state" className=" text-sm font-medium text-gray-700">
                                State / Country
                            </label>
                            <select
                                className={`form-select mr-3 ${state.errors.countryArea && 'border border-danger focus:border-danger'}`}
                                id="countryArea"
                                name="billingAddress.countryArea"
                                value={state.billingAddress.countryArea}
                                onChange={handleChange}
                            >
                                <option value={''}>Select countryArea</option>

                                {state.countryAreaList?.map((item: any) => (
                                    <option key={item.raw} value={item.raw}>
                                        {item.raw}
                                    </option>
                                ))}
                            </select>
                            {state.errors.countryArea && <div className="mt-1 text-danger">{state.errors.countryArea}</div>}
                        </div>
                    </div>
                </div>

                <div className="col-span-6">
                    <div className="flex items-center justify-between">
                        <div className=" mt-5">
                            <label htmlFor="firstname" className=" text-lg font-bold text-gray-700">
                                Shipping Address
                            </label>
                        </div>
                        <div className="pt-4">
                            <button type="button" className="btn btn-primary " onClick={() => router.push(`/customer/address?id=${id}`)}>
                                Manage
                            </button>
                        </div>
                    </div>
                    <div className="panel mt-5 grid grid-cols-12 gap-3">
                        <div className="col-span-6">
                            <label htmlFor="pFirstName" className=" text-sm font-medium text-gray-700">
                                First Name
                            </label>

                            <input
                                type="text"
                                className={`form-input ${state.errors.firstName && 'border border-danger focus:border-danger'}`}
                                name="shippingAddress.firstName"
                                value={state.shippingAddress.firstName}
                                onChange={handleChange}
                            />
                            {state.errors.pFirstName && <div className="mt-1 text-danger">{state.errors.firstName}</div>}
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="pLastName" className=" text-sm font-medium text-gray-700">
                                Last Name
                            </label>
                            <input
                                type="text"
                                className={`form-input ${state.errors.lastName && 'border border-danger focus:border-danger'}`}
                                name="shippingAddress.lastName"
                                value={state.shippingAddress.lastName}
                                onChange={handleChange}
                            />
                            {state.errors.pLastName && <div className="mt-1 text-danger">{state.errors.lastName}</div>}
                        </div>

                        <div className="col-span-6">
                            <label htmlFor="company" className=" text-sm font-medium text-gray-700">
                                Company
                            </label>
                            <input
                                type="text"
                                className={`form-input ${state.errors.company && 'border border-danger focus:border-danger'}`}
                                name="shippingAddress.companyName"
                                value={state.shippingAddress.companyName}
                                onChange={handleChange}
                            />
                            {state.errors.company && <div className="mt-1 text-danger">{state.errors.company}</div>}
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="phone" className=" text-sm font-medium text-gray-700">
                                Phone
                            </label>
                            <input
                                type="text"
                                className={`form-input ${state.errors.phone && 'border border-danger focus:border-danger'}`}
                                name="shippingAddress.phone"
                                value={state.shippingAddress.phone}
                                maxLength={10}
                                onChange={handleChange}
                            />
                            {state.errors.phone && <div className="mt-1 text-danger">{state.errors.phone}</div>}
                        </div>

                        <div className="col-span-6">
                            <label htmlFor="addressline1" className=" text-sm font-medium text-gray-700">
                                Addres Line 1
                            </label>
                            <input
                                type="text"
                                className={`form-input ${state.errors.address1 && 'border border-danger focus:border-danger'}`}
                                name="shippingAddress.streetAddress1"
                                value={state.shippingAddress.streetAddress1}
                                onChange={handleChange}
                            />
                            {state.errors.address1 && <div className="mt-1 text-danger">{state.errors.address1}</div>}
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="addressline2" className=" text-sm font-medium text-gray-700">
                                Addres Line 2
                            </label>
                            <input
                                type="text"
                                className={`form-input ${state.errors.address2 && 'border border-danger focus:border-danger'}`}
                                name="shippingAddress.streetAddress2"
                                value={state.shippingAddress.streetAddress2}
                                onChange={handleChange}
                            />
                            {state.errors.address2 && <div className="mt-1 text-danger">{state.errors.address2}</div>}
                        </div>

                        <div className="col-span-6">
                            <label htmlFor="city" className=" text-sm font-medium text-gray-700">
                                City
                            </label>
                            <input
                                type="text"
                                className={`form-input ${state.errors.city && 'border border-danger focus:border-danger'}`}
                                name="shippingAddress.city"
                                value={state.shippingAddress.city}
                                onChange={handleChange}
                            />
                            {state.errors.city && <div className="mt-1 text-danger">{state.errors.city}</div>}
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="pincode" className=" text-sm font-medium text-gray-700">
                                Post Code / ZIP
                            </label>
                            <input
                                type="number"
                                className={`form-input ${state.errors.postalCode && 'border border-danger focus:border-danger'}`}
                                name="shippingAddress.postalCode"
                                value={state.shippingAddress.postalCode}
                                onChange={handleChange}
                            />
                            {state.errors.postalCode && <div className="mt-1 text-danger">{state.errors.postalCode}</div>}
                        </div>

                        <div className="col-span-6">
                            <label htmlFor="country" className=" text-sm font-medium text-gray-700">
                                Country / Region
                            </label>
                            <select
                                className={`form-select mr-3 ${state.errors.country && 'border border-danger focus:border-danger'}`}
                                // className="form-select mr-3"
                                id="billingcountry"
                                name="shippingAddress.country"
                                value={state.shippingAddress.country}
                                onChange={async (e) => {
                                    handleChange(e);
                                    const selectedCountryCode = e.target.value;
                                    const selectedCountry: any = state.countryList.find((country: any) => country.code === selectedCountryCode);
                                    if (selectedCountry) {
                                        setState({ country: selectedCountry.code });
                                        // setSelectedCountry(selectedCountry.country);
                                    }
                                    const res = await countryAreaRefetch({
                                        code: selectedCountry.code,
                                    });
                                    console.log('res: ', res);

                                    setState({ countryAreaList: res?.data?.addressValidationRules?.countryAreaChoices });
                                }}
                                // value={selectedCountry}
                                // onChange={(e) => getStateList(e.target.value)}
                            >
                                <option value={''}>Select country</option>

                                {state.countryList?.map((item: any) => (
                                    <option key={item.code} value={item.code}>
                                        {item.country}
                                    </option>
                                ))}
                            </select>
                            {state.errors.country && <div className="mt-1 text-danger">{state.errors.country}</div>}
                        </div>

                        <div className="col-span-6">
                            <label htmlFor="state" className=" text-sm font-medium text-gray-700">
                                State / Country
                            </label>
                            <select
                                className={`form-select mr-3 ${state.errors.countryArea && 'border border-danger focus:border-danger'}`}
                                id="countryArea"
                                name="shippingAddress.countryArea"
                                value={state.shippingAddress.countryArea}
                                onChange={handleChange}
                            >
                                <option value={''}>Select countryArea</option>

                                {state.countryAreaList?.map((item: any) => (
                                    <option key={item.raw} value={item.raw}>
                                        {item.raw}
                                    </option>
                                ))}
                            </select>
                            {state.errors.countryArea && <div className="mt-1 text-danger">{state.errors.countryArea}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
