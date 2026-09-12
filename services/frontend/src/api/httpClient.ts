import axios from 'axios';

// All API requests go to the same origin — nginx proxies them to the correct backend
const apiClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('wmp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 and error logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('wmp_token');
      localStorage.removeItem('wmp_user');
      window.location.href = '/login';
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Single client for all services — nginx handles routing
export const portfolioClient = apiClient;
export const analyticsClient = apiClient;
export const authClient = apiClient;
