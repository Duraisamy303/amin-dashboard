import IconTrashLines from '@/components/Icon/IconTrashLines';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

export default function LowStock() {
    const recordsData = [
        { id: 1, 'Product Name': 'Product A', stock: 10, date: moment(new Date()).format('YYYY-MM-DD') },
        { id: 2, 'Product Name': 'Product B', stock: 3, date: moment(new Date()).format('YYYY-MM-DD') },
        { id: 3, 'Product Name': 'Product C', stock: 7, date: moment(new Date()).format('YYYY-MM-DD') },
        // Add more records as needed
    ];

    const initialRecords = recordsData;
    const PAGE_SIZES = [10, 20, 30];
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortStatus, setSortStatus] = useState({ columnAccessor: 'name', direction: 'asc' });
    const [selectedRecords, setSelectedRecords] = useState([]);

    return (
        <div className="">
            <div className="panel mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">Low Stocks</h5>
            </div>
            <div className="datatables">
                {/* {getLoading ? (
                        <CommonLoader />
                    ) : ( */}
                <DataTable
                    className="table-hover whitespace-nowrap"
                    records={recordsData}
                    columns={[
                        {
                            accessor: 'Product Name',
                            sortable: true,
                        },

                        { accessor: 'stock', sortable: true },
                        { accessor: 'date', sortable: true },
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
                    minHeight={200}
                    paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                />
            </div>
        </div>
    );
}
