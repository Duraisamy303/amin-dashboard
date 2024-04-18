import React from 'react';
import { useRouter } from 'next/router';

const editorder = () => {
    const router = useRouter();
    const { id } = router.query;
    console.log('✌️id --->', id);

    return (<>
    <div className="flex gap-3">
        <h3 className="text-lg font-semibold dark:text-white-light">Edit Order</h3> 
        <button type="button" className="btn btn-primary">Add Order</button>
    </div>
    </>);
};

export default editorder;
