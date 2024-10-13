import { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.css';
import ChatMessage from './ChatMessage/ChatMessage';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const userInputRef = useRef(null);
  const chatBottomRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const addMessage = (newMessage) => {
    setMessages((m) => [...m, newMessage]);
  };

  const sendMessage = async () => {
    const messageContents = userInputRef.current.value.trim();
    if (!messageContents) return;

    // Add the user's message
    addMessage({ sender: 'user', contents: messageContents });
    userInputRef.current.value = ''; // Clear the input field
    setLoading(true);

    try {
      // Call the backend API endpoint to get the AI response
      const response = await fetch('http://127.0.0.1:8000/process_query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: messageContents }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the server');
      }

      const data = await response.json();

      // Add AI response to the conversation
      addMessage({ sender: 'ai', contents: data.perplexity_response });
    } catch (error) {
      console.error('Error:', error);
      addMessage({ sender: 'system', contents: 'Something went wrong. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      <div className={styles.msgContainer}>
        {messages.map((msg, index) => (
          <ChatMessage sender={msg.sender} contents={msg.contents} key={index} />
        ))}
        <div ref={chatBottomRef} className={loading ? styles.bottomContainerLoading : ''} />

        <div className={styles.inputContainer}>
          <textarea
            name="chatInput"
            rows="1"
            placeholder="Ask a question"
            className={styles.chatInputField}
            onKeyDown={handleInputSubmit}
            ref={userInputRef}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
