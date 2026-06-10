import axios from 'axios';

// Create a centralized axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://pfm-t737.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fintech_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global error handling
api.interceptors.response.use(
  (response) => {
    // Return only the data payload for cleaner service files
    return response.data;
  },
  (error) => {
    // Handle 401 Unauthorized globally (e.g., token expired)
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized access - perhaps the token expired.');
      // Optionally trigger a logout function or clear storage here
      // localStorage.removeItem('fintech_token');
      // window.location.href = '/login';
    }
    
    // Log server errors for debugging
    if (error.response && error.response.status >= 500) {
      console.error('Server Error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;
