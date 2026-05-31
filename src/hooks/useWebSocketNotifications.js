/**
 * useWebSocketNotifications Hook
 * Purpose: Manages WebSocket connection for real-time notifications
 * Features:
 *   - Auto-connect on mount
 *   - Handle initial unread_count on connection
 *   - Listen for notification_message events
 *   - Auto-reconnect on connection loss
 *   - Update RTK Query cache when new notifications arrive
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { baseApi } from '../api/baseApi';

// WebSocket message types from backend
const WS_MESSAGE_TYPES = {
  NOTIFICATION_MESSAGE: 'notification',
  UNREAD_COUNT_UPDATE: 'unread_count_update',
  NOTIFICATION_READ: 'notification_read',
};

export const useWebSocketNotifications = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false); // Prevent duplicate connections
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState(null);

  // Get WebSocket URL from environment or use default
  const getWebSocketUrl = () => {
    // Check if WebSocket is disabled (backend doesn't support Channels)
    if (import.meta.env.VITE_DISABLE_WEBSOCKET === 'true') {
      return null;
    }
    
    // Priority 1: Use VITE_API_WS_URL from .env
    // Priority 2: Use VITE_WS_URL from .env
    // Priority 3: Use relative path with default port
    let baseUrl = import.meta.env.VITE_API_WS_URL || import.meta.env.VITE_WS_URL || '/ws/notifications/';
    
    // Construct full URL if relative
    if (baseUrl.startsWith('/')) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Use port 8000 for backend if on localhost
      const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? '127.0.0.1:8000' 
        : window.location.host;
      baseUrl = `${protocol}//${host}${baseUrl}`;
    }
    
    // Get fresh token from localStorage
    const token = localStorage.getItem('access_token');
    if (token && baseUrl.includes('?')) {
      return `${baseUrl}&token=${token}`;
    } else if (token) {
      return `${baseUrl}?token=${token}`;
    }
    
    return baseUrl;
  };

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);

      switch (data.type) {
        case WS_MESSAGE_TYPES.NOTIFICATION_MESSAGE:
          // New notification received
          setLastMessage(data.notification);
          
          // Update unread count
          if (data.unread_count !== undefined) {
            setUnreadCount(data.unread_count);
          } else {
            setUnreadCount(prev => prev + 1);
          }

          // Invalidate RTK Query cache to refresh notifications
          dispatch(baseApi.util.invalidateTags(['Notifications']));
          break;

        case WS_MESSAGE_TYPES.UNREAD_COUNT_UPDATE:
          // Backend pushed updated unread count
          if (data.unread_count !== undefined) {
            setUnreadCount(data.unread_count);
          }
          break;

        case WS_MESSAGE_TYPES.NOTIFICATION_READ:
          // A notification was marked as read (by this user or system)
          if (data.unread_count !== undefined) {
            setUnreadCount(data.unread_count);
          }
          dispatch(baseApi.util.invalidateTags(['Notifications']));
          break;

        default:
          console.log('Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [dispatch]);

  // Handle connection open
  const handleOpen = useCallback(() => {
    console.log('WebSocket connection established');
    setIsConnected(true);
    isConnectingRef.current = false; // Reset connection flag on success
    reconnectAttemptsRef.current = 0; // Reset reconnection attempts on success
  }, []);

  // Handle connection close
  const handleClose = useCallback((event) => {
    console.log('WebSocket connection closed:', event.code, event.reason);
    setIsConnected(false);
    isConnectingRef.current = false; // Reset connection flag on close

    // Auto-reconnect with exponential backoff if not intentionally closed
    if (event.code !== 1000 && event.code !== 1001) {
      const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
      reconnectAttemptsRef.current += 1;

      console.log(`Attempting WebSocket reconnection in ${backoffDelay}ms (attempt ${reconnectAttemptsRef.current})`);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, backoffDelay);
    }
  }, []);

  // Handle connection errors
  const handleError = useCallback((error) => {
    console.error('WebSocket error:', error);
    setIsConnected(false);
  }, []);

  // Connect to WebSocket (function declaration to avoid TDZ)
  function connect() {
    // Prevent duplicate connections
    if (isConnectingRef.current || socketRef.current) {
      console.log('WebSocket connection already in progress or active');
      return;
    }

    // Check for valid token before connecting
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No auth token available - skipping WebSocket connection');
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();

      // Skip if WebSocket is disabled
      if (!wsUrl) {
        console.log('WebSocket disabled - using polling fallback');
        setIsConnected(false);
        return;
      }

      isConnectingRef.current = true;
      console.log('Connecting to WebSocket:', wsUrl);

      const socket = new WebSocket(wsUrl);

      socket.onopen = handleOpen;
      socket.onmessage = handleMessage;
      socket.onclose = handleClose;
      socket.onerror = handleError;

      socketRef.current = socket;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      isConnectingRef.current = false;
    }
  }

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (socketRef.current) {
      socketRef.current.close(1000, 'Component unmounted');
      socketRef.current = null;
    }
    isConnectingRef.current = false; // Reset connection flag on disconnect
    setIsConnected(false);
  }, []);

  // Send message to server (if needed for specific actions)
  const sendMessage = useCallback((message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket not connected, cannot send message');
    return false;
  }, []);

  // Manually set unread count (for external updates)
  const updateUnreadCount = useCallback((count) => {
    setUnreadCount(count);
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    // Small delay to ensure auth token is available (especially for React StrictMode)
    const connectionDelay = setTimeout(() => {
      connect();
    }, 100);

    return () => {
      clearTimeout(connectionDelay);
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    unreadCount,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    updateUnreadCount,
  };
};

export default useWebSocketNotifications;
