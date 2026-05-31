/**
 * AuthContext - Centralized Role-Based Access Control (RBAC)
 * Provides authentication state and role-based permissions throughout the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import tokenService from '../services/tokenService';
import authService from '../services/authService';
import { setCredentials, logout } from '../features/auth/authSlice';

// ==================== ROLE DEFINITIONS ====================

const ROLES = {
  USER: 'user',
  REVIEWER: 'reviewer',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
};

// ==================== PERMISSIONS MATRIX ====================

const PERMISSIONS = {
  // Basic user permissions
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ARTICLES: 'view_articles',
  CREATE_ARTICLES: 'create_articles',
  EDIT_OWN_ARTICLES: 'edit_own_articles',
  VIEW_PROFILE: 'view_profile',
  EDIT_PROFILE: 'edit_profile',
  BOOKMARK_ARTICLES: 'bookmark_articles',
  VIEW_LEADERBOARD: 'view_leaderboard',
  VIEW_POINTS: 'view_points',

  // Reviewer permissions
  REVIEW_ARTICLES: 'review_articles',
  VIEW_REVIEWER_DASHBOARD: 'view_reviewer_dashboard',
  VIEW_REVIEWER_INBOX: 'view_reviewer_inbox',
  SUBMIT_REVIEWS: 'submit_reviews',
  VIEW_MY_REVIEWS: 'view_my_reviews',

  // Moderator permissions
  MODERATE_CONTENT: 'moderate_content',
  VIEW_MODERATION_DASHBOARD: 'view_moderation_dashboard',
  APPROVE_ARTICLES: 'approve_articles',
  REJECT_ARTICLES: 'reject_articles',
  MANAGE_FLAGS: 'manage_flags',

  // Admin permissions (full access)
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  VIEW_ADMIN_DASHBOARD: 'view_admin_dashboard',
  MANAGE_SYSTEM: 'manage_system',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_CATEGORIES: 'manage_categories',
  BULK_UPLOAD: 'bulk_upload',
};

// ==================== ROLE PERMISSIONS MAPPING ====================

// First, define the base permissions
const userPermissions = [
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_ARTICLES,
  PERMISSIONS.CREATE_ARTICLES,
  PERMISSIONS.EDIT_OWN_ARTICLES,
  PERMISSIONS.VIEW_PROFILE,
  PERMISSIONS.EDIT_PROFILE,
  PERMISSIONS.BOOKMARK_ARTICLES,
  PERMISSIONS.VIEW_LEADERBOARD,
  PERMISSIONS.VIEW_POINTS,
];

const reviewerPermissions = [
  ...userPermissions,
  PERMISSIONS.REVIEW_ARTICLES,
  PERMISSIONS.VIEW_REVIEWER_DASHBOARD,
  PERMISSIONS.VIEW_REVIEWER_INBOX,
  PERMISSIONS.SUBMIT_REVIEWS,
  PERMISSIONS.VIEW_MY_REVIEWS,
];

const moderatorPermissions = [
  ...userPermissions,
  PERMISSIONS.MODERATE_CONTENT,
  PERMISSIONS.VIEW_MODERATION_DASHBOARD,
  PERMISSIONS.APPROVE_ARTICLES,
  PERMISSIONS.REJECT_ARTICLES,
  PERMISSIONS.MANAGE_FLAGS,
];

const adminPermissions = [
  ...userPermissions,
  ...reviewerPermissions,
  ...moderatorPermissions,
  PERMISSIONS.MANAGE_USERS,
  PERMISSIONS.MANAGE_ROLES,
  PERMISSIONS.VIEW_ADMIN_DASHBOARD,
  PERMISSIONS.MANAGE_SYSTEM,
  PERMISSIONS.VIEW_ANALYTICS,
  PERMISSIONS.MANAGE_CATEGORIES,
  PERMISSIONS.BULK_UPLOAD,
];

const ROLE_PERMISSIONS = {
  [ROLES.USER]: userPermissions,
  [ROLES.REVIEWER]: reviewerPermissions,
  [ROLES.MODERATOR]: moderatorPermissions,
  [ROLES.ADMIN]: adminPermissions,
};

// ==================== AUTH CONTEXT ====================

const AuthContext = createContext();

/**
 * AuthProvider Component
 * Provides authentication state and role-based permissions to the entire app
 */
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const [permissions, setPermissions] = useState([]);
  const [localUser, setLocalUser] = useState(null);

  /**
   * Force logout user
   */
  const logoutUser = () => {
    dispatch(logout());
    // Clear any additional local state if needed
  };

  /**
   * fetchCurrentUser - Fetches the most recent user data from the backend
   * to ensure role and permissions are up-to-date.
   */
  const fetchCurrentUser = async () => {
    try {
      const freshUser = await authService.getCurrentUser();
      

      const access = tokenService.getAccessToken();
      const refresh = tokenService.getRefreshToken();

      // Update Redux and Local Storage
      dispatch(setCredentials({
        user: freshUser,
        access: access,
        refresh: refresh
      }));
      
      setLocalUser(freshUser);
      return freshUser;
    } catch (error) {
      console.error('Failed to fetch fresh user data:', error);

      // If unauthorized, clear session fully (tokens + persisted user) and surface login.
      if (error?.response?.status === 401) {
        tokenService.clearTokens?.();
        logoutUser();
      }
      return null;
    }
  };

  // On mount, try to restore user from localStorage if Redux doesn't have it
  useEffect(() => {
    const accessToken = tokenService.getAccessToken();
    
    if (accessToken) {
      fetchCurrentUser();
    }
  }, []); // Only run on mount

  // Update permissions when user changes
  useEffect(() => {
    const effectiveUser = user || localUser;
    if (effectiveUser?.role && ROLE_PERMISSIONS[effectiveUser.role]) {
      setPermissions(ROLE_PERMISSIONS[effectiveUser.role]);
    } else {
      setPermissions([]);
    }
  }, [user, localUser, isAuthenticated]);

  // ==================== AUTH HELPER METHODS ====================

  /**
   * Check if user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean}
   */
  const hasRole = (role) => {
    const effectiveUser = user || localUser;
    const hasRoleResult = effectiveUser?.role === role;
    return hasRoleResult;
  };

  /**
   * Helper: Check if user is admin (strict === 'admin')
   * @returns {boolean}
   */
  const checkIsAdmin = () => {
    const effectiveUser = user || localUser;
    const isAdminResult = effectiveUser?.is_staff === true || effectiveUser?.role === 'admin';
    return isAdminResult;
  };

  /**
   * Check if user has any of the specified roles
   * @param {string[]} roles - Array of roles to check
   * @returns {boolean}
   */
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  /**
   * Check if user has a specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  /**
   * Check if user has any of the specified permissions
   * @param {string[]} permissionList - Array of permissions to check
   * @returns {boolean}
   */
  const hasAnyPermission = (permissionList) => {
    return permissionList.some(perm => permissions.includes(perm));
  };

  // ==================== ROLE-BASED SHORTCUT METHODS ====================

  const isAdmin = () => {
    const result = checkIsAdmin();
    return result;
  };
  const isModerator = () => hasRole(ROLES.MODERATOR);
  const isReviewer = () => hasRole(ROLES.REVIEWER);
  const isUser = () => hasRole(ROLES.USER);

  // Compound role checks
  const isAdminOrModerator = () => hasAnyRole([ROLES.ADMIN, ROLES.MODERATOR]);
  const isReviewerOrAdmin = () => hasAnyRole([ROLES.REVIEWER, ROLES.ADMIN]);
  const isModeratorOrAdmin = () => hasAnyRole([ROLES.MODERATOR, ROLES.ADMIN]);

  // Feature access checks
  const canAccessAdminDashboard = () => isAdmin();
  const canAccessReviewerPortal = () => isReviewerOrAdmin();
  const canAccessModeration = () => isModeratorOrAdmin();
  const canManageUsers = () => isAdmin();
  const canReviewArticles = () => isReviewerOrAdmin();
  const canModerateContent = () => isModeratorOrAdmin();

  // ==================== AUTH ACTIONS ====================

  /**
   * Refresh user data from token
   */
  const refreshUserData = async () => {
    try {
      const userData = tokenService.getUserData();
      if (userData) {
        // Update Redux state if needed
        dispatch(setCredentials({
          user: userData,
          token: tokenService.getAccessToken()
        }));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // ==================== CONTEXT VALUE ====================

  const effectiveUser = user || localUser;

  const value = {
    // Auth state
    user: effectiveUser,
    isAuthenticated,
    loading,

    // User info
    userId: effectiveUser?.id,
    userRole: effectiveUser?.role,
    userEmail: effectiveUser?.email,
    userName: effectiveUser?.username,
    academicStatus: effectiveUser?.academic_status,

    // Role checks
    hasRole,
    hasAnyRole,
    isAdmin,
    checkIsAdmin,
    isModerator,
    isReviewer,
    isUser,

    // Compound role checks
    isAdminOrModerator,
    isReviewerOrAdmin,
    isModeratorOrAdmin,

    // Permission checks
    hasPermission,
    hasAnyPermission,
    permissions, // Array of all user permissions

    // Feature access
    canAccessAdminDashboard,
    canAccessReviewerPortal,
    canAccessModeration,
    canManageUsers,
    canReviewArticles,
    canModerateContent,

    // Actions
    logoutUser,
    refreshUserData,
    fetchCurrentUser,

    // Constants
    ROLES,
    PERMISSIONS,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook - Access authentication state and RBAC throughout the app
 * @returns {object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
