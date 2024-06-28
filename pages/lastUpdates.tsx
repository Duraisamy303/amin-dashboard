import IconTrashLines from '@/components/Icon/IconTrashLines';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

export default function LastUpdates() {
    const recordsData = [
        { id: 1, item: 'Product A',  date: moment(new Date()).format("YYYY-MM-DD"),quantity: 7},
        { id: 2, item: 'Product A',  date: moment(new Date()).format("YYYY-MM-DD"),quantity: 7},

        { id: 3, item: 'Product A',  date: moment(new Date()).format("YYYY-MM-DD"),quantity: 7},

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
                <h5 className="text-lg font-semibold dark:text-white-light">Last Updates</h5>
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
                            accessor: 'item',
                            sortable: true,
                           
                        },

                        { accessor: 'date', sortable: true },
                        { accessor: 'quantity', sortable: true },

                        
                       
                    ]}
                    highlightOnHover
                    totalRecords={initialRecords.length}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    sortStatus={null}
                    onSortStatusChange={setSortStatus}
                   
                    minHeight={200}
                    paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                />
            </div>
        </div>
    );
}
