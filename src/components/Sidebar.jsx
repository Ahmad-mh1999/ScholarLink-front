import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Compass,
  FileText,
  Bookmark,
  Users,
  Trophy,
  Medal,
  Hash,
  ChevronRight,
  PlusCircle,
  ShieldCheck,
  Settings,
  Shield,
  Upload,
  BarChart3,
  UserCog,
  FolderOpen
} from 'lucide-react';
import { useGetCategoriesQuery } from '../api/baseApi';

const Sidebar = () => {
  const {
    isAuthenticated,
    isAdmin,
    isModerator,
    isReviewer,
    isUser,
    isAdminOrModerator,
    isReviewerOrAdmin,
    canAccessAdminDashboard,
    canAccessReviewerPortal,
    canAccessModeration,
    canManageUsers,
    user,
    userRole
  } = useAuth();


  const { data: categoriesData } = useGetCategoriesQuery();
  
  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : Array.isArray(categoriesData?.results)
      ? categoriesData.results
      : [];

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Explore', icon: Compass, path: '/explore' },
    { label: 'My Articles', icon: FileText, path: '/my-articles' },
    { label: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
    { label: 'Peer Review Inbox', icon: Users, path: '/peer-review' },
    { label: 'My Points', icon: Trophy, path: '/points/my' },
    { label: 'Leaderboard', icon: Medal, path: '/leaderboard' },
  ];

  const reviewerItems = [
    { label: 'Reviewer Dashboard', icon: ShieldCheck, path: '/reviewer/dashboard' },
  ];

  // ==================== ROLE-BASED NAVIGATION ITEMS ====================

  // Base navigation items (available to all authenticated users)
  const baseNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Explore', icon: Compass, path: '/explore' },
    { label: 'My Articles', icon: FileText, path: '/my-articles' },
    { label: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
    { label: 'My Points', icon: Trophy, path: '/points/my' },
    { label: 'Leaderboard', icon: Medal, path: '/leaderboard' },
  ];

  // Reviewer-specific items
  const reviewerNavItems = [
    { label: 'Peer Review Inbox', icon: Users, path: '/peer-review', roles: ['reviewer', 'admin'] },
    { label: 'My Reviews', icon: ShieldCheck, path: '/my-reviews', roles: ['reviewer', 'admin'] },
    { label: 'Reviewer Dashboard', icon: ShieldCheck, path: '/reviewer/dashboard', roles: ['reviewer', 'admin'] },
  ];

  // Moderator-specific items
  const moderatorNavItems = [
    { label: 'Moderation Dashboard', icon: Shield, path: '/moderation/dashboard', roles: ['moderator', 'admin'] },
    { label: 'Content Moderation', icon: Shield, path: '/moderation/content', roles: ['moderator', 'admin'] },
  ];

  // Admin-specific items
  const adminNavItems = [
    { label: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', roles: ['admin'] },
  ];

  // Build the complete navigation array based on user role
  const allNavItems = [
    ...(isAdmin() ? [] : baseNavItems),
    ...(isReviewerOrAdmin() && !isAdmin() ? reviewerNavItems : []),
    ...(isAdminOrModerator() && !isAdmin() ? moderatorNavItems : []),
    ...(isAdmin() ? adminNavItems : []),
  ];


  // ==================== CONDITIONAL RENDERING ====================

  // Don't show sidebar if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside className="w-80 h-[calc(100vh-80px)] bg-white border-r border-gray-100 flex flex-col p-8 overflow-y-auto sticky top-20 scrollbar-hide">

      {/* Admin Mode Banner */}
      {isAdmin() && (
        <div className="mb-6 p-4 bg-gradient-to-br from-primary to-primary/90 rounded-2xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-accent" />
            <span className="text-xs font-bold uppercase tracking-widest">Admin Mode</span>
          </div>
          <NavLink 
            to="/admin/dashboard" 
            className="block w-full bg-accent hover:bg-accent/90 text-white py-2.5 rounded-xl font-bold text-sm text-center transition-all"
          >
            Open Admin Dashboard
          </NavLink>
        </div>
      )}

      {/* Action Button: Create New (Available to all authenticated users) */}
      {!isAdmin() && (
        <NavLink to="/submit" className="w-full bg-accent hover:bg-[#287E7B] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mb-10 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-teal-500/20">
          <PlusCircle className="w-5 h-5" />
          <span>Publish Research</span>
        </NavLink>
      )}

      {/* Main Navigation - Role-based menu */}
      <div className="space-y-2 mb-10">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Navigation</p>
        {allNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200
              ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-gray-500 hover:bg-[#F7FAFC] hover:text-primary'}
            `}
          >
            <div className="flex items-center gap-4">
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 opacity-0 group-hover:opacity-100`} />
          </NavLink>
        ))}
      </div>

      {/* Categories Section */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Top Categories</p>
        {categories.map((category) => (
          <NavLink
            key={category.slug || category.id}
            to={`/category/${category.slug}`}
            className="flex items-center gap-4 px-4 py-3 text-sm font-bold text-gray-500 hover:text-primary hover:bg-[#F7FAFC] rounded-2xl transition-all group"
          >
            <Hash className="w-4 h-4 text-gray-300 group-hover:text-accent transition-colors" />
            <span className="tracking-tight">{category.name || category}</span>
          </NavLink>
        ))}
      </div>

      {/* Footer / App Version (Optional) */}
      <div className="mt-auto pt-10 text-center">
        <p className="text-[10px] text-gray-300 font-medium uppercase tracking-widest">[Platform Name] v1.0.4</p>
      </div>
    </aside>
  );
};

export default Sidebar;
