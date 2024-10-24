import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// Authentication
export const registerUser = (userData) => api.post('/auth/signup', userData);
export const loginUser = (credentials) => api.post('/auth/signin', credentials);

// Quizzes
export const getAllQuizzes = () => api.get('/quizzes');
export const getQuizById = async (id) => {
  try {
    const response = await api.get(`/quizzes/${id}`);
    console.log('Quiz data received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw error;
  }
};
// export const createQuiz = (quiz) => api.post('/quizzes', quiz);
export const createQuiz = async (quizData) => {
  console.log('Data received in createQuiz:', quizData);
  try {
    const response = await api.post(`/quizzes?creatorId=${quizData.creatorId}`, quizData);
    return response.data;
  } catch (error) {
    console.error('Full error response:', error.response);
    throw error;
  }
};

export const updateQuiz = async (quizData) => {
  try {
    const response = await api.put(`/quizzes/${quizData.id}`, quizData);
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating quiz:', error);
    throw error;
  }
};

export const deleteQuiz = (id) => api.delete(`/quizzes/${id}`);

export const submitQuiz = async (id, answers, userId) => {
  try {
    console.log('Submitting quiz:', id, 'with answers:', answers, 'for user:', userId);
    const submission = { quizId: id, answers: answers };
    const response = await api.post(`/quizzes/${id}/submit?userId=${userId}`, submission);
    console.log('Quiz submission response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting quiz:', error.response || error);
    throw error;
  }
};

export const fetchQuizStats = async (quizId) => {
  try {
    const response = await api.get(`/quizzes/${quizId}/stats`);
    console.log('Quiz stats received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz stats:', error.response || error);
    throw error;
  }
};

export const getQuizzesByCreator = (creatorId) => api.get(`/quizzes/creator/${creatorId}`);

export const getUserAttemptDetails = (userId) => api.get(`/quiz-attempts/user/${userId}/details`);

export default api;