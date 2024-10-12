import React, { useState } from 'react';
import { chatWithPerplexity } from '../apiService';

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    console.log("Sending message:", messages);
    if (!input) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);

    try {
      const response = await chatWithPerplexity(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: response.response }]);
    } catch (error) {
      console.error('Chat failed:', error);
    }

    setInput('');
  };

  return (
    <div className="chatbot">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}

export default ChatBot;