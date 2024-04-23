import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { CREATE_NOTES, DELETE_NOTES, GET_ORDER_DETAILS } from '@/query/product';
import { Loader } from '@mantine/core';
import moment from 'moment';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@apollo/client';
import { showDeleteAlert } from '@/utils/functions';
import Swal from 'sweetalert2';
import IconPencil from '@/components/Icon/IconPencil';

const Editorder = () => {
    const router = useRouter();

    const [addNotes] = useMutation(CREATE_NOTES);
    const [deleteNotes] = useMutation(DELETE_NOTES);

    const { id } = router.query;

    const { error, data: orderDetails } = useQuery(GET_ORDER_DETAILS, {
        variables: { id },
    });

    const [orderData, setOrderData] = useState({});
    const [loading, setLoading] = useState(false);

    const [showBillingInputs, setShowBillingInputs] = useState(false);
    const [showShippingInputs, setShowShippingInputs] = useState(false);

    useEffect(() => {
        getOrderData();
    }, [orderDetails]);

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

                                            <input list="statusOptions" name="status" className="form-select" />

                                            <datalist id="statusOptions">
                                                <option value="processing">processing</option>
                                                <option value="onhold">onhold</option>
                                                <option value="completed">completed</option>
                                            </datalist>
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

                            <div className="panel p-5"></div>
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
                </>
            )}
        </>
    );
};

export default Editorder;
