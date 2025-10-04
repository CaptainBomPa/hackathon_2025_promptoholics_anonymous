/**
 * API Client
 * Centralized HTTP client for backend communication
 */
import axios from 'axios';
import config from '../config/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: config.defaultHeaders,
});

// Request interceptor
apiClient.interceptors.request.use(
  (requestConfig) => {
    // Add timestamp for debugging
    if (config.interceptors.request.addTimestamp) {
      requestConfig.metadata = { startTime: new Date() };
    }
    
    // Log requests in development
    if (config.interceptors.request.logRequests) {
      console.log('🚀 API Request:', {
        method: requestConfig.method?.toUpperCase(),
        url: requestConfig.url,
        data: requestConfig.data,
        params: requestConfig.params,
      });
    }
    
    return requestConfig;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    if (response.config.metadata?.startTime) {
      const duration = new Date() - response.config.metadata.startTime;
      response.duration = duration;
    }
    
    // Log responses in development
    if (config.interceptors.response.logResponses) {
      console.log('✅ API Response:', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        duration: response.duration ? `${response.duration}ms` : 'unknown',
        data: response.data,
      });
    }
    
    return response;
  },
  (error) => {
    // Calculate request duration for errors too
    if (error.config?.metadata?.startTime) {
      const duration = new Date() - error.config.metadata.startTime;
      error.duration = duration;
    }
    
    // Log errors
    console.error('❌ API Error:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      duration: error.duration ? `${error.duration}ms` : 'unknown',
      message: error.message,
      data: error.response?.data,
    });
    
    // Handle common errors
    if (config.interceptors.response.handleCommonErrors) {
      if (error.response?.status === 429) {
        // Rate limiting
        console.warn('⚠️ Rate limit exceeded. Please try again later.');
      } else if (error.response?.status >= 500) {
        // Server errors
        console.error('🔥 Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        // Timeout
        console.error('⏰ Request timeout. Please check your connection.');
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API errors consistently
export const handleApiError = (error, context = '') => {
  const errorInfo = {
    context,
    status: error.response?.status,
    message: error.message,
    data: error.response?.data,
    duration: error.duration,
  };
  
  // Return user-friendly error message
  if (error.response?.status === 400) {
    return {
      ...errorInfo,
      userMessage: 'Nieprawidłowe dane wejściowe. Sprawdź wprowadzone wartości.',
    };
  } else if (error.response?.status === 422) {
    return {
      ...errorInfo,
      userMessage: 'Błąd walidacji danych. Sprawdź poprawność wprowadzonych informacji.',
      validationErrors: error.response?.data?.details || [],
    };
  } else if (error.response?.status === 429) {
    return {
      ...errorInfo,
      userMessage: 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.',
    };
  } else if (error.response?.status >= 500) {
    return {
      ...errorInfo,
      userMessage: 'Błąd serwera. Spróbuj ponownie później.',
    };
  } else if (error.code === 'ECONNABORTED') {
    return {
      ...errorInfo,
      userMessage: 'Przekroczono limit czasu żądania. Sprawdź połączenie internetowe.',
    };
  } else {
    return {
      ...errorInfo,
      userMessage: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
    };
  }
};

export default apiClient;