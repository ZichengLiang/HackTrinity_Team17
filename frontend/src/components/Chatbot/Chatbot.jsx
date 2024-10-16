import { useState, useRef, useEffect } from "react";
import removeMarkdown from "remove-markdown"; // Import remove-markdown
import styles from "./Chatbot.module.css";
import ChatMessage from "./ChatMessage/ChatMessage";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const userInputRef = useRef(null);
  const chatBottomRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const addMessage = (newMessage) => {
    setMessages((m) => [newMessage, ...m]); // New messages are added at the top
  };

  const sendMessage = async () => {
    const messageContents = userInputRef.current.value.trim();
    if (!messageContents) return;

    // Add the user's message
    addMessage({ sender: "user", contents: messageContents });
    userInputRef.current.value = ""; // Clear the input field
    setLoading(true);

    try {
      // Simulate a delayed AI response using setTimeout
      setTimeout(async () => {
        // Backend call to get AI response
        const response = await fetch("http://127.0.0.1:8000/process_query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: messageContents }),
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error("Failed to get a response from the server");
        
        
        const stripMarkdown = (text) => {
          return text
            .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
            .replace(/(\*|_)(.*?)\1/g, '$2')    // Italics
            .replace(/~~(.*?)~~/g, '$1')        // Strikethrough
            .replace(/`(.*?)`/g, '$1')          // Inline code
            .replace(/#+\s+(.*?)(\n|$)/g, '$1') // Headers
            .replace(/\[.*?\]\((.*?)\)/g, '$1') // Links
            .replace(/!\[.*?\]\((.*?)\)/g, '')  // Images
            .replace(/(?:\r\n|\r|\n)/g, ' ');   // Line breaks
        };
        
        // Process AI response, remove markdown from the response before adding it
        const cleanResponse = stripMarkdown(data.perplexity_response);
        console.log("Original Response:", data.perplexity_response);
        console.log("Cleaned Response:", cleanResponse);


        // Add AI response to the conversation
        addMessage({ sender: "ai", contents: cleanResponse });
      }, 1000); // Simulate a 1-second delay for AI response
    } catch (error) {
      console.error("Error:", error);
      addMessage({
        sender: "system",
        contents: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollTop = chatBottomRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle message submission on pressing Enter
  const handleInputSubmit = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent new lines in the textarea
      sendMessage();
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Legal Chatbot</h1>
      <div className={styles.msgContainer} ref={chatBottomRef}>
        {messages.map((msg, index) => (
          <ChatMessage
            sender={msg.sender}
            contents={msg.contents}
            key={index}
          />
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
      {loading && <div className={styles.loadingIndicator}>Thinking...</div>}
    </div>
  );
};

export default Chatbot;
