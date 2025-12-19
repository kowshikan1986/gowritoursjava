import axios from 'axios';

// API base URL - connects to local SQLite API server
const API_BASE =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

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

