import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: '/api',  // proxied to http://localhost:5000/api via vite.config.js
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor — attach JWT ─────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor — global error toasts ───────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message;

        if (status === 401) {
            toast.error('Session expired. Please log in again.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else if (status === 404) {
            toast.error(message || 'Resource not found.');
        } else if (status >= 500) {
            toast.error('Something went wrong on our end. Please try again.');
        } else if (!error.response) {
            toast.error('Network error — check your connection.');
        } else {
            toast.error(message || 'An unexpected error occurred.');
        }

        return Promise.reject(error);
    }
);

export default api;
