import { defineStore } from 'pinia';
import axios from '@/utils/axios.config';

export const apiBaseURL = import.meta.env.VITE_API_BASE_URL;


export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        token: null,
        user: null
    }),
    actions: {
        async login(credentials) {
            console.log(credentials)
            console.log(apiBaseURL + '/auth/login')
            const response = await axios.post(apiBaseURL + '/auth/login', credentials);
            if (response.data && response.data.accessToken) {
                console.log(response)
                this.token = response.data.accessToken;
                localStorage.setItem('jwt', response.data.accessToken);
                console.log('localStorage.setItem(\'jwt\', response.data.token); ' + response.data.accessToken)
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.accessToken;
                this.user = response.data.user;
            }
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('jwt');
            delete axios.defaults.headers.common['Authorization'];
        }
    }
});