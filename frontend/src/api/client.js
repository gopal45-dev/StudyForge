import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
if (rawBaseUrl && !rawBaseUrl.endsWith('/api/v1')) {
  rawBaseUrl = rawBaseUrl.replace(/\/+$/, '') + '/api/v1';
}

const api = axios.create({
  baseURL: rawBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
// Request interceptor: attach token from localStorage if available (dual-cookie & token auth)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('studyforge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// Response error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
