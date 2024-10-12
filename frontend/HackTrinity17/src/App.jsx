import React from 'react';
import './assets/styles/App.css';
import ImageUpload from './components/ImageUpload';
import ChatBot from './components/ChatBot'; // Import the ChatBot component

function App() {
  const handleImageUpload = async (file) => {
    console.log('Uploaded file:', file); // For now, simply log the uploaded file to the console
  };

  return (
    <div className="ImageUploader">
      <h1 className="Title">Image Upload Example</h1>
      <ImageUpload onImageUpload={handleImageUpload} />
      <ChatBot /> {/* Add the ChatBot component here */}
    </div>
  );
}

export default App;