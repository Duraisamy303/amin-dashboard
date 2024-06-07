import { uploadImage } from '@/utils/functions';
import React, { useEffect } from 'react';

export default function Test() {

    

   

    useEffect(() => {
        const imageUpload = uploadImage('UHJvZHVjdDo1NTE5', 'http://file.prade.in/media/thumbnails/products/vykxn_1200_faf801dd_thumbnail_256.jpg');
        console.log('imageUpload: ', imageUpload);
    }, []);

    return <div>test</div>;
}
