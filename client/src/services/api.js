import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('userInfo')) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}`;
  }
  return req;
});

export const login = (formData) => API.post('/users/login', formData);
export const signUp = (formData) => API.post('/users/register', formData);

export const getChats = () => API.get('/chats');
export const createChat = (chatData) => API.post('/chats', chatData);
export const deleteChat = (id) => API.delete(`/chats/${id}`);
export const updateChat = (id, data) => API.put(`/chats/${id}`, data);
export const clearChats = () => API.delete('/chats/clear');
export const predict = (question, chatId) => API.post('/chats/predict', { question, chatId });

// Image-enabled prediction
export const getAnswer = (question_text, chatId) =>
  API.post('/chats/get_answer', { question_text, chatId });

// Image persistence endpoints
export const uploadChatImage = (chatId, file) => {
  const formData = new FormData();
  formData.append('image', file);
  return API.post(`/chats/${chatId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getChatImage = async (chatId) => {
  return API.get(`/chats/${chatId}/image`, { responseType: 'blob' });
};

export const getChatImageById = async (chatId, imageId) => {
  return API.get(`/chats/${chatId}/image/${imageId}`, { responseType: 'blob' });
};

export const getAllChatImages = async (chatId) => {
  return API.get(`/chats/${chatId}/images`);
};

export const deleteChatImage = (chatId) => API.delete(`/chats/${chatId}/image`);
export const deleteChatImageById = (chatId, imageId) => API.delete(`/chats/${chatId}/image/${imageId}`);

export const transcribeAudio = async (audioFile) => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  return API.post('/audio/transcribe', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
