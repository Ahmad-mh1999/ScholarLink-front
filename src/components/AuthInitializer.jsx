/**
 * AuthInitializer Component
 * 
 * This component runs on app startup to:
 * 1. Check if user has valid JWT tokens
 * 2. Validate token expiration
 * 3. Attempt token refresh if needed
 * 4. Sync auth state with Redux
 * 5. Handle redirects for authenticated/unauthenticated users
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import tokenService from '../services/tokenService';
import authService from '../services/authService';
import { setCredentials, logout } from '../features/auth/authSlice';

const PUBLIC_ROUTES = [
  '/login',
  '/register', 
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/resend-verification',
];

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentPath = location.pathname;
        const isPublicRoute = PUBLIC_ROUTES.some(route => 
          currentPath.startsWith(route)
        );

        // Check for tokens
        const accessToken = tokenService.getAccessToken();
        const refreshToken = tokenService.getRefreshToken();

        // No tokens - user is not logged in
        if (!accessToken && !refreshToken) {
          setIsInitializing(false);
          
          // Redirect to login if trying to access protected route
          if (!isPublicRoute && currentPath !== '/') {
            const redirectUrl = encodeURIComponent(currentPath + location.search);
            navigate(`/login?redirect=${redirectUrl}`, { replace: true });
          }
          return;
        }

        // Have tokens - validate them
        if (accessToken && !tokenService.isTokenExpired(accessToken)) {
          // Token is valid - sync with Redux
          const userData = tokenService.getUserData();
          if (userData) {
            dispatch(setCredentials({ 
              user: userData, 
              token: accessToken 
            }));
          }
          
          // If on auth page and authenticated, redirect to dashboard
          if (isPublicRoute) {
            const redirectTo = new URLSearchParams(location.search).get('redirect') || '/';
            navigate(redirectTo, { replace: true });
          }
          
          setIsInitializing(false);
          return;
        }

        // Token expired - try to refresh
        if (refreshToken) {
          try {
            const newAccessToken = await authService.refreshToken();
            const userData = await authService.getCurrentUser();
            
            dispatch(setCredentials({ 
              user: userData, 
              token: newAccessToken 
            }));
            
            setIsInitializing(false);
            return;
          } catch (refreshError) {
            // Refresh failed - clear everything
            console.error('Token refresh failed:', refreshError);
            tokenService.clearTokens();
            dispatch(logout());
            
            setIsInitializing(false);
            
            // Show session expired message
            if (!isPublicRoute) {
              const redirectUrl = encodeURIComponent(currentPath);
              navigate(`/login?session_expired=true&redirect=${redirectUrl}`, { 
                replace: true 
              });
            }
            return;
          }
        }

        // No valid tokens
        setIsInitializing(false);
        
        if (!isPublicRoute) {
          navigate('/login', { replace: true });
        }
        
      } catch (error) {
        console.error('Auth initialization error:', error);
        setInitError('Failed to initialize authentication');
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch, navigate, location]);

  // Show loading spinner while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-accent animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC]">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-medium">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render children once initialized
  return children;
};

export default AuthInitializer;
