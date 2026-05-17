import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  User, 
  CheckCheck, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  TrendingUp, 
  AtSign, 
  Radio, 
  ShieldCheck,
  Loader2,
  BookOpen,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { 
  useGetNotificationsQuery, 
  useMarkAllNotificationsReadMutation, 
  useMarkNotificationReadMutation,
  useGetUnreadNotificationsCountQuery
} from '../api/baseApi';
import { Link, useNavigate } from 'react-router-dom';
import useWebSocketNotifications from '../hooks/useWebSocketNotifications';

// Sub-component: Notification Card
const NotificationCard = ({ notification, onMarkRead }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (notification.type === 'manuscript' && notification.article_slug) {
      navigate(`/article/${notification.article_slug}`);
    } else if (notification.type === 'comment' && notification.article_slug) {
      navigate(`/article/${notification.article_slug}#comments`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'manuscript': return <FileText className="w-5 h-5 text-primary" />;
      case 'comment': return <MessageSquare className="w-5 h-5 text-primary" />;
      case 'verification': return <CheckCircle2 className="w-5 h-5 text-primary" />;
      case 'milestone': return <TrendingUp className="w-5 h-5 text-primary" />;
      default: return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const getActionText = (type) => {
    switch (type) {
      case 'manuscript': return 'View Article';
      case 'comment': return 'Reply to Comment';
      default: return null;
    }
  };

  return (
    <div 
      className={`relative group p-8 rounded-[2rem] transition-all duration-300 border-2
        ${notification.is_read 
          ? 'bg-[#F7FAFC]/50 border-transparent grayscale-[0.5] opacity-80' 
          : 'bg-white border-accent/20 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50'
        }`}
    >
      <div className="flex gap-6">
        {/* Left Icon Container */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
          ${notification.is_read ? 'bg-gray-100' : 'bg-[#EBF1FF]'}
        `}>
          {getIcon(notification.type)}
        </div>

        {/* Content Container */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className={`text-lg font-bold tracking-tight leading-tight ${notification.is_read ? 'text-gray-500' : 'text-primary'}`}>
              {notification.title}
            </h3>
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap ml-4">
              {notification.created_at_formatted || '2 minutes ago'}
            </span>
          </div>

          <p className={`text-sm leading-relaxed font-medium tracking-tight ${notification.is_read ? 'text-gray-400' : 'text-gray-500'}`}>
            {notification.description}
          </p>

          <div className="flex items-center gap-4 pt-2">
            {getActionText(notification.type) && (
              <button 
                onClick={handleAction}
                className="bg-primary hover:bg-[#152c4d] text-white px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-md shadow-primary/10"
              >
                {getActionText(notification.type)}
              </button>
            )}
            {!notification.is_read && (
              <button 
                onClick={() => onMarkRead(notification.id)}
                className="text-[10px] font-bold text-gray-400 hover:text-primary uppercase tracking-widest transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>

        {/* Unread Indicator */}
        {!notification.is_read && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <div className="w-2.5 h-2.5 bg-accent rounded-full shadow-sm shadow-accent/40" />
          </div>
        )}
      </div>
    </div>
  );
};

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [params, setParams] = useState({ page: 1 });
  
  // WebSocket for real-time notifications
  const { 
    isConnected, 
    unreadCount: wsUnreadCount, 
    lastMessage,
    connect,
    disconnect 
  } = useWebSocketNotifications();
  
  const { data: notificationsData, isLoading, isFetching, refetch } = useGetNotificationsQuery({ 
    ...params, 
    type: activeTab !== 'all' ? activeTab : undefined 
  });
  const { data: unreadData, refetch: refetchUnread } = useGetUnreadNotificationsCountQuery();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [markRead] = useMarkNotificationReadMutation();

  // Refetch when new notification arrives via WebSocket
  useEffect(() => {
    if (lastMessage) {
      refetch();
      refetchUnread();
    }
  }, [lastMessage, refetch, refetchUnread]);

  const handleLoadPrevious = () => {
    setParams(prev => ({ ...prev, page: prev.page + 1 }));
  };

  // Use WebSocket count if connected, otherwise API count
  const displayUnreadCount = isConnected ? wsUnreadCount : (unreadData?.count || 0);

  const sidebarItems = [
    { id: 'all', label: 'All Notifications', icon: Bell, badge: displayUnreadCount },
    { id: 'mentions', label: 'Mentions', icon: AtSign },
    { id: 'research', label: 'Research Updates', icon: BookOpen },
    { id: 'system', label: 'System', icon: Radio },
  ];

  const demoNotifications = [
    {
      id: 1,
      type: 'manuscript',
      title: 'New Manuscript Submission',
      description: 'Dr. Aris Thorne has submitted a new preprint: "Quantum Entanglement in Biological Systems: A Meta-Analysis".',
      created_at_formatted: '2 minutes ago',
      is_read: false
    },
    {
      id: 2,
      type: 'comment',
      title: 'New Comment on your Abstract',
      description: 'Professor Elena Vance commented on your recent publication regarding neural plasticity and cognitive load.',
      created_at_formatted: '45 minutes ago',
      is_read: false
    },
    {
      id: 3,
      type: 'verification',
      title: 'Verification Successful',
      description: 'Your institutional credentials have been successfully verified by the University of Oxford administration.',
      created_at_formatted: '3 hours ago',
      is_read: true
    },
    {
      id: 4,
      type: 'milestone',
      title: 'Milestone Reached',
      description: 'Your paper "Sustainable Urban Planning" has surpassed 500 citations this month. Congratulations!',
      created_at_formatted: 'Yesterday',
      is_read: true
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 2. Left Sidebar */}
      <aside className="lg:w-80 shrink-0 space-y-12">
        <div>
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em] mb-8">Categories</p>
          <div className="space-y-3">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300
                  ${activeTab === item.id 
                    ? 'bg-[#EBF1FF] text-primary shadow-sm' 
                    : 'text-gray-500 hover:bg-white hover:text-primary hover:shadow-sm'}
                `}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-primary' : 'text-gray-300'}`} />
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Digest Settings Card */}
        <div className="bg-[#EBF1FF] p-10 rounded-[2.5rem] space-y-6 border border-primary/5">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-primary tracking-tight">Digest Settings</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed opacity-80">
              Receive a weekly summary of your institutional impact and network activity.
            </p>
          </div>
          <button className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline transition-all">
            Manage Preferences
          </button>
        </div>
      </aside>

      {/* 4. Main Content Area */}
      <main className="flex-1 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-serif font-bold text-primary tracking-tight italic">Notifications</h1>
              {/* Live Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 rounded-full border border-accent/20">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Live</span>
              </div>
              
              {/* WebSocket Connection Status */}
              <div 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                  isConnected 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
                title={isConnected ? 'Real-time connection active' : 'Using polling (reconnecting...)'}
              >
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-500" />
                    <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">Real-time</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-gray-400" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Polling</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-gray-400 font-medium italic">Stay updated with your latest academic interactions and repository status.</p>
          </div>

          <button 
            onClick={() => markAllRead()}
            className="bg-accent hover:bg-[#287E7B] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-teal-500/20"
          >
            <CheckCheck className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest">Mark All as Read</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-8">
          {isLoading || isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Syncing Archives...</p>
            </div>
          ) : (notificationsData?.results?.length > 0 ? notificationsData.results : demoNotifications).map((notif) => (
            <NotificationCard 
              key={notif.id} 
              notification={notif} 
              onMarkRead={(id) => markRead(id)} 
            />
          ))}
        </div>

        {/* 5. Load Previous Notifications Button */}
        <div className="pt-8 flex justify-center">
          <button 
            onClick={handleLoadPrevious}
            disabled={isFetching}
            className="bg-[#EBF1FF] hover:bg-white text-primary px-12 py-5 rounded-[2rem] font-bold text-sm tracking-tight transition-all border border-transparent hover:border-primary/10 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {isFetching ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Load Previous Notifications
          </button>
        </div>
      </main>

    </div>
  );
};

export default Notifications;
