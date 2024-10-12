import { useState } from 'react';

import styles from './App.module.css';
import Header from './components/Header/Header';
import Grid1 from './components/Grid1/Grid1';
import Grid2 from './components/Grid2/Grid2';

function App() {

  return (
    <div className={styles.App}>
      <Header/>
      <div className={styles.gridContainer}>
        <Grid1/>
        <Grid2/>
      </div>
    </div>
  )
}

export default App
