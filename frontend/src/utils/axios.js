import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000 // 15s timeout
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors: retry for gateway/network errors, auto-logout on 401 expired sessions
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 1. Handle expired / invalid session (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if on a protected route to prevent loops
      if (typeof window !== 'undefined' && window.location.pathname.includes('-dashboard')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    const config = error.config;
    if (!config || config.__isRetryRequest) {
      return Promise.reject(error);
    }

    const isNetworkOrTimeout = !error.response || error.code === 'ECONNABORTED';
    const isGatewayError = error.response && [502, 503, 504].includes(error.response.status);

    if (isNetworkOrTimeout || isGatewayError) {
      config.__isRetryRequest = true;
      // Wait 2 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return axiosInstance(config);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
