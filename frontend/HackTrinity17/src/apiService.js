import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // Ensure this matches your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatWithPerplexity = async (messages) => {
  try {
    const response = await apiClient.post('/perplexity/chat', { messages });
    return response.data;
  } catch (error) {
    console.error('Error chatting with Perplexity:', error);
    throw error;
  }
};localStorage