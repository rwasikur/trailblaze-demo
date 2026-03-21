import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                localStorage.removeItem('adminToken');
                // Only redirect if the request was NOT a login attempt
                if (error.config && !error.config.url.includes('/login') && !error.config.url.includes('/signup')) {
                    toast.error("Session expired or unauthorized. Please log in again.");
                    window.location.href = '/admin';
                }
            } else if (status >= 400 && status !== 404 && status !== 401) {
                // For 400, 403, 500 etc. but ignoring 404 which might be handled by UI
                const message = error.response.data?.message || "An error occurred while processing your request.";
                // check if the request was a login/signup attempt to avoid double toast in AdminLogin
                if (!error.config || (!error.config.url.includes('/login') && !error.config.url.includes('/signup'))) {
                    toast.error(`Action failed: ${message}`);
                }
            }
        } else if (error.request) {
            // Network error
            toast.error("Network error. Please check your connection and try again.");
        } else {
            toast.error("An unexpected error occurred.");
        }
        return Promise.reject(error);
    }
);

export default api;
