import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor — attach JWT ─────────────────────────
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
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
        const data = error?.response?.data;
        const message = data?.message;

        // Detect chaos-engine responses by their shape
        const isChaos = data?.status === 'chaos';

        if (status === 401) {
            toast.error('Session expired. Please log in again.');
        } else if (status === 429) {
            toast.error(isChaos
                ? '⚡ Chaos: Too many requests — slow down!'
                : 'Too many requests. Please wait a moment.');
        } else if (status === 503) {
            toast.error(isChaos
                ? '☢️ Chaos: Service unavailable — backend is in failure mode.'
                : 'Service temporarily unavailable. Please try again shortly.');
        } else if (status === 502 || status === 504) {
            toast.error(isChaos
                ? `☢️ Chaos: ${message || 'Gateway error simulated.'}`
                : 'A gateway error occurred. Please retry.');
        } else if (status === 404) {
            toast.error(message || 'Resource not found.');
        } else if (status >= 500) {
            toast.error(isChaos
                ? `☢️ Chaos: ${message || 'Simulated server error.'}`
                : 'Something went wrong on our end. Please try again.');
        } else if (!error.response) {
            toast.error('Network error — check your connection.');
        } else {
            toast.error(message || 'An unexpected error occurred.');
        }

        return Promise.reject(error);
    }
);

// ── Journey Files Helper ─────────────────────────────────────
export const getJourneyFiles = (monitorId) =>
    api.get(`/monitors/${monitorId}/journey-files`).then((r) => r.data);

export default api;
