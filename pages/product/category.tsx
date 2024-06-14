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
import { useMutation, useQuery } from '@apollo/client';
import { CATEGORY_LIST, CREATE_CATEGORY, DELETE_CATEGORY, PRODUCT_LIST, UPDATE_CATEGORY } from '@/query/product';
import ReactQuill from 'react-quill';
import { PARENT_CATEGORY_LIST } from '@/query/product';
import IconLoader from '@/components/Icon/IconLoader';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import IconTrash from '@/components/Icon/IconTrash';
import { categoryImageUpload } from '@/utils/functions';
import { useRouter } from 'next/router';

const Category = () => {
    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const router = useRouter();

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Category'));
    });

    const {
        error,
        data: categoryData,
        refetch: categoryListRefetch,
    } = useQuery(CATEGORY_LIST, {
        variables: { channel: 'india-channel', first: 100 },
    });

    const [categoryList, setCategoryList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [parentLists, setParentLists] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [createCategoryLoader, setCreateCategoryLoader] = useState(false);
    const [updateCategoryLoader, setUpdateCategoryLoader] = useState(false);

    useEffect(() => {
        getCategoryList();
    }, [categoryData]);

    const getCategoryList = () => {
        setLoading(true);
        if (categoryData) {
            if (categoryData.categories && categoryData.categories.edges) {
                const newData = categoryData?.categories?.edges?.map((item: any) => {
                    const jsonObject = JSON.parse(item?.node?.description || item?.node?.description);
                    // Extract the text value
                    const textValue = jsonObject?.blocks[0]?.data?.text;

                    return {
                        ...item.node,
                        parent: item.node.parent?.name || '',
                        product: item.node.products?.totalCount,
                        textdescription: textValue || '',
                        image: item.node?.backgroundImage?.url, // Set textValue or empty string if it doesn't exist
                    };
                });
                setCategoryList(newData);
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
        setInitialRecords(categoryList);
    }, [categoryList]);

    // Log initialRecords when it changes
    useEffect(() => {}, [initialRecords]);

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

    //    parent category list query
    const {
        data: parentList,
        error: parentListError,
        refetch,
    } = useQuery(PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });
    useEffect(() => {
        const getparentCategoryList = parentList?.categories?.edges;
        setParentLists(getparentCategoryList);
    }, []);

    //Mutation
    const [addCategory] = useMutation(CREATE_CATEGORY);
    const [updateCategory] = useMutation(UPDATE_CATEGORY);
    const [deleteCatImage] = useMutation(UPDATE_CATEGORY);
    const [deleteCategory] = useMutation(DELETE_CATEGORY);
    const [bulkDelete] = useMutation(DELETE_CATEGORY);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        setPreviewUrl(previewUrl);
    }, [previewUrl]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return categoryList.filter((item: any) => {
                return (
                    item.id.toString().includes(search.toLowerCase()) ||
                    // item.image.toLowerCase().includes(search.toLowerCase()) ||
                    item.name.toLowerCase().includes(search.toLowerCase())
                    // item.description.toLowerCase().includes(search.toLowerCase()) ||
                    // item.slug.toLowerCase().includes(search.toLowerCase()) ||
                    // item.count.toString().includes(search.toLowerCase())
                );
            });
        });
    }, [search]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(initialRecords);
    }, [sortStatus]);

    // FORM VALIDATION
    const SubmittedForm = Yup.object().shape({
        name: Yup.string().required('Please fill the Category Name'),
        // description: Yup.string().required('Please fill the Description'),
        // slug: Yup.string().required('Please fill the Slug'),
        // count: Yup.string().required('Please fill the count'),
        // image: Yup.string().required('Please fill the Image'),
        // parentCategory: Yup.string().required('Please fill the Parent Category'),
    });

    // form submit
    const onSubmit = async (record: any, { resetForm }: any) => {
        setCreateCategoryLoader(true);
        setUpdateCategoryLoader(true);
        try {
            setCreateCategoryLoader(true);
            setUpdateCategoryLoader(true);

            const Description = JSON.stringify({ time: Date.now(), blocks: [{ id: 'some-id', data: { text: record.description }, type: 'paragraph' }], version: '2.24.3' });

            const variables = {
                input: {
                    name: record.name,
                    description: Description,
                },
                parent: record.parentCategory,
            };

            const { data } = await (modalTitle ? updateCategory({ variables: { ...variables, id: modalContant.id } }) : addCategory({ variables }));

            const catId = data?.categoryCreate?.category?.id;

            if (previewUrl) {
                if (modalTitle == null) {
                    const imageUpload = await categoryImageUpload(catId, previewUrl);
                    console.log('imageUpload: ', imageUpload);
                }
            }

            await categoryListRefetch();
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
            setCreateCategoryLoader(false);
            setUpdateCategoryLoader(false);
        } catch (error) {
            console.log('error: ', error);
            setCreateCategoryLoader(false);
            setUpdateCategoryLoader(false);
        }
    };

    // category table edit
    const EditCategory = (record: any) => {
        setModal1(true);
        setModalTitle(record);
        setModalContant(record);
        setPreviewUrl(record?.backgroundImage?.url);
    };

    // category table create
    const CreateCategory = () => {
        setModal1(true);
        setModalTitle(null);
        setModalContant(null);
    };

    // view categotry
    // const ViewCategory = (record: any) => {
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

    const BulkDeleteCategory = async () => {
        showDeleteAlert(
            async () => {
                if (selectedRecords.length === 0) {
                    Swal.fire('Cancelled', 'Please select at least one record!', 'error');
                    return;
                }
                selectedRecords?.map(async (item: any) => {
                    await bulkDelete({ variables: { id: item.id } });
                });
                const updatedRecordsData = categoryList.filter((record) => !selectedRecords.includes(record));
                setCategoryList(updatedRecordsData);
                setSelectedRecords([]);
                await categoryListRefetch();

                Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your List is safe :)', 'error');
            }
        );
    };

    const DeleteCategory = (record: any) => {
        showDeleteAlert(
            async () => {
                const { data } = await deleteCategory({ variables: { id: record.id } });
                const updatedRecordsData = categoryList.filter((dataRecord: any) => dataRecord.id !== record.id);
                setRecordsData(updatedRecordsData);
                setCategoryList(updatedRecordsData);
                // getCategoryList()
                setSelectedRecords([]);
                // setCategoryList(finishList)
                await categoryListRefetch();

                Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your List is safe :)', 'error');
            }
        );
    };

    const handleImageChange = async (e) => {
        const selectedFile: any = e.target.files[0];
        if (selectedFile) {
            const imageUrl: any = URL.createObjectURL(selectedFile);
            if (modalTitle !== null) {
                console.log('if : ');
                const res = await categoryImageUpload(modalTitle.id, imageUrl);
                setModalTitle(res?.data?.categoryUpdate?.category);
                setPreviewUrl(res?.data?.categoryUpdate?.category?.backgroundImage?.url);
            } else {
                setPreviewUrl(imageUrl);
            }
        }
    };

    const removeImage = async () => {
        try {
            const res = await deleteCatImage({
                variables: {
                    id: modalTitle.id,
                    input: {
                        backgroundImage: null,
                    },
                },
            });

            setModalTitle(res?.data?.categoryUpdate?.category);

            setPreviewUrl(null);
            // await categoryListRefetch();
        } catch (error) {
            console.log('error: ', error);
        }
    };

    return (
        <div>
            <div className="panel mt-6">
                <div className="mb-5 flex-col gap-5 md:flex md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Category</h5>

                    <div className="mt-5 md:mt-0 md:flex  md:ltr:ml-auto md:rtl:mr-auto">
                        <input type="text" className="form-input mb-3 mr-2 w-full md:mb-0 md:w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <div className="dropdown  mb-3 mr-0  md:mb-0 md:mr-2">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="btn btn-outline-primary dropdown-toggle lg:w-auto w-full"
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
                                        <button type="button" onClick={() => BulkDeleteCategory()}>
                                            Delete
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                        <button type="button" className="btn btn-primary w-full md:mb-0 md:w-auto" onClick={() => CreateCategory()}>
                            + Create
                        </button>
                    </div>
                </div>
                {loading ? (
                    <Loader />
                ) : (
                    <div className="datatables">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={recordsData}
                            columns={[
                                // { accessor: 'id', sortable: true },
                                { accessor: 'image', sortable: true, render: (row) => <img src={row?.image} alt="Product" className="h-10 w-10 object-cover ltr:mr-2 rtl:ml-2" /> },
                                { accessor: 'name', sortable: true },
                                {
                                    accessor: 'textdescription',
                                    sortable: true,
                                    title: 'Description',
                                },
                                {
                                    accessor: 'parent',
                                    sortable: true,
                                },
                                {
                                    accessor: 'product',
                                    sortable: true,

                                    render: (row: any) => <button onClick={() => router.push(`/?category=${row.id}`)}>{row.product}</button>,
                                },

                                {
                                    // Custom column for actions
                                    accessor: 'actions', // You can use any accessor name you want
                                    title: 'Actions',
                                    // Render method for custom column
                                    render: (row: any) => (
                                        <>
                                            {/* <Tippy content="View">
                                            <button type="button" onClick={() => ViewCategory(row)}>
                                                <IconEye className="ltr:mr-2 rtl:ml-2" />
                                            </button>
                                        </Tippy> */}
                                            <Tippy content="Edit">
                                                <button type="button" onClick={() => EditCategory(row)}>
                                                    <IconPencil className="ltr:mr-2 rtl:ml-2" />
                                                </button>
                                            </Tippy>
                                            <Tippy content="Delete">
                                                <button type="button" onClick={() => DeleteCategory(row)}>
                                                    <IconTrashLines />
                                                </button>
                                            </Tippy>
                                        </>
                                    ),
                                },
                            ]}
                            highlightOnHover
                            totalRecords={initialRecords.length}
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
                                        <div className="text-lg font-bold">{modalTitle === null ? 'Create Category' : 'Edit Category'}</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal1(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="mb-5 p-5">
                                        <Formik
                                            initialValues={
                                                modalContant === null
                                                    ? { name: '', textdescription: '', parentCategory: '', image: null }
                                                    : {
                                                          name: modalContant?.name,
                                                          description: modalContant?.textdescription,

                                                          //   count: modalContant?.count,
                                                          //   image: modalContant?.image,
                                                          parentCategory: modalContant?.parent?.id,
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
                                                    {/* <div className="mb-5">
                                                        <label htmlFor="description">Description</label>

                                                        <textarea
                                                            id="description"
                                                            rows={3}
                                                            placeholder="Enter description"
                                                            name="description"
                                                            className="form-textarea min-h-[130px] resize-none"
                                                        ></textarea>
                                                    </div> */}

                                                    <div className={submitCount ? (errors.description ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="description">Description </label>
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
                                                    </div>

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
                                                    <div>
                                                        <label htmlFor="description">Image </label>
                                                        {previewUrl ? (
                                                            <div className="relative flex items-center justify-around">
                                                                <img src={previewUrl} alt="Selected" style={{ marginTop: '10px', maxHeight: '200px' }} />
                                                                <div
                                                                    className="absolute cursor-pointer rounded-full bg-red-500 p-1 text-white"
                                                                    onClick={() => {
                                                                        console.log('click');
                                                                        if (modalTitle !== null) {
                                                                            console.log('modalTitle: ');
                                                                            removeImage();
                                                                        } else {
                                                                            console.log('else: ');
                                                                            setPreviewUrl(null);
                                                                        }
                                                                    }}
                                                                >
                                                                    <IconTrashLines />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <input type="file" id="product-gallery-image" className="form-input" onChange={handleImageChange} />
                                                        )}
                                                    </div>
                                                    <div className={submitCount ? (errors.parentCategory ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="parentCategory">Parent Category</label>
                                                        <Field as="select" name="parentCategory" className="form-select">
                                                            <option value="">Open this select</option>
                                                            {parentLists?.map((item: any) => {
                                                                return (
                                                                    <>
                                                                        <option value={item?.node?.id}>{item.node?.name}</option>
                                                                        {item?.node?.children?.edges?.map((child: any) => (
                                                                            <option key={child?.id} value={child?.node?.id} style={{ paddingLeft: '20px' }}>
                                                                                -- {child?.node?.name}
                                                                            </option>
                                                                        ))}
                                                                    </>
                                                                );
                                                            })}

                                                            {/* <option value="">Open this select menu</option>
                                                            <option value="Anklets">Anklets</option>
                                                            <option value="BlackThread">__Black Thread</option>
                                                            <option value="Kada">__Kada</option> */}
                                                        </Field>
                                                        {/* {submitCount ? (
                                                            errors.parentCategory ? (
                                                                <div className=" mt-1 text-danger">{errors.parentCategory}</div>
                                                            ) : (
                                                                <div className=" mt-1 text-[#1abc9c]"></div>
                                                            )
                                                        ) : (
                                                            ''
                                                        )} */}
                                                    </div>

                                                    <button type="submit" className="btn btn-primary !mt-6">
                                                        {createCategoryLoader || updateCategoryLoader ? (
                                                            <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                                                        ) : modalTitle === null ? (
                                                            'Submit'
                                                        ) : (
                                                            'Update'
                                                        )}
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
        </div>
    );
};

export default PrivateRouter(Category);
