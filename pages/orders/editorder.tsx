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

    useEffect(() => {
        getOrderData();
    }, [orderDetails]);

    const getOrderData = () => {
        console.log('getOrderData: ');
        setLoading(true);
        if (orderDetails) {
            if (orderDetails && orderDetails?.order) {
                console.log('orderDetails?.order: ', orderDetails?.order);

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
        const data = await addNotes({
            variables: { input: { message: record.message }, orderId: id },
        });
        console.log('data: ', data);

        const newData = { ...orderData, events: data?.data?.orderNoteAdd?.order?.events };
        setOrderData(newData);
        resetForm();
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
                        <div className="panel col-span-9 mb-5 p-5 ">
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
                                initialValues={{ message: '' }}
                                validationSchema={SubmittedForm}
                                onSubmit={(values, { resetForm }) => {
                                    onSubmit(values, { resetForm }); // Call the onSubmit function with form values and resetForm method
                                }}
                            >
                                {({ errors, submitCount, touched, setFieldValue, values }) => (
                                    <Form>
                                        <label className="text-gray-700">Add note</label>
                                        <Field name="message" type="textarea" id="message" placeholder="Add a note" className="form-textarea" />

                                        {errors.message && touched.message && <div className="mt-1 text-danger">{errors.message}</div>}
                                        {/* <textarea className="form-textarea" rows="2" placeholder="Add a note"></textarea> */}

                                        <div className="mt-3 flex items-center justify-between">
                                            <select className="form-select mr-3">
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
