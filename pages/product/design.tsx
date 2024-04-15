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
import { Button, Loader, LoadingOverlay } from '@mantine/core';
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
import { date } from 'yup/lib/locale';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_DESIGN, DELETE_DESIGN, DESIGN_LIST, UPDATE_DESIGN } from '@/query/product';
import moment from 'moment';
import { showDeleteAlert } from '@/utils/functions';
import { debounce } from 'lodash';

const Finish = () => {
    //For Table
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    //UseState
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [selectedRecords, setSelectedRecords] = useState<any>([]);
    const [search, setSearch] = useState('');
    const [addContactModal, setAddContactModal] = useState(false);

    const [modal1, setModal1] = useState(false);
    const [modalTitle, setModalTitle] = useState(null);
    const [modalContant, setModalContant] = useState<any>(null);

    const [viewModal, setViewModal] = useState(false);

    const [filterFormData, setFilterFormData] = useState({
        category: '',
        stock: '',
    });

    const { error, data: designData } = useQuery(DESIGN_LIST, {
        variables: { channel: 'india-channel' }, // Pass variables here
    });
    const [designList, setDesignList] = useState([]);
    const [loading, setLoading] = useState(false);

    //RTL
    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    //Mutation
    const [addDesign] = useMutation(CREATE_DESIGN);
    const [updateDesign] = useMutation(UPDATE_DESIGN);
    const [deleteDesign] = useMutation(DELETE_DESIGN);
    const [bulkDelete] = useMutation(DELETE_DESIGN);

    //UseEffect
    useEffect(() => {
        getDesignList();
    }, [designData]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setDesignList([...designList.slice(from, to)]);
    }, [page, pageSize]);

    // For sorting
    useEffect(() => {
        const data = sortBy(designList, sortStatus.columnAccessor);
        setDesignList(sortStatus.direction === 'desc' ? data.reverse() : data);
    }, [sortStatus]);

    // For search
    useEffect(() => {
        if (search != null && search !== '') {
            debouncedSearchData();
        } else {
            setDesignList(designList);
            // getDesignList();
        }
    }, [search]);

    const getDesignList = () => {
        setLoading(true);
        if (designData && designData.productDesigns && designData.productDesigns.edges?.length > 0) {
            const newData = designData.productDesigns.edges.map((item) => ({
                ...item.node,
                name: item?.node?.name,
            }));
            const sorting: any = sortBy(newData, 'id');
            setDesignList(sorting);
            setLoading(false);

            // const newData = categoryData.categories.edges.map((item) => item.node).map((item)=>{{...item,product:isTemplateExpression.products.totalCount}});
        }
    };

    const searchData = () => {
        setDesignList(() => {
            return designList.filter((item: any) => {
                return item.name.toLowerCase().includes(search.toLowerCase());
            });
        });
    };

    const debouncedSearchData = debounce(searchData, 500);

    // FORM VALIDATION
    const SubmittedForm = Yup.object().shape({
        name: Yup.string().required('Please fill the Name'),
        // sku: Yup.string().required('Please fill the SKU'),
        // stock: Yup.string().required('Please fill the Slug'),
        // price: Yup.string().required('Please fill the count'),
        // image: Yup.string().required('Please fill the Image'),
        // categories: Yup.string().required('Please fill the Parent categories'),
        // tags: Yup.string().required('Please fill the Tags'),
        // date: Yup.string().required('Please fill the Date'),
        // parentProduct: Yup.string().required('Please fill the Parent Product'),
    });

    // Api
    const onSubmit = async (record: any, { resetForm }: any) => {
        try {
            const variables = {
                input: {
                    name: record.name,
                },
            };

            const { data } = await (modalTitle ? updateDesign({ variables: { ...variables, id: modalContant.id } }) : addDesign({ variables }));

            const newData = modalTitle ? data?.productDesignUpdate?.productDesign : data?.productDesignCreate?.productDesign;

            if (!newData) {
                console.error('Error: New data is undefined.');
                return;
            }
            const updatedId = newData.id;
            const index = designList.findIndex((design: any) => design && design.id === updatedId);

            const updatedDesignList: any = [...designList];
            if (index !== -1) {
                updatedDesignList[index] = newData;
            } else {
                updatedDesignList.push(newData);
            }

            setDesignList(updatedDesignList);
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

    const DeleteProduct = (record: any) => {
        showDeleteAlert(
            async () => {
                const { data } = await deleteDesign({ variables: { id: record.id } });
                const updatedRecordsData = designList.filter((dataRecord: any) => dataRecord.id !== record.id);
                setDesignList(updatedRecordsData);
                // setSelectedRecords(updatedRecordsData);
                Swal.fire('Deleted!', 'Your Product has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Product List is safe :)', 'error');
            }
        );
    };

    // Product table edit
    const EditProduct = (record: any) => {
        setModal1(true);
        setModalTitle(record);
        setModalContant(record);
    };

    // Product table create
    const CreateProduct = () => {
        setModal1(true);
        setModalTitle(null);
        setModalContant(null);
    };

    // view categotry
    const ViewProduct = (record: any) => {
        setViewModal(true);
    };

    const BulkDeleteProduct = async () => {
        showDeleteAlert(
            () => {
                if (selectedRecords.length === 0) {
                    Swal.fire('Cancelled', 'Please select at least one record!', 'error');
                    return;
                }
                selectedRecords?.map(async (item: any) => {
                    await bulkDelete({ variables: { id: item.id } });
                });
                const updatedRecordsData = designList.filter((record) => !selectedRecords.includes(record));
                setDesignList(updatedRecordsData);
                // setRecordsData(updatedRecordsData);
                setSelectedRecords([]);
                Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Product List is safe :)', 'error');
            }
        );
    };

    // completed Product delete option

    // top Filter Category change
    const CategoryChange = (selectedCategory: string) => {
        console.log('Selected Category:', selectedCategory);
        // Update the state with the selected category
        setFilterFormData((prevState) => ({
            ...prevState,
            category: selectedCategory,
        }));
    };

    const StockStatusChange = (selectedStockStatus: string) => {
        console.log('Selected Stock Status:', selectedStockStatus);
        // Update the state with the selected stock status
        setFilterFormData((prevState) => ({
            ...prevState,
            stock: selectedStockStatus,
        }));
    };

    const onFilterSubmit = (e: any) => {
        e.preventDefault();
        console.log('filterFormData', filterFormData);

        setFilterFormData({
            category: '',
            stock: '',
        });
    };

    return (
        <div>
            <div className="panel mt-6">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Design</h5>
                    <button type="button" className="btn btn-outline-primary">
                        Import
                    </button>
                    <button type="button" className="btn btn-outline-primary">
                        Export
                    </button>
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
                                        <button type="button" onClick={() => BulkDeleteProduct()}>
                                            Delete
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                        <button type="button" className="btn btn-primary" onClick={() => CreateProduct()}>
                            + Create
                        </button>
                    </div>
                </div>

                {/* <div className="mb-5 ">
                    <form onSubmit={onFilterSubmit}>
                        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 md:flex-row">
                            <select className="form-select flex-1" onChange={(e) => CategoryChange(e.target.value)}>
                                <option value="">Select a Categories </option>
                                <option value="Anklets">Anklets</option>
                                <option value="Earings">Earings</option>
                                <option value="Palakka">Palakka</option>
                            </select>

                            <select className="form-select flex-1" onChange={(e) => StockStatusChange(e.target.value)}>
                                <option value="">Filter By Stock Status</option>
                                <option value="In Stock">In Stock</option>
                                <option value="Out Of Stock">Out Of Stock</option>
                            </select>

                            <button type="submit" className="btn btn-primary py-2.5">
                                Filter
                            </button>
                        </div>
                    </form>
                </div> */}
                {loading ? (
                    <>
                        <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                            <svg width="64" height="64" viewBox="0 0 135 135" xmlns="http://www.w3.org/2000/svg" fill="#4361ee">
                                <path d="M67.447 58c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm9.448 9.447c0 5.523 4.477 10 10 10 5.522 0 10-4.477 10-10s-4.478-10-10-10c-5.523 0-10 4.477-10 10zm-9.448 9.448c-5.523 0-10 4.477-10 10 0 5.522 4.477 10 10 10s10-4.478 10-10c0-5.523-4.477-10-10-10zM58 67.447c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10z">
                                    <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="-360 67 67" dur="2.5s" repeatCount="indefinite" />
                                </path>
                                <path d="M28.19 40.31c6.627 0 12-5.374 12-12 0-6.628-5.373-12-12-12-6.628 0-12 5.372-12 12 0 6.626 5.372 12 12 12zm30.72-19.825c4.686 4.687 12.284 4.687 16.97 0 4.686-4.686 4.686-12.284 0-16.97-4.686-4.687-12.284-4.687-16.97 0-4.687 4.686-4.687 12.284 0 16.97zm35.74 7.705c0 6.627 5.37 12 12 12 6.626 0 12-5.373 12-12 0-6.628-5.374-12-12-12-6.63 0-12 5.372-12 12zm19.822 30.72c-4.686 4.686-4.686 12.284 0 16.97 4.687 4.686 12.285 4.686 16.97 0 4.687-4.686 4.687-12.284 0-16.97-4.685-4.687-12.283-4.687-16.97 0zm-7.704 35.74c-6.627 0-12 5.37-12 12 0 6.626 5.373 12 12 12s12-5.374 12-12c0-6.63-5.373-12-12-12zm-30.72 19.822c-4.686-4.686-12.284-4.686-16.97 0-4.686 4.687-4.686 12.285 0 16.97 4.686 4.687 12.284 4.687 16.97 0 4.687-4.685 4.687-12.283 0-16.97zm-35.74-7.704c0-6.627-5.372-12-12-12-6.626 0-12 5.373-12 12s5.374 12 12 12c6.628 0 12-5.373 12-12zm-19.823-30.72c4.687-4.686 4.687-12.284 0-16.97-4.686-4.686-12.284-4.686-16.97 0-4.687 4.686-4.687 12.284 0 16.97 4.686 4.687 12.284 4.687 16.97 0z">
                                    <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="360 67 67" dur="8s" repeatCount="indefinite" />
                                </path>
                            </svg>
                        </div>
                    </>
                ) : (
                    <div className="datatables">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={designList}
                            columns={[
                                // { accessor: 'id', sortable: true },
                                // { accessor: 'image', render: (row) => <img src={row.image} alt="Product" className="h-10 w-10 object-cover ltr:mr-2 rtl:ml-2" /> },
                                { accessor: 'name', sortable: true },
                                // { accessor: 'sku', sortable: true },
                                // { accessor: 'stock', sortable: true },
                                // { accessor: 'price', sortable: true },
                                // { accessor: 'categories', sortable: true },
                                // { accessor: 'tags', sortable: true },
                                // { accessor: 'date', sortable: true },
                                {
                                    // Custom column for actions
                                    accessor: 'actions', // You can use any accessor name you want
                                    title: 'Actions',
                                    // Render method for custom column
                                    render: (row: any) => (
                                        <>
                                            {/* <Tippy content="View">
                                                <button type="button" onClick={() => ViewProduct(row)}>
                                                    <IconEye className="ltr:mr-2 rtl:ml-2" />
                                                </button>
                                            </Tippy> */}
                                            <Tippy content="Edit">
                                                <button type="button" onClick={() => EditProduct(row)}>
                                                    <IconPencil className="ltr:mr-2 rtl:ml-2" />
                                                </button>
                                            </Tippy>
                                            <Tippy content="Delete">
                                                <button type="button" onClick={() => DeleteProduct(row)}>
                                                    <IconTrashLines />
                                                </button>
                                            </Tippy>
                                        </>
                                    ),
                                },
                            ]}
                            highlightOnHover
                            totalRecords={designList.length}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            selectedRecords={selectedRecords}
                            onSelectedRecordsChange={(selectedRecords) => {
                                console.log('selectedRecords: ', selectedRecords);
                                setSelectedRecords(selectedRecords);
                            }}
                            minHeight={200}
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                    </div>
                )}
            </div>

            {/* CREATE AND EDIT Product FORM */}
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
                                        <div className="text-lg font-bold">{modalTitle === null ? 'Create Design' : 'Edit Design'}</div>
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
                                                        <Field name="name" type="text" id="name" placeholder="Enter Name" className="form-input" />

                                                        {submitCount ? errors.name ? <div className="mt-1 text-danger">{errors.name}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div>

                                                    {/* <div className={submitCount ? (errors.sku ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="sku">SKU </label>
                                                        <Field name="sku" type="text" id="sku" placeholder="Enter SKU" className="form-input" />

                                                        {submitCount ? errors.sku ? <div className="mt-1 text-danger">{errors.sku}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div>

                                                    <div className={submitCount ? (errors.stock ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="stock">Stock </label>
                                                        <Field name="stock" type="text" id="stock" placeholder="Enter Stock" className="form-input" />

                                                        {submitCount ? errors.stock ? <div className="mt-1 text-danger">{errors.stock}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div>

                                                    <div className={submitCount ? (errors.price ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="price">Price</label>
                                                        <Field name="price" type="number" id="price" placeholder="Enter Price" className="form-input" />

                                                        {submitCount ? errors.price ? <div className="mt-1 text-danger">{errors.price}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div>

                                                    <div className={submitCount ? (errors.categories ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="categories">Categories</label>
                                                        <Field name="categories" type="text" id="categories" placeholder="Enter categories" className="form-input" />

                                                        {submitCount ? errors.categories ? <div className="mt-1 text-danger">{errors.categories}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div>

                                                    <div className={submitCount ? (errors.tags ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="tags">Tags</label>
                                                        <Field name="tags" type="text" id="tags" placeholder="Enter Tags" className="form-input" />

                                                        {submitCount ? errors.tags ? <div className="mt-1 text-danger">{errors.tags}</div> : <div className="mt-1 text-success"></div> : ''}
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

            {/* Full View Product data*/}
            <Transition appear show={viewModal} as={Fragment}>
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
                                        <div className="text-lg font-bold">View Product</div>
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
            </Transition>
        </div>
    );
};

export default Finish;
