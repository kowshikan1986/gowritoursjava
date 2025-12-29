import axios from 'axios';

// API base URL - connects to the backend server
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');

const client = axios.create({
  baseURL: API_BASE,
});

// Request interceptor for debugging
client.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging and error handling
client.interceptors.response.use(
  (res) => {
    console.log('API Response:', res.status, res.config.url);
    return res;
  },
  (err) => {
    console.error('API Response Error:', err.response?.status, err.message);
    if (err?.response?.status === 401) {
      localStorage.removeItem('authToken');
    }
    return Promise.reject(err);
  }
);

export default client;

