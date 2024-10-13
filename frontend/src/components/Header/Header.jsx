import React from 'react'
import styles from './Header.module.css';

import logo from '../../assets/logo.png';

const Header = () => {
  return (
    <div className={styles.container}>
      <img src={logo} alt="Logo" className={styles.logo} />
      <h1 className={styles.title}>StockSafe</h1>
    </div>
  )
}

export default Header
