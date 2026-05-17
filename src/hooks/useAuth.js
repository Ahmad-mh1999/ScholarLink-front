/**
 * useAuth Hook - Simplified access to AuthContext
 * Provides authentication state and role-based permissions
 *
 * This hook is a convenience wrapper around useAuthContext
 * for components that only need basic auth state
 */

import { useAuth as useAuthContext } from '../contexts/AuthContext';

/**
 * useAuth Hook
 * Returns authentication state and role-based helpers
 *
 * @returns {object} Auth state and helpers
 */
const useAuth = () => {
  const auth = useAuthContext();

  return {
    // Auth state
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,

    // User info shortcuts
    userId: auth.userId,
    userRole: auth.userRole,
    userEmail: auth.userEmail,
    userName: auth.userName,

    // Role checks
    hasRole: auth.hasRole,
    hasAnyRole: auth.hasAnyRole,
    isAdmin: auth.isAdmin,
    isModerator: auth.isModerator,
    isReviewer: auth.isReviewer,
    isUser: auth.isUser,

    // Feature access shortcuts
    canAccessAdminDashboard: auth.canAccessAdminDashboard,
    canAccessReviewerPortal: auth.canAccessReviewerPortal,
    canAccessModeration: auth.canAccessModeration,
    canManageUsers: auth.canManageUsers,
    canReviewArticles: auth.canReviewArticles,
    canModerateContent: auth.canModerateContent,

    // Actions
    logout: auth.logoutUser,
  };
};

export default useAuth;
