import axios from 'axios';

let rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');
if (!rawApiUrl.endsWith('/api')) {
  rawApiUrl = `${rawApiUrl}/api`;
}
const API_BASE_URL = rawApiUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send HttpOnly authentication cookies
  timeout: 30000,
});

// Request Interceptor: Attach JWT Token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ventriva_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized API Error Formatting & 401 Session Interception
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An unexpected API error occurred';

    // Intercept 401 Unauthorized to auto-clear stale tokens for protected routes
    if (status === 401) {
      const url = error.config?.url || '';
      const isPublicAuthRequest = url.includes('/auth/login') || url.includes('/auth/google') || url.includes('/auth/register');

      if (!isPublicAuthRequest) {
        localStorage.removeItem('ventriva_token');
        localStorage.removeItem('token');
        localStorage.removeItem('ventriva_user');

        const isAuthCheck = url.includes('/auth/me');
        const isAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
        if (!isAuthCheck && !isAuthPage) {
          window.location.href = '/login?expired=true';
        }
      }
    }

    return Promise.reject({
      status,
      message,
      data: error.response?.data,
      response: error.response,
    });
  }
);


export default api;
