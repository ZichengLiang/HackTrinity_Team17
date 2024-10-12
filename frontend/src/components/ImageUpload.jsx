import React, { useState } from 'react';

const ImageUpload = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [urls, setUrls] = useState([]); 

    const handleImageChange = (event) => {
        const file = event.target.files[0]; //Only working for one file at the moment, will set up google drive soon
        if (file) {
            setSelectedImage(file); 
            uploadImage(file); // Upload the image to the backend
        }
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('file', file)

        try {
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData, // Send form data to backend
            });

            // Handle the response from backend
            const data = await response.json();
            if (response.ok) {
                
                setUrls(data.exact_matches);
            } else {
                console.error(data.message); 
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    return (
        <div>
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
            />
            {selectedImage && (
                <div>
                    <h3>Preview:</h3>
                    <img 
                        src={URL.createObjectURL(selectedImage)} 
                        alt="Selected" 
                        style={{ width: '200px', height: 'auto' }} 
                    />
                </div>
            )}
            {urls.length > 0 && ( //Only renders list of urls when there are any to render (will change here for sending to db)
                <div>
                    <h3>Exact Matches:</h3>
                    <ul>
                        {urls.map((url, index) => (
                            <li key={index}>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                    {url}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;