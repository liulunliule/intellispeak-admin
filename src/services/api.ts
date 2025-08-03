import axios from 'axios';

// const API_BASE_URL = 'https://endlessly-enabling-husky.ngrok-free.app';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include Authorization header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.log('Unauthorized request, redirecting to login...');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;