/**
 * NotificationBell Component
 * Purpose: Displays unread notifications count badge and dropdown in Navbar
 * Features:
 *   - Shows real-time unread count from WebSocket
 *   - Dropdown with recent notifications preview
 *   - Click to navigate to full notifications page
 *   - Click to mark all as read
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Loader2, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { 
  useGetNotificationsQuery, 
  useGetUnreadNotificationsCountQuery,
  useMarkAllNotificationsReadMutation 
} from '../api/baseApi';
import useWebSocketNotifications from '../hooks/useWebSocketNotifications';

// ═══════════════════════════════════════════════════════════════════
// Sub-component: Mini Notification Item (for dropdown)
// ═══════════════════════════════════════════════════════════════════
const MiniNotificationItem = ({ notification, onClick }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'manuscript': return '📄';
      case 'comment': return '💬';
      case 'verification': return '✅';
      case 'milestone': return '🏆';
      default: return '🔔';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer transition-all hover:bg-[#F7FAFC] ${
        notification.is_read ? 'opacity-60' : 'bg-accent/5'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">{getIcon(notification.type)}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-primary truncate">
            {notification.title}
          </p>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {notification.description}
          </p>
          <p className="text-[10px] text-gray-300 font-medium uppercase tracking-widest mt-1">
            {notification.created_at_formatted || 'Just now'}
          </p>
        </div>
        {!notification.is_read && (
          <div className="w-2 h-2 bg-accent rounded-full shrink-0 mt-1.5" />
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Main NotificationBell Component
// ═══════════════════════════════════════════════════════════════════
const NotificationBell = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // WebSocket for real-time updates
  const { 
    unreadCount: wsUnreadCount, 
    isConnected 
  } = useWebSocketNotifications();

  // RTK Query for initial data and polling fallback
  const { 
    data: unreadData, 
    isLoading: unreadLoading,
    refetch: refetchUnread 
  } = useGetUnreadNotificationsCountQuery(undefined, {
    // Poll every 30 seconds as fallback if WebSocket fails
    pollingInterval: isConnected ? 0 : 30000,
  });

  // Fetch recent notifications for dropdown
  const { 
    data: notificationsData, 
    isLoading: notificationsLoading 
  } = useGetNotificationsQuery({ 
    page: 1, 
    page_size: 5 
  }, {
    skip: !isOpen, // Only fetch when dropdown is open
  });

  const [markAllRead, { isLoading: isMarkingAllRead }] = useMarkAllNotificationsReadMutation();

  // Use WebSocket count if available, otherwise use API count
  const displayUnreadCount = isConnected ? wsUnreadCount : (unreadData?.count || 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync WebSocket count with API on disconnect
  useEffect(() => {
    if (!isConnected) {
      refetchUnread();
    }
  }, [isConnected, refetchUnread]);

  // Handle bell click
  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  // Handle mark all as read
  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllRead().unwrap();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    setIsOpen(false);
    
    // Navigate based on notification type
    if (notification.article_slug) {
      navigate(`/article/${notification.article_slug}`);
    } else if (notification.type === 'verification') {
      navigate('/settings');
    } else {
      navigate('/notifications');
    }
  };

  // Handle view all click
  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  // Don't render if user is not authenticated
  if (!user) return null;

  const recentNotifications = notificationsData?.results?.slice(0, 5) || [];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2.5 text-gray-400 hover:text-primary hover:bg-[#F7FAFC] rounded-xl transition-all group"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread Badge */}
        {displayUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 shadow-sm shadow-accent/30 animate-in zoom-in duration-200">
            {displayUnreadCount > 99 ? '99+' : displayUnreadCount}
          </span>
        )}

        {/* Connection Status Indicator (subtle) */}
        {isConnected && (
          <span className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-96 bg-white rounded-[2rem] shadow-2xl shadow-slate-300/50 border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary tracking-tight">Notifications</h3>
                <p className="text-xs text-gray-400">
                  {displayUnreadCount > 0 
                    ? `${displayUnreadCount} unread` 
                    : 'No new notifications'}
                </p>
              </div>
            </div>
            
            {displayUnreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isMarkingAllRead}
                className="p-2 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-xl transition-all disabled:opacity-50"
                title="Mark all as read"
              >
                {isMarkingAllRead ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCheck className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notificationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-accent animate-spin" />
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="p-3 space-y-1">
                {recentNotifications.map((notification) => (
                  <MiniNotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-[#F7FAFC] rounded-full flex items-center justify-center text-gray-200 mb-4">
                  <Bell className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-gray-400">No notifications yet</p>
                <p className="text-xs text-gray-300 mt-1">
                  We'll notify you when something happens
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-50 bg-[#F7FAFC]/50">
            <button
              onClick={handleViewAll}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-primary hover:bg-white hover:shadow-sm transition-all group"
            >
              View All Notifications
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
