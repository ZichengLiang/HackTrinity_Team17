import styles from "./ChatMessage.module.css";

const ChatMessage = ({ sender, contents }) => {
  return (
    <div className={styles.container}>
      {sender === "user" ? (
        <div className={styles.msgBubbleUser}>
          <p className={styles.msgUser}>{contents}</p>
        </div>
      ) : sender === "ai" ? (
        <div className={styles.msgBubbleAI}>
          <p className={styles.msgAI}>{contents}</p>
        </div>
      ) : sender === "system" ? (
        <div className={styles.msgBubble}>
          <p className={styles.msgSystem}>{contents}</p>
        </div>
      ) : (
        <p>Unknown message sender</p> // Fallback for unknown senders
      )}
    </div>
  );
};

export default ChatMessage;
