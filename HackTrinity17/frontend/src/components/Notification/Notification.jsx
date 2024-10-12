import styles from './Notification.module.css';
import { MdNotificationsActive } from "react-icons/md";

const Notification = () => {
  return (
    <div className={styles.container}>
      <div className={styles.notif}>
        <span>
          <MdNotificationsActive className={styles.icon} />
        </span>
        <p className={styles.title}>5 new matches found</p>
      </div>
      <div className={styles.btnContainer}>
        <button className={styles.btn}>View more</button>
      </div>
      
        
    </div>
  )
}

export default Notification
