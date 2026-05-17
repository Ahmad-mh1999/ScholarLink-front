/**
 * Axios Instance with JWT Authentication Interceptors
 * Features:
 * - Automatic Authorization header injection
 * - Automatic token refresh on 401 errors
 * - Request/Response logging in development
 * - Graceful handling of auth failures
 */

import axios from 'axios';
import tokenService from '../services/tokenService';
import authService from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1/';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Flag to track if we're currently refreshing token
let isRefreshing = false;
// Queue of requests to retry after token refresh
let refreshSubscribers = [];

/**
 * Subscribe to token refresh
 * @param {Function} callback - Function to call when token is refreshed
 */
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Notify all subscribers that token has been refreshed
 * @param {string} newToken - New access token
 */
const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

/**
 * Reject all subscribers (on refresh failure)
 * @param {Error} error - Error object
 */
const onTokenRefreshFailed = (error) => {
  refreshSubscribers.forEach((callback) => callback(null, error));
  refreshSubscribers = [];
};

// ==================== REQUEST INTERCEPTOR ====================

axiosInstance.interceptors.request.use(
  (config) => {
    // Get current token
    const token = tokenService.getAccessToken();
    
    // Add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For FormData, let browser set Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Development logging
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data instanceof FormData ? '[FormData]' : config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================

axiosInstance.interceptors.response.use(
  // Success handler
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  
  // Error handler (handles 401 and token refresh)
  async (error) => {
    const originalRequest = error.config;

    // If no response (network error), reject immediately
    if (!error.response) {
      console.error('[API Network Error]', error.message);
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized
    if (status === 401 && !originalRequest._retry) {
      // Don't retry if it's the refresh endpoint itself
      if (originalRequest.url?.includes('auth/refresh')) {
        tokenService.clearTokens();
        window.location.href = '/login?session_expired=true';
        return Promise.reject(error);
      }

      // Mark request as retry attempt
      originalRequest._retry = true;

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken, err) => {
            if (err || !newToken) {
              reject(err || new Error('Token refresh failed'));
              return;
            }
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // Attempt to refresh token
        const newToken = await authService.refreshToken();
        
        if (!newToken) {
          throw new Error('Token refresh returned empty token');
        }

        // Notify all waiting requests
        onTokenRefreshed(newToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // Token refresh failed
        onTokenRefreshFailed(refreshError);
        
        // Clear tokens and redirect to login
        tokenService.clearTokens();
        
        // Show session expired message and redirect
        const redirectUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?session_expired=true&redirect=${redirectUrl}`;
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      console.warn('[API 403 Forbidden]', data);
      // Could redirect to unauthorized page
    }

    // Handle 500+ Server errors
    if (status >= 500) {
      console.error('[API Server Error]', data);
    }

    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`[API Error] ${originalRequest.url}`, {
        status,
        data,
        headers: originalRequest.headers,
      });
    }

    return Promise.reject(error);
  }
);

// ==================== PUBLIC METHODS ====================

/**
 * Check and refresh token if needed (proactive refresh)
 * Call this before important operations or on app focus
 */
export const ensureValidToken = async () => {
  const token = tokenService.getAccessToken();
  
  if (!token) {
    return false;
  }

  // If token expires in less than 2 minutes, refresh it
  const timeLeft = tokenService.getTimeUntilExpiration(token);
  
  if (timeLeft > 0 && timeLeft < 120) {
    try {
      await authService.refreshToken();
      return true;
    } catch {
      return false;
    }
  }

  return !tokenService.isTokenExpired(token);
};

/**
 * Force logout - clears everything and redirects
 */
export const forceLogout = () => {
  tokenService.clearTokens();
  window.location.href = '/login?session_expired=true';
};

export default axiosInstance;
