import axios from 'axios';

const API_BASE_URL = 'https://bug-adapting-especially.ngrok-free.app';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

// Response interceptor for error handling with logout on 401 or 500
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 500)) {
            console.log('Unauthorized or server error, logging out...');
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            window.location.reload();
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;