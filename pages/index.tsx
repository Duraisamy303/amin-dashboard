import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../store/themeConfigSlice';
import IconBell from '@/components/Icon/IconBell';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import IconPencil from '@/components/Icon/IconPencil';
import { Button } from '@mantine/core';
import Dropdown from '../components/Dropdown';
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
import Link from 'next/link';
import { useRouter } from 'next/router';
import IconEdit from '@/components/Icon/IconEdit';
import { useMutation, useQuery } from '@apollo/client';
import {
    DELETE_PRODUCTS,
    PRODUCT_LIST,
    PARENT_CATEGORY_LIST,
    CATEGORY_FILTER_LIST,
    CREATE_PRODUCT,
    UPDATE_PRODUCT_CHANNEL,
    CREATE_VARIANT,
    UPDATE_VARIANT_LIST,
    UPDATE_META_DATA,
    ASSIGN_TAG_PRODUCT,
    PRODUCT_FULL_DETAILS,
} from '@/query/product';
import moment from 'moment';
import { Failure, Success, duplicateUploadImage, formatCurrency, profilePic, roundOff, uploadImage } from '@/utils/functions';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import IconLoader from '@/components/Icon/IconLoader';
import CommonLoader from './elements/commonLoader';

const ProductList = () => {
    const router = useRouter();
    const [loader, setLoading] = useState(false);

    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const {
        error,
        data: productData,
        loading: getloading,
    } = useQuery(PRODUCT_LIST, {
        variables: { channel: 'india-channel', first: 200, direction: 'DESC', field: 'CREATED_AT' }, // Pass variables here
    });

    const { data: stockFilter, refetch: productListRefetch } = useQuery(PRODUCT_LIST);

    const [addFormData] = useMutation(CREATE_PRODUCT);
    const [updateProductChannelList] = useMutation(UPDATE_PRODUCT_CHANNEL);
    const [createVariant] = useMutation(CREATE_VARIANT);
    const [updateVariantList] = useMutation(UPDATE_VARIANT_LIST);
    const [updateMedatData] = useMutation(UPDATE_META_DATA);
    const [assignTagToProduct] = useMutation(ASSIGN_TAG_PRODUCT);

    const [productList, setProductList] = useState([]);

    useEffect(() => {
        if (router?.query?.category) {
            OneCatProductList();
        } else {
            getProductList();
        }
    }, [router?.query, productData]);

    const getProductList = () => {
        setLoading(true);
        if (productData) {
            if (productData && productData.products && productData.products.edges?.length > 0) {
                const newData = productData?.products?.edges.map((item: any) => ({
                    ...item.node,
                    product: item?.node?.products?.totalCount,
                    image: item?.node?.thumbnail?.url,
                    categories: item?.node?.category?.name ? item?.node?.category?.name : '-',
                    date: item?.node?.updatedAt
                        ? `Last Modified ${moment(item?.node?.updatedAt).format('YYYY/MM/DD [at] h:mm a')}`
                        : `Published ${moment(item?.node?.channelListings[0]?.publishedAt).format('YYYY/MM/DD [at] h:mm a')}`,
                    price: `${formatCurrency('INR')}${roundOff(item?.node?.pricing?.priceRange?.start?.gross?.amount)}`,
                    status: item?.node?.channelListings[0]?.isPublished == true ? 'Published' : 'Draft',
                    sku: item?.node?.defaultVariant ? item?.node?.defaultVariant?.sku : '-',
                    tags: item?.node?.tags?.length > 0 ? item?.node?.tags?.map((item: any) => item.name)?.join(',') : '-',
                    stock: checkStock(item?.node?.variants) ? 'In stock' : 'Out of stock',
                }));
                // const sorting: any = sortBy(newData, 'id');
                setProductList(newData);
                setLoading(false);

                // const newData = categoryData.categories.edges.map((item) => item.node).map((item)=>{{...item,product:isTemplateExpression.products.totalCount}});
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Products'));
    });
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState([]);
    const [recordsData, setRecordsData] = useState(initialRecords);
    const [parentLists, setParentLists] = useState([]);
    const [rowId, setRowId] = useState('');

    const [deleteProducts] = useMutation(DELETE_PRODUCTS);

    const { data: productDetails, refetch: productDetailsRefetch } = useQuery(PRODUCT_FULL_DETAILS);

    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [selectedCategory, setSelectedCategory] = useState('');
    const [status, setStatus] = useState('');

    const [filterFormData, setFilterFormData] = useState({
        category: '',
        stock: '',
        productType: '',
    });

    useEffect(() => {
        // Sort finishList by 'id' and update initialRecords
        setInitialRecords(productList);
    }, [productList]);

    // Log initialRecords when it changes
    useEffect(() => {}, [initialRecords]);

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
            return productList.filter((item: any) => {
                return (
                    // item.id.toString().includes(search.toLowerCase()) ||
                    // item.image.toLowerCase().includes(search.toLowerCase()) ||
                    item?.name?.toLowerCase().includes(search.toLowerCase()) ||
                    item?.sku?.toLowerCase().includes(search.toLowerCase()) ||
                    item?.status.toLowerCase().includes(search.toLowerCase()) ||
                    // item.stock.toLowerCase().includes(search.toLowerCase()) ||
                    // item.price.toString().includes(search.toLowerCase()) ||
                    item?.categories?.toLowerCase().includes(search.toLowerCase()) ||
                    item?.date?.toString().includes(search.toLowerCase())
                );
            });
        });
    }, [search]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        // setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setInitialRecords(initialRecords);
    }, [sortStatus]);

    //    parent category list query
    const {
        data: parentList,
        error: parentListError,
        refetch: parentListRefetch,
    } = useQuery(PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });
    const GetcategoryFilterData = () => {
        const getparentCategoryList = parentList?.categories?.edges;
        setParentLists(getparentCategoryList);
    };

    useEffect(() => {
        GetcategoryFilterData();
    }, [parentList]);

    const {
        data: FilterCategoryList,
        error: FilterCategoryListError,
        refetch: FilterCategoryListRefetch,
    } = useQuery(CATEGORY_FILTER_LIST, {
        variables: { channel: 'india-channel', first: 100, categoryId: selectedCategory },
    });

    const { data: CategoryProductList, refetch: CategoryProductListRefetch } = useQuery(CATEGORY_FILTER_LIST, {
        variables: { channel: 'india-channel', first: 100, categoryId: router?.query?.category },
    });

    const OneCatProductList = async () => {
        try {
            const res = await CategoryProductListRefetch();
            console.log('OneCatProductList: ', res);
            const products = res?.data?.products?.edges;
            if (products?.length > 0) {
                const newData = products?.map((item: any) => ({
                    ...item.node,
                    product: item?.node?.products?.totalCount,
                    image: item?.node?.thumbnail?.url,
                    categories: item?.node?.category?.name ? item?.node?.category?.name : '-',
                    date: item?.node?.updatedAt
                        ? `Last Modified ${moment(item?.node?.updatedAt).format('YYYY/MM/DD [at] h:mm a')}`
                        : `Published ${moment(item?.node?.channelListings[0]?.publishedAt).format('YYYY/MM/DD [at] h:mm a')}`,
                    // price: item?.node?.pricing?.priceRange?.start?.gross?.amount,
                    price: `${formatCurrency('INR')}${roundOff(item?.node?.pricing?.priceRange?.start?.gross?.amount)}`,
                    status: item?.node?.channelListings[0]?.isPublished == true ? 'Published' : 'Draft',
                    sku: item?.node?.defaultVariant ? item?.node?.defaultVariant?.sku : '-',
                    tags: item?.node?.tags?.length > 0 ? item?.node?.tags?.map((item: any) => item.name)?.join(',') : '-',
                    stock: checkStock(item?.node?.variants) ? 'In stock' : 'Out of stock',

                    // shipmentTracking: item?.node?.shipments?.length>0?item
                }));

                // const sorting: any = sortBy(newData, 'id');
                setProductList(newData);
                setLoading(false);
            }
        } catch (error) {
            console.log('error: ', error);
        }
        setLoading(false);
    };

    const CategoryFilterList = () => {
        // const getFilterCategoryList = FilterCategoryList?.products?.edges;
        // console.log('✌️getFilterCategoryList --->', getFilterCategoryList);
        // setRecordsData(getFilterCategoryList);

        setLoading(true);

        if (FilterCategoryList) {
            if (FilterCategoryList && FilterCategoryList.products && FilterCategoryList.products.edges?.length > 0) {
                const newData = FilterCategoryList?.products?.edges.map((item: any) => ({
                    ...item.node,
                    product: item?.node?.products?.totalCount,
                    image: item?.node?.thumbnail?.url,
                    categories: item?.node?.category?.name ? item?.node?.category?.name : '-',
                    date: item?.node?.updatedAt
                        ? `Last Modified ${moment(item?.node?.updatedAt).format('YYYY/MM/DD [at] h:mm a')}`
                        : `Published ${moment(item?.node?.channelListings[0]?.publishedAt).format('YYYY/MM/DD [at] h:mm a')}`,
                    // price: item?.node?.pricing?.priceRange?.start?.gross?.amount,
                    price: `${formatCurrency('INR')}${roundOff(item?.node?.pricing?.priceRange?.start?.gross?.amount)}`,
                    status: item?.node?.channelListings[0]?.isPublished == true ? 'Published' : 'Draft',
                    sku: item?.node?.defaultVariant ? item?.node?.defaultVariant?.sku : '-',
                    tags: item?.node?.tags?.length > 0 ? item?.node?.tags?.map((item: any) => item.name)?.join(',') : '-',
                    stock: checkStock(item?.node?.variants) ? 'In stock' : 'Out of stock',

                    // shipmentTracking: item?.node?.shipments?.length>0?item
                }));

                // const sorting: any = sortBy(newData, 'id');
                setProductList(newData);
                setLoading(false);

                // const newData = categoryData.categories.edges.map((item) => item.node).map((item)=>{{...item,product:isTemplateExpression.products.totalCount}});
            } else if (FilterCategoryList && FilterCategoryList.products && FilterCategoryList.products.edges?.length === 0) {
                setProductList([]);
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const checkStock = (variants: any[]) => {
        let stock = false;
        if (variants?.length > 0) {
            const total = variants?.reduce((total, item) => total + item.quantityAvailable, 0);
            if (total > 0) {
                stock = true;
            }
        }
        return stock;
    };

    const onFilterSubmit = async (e: any) => {
        e.preventDefault();
        if (selectedCategory !== '') {
            await FilterCategoryListRefetch();
            CategoryFilterList();
        } else {
            getProductList();
        }

        if (status != '') {
        }
    };

    // Product table create
    const CreateProduct = () => {
        router.push('/apps/product/add');
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
                const productIds = selectedRecords?.map((item: any) => item.id);
                const { data }: any = deleteProducts({
                    variables: {
                        ids: productIds,
                    },
                });
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
                const { data }: any = deleteProducts({
                    variables: {
                        ids: [record.id],
                    },
                });
                const updatedRecordsData = recordsData.filter((dataRecord: any) => dataRecord.id !== record.id);
                setRecordsData(updatedRecordsData);
                Swal.fire('Deleted!', 'Your Product has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Product List is safe :)', 'error');
            }
        );
    };

    // top Filter Category change
    const CategoryChange = (selectedCategory: string) => {
        // Update the state with the selected category
        setSelectedCategory(selectedCategory);
        // setFilterFormData((prevState) => ({
        //     ...prevState,
        //     category: selectedCategory,
        // }));
    };

    const statusChange = async (e: string) => {
        try {
            setStatus(e);

            let filter = {};
            if (e == 'OutOfStock') {
                filter = { stockAvailability: 'OUT_OF_STOCK' };
            } else {
                filter = { stockAvailability: 'IN_STOCK' };
            }
            const res = await productListRefetch({
                channel: 'india-channel',
                first: 100,
                direction: 'DESC',
                field: 'CREATED_AT',
                filter,
            });

            const newData = res?.data?.products?.edges.map((item: any) => ({
                ...item.node,
                product: item?.node?.products?.totalCount,
                image: item?.node?.thumbnail?.url,
                categories: item?.node?.category?.name ? item?.node?.category?.name : '-',
                date: item?.node?.updatedAt
                    ? `Last Modified ${moment(item?.node?.updatedAt).format('YYYY/MM/DD [at] h:mm a')}`
                    : `Published ${moment(item?.node?.channelListings[0]?.publishedAt).format('YYYY/MM/DD [at] h:mm a')}`,
                // price: item?.node?.pricing?.priceRange?.start?.gross?.amount,
                price: `${formatCurrency('INR')}${roundOff(item?.node?.pricing?.priceRange?.start?.gross?.amount)}`,
                status: item?.node?.channelListings[0]?.isPublished == true ? 'Published' : 'Draft',
                sku: item?.node?.defaultVariant ? item?.node?.defaultVariant?.sku : '-',
                tags: item?.node?.tags?.length > 0 ? item?.node?.tags?.map((item: any) => item.name)?.join(',') : '-',
                stock: checkStock(item?.node?.variants) ? 'In stock' : 'Out of stock',

                // shipmentTracking: item?.node?.shipments?.length>0?item
            }));

            // const sorting: any = sortBy(newData, 'id');
            if (e == '') {
                getProductList();
            } else {
                setProductList(newData);
            }

            console.log('res: ', res);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const productTypeChange = (selectedProductType: string) => {
        console.log('Selected Product Type:', selectedProductType);
        // Update the state with the selected product type
        setFilterFormData((prevState) => ({
            ...prevState,
            productType: selectedProductType,
        }));
    };
    useEffect(() => {
        fetchData();
    }, [rowId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await productDetailsRefetch({
                channel: 'india-channel',
                id: rowId,
                choicesFirst: 10,
            });
            console.log('Refetch result: ', res);
            setLoading(false);
        } catch (error) {
            setLoading(true);

            console.error('Error refetching: ', error);
        }
    };

    const duplicate = async (row: any) => {
        try {
            setLoading(true);
            setRowId(row.id);
            // productDetailsRefetch()
            const res = await productDetailsRefetch({
                channel: 'india-channel',
                id: row.id,
            });
            const response = res.data?.product;
            setLoading(false);

            CreateDuplicateProduct(response);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const CreateDuplicateProduct = async (row: any) => {
        try {
            setLoading(true);

            let collectionId: any = [];

            if (row?.collections?.length > 0) {
                collectionId = row?.collections.map((item: any) => item.id);
            }
            let tagId: any[] = [];
            if (row?.tags?.length > 0) {
                tagId = row?.tags?.map((item: any) => item.id);
            }

            let finish = [];
            if (row?.productFinish?.length > 0) {
                finish = row?.productFinish?.map((item: any) => item.id);
            }

            let design = [];
            if (row?.prouctDesign?.length > 0) {
                design = row?.prouctDesign?.map((item: any) => item.id);
            }

            let style = [];
            if (row?.productstyle?.length > 0) {
                style = row?.productstyle?.map((item: any) => item.id);
            }

            let stone = [];
            if (row?.productStoneType?.length > 0) {
                stone = row?.productStoneType?.map((item: any) => item.id);
            }

            let upsells = [];
            if (row?.getUpsells?.length > 0) {
                upsells = row?.getUpsells?.map((item: any) => item?.productId);
            }
            let crosssells = [];
            if (row?.getCrosssells?.length > 0) {
                crosssells = row?.getCrosssells?.map((item: any) => item?.productId);
            }

            const { data } = await addFormData({
                variables: {
                    input: {
                        attributes: [],
                        category: row?.category?.id,
                        collections: collectionId,
                        description:row.description,
                        tags: tagId,
                        upsells,
                        crosssells,
                        // description: formattedDescription,
                        name: row.name,
                        productType: row.productType?.id,
                        seo: {
                            description: row.seoDescription,
                            title: row.seoTitle,
                        },
                        slug: row.slug + '-1',
                        order_no: row.orderNo,
                        prouctDesign: design,
                        productstyle: style,
                        productFinish: finish,
                        productStoneType: stone,
                    },
                },
            });

            if (data?.productCreate?.errors?.length > 0) {
                Failure(data?.productCreate?.errors[0]?.message);
                console.log('error: ', data?.productCreate?.errors[0]?.message);
            } else {
                const productId = data?.productCreate?.product?.id;
                productChannelListUpdate(productId, row);
                // if (row?.media?.length > 0) {
                //     row?.media?.map((item: any) => {
                //         const imageUpload = duplicateUploadImage(productId, item.url);
                //         console.log('imageUpload: ', imageUpload);
                //     });
                // }
            }
            setLoading(false);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const productChannelListUpdate = async (productId: any, row: any) => {
        try {
            setLoading(true);

            const { data } = await updateProductChannelList({
                variables: {
                    id: productId,
                    input: {
                        updateChannels: [
                            {
                                availableForPurchaseDate: null,
                                channelId: 'Q2hhbm5lbDoy',
                                isAvailableForPurchase: true,
                                isPublished: row?.channelListings[0]?.isPublished,
                                publicationDate: null,
                                visibleInListings: true,
                            },
                        ],
                    },
                },
                // variables: { email: formData.email, password: formData.password },
            });
            if (data?.productChannelListingUpdate?.errors?.length > 0) {
                console.log('error: ', data?.productChannelListingUpdate?.errors[0]?.message);
                Failure(data?.productChannelListingUpdate?.errors[0]?.message);
                deleteDuplicateProduct(productId);
            } else {
                console.log('productChannelListUpdate: ', data);

                variantListUpdate(productId, row);
            }
            setLoading(false);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const variantListUpdate = async (productId: any, row: any) => {
        try {
            let variants = [];
            if (row.variants.length > 0) {
                const variantArr = row.variants?.map((item: any, index: any) => ({
                    attributes: [],
                    sku: `${item.sku}-1`,
                    name: item.name,
                    trackInventory: item.trackInventory,
                    channelListings: [
                        {
                            channelId: 'Q2hhbm5lbDoy',
                            price: item.channelListings[0]?.price?.amount ? item.channelListings[0]?.price?.amount : '',
                            costPrice: item.channelListings[0]?.costPrice?.amount ? item.channelListings[0]?.costPrice?.amount : '',
                        },
                    ],
                    stocks: [
                        {
                            warehouse: 'V2FyZWhvdXNlOmRmODMzODUzLTQyMGYtNGRkZi04YzQzLTVkMzdjMzI4MDRlYQ==',
                            quantity: item?.stocks?.length > 0 ? item?.stocks[0]?.quantity : 1,
                        },
                    ],
                }));
                variants = variantArr;
            }

            const { data } = await createVariant({
                variables: {
                    id: productId,
                    inputs: variants,
                },
                // variables: { email: formData.email, password: formData.password },
            });
            if (data?.productVariantBulkCreate?.errors?.length > 0) {
                Failure(data?.productVariantBulkCreate?.errors[0]?.message);
                deleteDuplicateProduct(productId);
            } else {
                const resVariants = data?.productVariantBulkCreate?.productVariants;
                console.log('resVariants: ', resVariants);

                // const varArr = row?.variants.forEach((variant) => {
                //     variant.channelListings.forEach((channelListing) => {
                //         if (channelListing.channel.name === 'India Channel') {
                //             variantChannelListUpdate(channelListing, productId, variant.id, row);
                //         }
                //     });
                // });
                if (resVariants?.length > 0) {
                    const mergedVariants = row?.variants.map((variant: any, index: number) => ({
                        ...variant,
                        variantId: resVariants[index]?.id || null,
                    }));
                    console.log('mergedVariants: ', mergedVariants);
                    const varArr = mergedVariants.forEach((variant) => {
                        variant.channelListings.forEach((channelListing) => {
                            if (channelListing.channel.name === 'India Channel') {
                                console.log('channelListing: ', channelListing);
                                variantChannelListUpdate(channelListing?.price?.amount, productId, variant.variantId, row);
                            }
                        });
                    });
                } else {
                    updateMetaData(productId, row);
                }
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const variantChannelListUpdate = async (price: any, productId: any, variantId: any, row: any) => {
        try {
            const { data } = await updateVariantList({
                variables: {
                    id: variantId,
                    input: [
                        {
                            channelId: 'Q2hhbm5lbDoy',
                            price: price,
                            costPrice: price,
                        },
                    ],
                },
                // variables: { email: formData.email, password: formData.password },
            });
            if (data?.productVariantChannelListingUpdate?.errors?.length > 0) {
                Failure(data?.productVariantChannelListingUpdate?.errors[0]?.message);
                deleteDuplicateProduct(productId);
            } else {
                updateMetaData(productId, row);
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const updateMetaData = async (productId: any, row: any) => {
        try {
            let metadata = [];
            if (row.metadata?.length > 0) {
                metadata = row.metadata?.map((item: any) => ({ key: item.key, value: item.value }));
            }
            const { data } = await updateMedatData({
                variables: {
                    id: productId,
                    input: metadata,
                    keysToDelete: [],
                },
                // variables: { email: formData.email, password: formData.password },
            });
            if (data?.updateMetadata?.errors?.length > 0) {
                Failure(data?.updateMetadata?.errors[0]?.message);
                deleteDuplicateProduct(productId);
                console.log('error: ', data?.updateMetadata?.errors[0]?.message);
            } else {
                // if (selectedTag?.length > 0) {
                //     assignsTagToProduct(productId);
                //     console.log('success: ', data);
                // }
                router.push(`/apps/product/edit?id=${productId}`);
                Success('Product created successfully');
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const deleteDuplicateProduct = async (productId: any) => {
        try {
            const { data }: any = deleteProducts({
                variables: {
                    ids: [productId],
                },
            });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const statusFilter = [
        {
            name: 'In Stock',
            value: 'InStock',
        },
        {
            name: 'Out of stock',
            value: 'OutOfStock',
        },
    ];

    return (
        <div>
            <div className="panel mt-6">
                <div className="mb-10 flex flex-col gap-5 lg:mb-5 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-5">
                        <h5 className="text-lg font-semibold dark:text-white-light">Product</h5>
                         <button type="button" className="btn btn-outline-primary" onClick={() => router.push('/product_import')}>
                            Import
                        </button> 
                         <button type="button" className="btn btn-outline-primary" onClick={() => router.push('/product_export')}>
                            Export
                        </button> 
                    </div>
                    <div className="mt-5 md:mt-0 md:flex  md:ltr:ml-auto md:rtl:mr-auto">
                        <input type="text" className="form-input  mb-3 mr-2 w-full md:mb-0 md:w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <div className="dropdown mb-3 mr-0  md:mb-0 md:mr-2">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="btn btn-outline-primary dropdown-toggle  lg:w-auto w-full"
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
                        <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => CreateProduct()}>
                            + Create
                        </button>
                    </div>
                </div>

                <div className="mb-5 ">
                    <form onSubmit={onFilterSubmit}>
                        <div className="col-4 mx-auto  flex items-center gap-4 md:flex-row">
                            <select className="form-select flex-1" onChange={(e) => CategoryChange(e.target.value)}>
                                <option value="">Select a Categories </option>
                                {parentLists?.map((item: any) => {
                                    return (
                                        <>
                                            <option value={item?.node?.id}>{item.node?.name}</option>
                                            {item?.node?.children?.edges.map((child: any) => (
                                                <option key={child.id} value={child.node?.id} style={{ paddingLeft: '20px' }}>
                                                    -- {child.node?.name}
                                                </option>
                                            ))}
                                        </>
                                    );
                                })}
                            </select>
                            <select className="form-select flex-1" value={status} onChange={(e) => statusChange(e.target.value)}>
                                <option value={''}>Select a status</option>;
                                {statusFilter?.map((item: any) => {
                                    return (
                                        <>
                                            <option value={item.value}>{item.name}</option>
                                        </>
                                    );
                                })}
                            </select>

                            {/* New select dropdown for stock status */}
                            {/* <select className="form-select flex-1" onChange={(e) => StockStatusChange(e.target.value)}>
                                <option value="">Filter By Stock Status</option>
                                <option value="In Stock">In Stock</option>
                                <option value="Out Of Stock">Out Of Stock</option>
                            </select>

                            <select className="form-select flex-1" onChange={(e) => productTypeChange(e.target.value)}>
                                <option value="sample-product">Simple Product</option>
                                <option value="variable-product">Variable Product</option>
                            </select> */}
                            <button type="submit" className="btn btn-primary w-full py-2.5 md:w-auto">
                                Filter
                            </button>
                        </div>
                    </form>
                </div>

                <div className="datatables">
                    {getloading ? (
                        <CommonLoader />
                    ) : (
                        <DataTable
                            customLoader={<CommonLoader />}
                            className="table-hover whitespace-nowrap"
                            records={recordsData}
                            columns={[
                                // { accessor: 'id', sortable: true },
                                { accessor: 'image', sortable: true, render: (row) => <img src={row.image} alt="Product" className="h-10 w-10 object-cover ltr:mr-2 rtl:ml-2" /> },
                                // { accessor: 'name', sortable: true },
                                {
                                    accessor: 'name',
                                    sortable: true,
                                    render: (row) => (
                                        <>
                                            <div className="">{row.name}</div>
                                            <button onClick={() => duplicate(row)} className=" cursor-pointer text-blue-400 underline">
                                                Duplicate
                                            </button>
                                        </>
                                    ),
                                },

                                { accessor: 'sku', sortable: true, title: 'SKU' },
                                { accessor: 'stock', sortable: false },

                                { accessor: 'status', sortable: true },
                                { accessor: 'price', sortable: true },
                                { accessor: 'categories', sortable: true },
                                {
                                    accessor: 'tags',
                                    sortable: true,
                                    width: 200,

                                    render: (row) => <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', overflow: 'hidden', width: '200px' }}>{row.tags}</div>,
                                },
                                {
                                    accessor: 'date',
                                    sortable: true,
                                    width: 160,
                                    render: (row) => <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', overflow: 'hidden', width: '160px' }}>{row.date}</div>,
                                },
                                {
                                    // Custom column for actions
                                    accessor: 'actions', // You can use any accessor name you want
                                    title: 'Actions',
                                    // Render method for custom column
                                    render: (row: any) => (
                                        <>
                                            <div className="mx-auto flex w-max items-center gap-4">
                                                <button className="flex hover:text-info" onClick={() => router.push(`/apps/product/edit?id=${row.id}`)}>
                                                    <IconEdit className="h-4.5 w-4.5" />
                                                </button>
                                                {/* {row?.status == 'Published' && ( */}
                                                <button
                                                    className="flex hover:text-info"
                                                    onClick={() => {
                                                        if (row.status == 'Draft') {
                                                            Failure('Product is Draft !');
                                                        } else {
                                                            window.open(`http://www1.prade.in/product-details/${row.id}`, '_blank'); // '_blank' parameter opens the link in a new tab
                                                        }
                                                    }}
                                                >
                                                    {/* <Link href="/apps/product/view" className="flex hover:text-primary"> */}
                                                    <IconEye />
                                                </button>
                                                {/* )} */}

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
                                setSelectedRecords(selectedRecords);
                            }}
                            minHeight={200}
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrivateRouter(ProductList);
