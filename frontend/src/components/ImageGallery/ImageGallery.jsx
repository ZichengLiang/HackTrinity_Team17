import React, { useState } from 'react';
import styles from './ImageGallery.module.css'; // Ensure you import your styles

const ImageGallery = () => {
  const [images, setImages] = useState([]); // State to hold the fetched image data

  const fetchLatestImages = async () => {
    try {
      const response = await fetch('http://localhost:8000/download_latest_images');
      if (response.ok) {
        const imageData = await response.json();
        setImages(imageData); // Set the fetched image data in state
      } else {
        console.error("Failed to fetch images:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.btnContainer}>
        <h1 className={styles.title}>Image Gallery</h1>
        <button className={styles.btn} onClick={fetchLatestImages}>
          Most Recent
        </button>
      </div>
      <div className={styles.imageGrid}>
        {images.map((image, index) => (
          <div key={index} className={styles.imageContainer}>
            <img src={image.url} alt={image.name} className={styles.image} /> {/* Display the actual image /}
            <p>{image.name}</p> {/ Display the image name */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageGallery;