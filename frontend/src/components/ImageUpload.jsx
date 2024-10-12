import React, { useState } from 'react';

const ImageUpload = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [urls, setUrls] = useState([]); // State to hold the URLs from the response

    const handleImageChange = (event) => {
        const file = event.target.files[0]; // Get the first file
        if (file) {
            setSelectedImage(file); // Store the image file in state
            uploadImage(file); // Upload the image to the backend
        }
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('file', file); // Append the file to the form data

        try {
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData, // Send form data
            });

            // Handle the response
            const data = await response.json();
            if (response.ok) {
                // If the response is successful, set the URLs in state
                setUrls(data.exact_matches);
            } else {
                console.error(data.message); // Log any error messages
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
            {urls.length > 0 && (
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