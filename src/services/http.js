import axios from 'axios';

const http = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
});

// Request interceptor
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
http.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Handle specific error codes
      const { code, message } = error.response.data;
      if (code === 1004) {
        // Handle unauthorized access
        console.error('Unauthorized access. Please log in again.');
      } else {
        console.error(`Error ${code}: ${message}`);
      }
    } else {
      console.error('Network error or server is down.');
    }
    return Promise.reject(error);
  }
);

export default http;