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
import { useQuery } from '@apollo/client';
import { PRODUCT_LIST } from '@/query/product';
import moment from 'moment';
import IconLoader from '@/components/Icon/IconLoader';
import { useRouter } from 'next/router';
import Link from 'next/link';
import IconEdit from '@/components/Icon/IconEdit';

const rowData1 = [
    {
        id: 1,
        image: `${Image1.src}`,
        name: 'Necklace Yazhu',
        sku: 'PBS_NP_34',
        stock: 'Out of stock',
        price: 10800.0,
        categories: 'Necklace',
        tags: 'New',
        date: '26-03-2022',
    },
    {
        id: 2,
        image: `${Image2.src}`,
        name: 'Necklace Preetham',
        sku: 'PBS_NP_31',
        stock: 'In stock ',
        price: 14450.0,
        categories: 'Earings',
        tags: 'New',
        date: '09-10-2023',
    },
    {
        id: 3,
        image: `${Image3.src}`,
        name: 'Necklace Shila',
        sku: 'PBS_NP_32',
        stock: 'Out of stock',
        price: 18900.0,
        categories: 'New Arrivals',
        tags: 'New',
        date: '01-01-2024',
    },
];
const Product = () => {

    const router = useRouter();

    const { error, data: productData } = useQuery(PRODUCT_LIST, {
        variables: { channel: 'india-channel', first: 20 }, // Pass variables here
    });

    console.log("productData: ", productData);

    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(false);

    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const dispatch = useDispatch();

    useEffect(() => {
        getProductList();
    }, [productData]);

    const getProductList = () => {
        setLoading(true);


        if (productData && productData.products && productData.products.edges?.length > 0) {
            const newData = productData?.products?.edges.map((item) => ({
                ...item.node,
                product: item?.node?.products?.totalCount,
                image: item?.node?.thumbnail?.url,
                categories: item?.node?.category?.name,
                date: moment(item?.node?.created).format('DD-MM-YYYY'),
                price: item?.node?.pricing?.priceRange?.start?.gross?.amount,
            }));
            const sorting: any = sortBy(newData, 'id');
            setProductList(sorting);
            setLoading(false);

            // const newData = categoryData.categories.edges.map((item) => item.node).map((item)=>{{...item,product:isTemplateExpression.products.totalCount}});
        }else{
            setLoading(false);

        }
    };

    useEffect(() => {
        dispatch(setPageTitle('Checkbox Table'));
    });
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(rowData1, 'id'));
    const [recordsData, setRecordsData] = useState(initialRecords);

    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [modal1, setModal1] = useState(false);
    const [modalTitle, setModalTitle] = useState(null);
    const [modalContant, setModalContant] = useState<any>(null);

    const [viewModal, setViewModal] = useState(false);

    const [filterFormData, setFilterFormData] = useState({
        category: '',
        stock: '',
    });

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
            return rowData1.filter((item) => {
                return (
                    item.id.toString().includes(search.toLowerCase()) ||
                    // item.image.toLowerCase().includes(search.toLowerCase()) ||
                    item.name.toLowerCase().includes(search.toLowerCase()) ||
                    item.sku.toLowerCase().includes(search.toLowerCase()) ||
                    item.stock.toLowerCase().includes(search.toLowerCase()) ||
                    item.price.toString().includes(search.toLowerCase()) ||
                    item.categories.toLowerCase().includes(search.toLowerCase()) ||
                    item.date.toString().includes(search.toLowerCase())
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
        sku: Yup.string().required('Please fill the SKU'),
        stock: Yup.string().required('Please fill the Slug'),
        price: Yup.string().required('Please fill the count'),
        image: Yup.string().required('Please fill the Image'),
        categories: Yup.string().required('Please fill the Parent categories'),
        tags: Yup.string().required('Please fill the Tags'),
        date: Yup.string().required('Please fill the Date'),
        // parentProduct: Yup.string().required('Please fill the Parent Product'),
    });

    // form submit
    const onSubmit = (record: any, { resetForm }: any) => {
        console.log('record', record);

        const toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
        });
        toast.fire({
            icon: 'success',
            title: 'Form submitted successfully',
            padding: '10px 20px',
        });
        setModal1(false);
        resetForm();
    };

    // Product table edit
    const EditProduct = (record: any) => {
        setModal1(true);
        setModalTitle(record);
        setModalContant(record);
    };

    // Product table create
    // const CreateProduct = () => {
    //     // setModal1(true);
    //     // setModalTitle(null);
    //     // setModalContant(null);
    // };

    const CreateProduct = () => {
        router.push('/product/addproduct');
    };

    // view categotry
    const ViewProduct = (record: any) => {
        setViewModal(true);
    };

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

    const BulkDeleteProduct = async () => {
        showDeleteAlert(
            () => {
                if (selectedRecords.length === 0) {
                    Swal.fire('Cancelled', 'Please select at least one record!', 'error');
                    return;
                }
                const updatedRecordsData = recordsData.filter((record) => !selectedRecords.includes(record));
                setRecordsData(updatedRecordsData);
                setSelectedRecords([]);
                Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Product List is safe :)', 'error');
            }
        );
    };

    const DeleteProduct = (record: any) => {
        showDeleteAlert(
            () => {
                const updatedRecordsData = recordsData.filter((dataRecord: any) => dataRecord.id !== record.id);
                setRecordsData(updatedRecordsData);
                Swal.fire('Deleted!', 'Your Product has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Product List is safe :)', 'error');
            }
        );
    };

    // completed Product delete option
    console.log('modalcontant', modalContant);

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
                    <h5 className="text-lg font-semibold dark:text-white-light">Product</h5>
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

                <div className="mb-5 ">
                    <form onSubmit={onFilterSubmit}>
                        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 md:flex-row">
                            <select className="form-select flex-1" onChange={(e) => CategoryChange(e.target.value)}>
                                <option value="">Select a Categories </option>
                                <option value="Anklets">Anklets</option>
                                <option value="Earings">Earings</option>
                                <option value="Palakka">Palakka</option>
                            </select>

                            {/* New select dropdown for stock status */}
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
                </div>
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
                            records={productList}
                            columns={[
                                // { accessor: 'id', sortable: true },
                                { accessor: 'image', render: (row) => <img src={row.image} alt="Product" className="h-10 w-10 object-cover ltr:mr-2 rtl:ml-2" /> },
                                { accessor: 'name', sortable: true },
                                // { accessor: 'sku', sortable: true },
                                // { accessor: 'stock', sortable: true },
                                { accessor: 'price', sortable: true },
                                { accessor: 'categories', sortable: true },
                                // { accessor: 'tags', sortable: true },
                                { accessor: 'date', sortable: true },
                                {
                                    // Custom column for actions
                                    accessor: 'actions', // You can use any accessor name you want
                                    title: 'Actions',
                                    // Render method for custom column
                                    render: (row: any) => (
                                        <>
                                            <div className="mx-auto flex w-max items-center gap-4">
                                            <Link href="/product/editproduct" className="flex hover:text-info">
                                                <IconEdit className="h-4.5 w-4.5" />
                                            </Link>

                                            <Link href="/product/viewproduct" className="flex hover:text-primary">
                                                <IconEye />
                                            </Link>

                                            <button type="button" className="flex hover:text-danger" onClick={() => DeleteProduct(row)}>
                                                <IconTrashLines />
                                            </button>
                                        </div>
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
                                        <div className="text-lg font-bold">{modalTitle === null ? 'Create Product' : 'Edit Product'}</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal1(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="mb-5 p-5">
                                        <Formik
                                            initialValues={
                                                modalContant === null
                                                    ? { name: '', sku: '', stock: '', image: '', price: '', categories: '', tags: '' }
                                                    : {
                                                          name: modalContant?.name,
                                                          sku: modalContant?.sku,
                                                          stock: modalContant?.stock,
                                                          price: modalContant?.price,
                                                          image: modalContant?.image,
                                                          categories: modalContant?.categories,
                                                          tags: modalContant?.tags,
                                                      }
                                            }
                                            validationSchema={SubmittedForm}
                                            onSubmit={(values, { resetForm }) => {
                                                onSubmit(values, { resetForm }); // Call the onSubmit function with form values and resetForm method
                                            }}
                                        >
                                            {({ errors, submitCount, touched, setFieldValue, values }: any) => (
                                                <Form className="space-y-5">
                                                    <div className={submitCount ? (errors.image ? 'has-error' : 'has-success') : ''}>
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
                                                    </div>

                                                    <div className={submitCount ? (errors.name ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="fullName">Name </label>
                                                        <Field name="name" type="text" id="name" placeholder="Enter Name" className="form-input" />

                                                        {submitCount ? errors.name ? <div className="mt-1 text-danger">{errors.name}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div>

                                                    <div className={submitCount ? (errors.sku ? 'has-error' : 'has-success') : ''}>
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
                                                    </div>

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

export default Product;
