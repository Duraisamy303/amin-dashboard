import React, { Fragment, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import Link from 'next/link';
import { downloadExlcel, formatCurrency, getCurrentDateTime, getDateRange, mintDateTime, useSetState } from '@/utils/functions';
import IconDownload from '@/components/Icon/IconDownload';
import Tippy from '@tippyjs/react';
import IconPencil from '@/components/Icon/IconPencil';
import { DataTable } from 'mantine-datatable';
import { useMutation, useQuery } from '@apollo/client';
import { PARENT_CATEGORY_LIST, SALES_BY_DATE, SALES_BY_PRODUCT } from '@/query/product';
import Select from 'react-select';
import moment from 'moment';

const tabClassNames = (selected: boolean) =>
    `${selected ? ' text-lg !border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''}
    -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black text-lg `;

export default function Reports() {
    const order = ['Sales by date', 'Sales by product', 'Sales by category', 'Coupons by date'];
    const analysis = ['Order Analysis', 'Revenue Analysis', 'Customer Analysis', 'Product by Country', 'Product Revenue'];
    const customer = ['Customers vs. guests', 'Customer list'];
    const orderFilter = ['Last 7 Days', 'This Month', 'Last Month', 'Year', 'Custome'];
    const salesByDate = [
        {
            name: 'gross sales in this period',
            value: '0.00',
        },
        {
            name: 'average gross monthly sales',
            value: '0.00',
        },
        {
            name: 'net sales in this period',
            value: '0.00',
        },
        {
            name: 'average net monthly sales',
            value: '0.00',
        },
        {
            name: 'orders placed',
            value: '0.00',
        },
        {
            name: 'items purchased',
            value: '0.00',
        },
        {
            name: 'refunded 0 orders (0 items',
            value: '0.00',
        },
        {
            name: 'charged for shipping',
            value: '0.00',
        },
        {
            name: 'worth of coupons used',
            value: '0.00',
        },
    ];

    const [salesBydate] = useMutation(SALES_BY_DATE);
    const [salesByProduct] = useMutation(SALES_BY_PRODUCT);

    const { data: parentList, error: parentListError, refetch: parentListRefetch } = useQuery(PARENT_CATEGORY_LIST);

    const [state, setState] = useSetState({
        orderSubMenu: 'Sales by date',
        customerIndex: 0,
        activeTab: 'Orders',
        dateFilter: 'Last 7 Days',
        orderDateFilter: 'Last 7 Days',
        search: '',
        activeAccordion: null,
        analysisTab: 'Order Analysis',
        orderStartDate: new Date(),
        orderEndDate: new Date(),
        orderCurrency: 'All Currencies',
        analysisCurrency: 'All Currencies',
        tableData: [],
    });

    const getBorderColor = (index) => {
        // const colors = ['#7ad03a', '#a00', '#ffba00', '#2ea2cc', '#a46497', '#ebe9eb', '#515151', '#77a464', '#767676'];
        const colors = ['#2ea2cc'];

        return colors[index % colors.length];
    };

    const toggleAccordion = (accordion) => {
        console.log('accordion: ', accordion);
        setState({
            activeAccordion: state.activeAccordion === accordion ? null : accordion,
        });
    };

    useEffect(() => {
        if (state.orderSubMenu == 'Sales by date') {
            getSalesByDate();
        } else if (state.orderSubMenu == 'Sales by product') {
            getSalesByProduct();
        }
    }, [state.orderDateFilter, state.orderStartDate, state.orderEndDate, state.orderSubMenu]);

    useEffect(() => {
        GetcategoryFilterData();
    }, [parentList]);

    const GetcategoryFilterData = async () => {
        try {
            const res: any = await parentListRefetch({
                channel: 'india-channel',
            });

            const getparentCategoryList = res?.data?.categories?.edges;
            setState({ categoryList: getparentCategoryList });
            // setParentLists(getparentCategoryList);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getSalesByDate = async () => {
        try {
            let startDate: any, endDate: any;
            console.log('state.orderDateFilter: ', state.orderDateFilter);

            if (state.orderDateFilter == 'Last 7 Days') {
                const { start, end } = getDateRange('last7Days');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'This Month') {
                const { start, end } = getDateRange('thisMonth');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'Last Month') {
                const { start, end } = getDateRange('lastMonth');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'Custome') {
                (startDate = moment(state.orderStartDate).format('YYYY-MM-DD')), (endDate = moment(state.orderEndDate).format('YYYY-MM-DD'));
            }

            console.log('startDate: ', startDate, endDate);

            const res = await salesBydate({
                variables: {
                    fromdate: startDate,
                    toDate: endDate,
                    currency: state.currency,
                },
            });

            const tableData = salesBydateTable(res?.data?.salesByDate);
            console.log('tableData: ', tableData);
            setState({ tableData });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getSalesByProduct = async () => {
        try {
            let startDate: any, endDate: any;

            if (state.orderDateFilter == 'Last 7 Days') {
                const { start, end } = getDateRange('last7Days');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'This Month') {
                const { start, end } = getDateRange('thisMonth');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'Last Month') {
                const { start, end } = getDateRange('lastMonth');
                (startDate = start), (endDate = end);
            }

            if (state.orderDateFilter == 'Custome') {
                (startDate = moment(state.orderStartDate).format('YYYY-MM-DD')), (endDate = moment(state.orderEndDate).format('YYYY-MM-DD'));
            }

            const res = await salesByProduct({
                variables: {
                    fromdate: startDate,
                    toDate: endDate,
                    currency: state.currency,
                },
            });
            console.log('res?.data: ', res?.data);

            const tableData = salesBydateTable(res?.data?.salesByDate);
            console.log('tableData: ', tableData);
            setState({ tableData });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const salesBydateTable = (data) => {
        console.log('data: ', data);
        const { dates, totalItemsSoldList, shippingAmountList, refundAmountList, noOfOrderList, couponAmountList, productsTotalAmount } = data;

        const table = dates?.map((date, index) => ({
            date,
            totalItemsSold: totalItemsSoldList[index],
            shippingAmount: shippingAmountList[index],
            refundAmount: refundAmountList[index],
            noOfOrders: noOfOrderList[index],
            couponAmount: couponAmountList[index],
            // productsTotalAmount: productsTotalAmount[index],
        }));

        return table;
    };
    // Mapping selected values to options for display in the Select component

    return (
        <>
            <div className="panel text-xl">{state.activeTab}</div>
            <Tab.Group>
                <Tab.List className=" mt-5 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                    {['Orders', 'Customers', 'Analysis'].map((tab) => (
                        <Tab as={Fragment} key={tab}>
                            {({ selected }) => (
                                <button
                                    onClick={() => {
                                        setState({
                                            activeTab: tab,
                                            orderSubMenu: 'Sales by date',
                                            orderDateFilter: 'Last 7 Days',
                                            dateFilter: 'Last 7 Days',
                                            orderCurrency: 'All Currencies',
                                            analysisTab: 'Order Analysis',
                                            analysisCurrency: 'All Currencies',
                                        });
                                    }}
                                    className={tabClassNames(selected)}
                                >
                                    {tab}
                                </button>
                            )}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels>
                    {/* -----------------------Sub menu start----------------------------------------- */}

                    {/* Order Tab */}
                    <Tab.Panel>
                        {/* Main Filter Sale by date,product,category */}
                        <div className="flex  ">
                            {order?.map((link, index) => (
                                <React.Fragment key={index}>
                                    <div
                                        onClick={() => setState({ orderSubMenu: link })}
                                        className={`dark:hover:text-primary-dark hover: px-4 py-2 ${link == state.orderSubMenu ? 'text-primary' : ' border-gray-300'} border-r`}
                                    >
                                        {link?.split(' ')?.map((word, i) => (
                                            <React.Fragment key={i}>
                                                <span className="text-md cursor-pointer">{word}</span>
                                                {i !== link.split(' ').length - 1 && <span className="mx-1 border-b-2 border-black"></span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </Tab.Panel>
                    {/* Customer Tab */}
                    <Tab.Panel>
                        <div className="flex   ">
                            {customer?.map((link, index) => (
                                <React.Fragment key={index}>
                                    <div
                                        onClick={() => setState({ customerIndex: index })}
                                        className={`dark:hover:text-primary-dark hover: px-4 py-2 ${index == state.customerIndex ? 'text-primary' : ' border-gray-300'} border-r`}
                                    >
                                        {link?.split(' ')?.map((word, i) => (
                                            <React.Fragment key={i}>
                                                <span className="text-md cursor-pointer">{word}</span>
                                                {i !== link.split(' ').length - 1 && <span className="mx-1 border-b-2 border-black"></span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </Tab.Panel>
                    {/* Analysis Tab */}
                    <Tab.Panel>
                        {/* Main Filter Sale by date,product,category */}
                        <div className="flex  ">
                            {analysis?.map((link, index) => (
                                <React.Fragment key={index}>
                                    <div
                                        onClick={() => setState({ analysisTab: link })}
                                        className={`dark:hover:text-primary-dark hover: px-4 py-2 ${link == state.analysisTab ? 'text-primary' : ' border-gray-300'} border-r`}
                                    >
                                        {link?.split(' ')?.map((word, i) => (
                                            <React.Fragment key={i}>
                                                <span className="text-md cursor-pointer">{word}</span>
                                                {i !== link.split(' ').length - 1 && <span className="mx-1 border-b-2 border-black"></span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </Tab.Panel>
                    {/* ----------------------------Sub menu end---------------------------------------- */}
                    {state.activeTab == 'Orders' ? (
                        <div className="panel mt-5 ">
                            {/* Filter By last 7 days,last month year */}
                            <div className="flex items-center justify-between">
                                <div className="flex  items-center  ">
                                    {orderFilter?.map((link, index) => (
                                        <React.Fragment key={index}>
                                            <div
                                                onClick={() => setState({ orderDateFilter: link })}
                                                className={`dark:hover:text-primary-dark hover: px-4 py-2 ${link == state.orderDateFilter ? 'text-primary' : ' border-gray-300'} border`}
                                            >
                                                {link?.split(' ')?.map((word, i) => (
                                                    <React.Fragment key={i}>
                                                        <span className="text-md cursor-pointer">{word}</span>
                                                        {i !== link.split(' ').length - 1 && <span className="border-b-1 mx-1 border-black"></span>}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    <div className="pl-4">
                                        <select className="form-select w-[180px]" value={state.orderCurrency} onChange={(e) => setState({ orderCurrency: e.target.value })}>
                                            <option value="All Currencies">All Currencies</option>
                                            <option value="INR">INR</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-2 border p-3">
                                    <IconDownload />
                                    <div onClick={() => downloadExlcel(state.tableData, 'Orders')} className="">
                                        Export CSV
                                    </div>
                                </div>
                            </div>
                            {state.orderDateFilter == 'Custome' && (
                                <div className="mt-3 flex   items-center gap-4">
                                    <div className="">
                                        <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                            From :
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={state.orderStartDate}
                                            onChange={(e) => {
                                                setState({ orderStartDate: e.target.value });
                                            }}
                                            id="dateTimeCreated"
                                            name="dateTimeCreated"
                                            className="form-input"
                                            // max={getCurrentDateTime()}
                                        />
                                    </div>
                                    <div className="">
                                        <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                            To:
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={state.orderEndDate}
                                            onChange={(e) => {
                                                setState({ orderEndDate: e.target.value });
                                            }}
                                            id="dateTimeCreated"
                                            name="dateTimeCreated"
                                            className="form-input"
                                            max={getCurrentDateTime()}
                                            min={mintDateTime(state.orderStartDate)}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="mt-5 grid w-full grid-cols-12 gap-3">
                                <div className="col-span-3">
                                    {/* Sale by date data */}
                                    {state.orderSubMenu == 'Sales by date' ? (
                                        salesByDate?.map((link, index) => (
                                            <React.Fragment key={index}>
                                                <div
                                                    style={{ borderRightWidth: '3px', borderRightColor: getBorderColor(index), height: '80px' }} // Adjust the height as needed
                                                    // onClick={() => setState({ orderIndex: index })}
                                                    className={`dark:hover:text-primary-dark mb-4 cursor-pointer border border-gray-300 px-4 py-2 hover:bg-neutral-400 dark:hover:bg-gray-700`}

                                                    // className={`dark:hover:text-primary-dark hover: mb-4 cursor-pointer px-4 py-2 ${'border-gray-300'} border`}
                                                >
                                                    <div className="text-md cursor-pointer text-lg ">{`${formatCurrency('INR')}${link.value}`}</div>
                                                    <div className="text-md cursor-pointer  text-[16px]">{link.name}</div>
                                                </div>
                                            </React.Fragment>
                                        ))
                                    ) : state.orderSubMenu == 'Sales by product' ? (
                                        <div className="mx-auto  w-full max-w-md">
                                            <div className="mb-4">
                                                <button
                                                    onClick={() => toggleAccordion('search')}
                                                    className="flex w-full items-center justify-between bg-gray-200 p-4 text-lg font-medium dark:bg-gray-800"
                                                >
                                                    Product Search
                                                    <span>{state.activeAccordion === 'search' ? '-' : '+'}</span>
                                                </button>
                                                {state.activeAccordion === 'search' && (
                                                    <div className="border border-t-0 border-gray-300 p-4 dark:border-gray-700">
                                                        <input
                                                            type="text"
                                                            className="form-input w-full p-2"
                                                            placeholder="Search by product"
                                                            value={state.search}
                                                            onChange={(e) => setState({ search: e.target.value })}
                                                        />
                                                        <button type="button" className="btn btn-primary mt-3 h-9" onClick={() => setState({ isOpenChannel: true })}>
                                                            Submit
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <button
                                                    onClick={() => toggleAccordion('topSellers')}
                                                    className="flex w-full items-center justify-between bg-gray-200 p-4 text-lg font-medium dark:bg-gray-800"
                                                >
                                                    Top Sellers
                                                    <span>{state.activeAccordion === 'topSellers' ? '-' : '+'}</span>
                                                </button>
                                                {state.activeAccordion === 'topSellers' && (
                                                    <div className="border border-t-0 border-gray-300 p-4 dark:border-gray-700">
                                                        {Array.from({ length: 8 }, (_, i) => i + 1).map((item) => (
                                                            <div key={item} className="py-1">
                                                                {`${1} ${'Product name'}`}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : state.orderSubMenu == 'Sales by category' ? (
                                        <div className="mb-4">
                                            <button className="flex w-full items-center justify-between bg-gray-200 p-4 text-lg font-medium dark:bg-gray-800"> Categories</button>
                                            <div className="border border-t-0 border-gray-300 p-4 dark:border-gray-700">
                                                <Select
                                                    placeholder="Select categories"
                                                    options={state.categoryList.map((edge) => ({
                                                        value: edge.node.id,
                                                        label: edge.node.name,
                                                    }))}
                                                    value={state.selectedCategory}
                                                    onChange={(data: any) => setState({ selectedCategory: data })}
                                                    isSearchable={true}
                                                    isMulti
                                                />
                                                <button type="button" className="btn btn-primary mt-3 h-9" onClick={() => setState({ isOpenChannel: true })}>
                                                    Submit
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                                <div className="col-span-9">
                                    <div className="datatables">
                                        <DataTable
                                            className="table-hover whitespace-nowrap"
                                            records={state.tableData}
                                            columns={[
                                                { accessor: 'date', title: 'Date' },
                                                { accessor: 'noOfOrders', title: 'No of orders' },
                                                { accessor: 'totalItemsSold', title: 'Total Items Sold' },
                                                { accessor: 'couponAmount', title: 'Coupon Amount' },
                                                { accessor: 'refundAmount', title: 'Refund Amount' },
                                                { accessor: 'shippingAmount', title: 'Shipping Amount' },
                                            ]}
                                            highlightOnHover
                                            totalRecords={state.tableData?.length}
                                            recordsPerPage={10}
                                            page={0}
                                            // onPageChange={(p) => setPage(p)}
                                            recordsPerPageOptions={[10, 20, 30]}
                                            // onRecordsPerPageChange={setPageSize}
                                            // sortStatus={sortStatus}
                                            // onSortStatusChange={setSortStatus}
                                            // selectedRecords={selectedRecords}
                                            // onSelectedRecordsChange={(selectedRecords) => {
                                            //     setSelectedRecords(selectedRecords);
                                            // }}
                                            minHeight={200}
                                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : state.activeTab == 'Customers' ? (
                        <div>Customer</div>
                    ) : (
                        <div className="panel mt-5 ">
                            {/* Filter By last 7 days,last month year */}
                            <div className="flex items-center justify-between">
                                <div className="flex  items-center  ">
                                    {orderFilter?.map((link, index) => (
                                        <React.Fragment key={index}>
                                            <div
                                                onClick={() => setState({ dateFilter: link })}
                                                className={`dark:hover:text-primary-dark hover: px-4 py-2 ${link == state.dateFilter ? 'text-primary' : ' border-gray-300'} border`}
                                            >
                                                {link?.split(' ')?.map((word, i) => (
                                                    <React.Fragment key={i}>
                                                        <span className="text-md cursor-pointer">{word}</span>
                                                        {i !== link.split(' ').length - 1 && <span className="border-b-1 mx-1 border-black"></span>}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    <div className="pl-4">
                                        <select className="form-select w-[180px]" value={state.analysisCurrency} onChange={(e) => setState({ analysisCurrency: e.target.value })}>
                                            <option value="All Currencies">All Currencies</option>
                                            <option value="INR">INR</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-2 border p-3">
                                    <IconDownload />
                                    <div className="">Export CSV</div>
                                </div>
                            </div>
                            {state.dateFilter == 'Custome' && (
                                <div className="mt-3 flex   items-center gap-4">
                                    <div className="">
                                        <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                            From :
                                        </label>
                                        <input
                                            type="datetime-local"
                                            // value={startDate}
                                            // // onChange={(e) => {
                                            // //     setStartDate(e.target.value);
                                            // // }}
                                            id="dateTimeCreated"
                                            name="dateTimeCreated"
                                            className="form-input"
                                            // max={getCurrentDateTime()}
                                        />
                                    </div>
                                    <div className="">
                                        <label htmlFor="dateTimeCreated" className="block pr-2 text-sm font-medium text-gray-700">
                                            To:
                                        </label>
                                        <input
                                            type="datetime-local"
                                            // value={endDate}
                                            // onChange={(e) => {
                                            //     setEndDate(e.target.value);
                                            //     filterByDates(e.target.value);
                                            // }}
                                            id="dateTimeCreated"
                                            name="dateTimeCreated"
                                            className="form-input"
                                            // max={getCurrentDateTime()}
                                            // min={mintDateTime(startDate || new Date())}
                                        />
                                    </div>
                                    <div className="mt-7 flex">
                                        <button type="button" className="btn btn-primary h-9" onClick={() => setState({ isOpenChannel: true })}>
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 grid w-full grid-cols-12 gap-3">
                                <div className="col-span-3">
                                    {/* Sale by date data */}
                                    <div className="mb-4">
                                        <button className="flex w-full items-center justify-between bg-gray-200 p-4 text-lg font-medium dark:bg-gray-800">Products</button>
                                        <div className="border border-t-0 border-gray-300 p-4 dark:border-gray-700">
                                            <input
                                                type="text"
                                                className="form-input w-full p-2"
                                                placeholder="Search by product"
                                                value={state.search}
                                                onChange={(e) => setState({ search: e.target.value })}
                                            />
                                            <button type="button" className="btn btn-primary mt-3 h-9" onClick={() => setState({ isOpenChannel: true })}>
                                                Submit
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <button className="flex w-full items-center justify-between bg-gray-200 p-4 text-lg font-medium dark:bg-gray-800"> Categories</button>
                                        <div className="border border-t-0 border-gray-300 p-4 dark:border-gray-700">
                                            <Select
                                                placeholder="Select categories"
                                                options={state.categoryList.map((edge) => ({
                                                    value: edge.node.id,
                                                    label: edge.node.name,
                                                }))}
                                                value={state.selectedCategory}
                                                onChange={(data: any) => setState({ selectedCategory: data })}
                                                isSearchable={true}
                                                isMulti
                                            />
                                            <button type="button" className="btn btn-primary mt-3 h-9" onClick={() => setState({ isOpenChannel: true })}>
                                                Submit
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <button className="flex w-full items-center justify-between bg-gray-200 p-4 text-lg font-medium dark:bg-gray-800"> Countries</button>
                                        <div className="border border-t-0 border-gray-300 p-4 dark:border-gray-700">
                                            <Select
                                                placeholder="Select countries"
                                                options={state.categoryList.map((edge) => ({
                                                    value: edge.node.id,
                                                    label: edge.node.name,
                                                }))}
                                                value={state.selectedCategory}
                                                onChange={(data: any) => setState({ selectedCategory: data })}
                                                isSearchable={true}
                                                isMulti
                                            />
                                            <button type="button" className="btn btn-primary mt-3 h-9" onClick={() => setState({ isOpenChannel: true })}>
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-9">
                                    <div className="datatables">
                                        <DataTable
                                            className="table-hover whitespace-nowrap"
                                            records={state.tableData}
                                            columns={[
                                                { accessor: 'date', title: 'Date' },
                                                { accessor: 'couponAmount', title: 'Coupon Amount' },
                                                { accessor: 'noOfOrders', title: 'No of orders' },
                                                { accessor: 'refundAmount', title: 'Refund Amount' },
                                                { accessor: 'shippingAmount', title: 'ShippinAmount' },
                                                { accessor: 'totalItemsSold', title: 'Total Items Sold' },
                                            ]}
                                            highlightOnHover
                                            // totalRecords={state.tableData?.length}
                                            // recordsPerPage={10}
                                            // page={0}
                                            // onPageChange={(p) => setPage(p)}
                                            // recordsPerPageOptions={[10, 20, 30]}
                                            // onRecordsPerPageChange={setPageSize}
                                            // sortStatus={sortStatus}
                                            // onSortStatusChange={setSortStatus}
                                            // selectedRecords={selectedRecords}
                                            // onSelectedRecordsChange={(selectedRecords) => {
                                            //     setSelectedRecords(selectedRecords);
                                            // }}
                                            minHeight={200}
                                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Tab.Panels>
            </Tab.Group>
        </>
    );
}
