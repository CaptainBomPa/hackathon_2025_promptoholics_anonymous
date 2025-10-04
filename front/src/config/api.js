/**
 * API Configuration
 * Centralized configuration for backend communication
 */

const config = {
  // Base URL for API calls
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  
  // Request timeout in milliseconds
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  
  // Environment
  environment: process.env.REACT_APP_ENV || 'development',
  
  // Feature flags
  useMockData: process.env.REACT_APP_USE_MOCK_DATA === 'true',
  enableDebug: process.env.REACT_APP_ENABLE_DEBUG === 'true',
  
  // API endpoints
  endpoints: {
    // Pension calculation
    calculatePension: '/pensions/calculate',
    updatePostalCode: '/pensions/calculation-report/{calculationId}/update-postal-code',
    
    // Facts
    randomFact: '/facts/random',
    
    // Admin
    generateReport: '/admin/reports',
  },
  
  // Default headers
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Request/Response interceptors config
  interceptors: {
    request: {
      // Add timestamp to requests for debugging
      addTimestamp: true,
      // Log requests in development
      logRequests: process.env.REACT_APP_ENV === 'development',
    },
    response: {
      // Log responses in development
      logResponses: process.env.REACT_APP_ENV === 'development',
      // Handle common error responses
      handleCommonErrors: true,
    }
  }
};

export default config;