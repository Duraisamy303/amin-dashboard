import React, { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { CREATE_NOTES, DELETE_NOTES, GET_ORDER_DETAILS, SHIPPING_LIST } from '@/query/product';
import { Loader } from '@mantine/core';
import moment from 'moment';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@apollo/client';
import { showDeleteAlert } from '@/utils/functions';
import Swal from 'sweetalert2';
import IconPencil from '@/components/Icon/IconPencil';
import IconX from '@/components/Icon/IconX';
import { Dialog, Transition } from '@headlessui/react';
import IconEdit from '@/components/Icon/IconEdit';
import Modal from '@/components/Modal';

const Editorder = () => {
    const router = useRouter();

    const [addNotes] = useMutation(CREATE_NOTES);
    const [deleteNotes] = useMutation(DELETE_NOTES);

    const { id } = router.query;

    const { error, data: orderDetails } = useQuery(GET_ORDER_DETAILS, {
        variables: { id },
    });

    const { data: shippingProvider } = useQuery(SHIPPING_LIST);

    const [orderData, setOrderData] = useState({});
    const [customerData, setCustomerData] = useState([]);
    const [loading, setLoading] = useState(false);

    //List data
    const [data, setData] = useState([]);
    console.log('data: ', data);

    const [btnOpen, setbtnOpen] = useState(false);

    //For fee
    const [feeOpen, setFeeOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState(0);
    const [feePrice, setFeePrice] = useState(0);
    const [feeIsEdit, setFeeIsEdit] = useState(false);

    // For product
    const [addProductOpen, setAddProductOpen] = useState(false);
    const [productIsEdit, setProductIsEdit] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(0);
    const [selectedUser, setSelectedUser] = useState('');
    const [quantity, setQuantity] = useState(0);

    //For shipping
    const [shippingOpen, setShippingOpen] = useState(false);
    const [selectedShipping, setSelectedShipping] = useState(0);
    const [shippingPrice, setShippingPrice] = useState(0);
    const [shippingIsEdit, setShippingIsEdit] = useState(false);

    const [showBillingInputs, setShowBillingInputs] = useState(false);
    const [showShippingInputs, setShowShippingInputs] = useState(false);

    useEffect(() => {
        getOrderData();
    }, [orderDetails]);

    useEffect(() => {
        getCustomer();
    }, [shippingProvider]);

    const getOrderData = () => {
        console.log('getOrderData: ');
        setLoading(true);
        if (orderDetails) {
            if (orderDetails && orderDetails?.order) {
                setOrderData(orderDetails?.order);
                setLoading(false);
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const getCustomer = () => {
        setLoading(true);
        if (shippingProvider) {
            if (shippingProvider && shippingProvider?.shippingCarriers?.edges?.length > 0) {
                setCustomerData(shippingProvider?.shippingCarriers?.edges);
                setLoading(false);
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const SubmittedForm = Yup.object().shape({
        message: Yup.string().required('Please fill the message'),
    });

    const onSubmit = async (record: any, { resetForm }: any) => {
        try {
            const aaa = { input: { message: record.message }, orderId: id, private_note: record.mail };

            const data = await addNotes({
                variables: { input: { message: record.message }, orderId: id, private_note: record.mail },
            });

            const newData = { ...orderData, events: data?.data?.orderNoteAdd?.order?.events };
            setOrderData(newData);
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
                const filter = orderData?.events?.filter((data: any) => data.id !== item.id);
                const newData = { ...orderData, events: filter };
                setOrderData(newData);
                Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Notes List is safe :)', 'error');
            }
        );
    };

    const BillingInputs = () => {
        setShowBillingInputs(!showBillingInputs);
    };

    const ShippingInputs = () => {
        setShowShippingInputs(!showShippingInputs);
    };

    const [items, setItems] = useState<any>([]);
    console.log('items: ', items);

    const addItem = () => {
        let maxId = 0;
        maxId = items?.length ? items.reduce((max: number, character: any) => (character.id > max ? character.id : max), items[0].id) : 0;

        setItems([
            ...items,
            {
                id: maxId + 1,
                title: '',
                description: '',
                rate: 0,
                quantity: 0,
                amount: 0,
            },
        ]);
    };

    const removeItem = (item: any = null) => {
        showDeleteAlert(
            async () => {
                setData(data.filter((data: any) => data.id !== item.id));

                Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your item List is safe :)', 'error');
            }
        );

        // setItems(items.filter((d: any) => d.id !== item.id));
    };

    const changeQuantityPrice = (type: string, value: string, id: number) => {
        // const list = items;

        const updatedItems = items.map((item: any) => {
            if (item.id === id) {
                // Update the quantity or amount based on the type
                const updatedValue = type === 'quantity' || type === 'amount' ? Number(value) : value;

                // Calculate the total after updating the quantity or amount
                const total = Number(item.quantity) * Number(item.amount);
                console.log('item.quantity: ', item.quantity, item.amount);

                // Return the updated item with the new value and total
                return {
                    ...item,
                    [type]: updatedValue,
                    total: total,
                };
            }
            return item;
        });
        setItems([...updatedItems]);

        console.log('updatedItems: ', updatedItems);

        const item = items.find((d: any) => d.id === id);
        if (type === 'quantity') {
            item.quantity = Number(value);
        }
        if (type === 'price') {
            item.amount = Number(value);
        }
    };

    // For product
    const handleAddProduct = (e: any) => {
        e.preventDefault();
        const product = { user: selectedUser, quantity: quantity, type: 'product', id: data.length + 1 };
        setData([product, ...data]);
        setAddProductOpen(false);
        setSelectedUser('');
        setQuantity(0);
        setProductIsEdit(false);
    };

    const handleUpdateProduct = (e: any) => {
        e.preventDefault();
        const newData = [...data];
        newData[selectedProduct] = { user: selectedUser, quantity: quantity, type: 'product' };
        setData(newData);
        setAddProductOpen(false);
        setSelectedUser('');
        setQuantity(0);
        setProductIsEdit(false);
    };

    //For fee
    const handleAddFee = (e: any) => {
        e.preventDefault();
        const product = { user: feePrice, type: 'fee', id: data.length + 1 };
        console.log('product: ', product);
        setData([...data, product]);
        setFeeOpen(false);
        setFeePrice(0);
        setFeeIsEdit(false);
    };

    const handleUpdateFee = (e: any) => {
        console.log('handleUpdateFee: ');
        e.preventDefault();
        const newData: any = [...data];
        newData[selectedFee] = { ...newData[selectedFee], user: feePrice, type: 'fee' };
        setData(newData);
        setFeeOpen(false);
        setFeePrice(0);
        setFeeIsEdit(false);
    };

    //For shipping
    const handleAddShipping = (e: any) => {
        e.preventDefault();
        const product = { user: shippingPrice, type: 'shipping', id: data.length + 1 };
        console.log('product: ', product);
        setData([...data, product]);
        setShippingOpen(false);
        setShippingPrice(0);
        setShippingIsEdit(false);
    };

    const handleUpdateShipping = (e: any) => {
        e.preventDefault();
        const newData: any = [...data];
        newData[selectedShipping] = { ...newData[selectedShipping], user: shippingPrice, type: 'shipping' };
        setData(newData);
        setShippingOpen(false);
        setShippingPrice(0);
        setShippingIsEdit(false);
    };

    return (
        <>
            {loading ? (
                <Loader />
            ) : (
                <>
                    <div className="panel mb-5 flex items-center justify-between gap-3 p-5 ">
                        <h3 className="text-lg font-semibold dark:text-white-light">Edit Order</h3>
                        <button type="button" className="btn btn-primary">
                            Add Order
                        </button>
                    </div>
                    <div className="grid grid-cols-12 gap-5 ">
                        <div className=" col-span-9 mb-5  ">
                            <div className="panel mb-5 p-5">
                                <div>
                                    <h3 className="text-lg font-semibold">Order #13754 Details</h3>
                                    <p className=" pt-1 text-gray-500">Payment via Cash on delivery. Customer IP: 122.178.161.16</p>
                                </div>
                                <div className="mt-8">
                                    <h5 className="mb-3 text-lg font-semibold">General</h5>
                                    <div className="grid grid-cols-12 gap-5">
                                        <div className="col-span-4">
                                            <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                                Date created:
                                            </label>

                                            <input type="datetime-local" id="dateTimeCreated" name="dateTimeCreated" className="form-input" required />
                                        </div>

                                        <div className="col-span-4">
                                            <label htmlFor="regularPrice" className="block pr-2 text-sm font-medium text-gray-700">
                                                Status:
                                            </label>
                                            <select className="form-select">
                                                <option value="processing">Processing</option>
                                                <option value="onhold">On Hold</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>

                                        <div className="col-span-4">
                                            <div className=" flex  items-center justify-between">
                                                <label htmlFor="status" className="block pr-2 text-sm font-medium text-gray-700">
                                                    Customer:
                                                </label>
                                                <div>
                                                    <p>
                                                        <a href="#" className="mr-2 text-primary">
                                                            Profile
                                                        </a>
                                                        /
                                                        <a href="#" className="ml-2 text-primary">
                                                            View Other Orders
                                                        </a>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* <input list="statusOptions" name="status" className="form-select" /> */}
                                            <select className="form-select">
                                                {customerData?.map((item) => (
                                                    <option value="processing">{item?.node?.name}</option>
                                                ))}
                                            </select>
                                            {/* <datalist id="statusOptions">
                                                <option value="processing">processing</option>
                                                <option value="onhold">onhold</option>
                                                <option value="completed">completed</option>
                                            </datalist> */}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-12 gap-5">
                                    <div className="col-span-6 mr-5">
                                        <div className="flex w-52 items-center justify-between">
                                            <h5 className="mb-3 text-lg font-semibold">Billing</h5>
                                            <button type="button" onClick={() => BillingInputs()}>
                                                <IconPencil className="cursor-pointer" />
                                            </button>
                                        </div>
                                        {showBillingInputs === false ? (
                                            <>
                                                <div className="mt-3 text-gray-500">
                                                    <p>RDA</p>
                                                    <p>Indumathi Navinkumar</p>
                                                    <p>
                                                        {' '}
                                                        59A Winner St <br /> Madurai 625010
                                                        <br /> Tamil Nadu
                                                    </p>
                                                    <p className="mt-3 font-semibold">Email Address:</p>
                                                    <p>
                                                        <a href="mailto:mail2inducs@gmail.com" className="text-primary underline">
                                                            mail2inducs@gmail.com
                                                        </a>
                                                    </p>

                                                    <p className="mt-3 font-semibold">Phone:</p>
                                                    <p>
                                                        <a href="tel:01803556656" className="text-primary underline">
                                                            01803 556656
                                                        </a>
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <a href="#" className="text-primary underline">
                                                    Load billing address
                                                </a>

                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-6">
                                                        <label htmlFor="firstname" className=" text-sm font-medium text-gray-700">
                                                            First Name
                                                        </label>
                                                        <input type="text" id="billingfname" name="billingfname" className="form-input" required />
                                                    </div>
                                                    <div className="col-span-6">
                                                        <label htmlFor="Lastname" className=" text-sm font-medium text-gray-700">
                                                            Last Name
                                                        </label>
                                                        <input type="text" id="billinglname" name="billinglname" className="form-input" required />
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-12">
                                                        <label htmlFor="company" className=" text-sm font-medium text-gray-700">
                                                            Company
                                                        </label>
                                                        <input type="text" id="billingcompany" name="billingcompany" className="form-input" required />
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-6">
                                                        <label htmlFor="addressline1" className=" text-sm font-medium text-gray-700">
                                                            Addres Line 1
                                                        </label>
                                                        <input type="text" id="billingaddress1" name="billingaddress1" className="form-input" required />
                                                    </div>
                                                    <div className="col-span-6">
                                                        <label htmlFor="addressline2" className=" text-sm font-medium text-gray-700">
                                                            Addres Line 2
                                                        </label>
                                                        <input type="text" id="billingaddress2" name="billingaddress2" className="form-input" required />
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-6">
                                                        <label htmlFor="city" className=" text-sm font-medium text-gray-700">
                                                            City
                                                        </label>
                                                        <input type="text" id="billingcity" name="billingcity" className="form-input" required />
                                                    </div>
                                                    <div className="col-span-6">
                                                        <label htmlFor="pincode" className=" text-sm font-medium text-gray-700">
                                                            Post Code / ZIP
                                                        </label>
                                                        <input type="text" id="billingpincode" name="billingpincode" className="form-input" required />
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-6">
                                                        <label htmlFor="country" className=" text-sm font-medium text-gray-700">
                                                            Country / Region
                                                        </label>
                                                        <select className="form-select mr-3" id="billingcountry" name="billingcountry">
                                                            <option value="india">India</option>
                                                            <option value="iran">Iran</option>
                                                            <option value="italy">Italy</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-6">
                                                        <label htmlFor="state" className=" text-sm font-medium text-gray-700">
                                                            State / County
                                                        </label>
                                                        <select className="form-select mr-3" id="billingstate" name="billingstate">
                                                            <option value="tamilnadu">Tamil Nadu</option>
                                                            <option value="kerala">Kerala</option>
                                                            <option value="Delhi">Delhi</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-6">
                                                        <label htmlFor="email" className=" text-sm font-medium text-gray-700">
                                                            Email address
                                                        </label>
                                                        <input type="mail" id="billingemail" name="billingemail" className="form-input" required />
                                                    </div>
                                                    <div className="col-span-6">
                                                        <label htmlFor="phone" className=" text-sm font-medium text-gray-700">
                                                            Phone
                                                        </label>
                                                        <input type="number" id="billingphone" name="billingphone" className="form-input" required />
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-12">
                                                        <label htmlFor="payments" className=" text-sm font-medium text-gray-700">
                                                            Payment method:
                                                        </label>
                                                        <select className="form-select mr-3" id="billingpayments" name="billingpayments">
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
                                                        <input type="text" id="billingtransaction" name="billingtransaction" className="form-input" required />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="col-span-6 mr-5">
                                        <div className="flex w-52 items-center justify-between">
                                            <h5 className="mb-3 text-lg font-semibold">Shipping</h5>
                                            <button type="button" onClick={() => ShippingInputs()}>
                                                <IconPencil />
                                            </button>
                                        </div>

                                        {showShippingInputs === false ? (
                                            <>
                                                <div className="mt-3 text-gray-500">
                                                    <p>RDA</p>
                                                    <p>Indumathi Navinkumar</p>
                                                    <p>
                                                        {' '}
                                                        59A Winner St <br /> Madurai 625010
                                                        <br /> Tamil Nadu
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <a href="#" className="mr-3 text-primary underline">
                                                    Load Shipping address
                                                </a>
                                                <a href="#" className="text-primary underline">
                                                    Copy Billing address
                                                </a>

                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-6">
                                                        <label htmlFor="firstname" className=" text-sm font-medium text-gray-700">
                                                            First Name
                                                        </label>
                                                        <input type="text" id="shippingfname" name="shippingfname" className="form-input" required />
                                                    </div>
                                                    <div className="col-span-6">
                                                        <label htmlFor="Lastname" className=" text-sm font-medium text-gray-700">
                                                            Last Name
                                                        </label>
                                                        <input type="text" id="shippinglname" name="shippinglname" className="form-input" required />
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-12">
                                                        <label htmlFor="company" className=" text-sm font-medium text-gray-700">
                                                            Company
                                                        </label>
                                                        <input type="text" id="shippingcompany" name="shippingcompany" className="form-input" required />
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-6">
                                                        <label htmlFor="addressline1" className=" text-sm font-medium text-gray-700">
                                                            Addres Line 1
                                                        </label>
                                                        <input type="text" id="shippingaddress1" name="shippingaddress1" className="form-input" required />
                                                    </div>
                                                    <div className="col-span-6">
                                                        <label htmlFor="addressline2" className=" text-sm font-medium text-gray-700">
                                                            Addres Line 2
                                                        </label>
                                                        <input type="text" id="shippingaddress2" name="shippingaddress2" className="form-input" required />
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-6">
                                                        <label htmlFor="city" className=" text-sm font-medium text-gray-700">
                                                            City
                                                        </label>
                                                        <input type="text" id="shippingcity" name="shippingcity" className="form-input" required />
                                                    </div>
                                                    <div className="col-span-6">
                                                        <label htmlFor="pincode" className=" text-sm font-medium text-gray-700">
                                                            Post Code / ZIP
                                                        </label>
                                                        <input type="text" id="shippingpincode" name="shippingpincode" className="form-input" required />
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-6">
                                                        <label htmlFor="country" className=" text-sm font-medium text-gray-700">
                                                            Country / Region
                                                        </label>
                                                        <select className="form-select mr-3" id="shippingcountry" name="shippingcountry">
                                                            <option value="india">India</option>
                                                            <option value="iran">Iran</option>
                                                            <option value="italy">Italy</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-6">
                                                        <label htmlFor="state" className=" text-sm font-medium text-gray-700">
                                                            State / County
                                                        </label>
                                                        <select className="form-select mr-3" id="shippingstate" name="shippingstate">
                                                            <option value="tamilnadu">Tamil Nadu</option>
                                                            <option value="kerala">Kerala</option>
                                                            <option value="Delhi">Delhi</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    {/* <div className="col-span-6">
                                            <label htmlFor="email" className=" text-sm font-medium text-gray-700">
                                                Email address
                                            </label>
                                            <input type="mail" id="billingemail" name="billingemail" className="form-input" required />
                                        </div> */}
                                                    <div className="col-span-6">
                                                        <label htmlFor="phone" className=" text-sm font-medium text-gray-700">
                                                            Phone
                                                        </label>
                                                        <input type="number" id="shippingphone" name="shippingphone" className="form-input" required />
                                                    </div>
                                                </div>
                                                <div className="mt-5 grid grid-cols-12 gap-3">
                                                    <div className="col-span-12">
                                                        <label htmlFor="phone" className=" text-sm font-medium text-gray-700">
                                                            Customer Provided note:
                                                        </label>
                                                        <textarea className="form-input" name="note" id="note" cols="30" rows="2"></textarea>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="panel p-5">
                                <div className="table-responsive">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th className="w-1">Cost</th>
                                                <th className="w-1">Qty</th>
                                                <th>Total</th>
                                                <th>Action</th>

                                                <th className="w-1"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data?.length <= 0 && (
                                                <tr>
                                                    <td colSpan={5} className="!text-center font-semibold">
                                                        No Item Available
                                                    </td>
                                                </tr>
                                            )}
                                            {data?.map((item: any, index: any) => {
                                                console.log('item: ', item);
                                                return item?.type == 'product' ? (
                                                    <tr className="panel align-top" key={index}>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-input min-w-[200px]"
                                                                placeholder="Enter Item Name"
                                                                value={item.user}
                                                                disabled
                                                                onChange={(e) => changeQuantityPrice('title', e.target.value, item.id)}
                                                            />
                                                        </td>
                                                        <td></td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-input w-32"
                                                                placeholder="Price"
                                                                value={item.quantity}
                                                                min={0}
                                                                disabled
                                                                onChange={(e) => changeQuantityPrice('price', e.target.value, item.id)}
                                                            />
                                                        </td>
                                                        <td>${item.quantity * item.amount}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedUser(item.user);
                                                                    setQuantity(item.quantity);
                                                                    setAddProductOpen(true);
                                                                    setProductIsEdit(true);
                                                                    setSelectedProduct(index);
                                                                }}
                                                            >
                                                                <IconEdit className="h-5 w-5" />
                                                            </button>
                                                            <button type="button" onClick={() => removeItem(item)}>
                                                                <IconX className="h-5 w-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ) : item?.type == 'fee' ? (
                                                    <>
                                                        <tr className="panel align-top" key={index}>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-input min-w-[200px]"
                                                                    placeholder="Enter Item Name"
                                                                    value={'Fee'}
                                                                    disabled
                                                                    onChange={(e) => changeQuantityPrice('title', e.target.value, item.id)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-input min-w-[200px]"
                                                                    placeholder="Enter Item Name"
                                                                    value={item.user}
                                                                    disabled
                                                                    onChange={(e) => changeQuantityPrice('title', e.target.value, item.id)}
                                                                />
                                                            </td>
                                                            <td></td>
                                                            <td>${item.quantity * item.amount}</td>
                                                            <td>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFeePrice(item.user);
                                                                        setFeePrice(item.user);
                                                                        setFeeOpen(true);
                                                                        setFeeIsEdit(true);
                                                                        setSelectedFee(index);
                                                                    }}
                                                                >
                                                                    <IconEdit className="h-5 w-5" />
                                                                </button>
                                                                <button type="button" onClick={() => removeItem(item)}>
                                                                    <IconX className="h-5 w-5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </>
                                                ) : item?.type == 'shipping' ? (
                                                    <>
                                                        <tr className="panel align-top" key={index}>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-input min-w-[200px]"
                                                                    placeholder="Enter Item Name"
                                                                    value={'Shipping'}
                                                                    disabled
                                                                    onChange={(e) => changeQuantityPrice('title', e.target.value, item.id)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-input min-w-[200px]"
                                                                    placeholder="Enter Item Name"
                                                                    value={item.user}
                                                                    disabled
                                                                    onChange={(e) => changeQuantityPrice('title', e.target.value, item.id)}
                                                                />
                                                            </td>
                                                            <td></td>
                                                            <td>${item.quantity * item.amount}</td>
                                                            <td>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setShippingPrice(item.user);
                                                                        setShippingOpen(true);
                                                                        setShippingIsEdit(true);
                                                                        setSelectedShipping(index);
                                                                    }}
                                                                >
                                                                    <IconEdit className="h-5 w-5" />
                                                                </button>
                                                                <button type="button" onClick={() => removeItem(item)}>
                                                                    <IconX className="h-5 w-5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </>
                                                ) : null;
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
                                    <div className="mb-6 sm:mb-0"></div>
                                    <div className="sm:w-2/5">
                                        <div className="flex items-center justify-between">
                                            <div>Subtotal</div>
                                            <div>$265.00</div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div>Tax(%)</div>
                                            <div>0%</div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div>Shipping Rate($)</div>
                                            <div>$0.00</div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div>Discount(%)</div>
                                            <div>0%</div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between font-semibold">
                                            <div>Total</div>
                                            <div>$265.00</div>
                                        </div>
                                    </div>
                                </div>

                                {btnOpen ? (
                                    <div className="mt-3 flex  flex-row-reverse gap-1">
                                        <button type="button" className="btn btn-primary" onClick={() => addItem()}>
                                            Save
                                        </button>
                                        <button type="button" className="btn btn-outline-primary" onClick={() => setbtnOpen(false)}>
                                            cancel
                                        </button>
                                        <button type="button" className="btn btn-outline-primary">
                                            Add tax
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={() => {
                                                setShippingPrice(0);
                                                setShippingIsEdit(false);
                                                setShippingOpen(true);
                                            }}
                                        >
                                            Add shipping
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={() => {
                                                setFeePrice(0);
                                                setFeeIsEdit(false);
                                                setFeeOpen(true);
                                            }}
                                        >
                                            Add fee
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={() => {
                                                setSelectedUser('');
                                                setQuantity(0);
                                                setProductIsEdit(false);
                                                setAddProductOpen(true);
                                            }}
                                        >
                                            Add product(s)
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-6 flex">
                                        <button type="button" className="btn btn-primary" onClick={() => setbtnOpen(true)}>
                                            Add Item
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="panel col-span-3 mb-5 p-5 ">
                            <div className="mb-5 border-b border-gray-200 pb-2 ">
                                <h3 className="text-lg font-semibold">Order Notes</h3>
                            </div>
                            <div className="mb-5 border-b border-gray-200 pb-2 ">
                                {orderData?.events?.length > 0 ? (
                                    orderData?.events?.map((data: any) => (
                                        <div className="mb-5">
                                            <div className="text-gray-500">
                                                <div className=" mb-2 bg-gray-100  p-3 ">{data?.message}</div>
                                                <span className=" mr-1 border-b border-dotted border-gray-500">{moment(data?.date).format('MMMM DD, YYYY [at] HH:mm a')}</span>
                                                {data?.user && data?.user?.email && `by ${data.user.email}`}
                                                <span className="ml-2 cursor-pointer text-danger" onClick={() => removeNotes(data)}>
                                                    Delete note
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <span className=" mr-1 border-b border-dotted border-gray-500">No data found</span>
                                )}

                                {/* <div className="mb-5">
                                    <div className="text-gray-500">
                                        <div className="mb-2 bg-blue-200 p-3">Hi</div>
                                        <span class="mr-1 border-b border-dotted border-gray-500">April 20, 2024 at 11:26 am</span>- by prderepteamuser -{' '}
                                        <span className="ml-2 cursor-pointer text-danger ">Delete note</span>
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <div className="text-gray-500">
                                        <div className="mb-2 bg-pink-200 p-3">Payment to be made upon delivery. Order status changed from Pending payment to Processing.</div>
                                        <span class="mr-1 border-b border-dotted border-gray-500">April 20, 2024 at 11:26 am</span>- by prderepteamuser -{' '}
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
                    <Modal
                        edit={productIsEdit}
                        addHeader={'Add Product'}
                        updateHeader={'Update Product'}
                        open={addProductOpen}
                        close={() => setAddProductOpen(false)}
                        renderComponent={() => (
                            <div className="p-5">
                                <form onSubmit={productIsEdit ? handleUpdateProduct : handleAddProduct}>
                                    <div className=" flex justify-between">
                                        <label htmlFor="name">Product</label>
                                        <label htmlFor="name">Quantity</label>
                                    </div>
                                    <div className="flex gap-5">
                                        <select id="user" className="form-select" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                                            <option value="">Select User</option>
                                            <option value="Max Smith">Max Smith</option>
                                            <option value="John Doe">John Doe</option>
                                            <option value="Kia Jain">Kia Jain</option>
                                            <option value="Karena Courtliff">Karena Courtliff</option>
                                            <option value="Vladamir Koschek">Vladamir Koschek</option>
                                            <option value="Robert Garcia">Robert Garcia</option>
                                            <option value="Marie Hamilton">Marie Hamilton</option>
                                            <option value="Megan Meyers">Megan Meyers</option>
                                            <option value="Angela Hull">Angela Hull</option>
                                            <option value="Karen Wolf">Karen Wolf</option>
                                            <option value="Jasmine Barnes">Jasmine Barnes</option>
                                            <option value="Thomas Cox">Thomas Cox</option>
                                            <option value="Marcus Jones">Marcus Jones</option>
                                            <option value="Matthew Gray">Matthew Gray</option>
                                            <option value="Chad Davis">Chad Davis</option>
                                            <option value="Linda Drake">Linda Drake</option>
                                            <option value="Kathleen Flores">Kathleen Flores</option>
                                        </select>
                                        <input
                                            type="number"
                                            className="form-input w-20"
                                            // placeholder="Quantity"
                                            // defaultValue={item.quantity}
                                            value={quantity}
                                            onChange={(e: any) => setQuantity(e.target.value)}
                                            min={0}
                                            // onChange={(e) => changeQuantityPrice('quantity', e.target.value, item.id)}
                                        />
                                    </div>

                                    <div className="mt-8 flex items-center justify-end">
                                        <button type="button" className="btn btn-outline-danger gap-2" onClick={() => setAddProductOpen(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                            {productIsEdit ? 'Update Product' : 'Add Product'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    />

                    <Modal
                        edit={feeIsEdit}
                        addHeader={'Add Fee'}
                        updateHeader={'Update Fee'}
                        open={feeOpen}
                        close={() => setFeeOpen(false)}
                        renderComponent={() => (
                            <div className="p-5">
                                <form onSubmit={feeIsEdit ? handleUpdateFee : handleAddFee}>
                                    <div className="">
                                        <div className="mb-3  bg-[#fbfbfb] text-sm  font-medium dark:bg-[#121c2c]">{'Enter a fixed amount or percentage to apply as a fee.'}</div>

                                        <input
                                            type="number"
                                            className="form-input w-full"
                                            // placeholder="Quantity"
                                            // defaultValue={item.quantity}
                                            value={feePrice}
                                            onChange={(e: any) => setFeePrice(e.target.value)}
                                            min={0}
                                            // onChange={(e) => changeQuantityPrice('quantity', e.target.value, item.id)}
                                        />
                                    </div>
                                    <div className="mt-8 flex items-center justify-end">
                                        <button type="button" className="btn btn-outline-danger gap-2" onClick={() => setFeeOpen(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                            {feeIsEdit ? 'Update Fee' : 'Add Fee'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    />

                    <Modal
                        edit={shippingIsEdit}
                        addHeader={'Add Shipping'}
                        updateHeader={'Update Shipping'}
                        open={shippingOpen}
                        close={() => setShippingOpen(false)}
                        renderComponent={() => (
                            <div className="p-5">
                                <form onSubmit={shippingIsEdit ? handleUpdateShipping : handleAddShipping}>
                                    <div className="">
                                        <div className="mb-3  bg-[#fbfbfb] text-sm  font-medium dark:bg-[#121c2c]">{'Enter a fixed amount or percentage to apply as a Shipping.'}</div>

                                        <input
                                            type="number"
                                            className="form-input w-full"
                                            // placeholder="Quantity"
                                            // defaultValue={item.quantity}
                                            value={shippingPrice}
                                            onChange={(e: any) => setShippingPrice(e.target.value)}
                                            min={0}
                                            // onChange={(e) => changeQuantityPrice('quantity', e.target.value, item.id)}
                                        />
                                    </div>
                                    <div className="mt-8 flex items-center justify-end">
                                        <button type="button" className="btn btn-outline-danger gap-2" onClick={() => setShippingOpen(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                            {shippingIsEdit ? 'Update Shipping' : 'Add Shipping'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    />
                </>
            )}
        </>
    );
};

export default Editorder;
