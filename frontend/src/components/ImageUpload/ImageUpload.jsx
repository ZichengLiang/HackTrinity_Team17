import styles from './ImageUpload.module.css';
import { useState } from 'react';
import { FiUploadCloud } from "react-icons/fi";

const ImageUpload = ({ setUrls }) => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event) => {
    const files = event.target.files;
    setSelectedFiles(files);
    setUploadProgress(0);
  };

  const uploadImages = async (event) => {
    event.preventDefault();
    const formData = new FormData();

    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }
    }

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const exactMatches = data.results.flatMap(result => result.stolen_urls || []);
        setUrls(exactMatches);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={uploadImages}>
        <div className={styles.uploadContainer}>
          <button type="submit" className={styles.submitBtn}>
            <FiUploadCloud className={styles.icon} />
          </button>
          <div className={styles.rightCol}>
            <h1 className={styles.title}>Upload Images</h1>
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileChange}
              multiple
              className={styles.fileInput}
              style={{ display: 'none' }}
            />
            <label htmlFor="fileUpload" className={styles.customButton}>
              <span className={styles.iconText}>
                <i className={styles.icon}></i> Choose Files
              </span>
            </label>
          </div>
        </div>
      </form>

      {uploadProgress > 0 && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }}></div>
          <span className={styles.progressText}>{uploadProgress}%</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
