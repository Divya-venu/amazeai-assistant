import axios from 'axios';

const getBaseURL = () => {
    // Prefer environment variable if defined (for production)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    const hostname = window.location.hostname;
    // If we're on localhost or 127.0.0.1, use port 5000 on the same host
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `http://${hostname}:5000/api`;
    }
    // Fallback to the current host on port 5000 (standard for local network testing)
    return `http://${hostname}:5000/api`;
};

const apiClient = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    timeout: 60000, // 60s — supports large CSV uploads + Groq AI processing
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401s
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            console.error('[API Client] Unauthorized access - redirecting to login');
            localStorage.removeItem('user'); // Clean up user info
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
