import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API = axios.create({ baseURL: `${API_URL}/api` });

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

// Expert Analysis endpoints
export const predictExpert = (question, chatId) => API.post('/chats/predict_expert', { question, chatId });
export const predictExpertWithImage = (question_text, chatId) =>
  API.post('/chats/predict_expert_image', { question_text, chatId });
export const getExpertAnalysisStatus = () => API.get('/chats/expert_analysis_status');

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

// Admin endpoints
export const getAllUsers = () => API.get('/admin/users');
export const getUserById = (id) => API.get(`/admin/users/${id}`);
export const updateUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role });
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const getDashboardStats = () => API.get('/admin/stats');
export const getAnalytics = (period = 'monthly') => API.get('/admin/analytics', { params: { period } });

// User moderation endpoints
export const timeoutUser = (id, reason) => API.post(`/admin/users/${id}/timeout`, { reason });
export const blockUser = (id, reason) => API.post(`/admin/users/${id}/block`, { reason });
export const unblockUser = (id) => API.post(`/admin/users/${id}/unblock`);

// Feedback endpoints
export const submitFeedback = (feedbackData) => API.post('/feedback', feedbackData);
export const getAllFeedback = (params) => API.get('/admin/feedback', { params });
export const getFeedbackById = (id) => API.get(`/admin/feedback/${id}`);
export const updateFeedback = (id, data) => API.put(`/admin/feedback/${id}`, data);
export const deleteFeedback = (id) => API.delete(`/admin/feedback/${id}`);
export const getFeedbackStats = () => API.get('/admin/feedback/stats');
