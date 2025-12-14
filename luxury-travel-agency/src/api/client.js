import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

export default client;

