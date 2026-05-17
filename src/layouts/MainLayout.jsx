import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  // Hide sidebar on admin routes - admin dashboard has its own sidebar
  const isAdminRoute = location.pathname.startsWith('/admin');
  const showSidebar = !isAdminRoute;

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col font-sans text-text">
      {/* Top Navigation - Hidden on admin routes */}
      {!isAdminRoute && <Navbar />}

      <div className="flex flex-1 relative">
        {/* Fixed Left Sidebar - Hidden on admin routes */}
        {showSidebar && <Sidebar />}

        {/* Dynamic Main Content Area */}
        <main className={`flex-1 overflow-y-auto animate-in fade-in duration-500 ${
          showSidebar 
            ? 'p-8 md:p-12 lg:p-16 max-w-[1600px] mx-auto w-full' 
            : 'w-full'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
