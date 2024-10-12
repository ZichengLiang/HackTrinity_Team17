import React, { useState } from 'react';

const ImageUpload = () => {
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [urls, setUrls] = useState([]); // State to hold URLs from the response

    const handleFileChange = (event) => {
        const files = event.target.files; // Get selected files
        setSelectedFiles(files); // Store files in state
    };

    const uploadImages = async () => {
        const formData = new FormData();

        // Append files to form data
        if (selectedFiles) {
            for (let i = 0; i < selectedFiles.length; i++) {
                formData.append('files', selectedFiles[i]); // Match key with backend expectation
            }
        }

        try {
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                // Update state with exact matches from the response
                const exactMatches = data.results.flatMap(result => result.stolen_urls || []);
                setUrls(exactMatches);
            } else {
                console.error(data.message); // Log error messages
            }
        } catch (error) {
            console.error('Error uploading images:', error);
        }
    };

    return (
        <div>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} />
            {selectedFiles && (
                <div>
                    <button onClick={uploadImages}>Upload</button>
                    <h3>Preview:</h3>
                    {Array.from(selectedFiles).map((file, index) => (
                        <div key={index}>
                            <img
                                src={URL.createObjectURL(file)}
                                alt="Selected"
                                style={{ width: '200px', height: 'auto' }}
                            />
                            <p>{file.name}</p>
                        </div>
                    ))}
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
