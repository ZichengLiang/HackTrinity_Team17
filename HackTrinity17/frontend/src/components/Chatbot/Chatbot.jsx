import { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.css';
import ChatMessage from './ChatMessage/ChatMessage';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const userInputRef = useRef(null);
  const chatBottomRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const addMessage = (newMessage) => {
    setMessages((m) => [newMessage, ...m]);
  };

  const sendMessage = async () => {
    const messageContents = userInputRef.current.value.trim();
    if (!messageContents) return;

    // Add the user's message
    addMessage({ sender: 'user', contents: messageContents });
    userInputRef.current.value = ''; // Clear the input field
    setLoading(true);

    // Simulate a delayed AI response using setTimeout
    setTimeout(() => {
      // Dummy AI response
      const aiResponse = "This is a dummy AI response.";
      addMessage({ sender: 'ai', contents: aiResponse });

      setLoading(false);
    }, 1000); // Simulate a 1-second delay for AI response
  };

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollTop = chatBottomRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle message submission on pressing Enter
  const handleInputSubmit = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent new lines in the textarea
      sendMessage();
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Legal Chatbot</h1>
      <div className={styles.msgContainer} ref={chatBottomRef}>
        {messages.map((msg, index) => (
          <ChatMessage sender={msg.sender} contents={msg.contents} key={index} />
        ))}
      </div>
      <div className={styles.inputContainer}>
        <textarea
          name="chatInput"
          rows="1"
          placeholder="Ask a question"
          className={styles.chatInputField}
          onKeyDown={handleInputSubmit}
          ref={userInputRef}
        />
      </div>
    </div>
  );
};

export default Chatbot;
