import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import tokenService from '../services/tokenService';
import authService from '../services/authService';
import { setCredentials, logout } from '../features/auth/authSlice';

/**
 * Enhanced Protected Route Component
 * Features:
 * - Validates JWT token on mount
 * - Auto-refreshes token if needed
 * - Shows loading spinner while checking
 * - Redirects to login on invalid/expired token
 * - Supports role-based access control
 */

const ProtectedRoute = ({ children, requiredRole, fallback }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated: reduxAuth, user: reduxUser, loading: reduxLoading } = useSelector((state) => state.auth);
  
  // Local state for token validation and user restoration
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [localUser, setLocalUser] = useState(null);
  
  // Use either Redux user or locally restored user
  const user = reduxUser || localUser;

  useEffect(() => {
    const validateToken = async () => {
      const accessToken = tokenService.getAccessToken();
      
      // No token at all
      if (!accessToken) {
        setIsTokenValid(false);
        setIsValidating(false);
        return;
      }

      // Check if token is expired
      if (tokenService.isTokenExpired(accessToken)) {
        // Try to refresh
        try {
          await authService.refreshToken();
          setIsTokenValid(true);
          
          // If Redux doesn't have user data, fetch it
          if (!reduxAuth || !reduxUser) {
            try {
              const userData = await authService.getCurrentUser();
              dispatch(setCredentials({ user: userData, access: tokenService.getAccessToken(), refresh: tokenService.getRefreshToken() }));
            } catch (e) {
              // Try to restore from localStorage
              const storedUser = localStorage.getItem('user_data');
              if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setLocalUser(parsedUser);
                dispatch(setCredentials({ 
                  user: parsedUser, 
                  access: tokenService.getAccessToken(), 
                  refresh: tokenService.getRefreshToken() 
                }));
              }
            }
          }
        } catch {
          // Refresh failed
          setIsTokenValid(false);
          dispatch(logout());
        }
      } else {
        // Token is valid
        setIsTokenValid(true);
        
        // If Redux doesn't have user but we have valid token, restore from localStorage
        if (!reduxUser) {
          try {
            const storedUser = localStorage.getItem('user_data');
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              setLocalUser(parsedUser);
              dispatch(setCredentials({ 
                user: parsedUser, 
                access: accessToken, 
                refresh: tokenService.getRefreshToken() 
              }));
            }
          } catch (e) {
            console.error('Error restoring user:', e);
          }
        }
      }
      
      setIsValidating(false);
    };

    validateToken();
  }, [dispatch, reduxAuth, reduxUser]);

  // Show loading spinner while validating
  if (isValidating || reduxLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isTokenValid && !reduxAuth) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return (
      <Navigate 
        to={`/login?redirect=${redirectUrl}`} 
        state={{ from: location, sessionExpired: true }} 
        replace 
      />
    );
  }


  // Role-based protection
  if (requiredRole) {
    const userRole = user?.role;
    const isStaff = user?.is_staff;
    const userPermissions = user?.permissions || [];
    
    // Check if user has the required role
    const hasRole = userRole === requiredRole || (requiredRole === 'admin' && isStaff === true);
    
    // Special handling for admin routes - only admin role can access
    const isAdminRoute = requiredRole === 'admin' || requiredRole === 'super_admin';
    const isAdmin = isStaff === true || userRole === 'admin' || userRole === 'super_admin';
    
    
    // For admin routes, require strict admin role
    if (isAdminRoute && !isAdmin) {
      toast.error('Access denied: Admin only');
      return <Navigate to="/dashboard" replace />;
    }
    
    
    // For other role-based routes
    if (!isAdminRoute && !hasRole && !userPermissions.includes(requiredRole)) {
      return fallback || <Navigate to="/unauthorized" replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
