import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconBell from '@/components/Icon/IconBell';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import IconPencil from '@/components/Icon/IconPencil';
import { Button, Loader } from '@mantine/core';
import Dropdown from '../../components/Dropdown';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '@/components/Icon/IconX';
import Image1 from '@/public/assets/images/profile-1.jpeg';
import Image2 from '@/public/assets/images/profile-2.jpeg';
import Image3 from '@/public/assets/images/profile-3.jpeg';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import IconEye from '@/components/Icon/IconEye';
import { CREATE_DESIGN, CREATE_DRAFT_ORDER, CREATE_FINISH, DELETE_FINISH, FINISH_LIST, ORDER_LIST, UPDATE_DESIGN, UPDATE_FINISH } from '@/query/product';
import { useMutation, useQuery } from '@apollo/client';
import moment from 'moment';
import { useRouter } from 'next/router';
import Modal from '@/components/Modal';
import { useSetState } from '@/utils/functions';
import dayjs from 'dayjs';

const Orders = () => {
    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [state, setState] = useSetState({
        isOpenChannel: false,
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
    });

    const [draftOrder] = useMutation(CREATE_DRAFT_ORDER);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Checkbox Table'));
    });
    const router = useRouter();

    const { error, data: finishData } = useQuery(ORDER_LIST, {
        variables: { channel: 'india-channel', first: 100 },
    });

    const [finishList, setFinishList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getFinishList();
    }, [finishData]);

    const getFinishList = () => {
        setLoading(true);
        if (finishData) {
            console.log("finishData: ", finishData);
            if (finishData && finishData.orders && finishData.orders?.edges?.length > 0) {
                const newData = finishData.orders?.edges.map((item: any) => ({
                    ...item.node,
                    order: `#${item?.node?.number} ${item?.node?.user?.firstName}${item?.node?.user?.lastName}`,
                    date: dayjs(item?.node?.updatedAt).format('MMM D, YYYY'),
                    status: item?.node?.status,
                    total: item?.node?.total.gross.amount,
                    payment: item?.node?.paymentStatus,
                }));
                console.log('newData: ', newData);
                setFinishList(newData);
                setLoading(false);
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState([]); // Initialize initialRecords with an empty array
    const [recordsData, setRecordsData] = useState([]);

    // Update initialRecords whenever finishList changes
    useEffect(() => {
        // Sort finishList by 'id' and update initialRecords
        setInitialRecords(sortBy(finishList, 'id'));
    }, [finishList]);

    // Log initialRecords when it changes
    useEffect(() => {
        console.log('initialRecords: ', initialRecords);
    }, [initialRecords]);

    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [modal1, setModal1] = useState(false);
    const [modalTitle, setModalTitle] = useState(null);
    const [modalContant, setModalContant] = useState<any>(null);

    // const [viewModal, setViewModal] = useState(false);

    //Mutation
    const [addOrder] = useMutation(CREATE_FINISH);
    const [updateOrder] = useMutation(UPDATE_FINISH);
    const [deleteDesign] = useMutation(DELETE_FINISH);
    const [bulkDelete] = useMutation(DELETE_FINISH);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return finishList.filter((item: any) => {
                return (
                    item.id.toString().includes(search.toLowerCase()) ||
                    // item.image.toLowerCase().includes(search.toLowerCase()) ||
                    item.order.toLowerCase().includes(search.toLowerCase())
                    // item.description.toLowerCase().includes(search.toLowerCase()) ||
                    // item.slug.toLowerCase().includes(search.toLowerCase()) ||
                    // item.count.toString().includes(search.toLowerCase())
                );
            });
        });
    }, [search]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    }, [sortStatus]);

    // FORM VALIDATION
    const SubmittedForm = Yup.object().shape({
        name: Yup.string().required('Please fill the Name'),
        // description: Yup.string().required('Please fill the Description'),
        // slug: Yup.string().required('Please fill the Slug'),
        // count: Yup.string().required('Please fill the count'),
        // image: Yup.string().required('Please fill the Image'),
        // parentCategory: Yup.string().required('Please fill the Parent Category'),
    });

    // form submit
    const onSubmit = async (record: any, { resetForm }: any) => {
        try {
            const variables = {
                input: {
                    name: record.name,
                },
            };

            const { data } = await (modalTitle ? updateOrder({ variables: { ...variables, id: modalContant.id } }) : addOrder({ variables }));
            console.log('data: ', data);

            const newData = modalTitle ? data?.productFinishUpdate?.productFinish : data?.productFinishCreate?.productFinish;
            console.log('newData: ', newData);

            if (!newData) {
                console.error('Error: New data is undefined.');
                return;
            }
            const updatedId = newData.id;
            const index = recordsData.findIndex((design: any) => design && design.id === updatedId);

            const updatedDesignList: any = [...recordsData];
            if (index !== -1) {
                updatedDesignList[index] = newData;
            } else {
                updatedDesignList.push(newData);
            }

            // setFinishList(updatedDesignList);
            setRecordsData(updatedDesignList);
            const toast = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000,
            });
            toast.fire({
                icon: modalTitle ? 'success' : 'info',
                title: modalTitle ? 'Data updated successfully' : 'New data added successfully',
                padding: '10px 20px',
            });

            setModal1(false);
            resetForm();
        } catch (error) {
            console.log('error: ', error);
        }
    };

    // category table edit
    const EditOrder = (record: any) => {
        router.push(`/orders/editorder?id=${record.id}`);
    };

    // category table create
    const CreateOrder = () => {
        // setModal1(true);
        // setModalTitle(null);
        // setModalContant(null);
        router.push('/orders/new-order');
    };

    // view categotry
    // const ViewOrder = (record: any) => {
    //     setViewModal(true);
    // };

    // delete Alert Message
    const showDeleteAlert = (onConfirm: () => void, onCancel: () => void) => {
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
                text: "You won't be able to revert this!",
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

    const BulkDeleteOrder = async () => {
        showDeleteAlert(
            () => {
                if (selectedRecords.length === 0) {
                    Swal.fire('Cancelled', 'Please select at least one record!', 'error');
                    return;
                }
                selectedRecords?.map(async (item: any) => {
                    await bulkDelete({ variables: { id: item.id } });
                });
                const updatedRecordsData = finishList.filter((record) => !selectedRecords.includes(record));
                setFinishList(updatedRecordsData);
                setSelectedRecords([]);
                Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Product List is safe :)', 'error');
            }
        );
    };

    const DeleteOrder = (record: any) => {
        showDeleteAlert(
            async () => {
                const { data } = await deleteDesign({ variables: { id: record.id } });
                const updatedRecordsData = finishList.filter((dataRecord: any) => dataRecord.id !== record.id);
                setRecordsData(updatedRecordsData);
                setFinishList(updatedRecordsData);
                // getFinishList()
                setSelectedRecords([]);
                // setFinishList(finishList)
                Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Order List is safe :)', 'error');
            }
        );
    };

    // completed category delete option
    const handleSetChannel = () => {
        createDraftOrder();
    };

    const createDraftOrder = async () => {
        try {
            const { data } = await draftOrder({
                variables: {
                    input: {
                        channelId: state.selectedCurrency == 'USD' ? 'Q2hhbm5lbDox' : 'Q2hhbm5lbDoy',
                    },
                },
            });
            localStorage.setItem('channel', state.selectedCurrency);
            router.push({
                pathname: '/orders/new-order',
                query: { orderId: data?.draftOrderCreate?.order?.id },
            });
        } catch (error) {
            console.log('error: ', error);
        }
    };
    return (
        <div>
            <div className="panel mt-6">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Orders</h5>

                    <div className="flex ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input mr-2 w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <div className="dropdown  mr-2 ">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="btn btn-outline-primary dropdown-toggle"
                                button={
                                    <>
                                        Bulk Actions
                                        <span>
                                            <IconCaretDown className="inline-block ltr:ml-1 rtl:mr-1" />
                                        </span>
                                    </>
                                }
                            >
                                <ul className="!min-w-[170px]">
                                    <li>
                                        <button type="button" onClick={() => BulkDeleteOrder()}>
                                            Delete
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                        <button type="button" className="btn btn-primary" onClick={() => setState({ isOpenChannel: true })}>
                            + Create
                        </button>
                    </div>
                </div>

                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="dropdown  mr-2 ">
                        <Dropdown
                            placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                            btnClassName="btn btn-outline-primary dropdown-toggle"
                            button={
                                <>
                                    All dates
                                    <span>
                                        <IconCaretDown className="inline-block ltr:ml-1 rtl:mr-1" />
                                    </span>
                                </>
                            }
                        >
                            <ul className="!min-w-[120px]">
                                <li>
                                    <button type="button">All dates</button>
                                </li>

                                <li>
                                    <button type="button">April 2024</button>
                                </li>

                                <li>
                                    <button type="button">March 2024</button>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>
                    <div className="dropdown  mr-2 ">
                        <Dropdown
                            placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                            btnClassName="btn btn-outline-primary dropdown-toggle"
                            button={
                                <>
                                    Filter by Registered Customer
                                    <span>
                                        <IconCaretDown className="inline-block ltr:ml-1 rtl:mr-1" />
                                    </span>
                                </>
                            }
                        >
                            <ul className="!min-w-[120px]">
                                <li>
                                    <button type="button">Customer Name</button>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>
                    <div>
                        <button type="button" className="btn btn-primary">
                            Filter
                        </button>
                    </div>
                </div>
                {loading ? (
                    <Loader />
                ) : (
                    <div className="datatables">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={finishList}
                            columns={[
                                // { accessor: 'id', sortable: true },
                                // { accessor: 'image', sortable: true, render: (row) => <img src={row.image} alt="Product" className="h-10 w-10 object-cover ltr:mr-2 rtl:ml-2" /> },
                                { accessor: 'order', sortable: true, },
                                { accessor: 'date', sortable: true },
                                { accessor: 'status', sortable: true,title: 'Order status'},
                                { accessor: 'paymentStatus', sortable: true,title: 'Payment status' },
                                { accessor: 'total', sortable: true },
                                {
                                    // Custom column for actions
                                    accessor: 'actions', // You can use any accessor name you want
                                    title: 'Actions',
                                    // Render method for custom column
                                    render: (row: any) => (
                                        <>
                                            {/* <Tippy content="View">
                                                <button type="button" onClick={() => ViewOrder(row)}>
                                                    <IconEye className="ltr:mr-2 rtl:ml-2" />
                                                </button>
                                            </Tippy> */}
                                            <Tippy content="Edit">
                                                <button type="button" onClick={() => EditOrder(row)}>
                                                    <IconPencil className="ltr:mr-2 rtl:ml-2" />
                                                </button>
                                            </Tippy>
                                            <Tippy content="Delete">
                                                <button type="button" onClick={() => DeleteOrder(row)}>
                                                    <IconTrashLines />
                                                </button>
                                            </Tippy>
                                        </>
                                    ),
                                },
                            ]}
                            highlightOnHover
                            totalRecords={finishList.length}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            selectedRecords={selectedRecords}
                            onSelectedRecordsChange={(selectedRecords) => {
                                setSelectedRecords(selectedRecords);
                            }}
                            minHeight={200}
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                    </div>
                )}
            </div>

            {/* CREATE AND EDIT CATEGORY FORM */}
            <Transition appear show={modal1} as={Fragment}>
                <Dialog as="div" open={modal1} onClose={() => setModal1(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">{modalTitle === null ? 'Create Order' : 'Edit Order'}</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal1(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="mb-5 p-5">
                                        <Formik
                                            initialValues={
                                                modalContant === null
                                                    ? { name: '' }
                                                    : {
                                                          name: modalContant?.name,
                                                          //   description: modalContant?.description,

                                                          //   count: modalContant?.count,
                                                          //   image: modalContant?.image,
                                                          //   parentCategory: modalContant?.name,
                                                      }
                                            }
                                            validationSchema={SubmittedForm}
                                            onSubmit={(values, { resetForm }) => {
                                                onSubmit(values, { resetForm }); // Call the onSubmit function with form values and resetForm method
                                            }}
                                        >
                                            {({ errors, submitCount, touched, setFieldValue, values }: any) => (
                                                <Form className="space-y-5">
                                                    {/* <div className={submitCount ? (errors.image ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="image">Image</label>
                                                        <input
                                                            id="image"
                                                            name="image"
                                                            type="file"
                                                            onChange={(event: any) => {
                                                                setFieldValue('image', event.currentTarget.files[0]);
                                                            }}
                                                            className="form-input"
                                                        />
                                                        {values.image && typeof values.image === 'string' && (
                                                            <img src={values.image} alt="Product Image" style={{ width: '30px', height: 'auto', paddingTop: '5px' }} />
                                                        )}
                                                        {submitCount ? errors.image ? <div className="mt-1 text-danger">{errors.image}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div> */}

                                                    <div className={submitCount ? (errors.name ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="fullName">Name </label>
                                                        <Field name="name" type="text" id="fullName" placeholder="Enter Name" className="form-input" />

                                                        {submitCount ? errors.name ? <div className="mt-1 text-danger">{errors.name}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div>

                                                    {/* <div className={submitCount ? (errors.description ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="description">description </label>
                                                        <Field name="description" as="textarea" id="description" placeholder="Enter Description" className="form-input" />

                                                        {submitCount ? (
                                                            errors.description ? (
                                                                <div className="mt-1 text-danger">{errors.description}</div>
                                                            ) : (
                                                                <div className="mt-1 text-success"></div>
                                                            )
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div> */}

                                                    {/* <div className={submitCount ? (errors.slug ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="slug">Slug </label>
                                                        <Field name="slug" type="text" id="slug" placeholder="Enter Description" className="form-input" />

                                                        {submitCount ? errors.slug ? <div className="mt-1 text-danger">{errors.slug}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div> */}

                                                    {/* <div className={submitCount ? (errors.count ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="count">Count</label>
                                                        <Field name="count" type="number" id="count" placeholder="Enter Count" className="form-input" />

                                                        {submitCount ? errors.count ? <div className="mt-1 text-danger">{errors.count}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div> */}

                                                    {/* <div className={submitCount ? (errors.parentCategory ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="parentCategory">Parent Category</label>
                                                        <Field as="select" name="parentCategory" className="form-select">
                                                            <option value="">Open this select menu</option>
                                                            <option value="Anklets">Anklets</option>
                                                            <option value="BlackThread">__Black Thread</option>
                                                            <option value="Kada">__Kada</option>
                                                        </Field>
                                                        {submitCount ? (
                                                            errors.parentCategory ? (
                                                                <div className=" mt-1 text-danger">{errors.parentCategory}</div>
                                                            ) : (
                                                                <div className=" mt-1 text-[#1abc9c]"></div>
                                                            )
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div> */}

                                                    <button type="submit" className="btn btn-primary !mt-6">
                                                        {modalTitle === null ? 'Submit' : 'Update'}
                                                    </button>
                                                </Form>
                                            )}
                                        </Formik>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Full View Category data*/}
            {/* <Transition appear show={viewModal} as={Fragment}>
                <Dialog as="div" open={viewModal} onClose={() => setViewModal(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">View Category</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setViewModal(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="mb-5 p-5"></div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition> */}

            <Modal
                addHeader={'Select a Currency'}
                open={state.isOpenChannel}
                close={() => setState({ isOpenChannel: false })}
                renderComponent={() => (
                    <div className="p-5">
                        <select
                            className="form-select"
                            value={state.selectedCurrency}
                            onChange={(val) => {
                                const selectedCurrency: any = val.target.value;
                                setState({ selectedCurrency });
                            }}
                        >
                            <option value="" disabled selected>
                                Select a currency
                            </option>
                            {state.currency?.map((item) => (
                                <option key={item?.value} value={item?.value}>
                                    {item?.label}
                                </option>
                            ))}
                        </select>

                        <div className="mt-8 flex items-center justify-end">
                            <button type="button" className="btn btn-outline-danger gap-2" onClick={() => setState({ isOpenChannel: false })}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => handleSetChannel()}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

export default Orders;
