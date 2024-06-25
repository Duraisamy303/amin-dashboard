import { CATEGORY_LIST, PRODUCT_EXPORT } from '@/query/product';
import { useQuery } from '@apollo/client';
import React from 'react';
import Select from 'react-select';

export default function Product_export() {
    const { data: exportData, refetch: exportDatarefetch } = useQuery(PRODUCT_EXPORT);
    const { data: categoryList } = useQuery(CATEGORY_LIST, {
        variables: {
            first: 500,
            after: null,
            channel: 'india-channel',
        },
    });

    const generateCSV = async () => {
        try {
            let hasNextPage = true;
            let after = null;
            let allData = [];

            while (hasNextPage) {
                const res = await exportDatarefetch({
                    first: 200,
                    after: after,
                });

                const edges = res.data.productVariants?.edges;
                const pageInfo = res.data.productVariants?.pageInfo;

                if (!pageInfo || !edges) {
                    console.error('Invalid response structure:', res);
                    throw new Error('Invalid response structure');
                }

                allData = [...allData, ...edges];
                after = pageInfo.endCursor;
                hasNextPage = pageInfo.hasNextPage;
            }

            console.log('allData: ', allData);
            
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <div className="panel mb-5 flex items-center justify-between gap-3 p-5 ">
                <h3 className="text-lg font-semibold dark:text-white-light">Export Products</h3>
            </div>
            <div className=" flex w-full items-center justify-center text-center">
                <div className="panel w-full p-4 text-center">
                    <h3 className="text-lg font-semibold dark:text-white-light ">Export products to a CSV file</h3>
                    <div className="active mt-4 flex items-center justify-center">
                        <div className="mb-5 mr-4 pr-6">
                            <label htmlFor="upsells" className="block pr-5 text-sm font-medium text-gray-700">
                                Which product category should be exported?
                            </label>
                        </div>
                        <div className="mb-5">
                            <Select
                                placeholder="Select an option"
                                // value={selectedUpsell}
                                // options={productList}
                                // onChange={(e: any) => setSelectedUpsell(e)}
                                isMulti
                                isSearchable={true}
                            />
                        </div>
                    </div>
                    <div className="mb-5">
                        <button type="button" className="btn btn-outline-primary" onClick={generateCSV}>
                            Generate CSV
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
