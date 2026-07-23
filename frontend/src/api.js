import axios from 'axios';

// REACT_APP_API_URL is baked in at build time (set per environment before `npm run build`)
// e.g. https://dev.yourdomain.com/api  |  https://qa.yourdomain.com/api  |  https://yourdomain.com/api
const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({ baseURL: API_URL });

export const getRegistrations = (params) => api.get('/registrations', { params });
export const getRegistration = (id) => api.get(`/registrations/${id}`);
export const createRegistration = (data) => api.post('/registrations', data);
export const updateRegistration = (id, data) => api.put(`/registrations/${id}`, data);
export const deleteRegistration = (id) => api.delete(`/registrations/${id}`);

export default api;
