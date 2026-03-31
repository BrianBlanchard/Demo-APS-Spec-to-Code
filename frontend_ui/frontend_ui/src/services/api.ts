import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiError } from '../types/api';

// API base URL - should match backend server
const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sessionToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: error.message || 'An unexpected error occurred',
      code: (error.response?.data as any)?.code,
    };

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;

// Helper function for making API requests
export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};
