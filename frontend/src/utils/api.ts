import axios from 'axios';

// Support production external API URL or default to relative path for reverse proxy/monolith
const rawBaseUrl =
  import.meta.env.VITE_API_URL ||
  'https://pen-fight-backend.onrender.com';

const baseURL = `${rawBaseUrl.replace(/\/$/, '')}/api`;

export const api = axios.create({
  baseURL,
  withCredentials: true, // sends HTTP-only session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token as Bearer fallback for third-party cross-origin deployments
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('penfight_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // localStorage not accessible
  }
  return config;
});

// Response interceptor for clean error messaging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);
