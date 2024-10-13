import styles from './NextActions.module.css';


const NextActions = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Next Actions</h1>
      <button className={styles.btn} onClick={handleButtonClick}>
          Take action
        </button>
    </div>
    
  )
}

export default NextActions
