import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('adminToken');
            // Only redirect if the request was NOT a login attempt
            if (error.config && !error.config.url.includes('/login')) {
                toast.error("Session expired or unauthorized. Please log in again.");
                window.location.href = '/admin';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
