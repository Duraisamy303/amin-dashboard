import Link from 'next/link';
import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconUserPlus from '@/components/Icon/IconUserPlus';
import IconListCheck from '@/components/Icon/IconListCheck';
import IconLayoutGrid from '@/components/Icon/IconLayoutGrid';
import IconSearch from '@/components/Icon/IconSearch';
import IconUser from '@/components/Icon/IconUser';
import IconFacebook from '@/components/Icon/IconFacebook';
import IconInstagram from '@/components/Icon/IconInstagram';
import IconLinkedin from '@/components/Icon/IconLinkedin';
import IconTwitter from '@/components/Icon/IconTwitter';
import IconX from '@/components/Icon/IconX';
import { useGetAllProductsQuery } from '@/Api/categoryApi';
import { useMutation, useQuery } from '@apollo/client';
import { CATEGORY_LIST, CREATE_CATEGORY, DELETE_CATEGORY, PRODUCT_LIST } from '@/query/product';
import { useSetState } from '@/utils/functions';
import Tippy from '@tippyjs/react';
import IconEye from '@/components/Icon/IconEye';
import IconPencil from '@/components/Icon/IconPencil';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
const ReactQuill = dynamic(import('react-quill'), { ssr: false });

const Contacts = () => {
    const router = useRouter();

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const {
        loading,
        error,
        data: categoryData,
    } = useQuery(CATEGORY_LIST, {
        variables: { channel: 'india-channel', first: 20 }, // Pass variables here
    });

    const [deleteCat] = useMutation(DELETE_CATEGORY);

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [categoryList, setCategoryList] = useState([]);
    const [filteredItems, setFilteredItems] = useState<any>(categoryList);
    const [selectedRecords, setSelectedRecords] = useState<any>([]);
    const [search, setSearch] = useState('');
    const [addContactModal, setAddContactModal] = useState(false);

    useEffect(() => {
        getCategoryList();
    }, [categoryData]);

    const getCategoryList = () => {
        if (categoryData && categoryData.categories && categoryData.categories.edges) {
            const newData = categoryData.categories.edges.map((item) => ({
                ...item.node,
                product: item?.node?.products?.totalCount,
            }));
            const sorting: any = sortBy(newData, 'id');
            console.log("sorting: ", sorting);
            setCategoryList(sorting);
            // const newData = categoryData.categories.edges.map((item) => item.node).map((item)=>{{...item,product:isTemplateExpression.products.totalCount}});
        }
    };

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setCategoryList([...categoryList.slice(from, to)]);
    }, [page, pageSize]);

    const [value, setValue] = useState<any>('list');
    const [defaultParams] = useState({
        id: null,
        name: '',
        description: '',
    });

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));

    const [addCategory] = useMutation(CREATE_CATEGORY);

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const searchContact = () => {
        setFilteredItems(() => {
            return categoryList.filter((item: any) => {
                return item.name.toLowerCase().includes(search.toLowerCase());
            });
        });
    };

    // useEffect(() => {
    //     searchContact();
    // }, [search]);

    const saveUser = async () => {
        if (!params.name) {
            showMessage('Name is required.', 'error');
            return true;
        }
        if (!params.description) {
            showMessage('Description is required.', 'error');
            return true;
        }

        const { data } = await addCategory({
            variables: { email: params.name, password: params.description },
        });

        // if (params.id) {
        //     //update user
        //     let user: any = filteredItems.find((d: any) => d.id === params.id);
        //     user.name = params.name;
        //     user.email = params.email;
        //     user.phone = params.phone;
        //     user.role = params.role;
        //     user.location = params.location;
        // } else {
        //     //add user
        //     let maxUserId = filteredItems.length ? filteredItems.reduce((max: any, character: any) => (character.id > max ? character.id : max), filteredItems[0].id) : 0;

        //     let user = {
        //         id: maxUserId + 1,
        //         path: 'profile-35.png',
        //         name: params.name,
        //         email: params.email,
        //         phone: params.phone,
        //         role: params.role,
        //         location: params.location,
        //         posts: 20,
        //         followers: '5K',
        //         following: 500,
        //     };
        //     filteredItems.splice(0, 0, user);
        //     //   searchContacts();
        // }

        showMessage('User has been saved successfully.');
        setAddContactModal(false);
    };

    const editUser = (user: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        if (user) {
            let json1 = JSON.parse(JSON.stringify(user));
            setParams(json1);
        }
        setAddContactModal(true);
    };

    const deleteUser = (user: any = null) => {
        setFilteredItems(filteredItems.filter((d: any) => d.id !== user.id));
        showMessage('User has been deleted successfully.');
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    useEffect(() => {
        const data = sortBy(categoryList, sortStatus.columnAccessor);
        setCategoryList(sortStatus.direction === 'desc' ? data.reverse() : data);
    }, [sortStatus]);

    const deleteCategory = async (row: any) => {
        console.log('data: ', row);
        try {
            const { data } = await deleteCat({
                variables: { id: row.id },
            });
            console.log('response: ', data);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl">Category</h2>
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => editUser()}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Category
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${value === 'list' && 'bg-primary text-white'}`} onClick={() => setValue('list')}>
                                <IconListCheck />
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${value === 'grid' && 'bg-primary text-white'}`} onClick={() => setValue('grid')}>
                                <IconLayoutGrid />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input type="text" placeholder="Search Contacts" className="peer form-input py-2 ltr:pr-11 rtl:pl-11" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <button type="button" className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="datatables pt-5">
                <DataTable
                    className="table-hover whitespace-nowrap"
                    records={categoryList}
                    columns={[
                        // { accessor: 'id', sortable: true },
                        // { accessor: 'image', sortable: true, render: (row) => <img src={row.image} alt="Product" className="h-10 w-10 object-cover ltr:mr-2 rtl:ml-2" /> },
                        { accessor: 'name', sortable: true },
                        { accessor: 'product', sortable: true },

                        {
                            // Custom column for actions
                            accessor: 'actions', // You can use any accessor name you want
                            title: 'Actions',
                            // Render method for custom column
                            render: (row: any) => (
                                <>
                                    <Tippy content="View">
                                        <button type="button" onClick={() => router.push(`/slug/categoryView/${row.id}`)}>
                                            <IconEye className="ltr:mr-2 rtl:ml-2" />
                                        </button>
                                    </Tippy>
                                    <Tippy content="Edit">
                                        <button type="button">
                                            <IconPencil className="ltr:mr-2 rtl:ml-2" />
                                        </button>
                                    </Tippy>
                                    <Tippy content="Delete">
                                        <button type="button" onClick={() => deleteCategory(row)}>
                                            <IconTrashLines />
                                        </button>
                                    </Tippy>
                                </>
                            ),
                        },
                    ]}
                    highlightOnHover
                    totalRecords={categoryList.length}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    sortStatus={sortStatus}
                    onSortStatusChange={setSortStatus}
                    selectedRecords={selectedRecords}
                    onSelectedRecordsChange={(selectedRecords: any) => {
                        console.log('selectedRecords: ', selectedRecords);
                        setSelectedRecords(selectedRecords);
                    }}
                    minHeight={200}
                    paginationText={({ from, to, totalRecords }) => {
                        return `Showing  ${from} to ${to} of ${totalRecords} entries`;
                    }}
                />
            </div>

            {/* {value === 'list' && (
                <div className="panel mt-5 overflow-hidden border-0 p-0">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Location</th>
                                    <th>Phone</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((contact: any) => {
                                    return (
                                        <tr key={contact.id}>
                                            <td>
                                                <div className="flex w-max items-center">
                                                    {contact.path && (
                                                        <div className="w-max">
                                                            <img src={`/assets/images/${contact.path}`} className="h-8 w-8 rounded-full object-cover ltr:mr-2 rtl:ml-2" alt="avatar" />
                                                        </div>
                                                    )}
                                                    {!contact.path && contact.name && (
                                                        <div className="grid h-8 w-8 place-content-center rounded-full bg-primary text-sm font-semibold text-white ltr:mr-2 rtl:ml-2"></div>
                                                    )}
                                                    {!contact.path && !contact.name && (
                                                        <div className="rounded-full border border-gray-300 p-2 ltr:mr-2 rtl:ml-2 dark:border-gray-800">
                                                            <IconUser className="h-4.5 w-4.5" />
                                                        </div>
                                                    )}
                                                    <div>{contact.name}</div>
                                                </div>
                                            </td>
                                            <td>{contact.email}</td>
                                            <td className="whitespace-nowrap">{contact.location}</td>
                                            <td className="whitespace-nowrap">{contact.phone}</td>
                                            <td>
                                                <div className="flex items-center justify-center gap-4">
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editUser(contact)}>
                                                        Edit
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(contact)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {value === 'grid' && (
                <div className="mt-5 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {filteredItems.map((contact: any) => {
                        return (
                            <div className="relative overflow-hidden rounded-md bg-white text-center shadow dark:bg-[#1c232f]" key={contact.id}>
                                <div className="relative overflow-hidden rounded-md bg-white text-center shadow dark:bg-[#1c232f]">
                                    <div className="rounded-t-md bg-white/40 bg-[url('/assets/images/notification-bg.png')] bg-cover bg-center p-6 pb-0">
                                        <img className="mx-auto max-h-40 w-4/5 object-contain" src={`/assets/images/${contact.path}`} alt="contact_image" />
                                    </div>
                                    <div className="relative -mt-10 px-6 pb-24">
                                        <div className="rounded-md bg-white px-2 py-4 shadow-md dark:bg-gray-900">
                                            <div className="text-xl">{contact.name}</div>
                                            <div className="text-white-dark">{contact.role}</div>
                                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex-auto">
                                                    <div className="text-info">{contact.posts}</div>
                                                    <div>Posts</div>
                                                </div>
                                                <div className="flex-auto">
                                                    <div className="text-info">{contact.following}</div>
                                                    <div>Following</div>
                                                </div>
                                                <div className="flex-auto">
                                                    <div className="text-info">{contact.followers}</div>
                                                    <div>Followers</div>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <ul className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary h-7 w-7 rounded-full p-0">
                                                            <IconFacebook />
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary h-7 w-7 rounded-full p-0">
                                                            <IconInstagram />
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary h-7 w-7 rounded-full p-0">
                                                            <IconLinkedin />
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary h-7 w-7 rounded-full p-0">
                                                            <IconTwitter />
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="mt-6 grid grid-cols-1 gap-4 ltr:text-left rtl:text-right">
                                            <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Email :</div>
                                                <div className="truncate text-white-dark">{contact.email}</div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Phone :</div>
                                                <div className="text-white-dark">{contact.phone}</div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Address :</div>
                                                <div className="text-white-dark">{contact.location}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 mt-6 flex w-full gap-4 p-6 ltr:left-0 rtl:right-0">
                                        <button type="button" className="btn btn-outline-primary w-1/2" onClick={() => editUser(contact)}>
                                            Edit
                                        </button>
                                        <button type="button" className="btn btn-outline-danger w-1/2" onClick={() => deleteUser(contact)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )} */}

            <Transition appear show={addContactModal} as={Fragment}>
                <Dialog as="div" open={addContactModal} onClose={() => setAddContactModal(false)} className="relative z-50">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setAddContactModal(false)}
                                        className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {params.id ? 'Edit Contact' : 'Add Category'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div className="mb-5">
                                                <label htmlFor="name">Name</label>
                                                <input id="name" type="text" placeholder="Enter Name" className="form-input" value={params.name} onChange={(e) => changeValue(e)} />
                                            </div>
                                            {/* <div className="mb-5">
                                                <label htmlFor="email">Email</label>
                                                <input id="email" type="email" placeholder="Enter Email" className="form-input" value={params.email} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="number">Phone Number</label>
                                                <input id="phone" type="text" placeholder="Enter Phone Number" className="form-input" value={params.phone} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="occupation">Occupation</label>
                                                <input id="role" type="text" placeholder="Enter Occupation" className="form-input" value={params.role} onChange={(e) => changeValue(e)} />
                                            </div> */}
                                            <div className="mb-5">
                                                <label htmlFor="address">Description</label>
                                                {/* <div className="h-fit"> */}
                                                <ReactQuill
                                                    theme="snow"
                                                    value={params.description || ''}
                                                    defaultValue={params.description || ''}
                                                    onChange={(content, delta, source, editor) => {
                                                        params.description = content;
                                                        console.log('content: ', content);
                                                        console.log('params: ', params);
                                                        params.displayDescription = editor.getText();
                                                        // setParams({
                                                        //     ...params,
                                                        // });
                                                    }}
                                                    style={{ minHeight: '200px' }}
                                                />
                                                {/* </div> */}
                                                {/* <textarea
                                                    id="description"
                                                    rows={3}
                                                    placeholder="Enter description"
                                                    className="form-textarea min-h-[130px] resize-none"
                                                    value={params.description}
                                                    onChange={(e) => changeValue(e)}
                                                ></textarea> */}
                                            </div>
                                            <div className="mt-8 flex items-center justify-end">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveUser}>
                                                    {params.id ? 'Update' : 'Add'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default Contacts;
