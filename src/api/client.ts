import axios from 'axios';
import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';
import { tokenManager } from '../utils/tokenManager';

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

<<<<<<< HEAD
// Projects Service  
export const projectsApiClient = axios.create({
  baseURL: ENV1.PROJECTS_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // ... config
});

// Request interceptor for projects API
projectsApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for projects API
projectsApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

=======
>>>>>>> main
// Request interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip token handling for auth endpoints
    const isAuthEndpoint = config.url?.includes('/auth/initial/');
    
    if (!isAuthEndpoint) {
      // Get valid access token (will refresh if needed)
      const token = await tokenManager.getValidAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else if (config.url?.includes('/auth/initial/refresh')) {
      // For refresh endpoint, don't add any authorization header
      // The refresh token is sent in the request body
    } else {
      // For other auth endpoints (login, signup), check for legacy token
      const legacyToken = localStorage.getItem('authToken');
      if (legacyToken && config.headers) {
        config.headers.Authorization = `Bearer ${legacyToken}`;
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle 401 errors
    if (error.response?.status === 401 && originalRequest) {
      // Skip retry for auth endpoints
      const isAuthEndpoint = originalRequest.url?.includes('/auth/initial/');
      
      if (!isAuthEndpoint && !(originalRequest as any)._retry) {
        (originalRequest as any)._retry = true;
        
        // Try to refresh token
        const refreshed = await tokenManager.refreshAccessToken();
        
        if (refreshed) {
          // Retry the original request with new token
          const newToken = tokenManager.getAccessToken();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        }
      }
      
      // If refresh failed or this is an auth endpoint, clear tokens and redirect
      tokenManager.clearTokens();
      
      // Only redirect if we're not already on the landing page
      if (window.location.pathname !== '/landing') {
        window.location.href = '/landing';
      }
    }
    
    return Promise.reject(error);
  }
);
