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
export const predict = (question) => API.post('/chats/predict', { question });

export const transcribeAudio = async (audioFile) => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  return API.post('/audio/transcribe', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
