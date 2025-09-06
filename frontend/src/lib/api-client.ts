import axios from 'axios';

// Create a common axios instance with credentials enabled
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // This ensures cookies are sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add request interceptor for debugging and authentication
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('Request headers:', config.headers);
    console.log('With credentials:', config.withCredentials);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      headers: error.response?.headers
    });
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('Authentication failed - redirecting to login');
      // You could dispatch a logout action here if needed
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
