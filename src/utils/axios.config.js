import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});

instance.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response.status === 401 && !error.config._retry) {
        error.config._retry = true;
        useAuthStore().logout();
        window.location.href = "/login"; // Adjust the path to your login route

        return;
    }
    return Promise.reject(error);
});

export default instance;