import axios from 'axios';

// REACT_APP_API_URL is baked in at build time (set per environment before `npm run build`)
const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({ baseURL: API_URL });

// Attach the admin token (if present) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (username, password) => api.post('/auth/login', { username, password });
export const getMe = () => api.get('/auth/me');

// Registrations
export const getRegistrations = (params) => api.get('/registrations', { params });
export const getRegistration = (id) => api.get(`/registrations/${id}`);
export const createRegistration = (data) => api.post('/registrations', data);
export const updateRegistration = (id, data) => api.put(`/registrations/${id}`, data);
export const deleteRegistration = (id) => api.delete(`/registrations/${id}`);

export default api;
