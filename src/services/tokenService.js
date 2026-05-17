/**
 * Token Service - Centralized JWT Token Management
 * Handles: storage, retrieval, expiration checking, and cleanup
 */

const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
  USER: 'user_data',
  REMEMBER_ME: 'remember_me',
};

/**
 * Decode JWT token to extract payload
 * @param {string} token - JWT token
 * @returns {object|null} Decoded payload or null
 */
const decodeToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT token format');
      return null;
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired or invalid
 */
const isTokenExpired = (token) => {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  // Check if token expires in less than 5 minutes (300 seconds)
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime + 300;
};

/**
 * Get token expiration time in milliseconds
 * @param {string} token - JWT token
 * @returns {number|null} Expiration timestamp or null
 */
const getTokenExpiration = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  return decoded.exp * 1000;
};

/**
 * Get time until token expires in seconds
 * @param {string} token - JWT token
 * @returns {number} Seconds until expiration (negative if expired)
 */
const getTimeUntilExpiration = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return -1;
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp - currentTime;
};

/**
 * Save tokens to storage
 * @param {string} accessToken - Access JWT token
 * @param {string} refreshToken - Refresh JWT token
 * @param {boolean} rememberMe - Whether to persist across sessions
 */
const setTokens = (accessToken, refreshToken, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
    localStorage.setItem(TOKEN_KEYS.REMEMBER_ME, 'true');
  } else {
    sessionStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
    sessionStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
    localStorage.removeItem(TOKEN_KEYS.REMEMBER_ME);
  }
};

/**
 * Get access token from storage
 * @returns {string|null} Access token or null
 */
const getAccessToken = () => {
  return (
    localStorage.getItem(TOKEN_KEYS.ACCESS) ||
    sessionStorage.getItem(TOKEN_KEYS.ACCESS) ||
    null
  );
};

/**
 * Get refresh token from storage
 * @returns {string|null} Refresh token or null
 */
const getRefreshToken = () => {
  return (
    localStorage.getItem(TOKEN_KEYS.REFRESH) ||
    sessionStorage.getItem(TOKEN_KEYS.REFRESH) ||
    null
  );
};

/**
 * Update access token (after refresh)
 * @param {string} newAccessToken - New access token
 */
const setAccessToken = (newAccessToken) => {
  const isRememberMe = localStorage.getItem(TOKEN_KEYS.REMEMBER_ME) === 'true';
  if (isRememberMe || localStorage.getItem(TOKEN_KEYS.ACCESS)) {
    localStorage.setItem(TOKEN_KEYS.ACCESS, newAccessToken);
  } else {
    sessionStorage.setItem(TOKEN_KEYS.ACCESS, newAccessToken);
  }
};

/**
 * Clear all tokens from storage
 */
const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
  localStorage.removeItem(TOKEN_KEYS.USER);
  localStorage.removeItem(TOKEN_KEYS.REMEMBER_ME);
  sessionStorage.removeItem(TOKEN_KEYS.ACCESS);
  sessionStorage.removeItem(TOKEN_KEYS.REFRESH);
};

/**
 * Check if user is authenticated (has valid non-expired token)
 * @returns {boolean} True if authenticated
 */
const isAuthenticated = () => {
  const token = getAccessToken();
  return token && !isTokenExpired(token);
};

/**
 * Check if token needs refresh (expires in less than 5 minutes)
 * @returns {boolean} True if refresh needed
 */
const needsTokenRefresh = () => {
  const token = getAccessToken();
  if (!token) return false;
  const timeLeft = getTimeUntilExpiration(token);
  return timeLeft > 0 && timeLeft < 300; // Less than 5 minutes
};

/**
 * Save user data
 * @param {object} userData - User information
 */
const setUserData = (userData) => {
  localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(userData));
};

/**
 * Get user data
 * @returns {object|null} User data or null
 */
const getUserData = () => {
  const data = localStorage.getItem(TOKEN_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

/**
 * Get user ID from token
 * @returns {string|number|null} User ID or null
 */
const getUserId = () => {
  const token = getAccessToken();
  const decoded = decodeToken(token);
  return decoded?.user_id || decoded?.sub || null;
};

/**
 * Get user role from token
 * @returns {string|null} User role or null
 */
const getUserRole = () => {
  const token = getAccessToken();
  const decoded = decodeToken(token);
  return decoded?.role || decoded?.user_role || null;
};

const tokenService = {
  // Token storage
  setTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
  
  // Token validation
  isTokenExpired,
  isAuthenticated,
  needsTokenRefresh,
  getTokenExpiration,
  getTimeUntilExpiration,
  decodeToken,
  
  // User data
  setUserData,
  getUserData,
  getUserId,
  getUserRole,
  
  // Constants
  TOKEN_KEYS,
};

export default tokenService;
