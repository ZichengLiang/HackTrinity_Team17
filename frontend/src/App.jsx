import { useState } from 'react';
import styles from './App.module.css';
import Header from './components/Header/Header';
import Matches from './components/Matches/Matches';
import Notification from './components/Notification/Notification';
import ImageUpload from './components/ImageUpload/ImageUpload';
import ImageGallery from './components/ImageGallery/ImageGallery';
import TopSites from './components/TopSites/TopSites';
import NextActions from './components/NextActions/NextActions';
import Chatbot from './components/Chatbot/Chatbot';

function App() {
  const [urls, setUrls] = useState([]); // State to hold the URLs

  return (
    <div className={styles.App}>
      <Header className={styles.header} />

      <div className={styles.dashboard}>
        <div className={styles.leftCol}>
          <Matches urls={urls} /> {/* Pass the urls to Matches component */}
          <ImageUpload setUrls={setUrls} /> {/* Pass setUrls to ImageUpload component */}
          <ImageGallery />
        </div>

        <div className={styles.rightCol}>
          <div className={styles.notif}>
            <Notification />
          </div>

          <div className={styles.metrics}>
            <TopSites />
            <NextActions />
          </div>

          <div className={styles.botContainer}>
            <Chatbot />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
