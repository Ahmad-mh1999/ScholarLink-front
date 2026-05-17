/**
 * Auth Service - Authentication API calls
 * Handles: login, register, refresh token, logout
 */

import axios from 'axios';
import tokenService from './tokenService';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1/';

// Create a separate axios instance for auth calls (without interceptors)
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Remember user across sessions
 * @returns {Promise} Login response with tokens
 */
const login = async (email, password, rememberMe = false) => {
  const response = await authAxios.post('auth/login/', {
    email,
    password,
  });

  const { access, refresh, user } = response.data;

  if (access && refresh) {
    tokenService.setTokens(access, refresh, rememberMe);
    tokenService.setUserData(user);
  }

  return response.data;
};

/**
 * Register new user
 * @param {object} userData - Registration data
 * @returns {Promise} Registration response
 */
const register = async (userData) => {
  const response = await authAxios.post('auth/register/', userData);
  return response.data;
};

/**
 * Refresh access token using refresh token
 * @returns {Promise} New access token
 */
const refreshToken = async () => {
  const refresh = tokenService.getRefreshToken();
  
  if (!refresh) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await authAxios.post('auth/refresh/', {
      refresh,
    });

    const { access } = response.data;
    
    if (access) {
      tokenService.setAccessToken(access);
    }

    return access;
  } catch (error) {
    // Refresh failed - clear tokens and throw
    tokenService.clearTokens();
    throw error;
  }
};

/**
 * Logout user
 * Calls backend to blacklist token, then clears storage
 * @returns {Promise} Logout response
 */
const logout = async () => {
  const refresh = tokenService.getRefreshToken();
  
  try {
    if (refresh) {
      await authAxios.post('auth/logout/', {
        refresh,
      });
    }
  } catch (error) {
    console.warn('Logout API call failed:', error.message);
  } finally {
    // Always clear tokens locally
    tokenService.clearTokens();
  }
};

/**
 * Verify email
 * @param {string} token - Verification token
 * @returns {Promise} Verification response
 */
const verifyEmail = async (token) => {
  const response = await authAxios.post('auth/verify-email/', {
    token,
  });
  return response.data;
};

/**
 * Resend verification email
 * @param {string} email - User email
 * @returns {Promise} Response
 */
const resendVerification = async (email) => {
  const response = await authAxios.post('auth/resend-verification/', {
    email,
  });
  return response.data;
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise} Response
 */
const forgotPassword = async (email) => {
  const response = await authAxios.post('auth/forgot-password/', {
    email,
  });
  return response.data;
};

/**
 * Reset password
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise} Response
 */
const resetPassword = async (token, newPassword) => {
  const response = await authAxios.post('auth/reset-password/', {
    token,
    new_password: newPassword,
  });
  return response.data;
};

/**
 * Get current user profile
 * @returns {Promise} User data
 */
const getCurrentUser = async () => {
  const token = tokenService.getAccessToken();
  
  if (!token) {
    throw new Error('No access token');
  }

  const response = await authAxios.get('users/me/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const userData = response.data;
  
  // LOG: Check if role is present in API response
  console.log('[AUTH DEBUG] API Response Data:', userData);

  // FALLBACK: If API doesn't return role, try to get it from JWT token
  if (!userData.role) {
    const roleFromToken = tokenService.getUserRole();
    if (roleFromToken) {
      console.log('[AUTH DEBUG] Role missing in API response, extracted from token:', roleFromToken);
      userData.role = roleFromToken;
    } else if (userData.is_superuser || userData.is_staff) {
      // Emergency fallback for admins if field is missing but staff/superuser is present
      console.log('[AUTH DEBUG] Role missing, but user is staff/superuser. Setting to "admin".');
      userData.role = 'admin';
    } else {
      console.warn('[AUTH DEBUG] Role missing in both API and token, defaulting to "user"');
      userData.role = 'user';
    }
  }

  tokenService.setUserData(userData);
  return userData;
};

/**
 * Check if user is authenticated (valid token check)
 * @returns {Promise<boolean>} True if authenticated
 */
const checkAuth = async () => {
  try {
    // First check if we have tokens
    if (!tokenService.getAccessToken()) {
      return false;
    }

    // Check if token is expired
    if (tokenService.isTokenExpired()) {
      // Try to refresh
      await refreshToken();
    }

    // Verify with backend
    await getCurrentUser();
    return true;
  } catch (error) {
    console.error('Auth check failed:', error);
    tokenService.clearTokens();
    return false;
  }
};

const authService = {
  login,
  register,
  logout,
  refreshToken,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  checkAuth,
  authAxios,
};

export default authService;
