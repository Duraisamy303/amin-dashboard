import React, { useEffect } from 'react';
import { useSetState } from '@mantine/hooks';
import * as FileSaver from 'file-saver';
import XLSX from 'sheetjs-style';
import { useQuery } from '@apollo/client';
import { EXPORT_LIST } from '@/query/product';

export default function Test() {
    const { data: ExportList, refetch: exportListeRefetch } = useQuery(EXPORT_LIST);
    console.log('ExportList: ', ExportList);
    const [state, setState] = useSetState({
        productIsEdit: false,
        addProductOpen: false,
        selectedItems: {},
        productList: [],
        loading: false,
        quantity: '',
        search: '',
    });

    const filetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8';
    const fileExtension = '.xlsx';

    const exportExcel = async () => {
        const res = await exportListeRefetch({
            first: 1000,
            filter: {
                // created: {
                //     gte: moment(response.gte).format('YYYY-MM-DD'),
                //     lte: moment(response.lte).format('YYYY-MM-DD'),
                // },
                customer: 'Durai',
                // search: '730',
            },
            sort: {
                direction: 'DESC',
                field: 'NUMBER',
            },
        });
        console.log('res: ', res);

        const dats = res.data?.orders?.edges?.map((item) => {
            const res = {
                OrderNumber: item?.node?.number,
                CustomerName: ` ${item?.node?.user?.firstName}${item?.node?.user?.lastName}`,
                EmailID: item?.node?.shippingAddress?.userEmail,
                PhoneNumber: item?.node?.shippingAddress?.phone,
                Address1: item?.node?.shippingAddress?.streetAddress1,
                Address2: item?.node?.shippingAddress?.streetAddress2,
                Country: item?.node?.shippingAddress?.country?.country,
                City: item?.node?.shippingAddress?.city,
                ProductsName: item?.node?.lines?.map((data) => data?.productName),
                ProductPrice: item?.node?.lines?.map((data) => data?.totalPrice?.gross?.amount),
                ProductSKU: item?.node?.lines?.map((data) => data?.productSku),
                DateOfPurchase: '',
                PaymentStatus: item?.node?.paymentStatus,
                Currency: item?.node?.total?.gross?.currency,
                PurchaseTotal: item?.node?.total?.gross?.amount,
                Discount: 0,
                Shipping: item?.node?.shippingPrice?.gross?.amount,
                GST: item?.node?.total?.tax?.amount,
            };
            return res;
        });
        console.log('dats: ', dats);

        const excelData = [
            {
                fName: 'Durai',
                Age: '20',
            },
            {
                fName: 'Durai2',
                Age: '20',
            },
            {
                fName: 'Durai2',
                Age: '20',
            },
        ];
        // const ws = XLSX.utils.json_to_sheet(excelData);
        // const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
        // const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        // const data = new Blob([excelBuffer], { type: filetype });
        // FileSaver.saveAs(data, 'fileName' + fileExtension);
    };

    return (
        <>
            <button type="button" className="btn btn-outline-primary" onClick={() => exportExcel()}>
                Add Product
            </button>
        </>
    );
}
