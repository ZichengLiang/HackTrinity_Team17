import styles from './Notification.module.css';
import { MdNotificationsActive } from "react-icons/md";

const Notification = () => {
  return (
    <div className={styles.container}>
      <div className={styles.notif}>
        <span>
          <MdNotificationsActive className={styles.icon} />
        </span>
        <h1 className={styles.title}>5 new matches found</h1>
      </div>
        
    </div>
  )
}

export default Notification
