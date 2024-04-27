import React, { useState } from 'react';

const YourComponent = () => {
    const [image, setImage] = useState(null);
    const [images, setImages] = useState([]);
    console.log('images: ', images);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append(
                'operations',
                JSON.stringify({
                    operationName: 'ProductMediaCreate',
                    variables: { product: 'UHJvZHVjdDo1MQ==', alt: '', image: null },
                    query: `mutation ProductMediaCreate($product: ID!, $image: Upload, $alt: String, $mediaUrl: String) {
                    productMediaCreate(input: {alt: $alt, image: $image, product: $product, mediaUrl: $mediaUrl}) {
                        errors { ...ProductError }
                        product { id media { ...ProductMedia } }
                    }
                }
                fragment ProductError on ProductError { code field message }
                fragment ProductMedia on ProductMedia { id alt sortOrder url(size: 1024) type oembedData }`,
                })
            );
            formData.append('map', JSON.stringify({ '1': ['variables.image'] }));
            formData.append('1', image);

            const response = await fetch('http://file.prade.in/graphql/', {
                method: 'POST',
                headers: {
                    Authorization:
                        'JWT eyJhbGciOiJSUzI1NiIsImtpZCI6IkVjSWJKby1EQXp4dnUxSEp6clRTLWZmODNkTkJwdEJ5RC0xQzdZa25meTAiLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE3MTM3NjMxMjQsIm93bmVyIjoic2FsZW9yIiwiaXNzIjoiaHR0cDovL2ZpbGUucHJhZGUuaW4vZ3JhcGhxbC8iLCJleHAiOjE3MTM3NjM0MjQsInRva2VuIjoiRzV4U29sNmRqczFGIiwiZW1haWwiOiJhZG1pbkBpcmVwdXRlLmluIiwidHlwZSI6ImFjY2VzcyIsInVzZXJfaWQiOiJWWE5sY2pveCIsImlzX3N0YWZmIjp0cnVlfQ.Ya87q2grLsRqqNiBc6Fu8BLg3GgW2Z2YbGrrpWMNvg63STxdIh9Y5CgvvHCVDeC6Am0pIoT9a5qiwJdapcHqZ9WAlqDZjA52Lkvb_2NHO79aelHsJPl0BRrxGY7LzKe-5J_2-XCAD0VMQMWcWQxN4DdPkB5BBxe_Nrb7nYn_SHsXf4deBkJN6Fo7dBmeMN40J-kX4N6yxwY6GfyI4OxEp_VCIdqODedB4WlESnbH4PMc1sZw3CP6vrlOkgOFojkHeOVMNdBivY3x_L_rAO19si0EaSf0-Bm1Vw4qk9m25yuOc3ke6Qz3_2nPn44B2AOr6m0lH0lASDhuDfAiFlS6ig',
                },
                body: formData,
            });

            const data = await response.json();
            console.log(data); // Response from the server
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <input type="file" multiple onChange={handleImageChange} />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
};

export default YourComponent;





// import React, { useState } from 'react';

// const App = () => {
//     const [images, setImages] = useState([
//         { id: 1, src: 'image1.jpg', name: 'Image 1' },
//         { id: 2, src: 'image2.jpg', name: 'Image 2' },
//         { id: 3, src: 'image3.jpg', name: 'Image 3' },
//         { id: 4, src: 'image4.jpg', name: 'Image 4' },
//         { id: 5, src: 'image5.jpg', name: 'Image 5' },
//         { id: 6, src: 'image6.jpg', name: 'Image 6' },
//     ]);
//     console.log('images: ', images);

//     const handleDragStart = (e, id) => {
//         e.dataTransfer.setData('imageId', id);
//     };

//     const handleDragOver = (e) => {
//         e.preventDefault();
//     };

//     const handleDrop = (e, targetIndex) => {
//         e.preventDefault();
//         const imageId = e.dataTransfer.getData('imageId');
//         const newIndex = parseInt(targetIndex, 10);
//         const draggedImageIndex = images.findIndex((image) => image.id === parseInt(imageId, 10));
//         if (draggedImageIndex !== -1) {
//             const newImages = [...images];
//             const [draggedImage] = newImages.splice(draggedImageIndex, 1);
//             newImages.splice(newIndex, 0, draggedImage);
//             setImages(newImages);
//         }
//     };

//     return (
//         <div>
//             <div style={{ display: 'flex', flexWrap: 'wrap' }}>
//                 {images.map((image, index) => (
//                     <div
//                         key={image.id}
//                         draggable
//                         onDragStart={(e) => handleDragStart(e, image.id)}
//                         onDragOver={handleDragOver}
//                         onDrop={(e) => handleDrop(e, index)}
//                         style={{ width: '33.33%', padding: '5px' }}
//                     >
//                         <img src={image.src} alt={image.name} style={{ width: '100%', height: 'auto' }} />
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default App;

