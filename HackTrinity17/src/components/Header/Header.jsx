import React from 'react'
import styles from './Header.module.css';

const Header = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>StockSafe</h1>
    </div>
  )
}

export default Header
