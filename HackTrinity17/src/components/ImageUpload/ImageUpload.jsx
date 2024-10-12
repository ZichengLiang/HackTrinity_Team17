import styles from './ImageUpload.module.css';
import {useState} from 'react';
import axios from 'axios';
import { FiUploadCloud } from "react-icons/fi";


const ImageUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  // const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); 

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
    setUploadProgress(0); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();

    if (selectedFiles){
      for (let i = 0; i < selectedFiles.length; i++){
        formData.append('file', selectedFiles[i]);
        console.log(selectedFiles[i]);
      }
    }

    // backend posting
    try {
      // POST request to backend with progress tracking
      await axios.post('https://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          // Calculate the percentage of the upload completed
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentage);
        },
      });
      alert('Files successfully uploaded');
    } catch (error) {
      console.error('Error uploading files', error);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>

      {/* Custom button with an icon */}

      
      <div className={styles.uploadContainer}>
        <button onClick={handleSubmit} className={styles.submitBtn}>
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

          {/* Display selected files */}
          {selectedFiles && (
            <div className={styles.fileList}>
              {Array.from(selectedFiles).map((file, index) => (
                <div key={index} className={styles.fileName}>
                  {file.name}
                </div>
              ))}
            </div>
          )}
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
  )

}


export default ImageUpload
