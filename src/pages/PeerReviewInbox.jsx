import React, { useState } from 'react';
import { 
  FileText, 
  Library, 
  Settings, 
  Plus, 
  HelpCircle, 
  Inbox, 
  Star, 
  Users, 
  Filter, 
  ListFilter
} from 'lucide-react';
import { 
  useGetReviewDashboardQuery, 
  useRespondToReviewRequestMutation 
} from '../api/baseApi';
import { Link } from 'react-router-dom';
import IncomingRequests from './PeerReview/IncomingRequests';
import MyReviews from './PeerReview/MyReviews';

const PeerReviewInbox = () => {
  const [activeTab, setActiveTab] = useState('incoming');
  const { data: dashboardData, isLoading, isFetching } = useGetReviewDashboardQuery();
  const [respondToRequest] = useRespondToReviewRequestMutation();

  const sidebarNav = [
    { label: 'Reviews', icon: Inbox, path: '/peer-review', active: true },
    { label: 'Submissions', icon: FileText, path: '/my-articles' },
    { label: 'Library', icon: Library, path: '/explore' },
    { label: 'Settings', icon: Settings, path: '/profile' },
  ];

  const handleRespond = async (id, action) => {
    try {
      await respondToRequest({ id, action }).unwrap();
    } catch (err) {
      console.error('Failed to respond to request:', err);
    }
  };

  // Demo data fallback for My Reviews
  const demoReviews = [
    { id: 101, title: 'Impact of Quantum Computing on Data Security', status: 'in_progress', views_count: 450, updated_at_formatted: '2 hours ago', slug: 'quantum-sec', role: 'Reviewer' },
    { id: 102, title: 'CRISPR-Cas9 Interventions for Genetic Resiliency', status: 'completed', views_count: 1200, updated_at_formatted: '3 days ago', slug: 'crispr-3', role: 'Author' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Left Sidebar (Internal Page Navigation) */}
      <aside className="lg:w-72 shrink-0 space-y-12">
        <div className="space-y-2">
          <h2 className="text-xl font-serif font-bold text-primary tracking-tight">The Digital Atelier</h2>
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Curated Archive</p>
        </div>

        <nav className="space-y-3">
          {sidebarNav.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300
                ${item.active 
                  ? 'bg-white text-primary shadow-lg shadow-slate-200/50 border border-gray-50' 
                  : 'text-gray-400 hover:text-primary hover:bg-white'}
              `}
            >
              <item.icon className={`w-5 h-5 ${item.active ? 'text-accent' : ''}`} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-12 space-y-6">
          <Link to="/submit" className="w-full bg-primary hover:bg-[#152c4d] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20">
            <Plus className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest">New Submission</span>
          </Link>
          <button className="flex items-center gap-3 text-gray-400 hover:text-primary transition-colors px-6">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-bold tracking-tight">Support</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 space-y-12">
        <div className="space-y-4">
          <h1 className="text-5xl font-serif font-bold text-primary tracking-tight">Peer Review Inbox</h1>
          <p className="text-gray-400 font-medium italic max-w-2xl leading-relaxed">
            Manage your active scholarly evaluations and explore incoming invitations from the global research community.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-gray-100 pb-2">
          <div className="flex items-center gap-12">
            <button 
              onClick={() => setActiveTab('incoming')}
              className={`relative pb-4 text-sm font-bold uppercase tracking-widest transition-all
                ${activeTab === 'incoming' ? 'text-accent' : 'text-gray-300 hover:text-gray-500'}
              `}
            >
              Incoming Requests
              {activeTab === 'incoming' && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-accent rounded-full animate-in fade-in zoom-in duration-300" />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('my-reviews')}
              className={`relative pb-4 text-sm font-bold uppercase tracking-widest transition-all
                ${activeTab === 'my-reviews' ? 'text-accent' : 'text-gray-300 hover:text-gray-500'}
              `}
            >
              My Reviews / Submissions
              {activeTab === 'my-reviews' && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-accent rounded-full animate-in fade-in zoom-in duration-300" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-4 mb-2">
            <button className="p-2 text-gray-300 hover:text-primary transition-colors"><Filter className="w-5 h-5" /></button>
            <button className="p-2 text-gray-300 hover:text-primary transition-colors"><ListFilter className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'incoming' ? (
            <IncomingRequests 
              requests={dashboardData?.requests} 
              isLoading={isLoading || isFetching} 
              onRespond={handleRespond} 
            />
          ) : (
            <MyReviews 
              reviews={dashboardData?.my_reviews || demoReviews} 
              isLoading={isLoading || isFetching} 
            />
          )}
        </div>

        {/* Load More Button (Only for requests) */}
        {activeTab === 'incoming' && (dashboardData?.requests?.length > 0) && (
          <div className="flex justify-center pt-8">
            <button className="bg-[#EBF1FF] hover:bg-[#D9E6FF] text-primary px-12 py-5 rounded-[2rem] font-bold text-sm tracking-tight transition-all shadow-sm">
              Load Previous Notifications
            </button>
          </div>
        )}

        {/* 5. Bottom Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-12">
          {/* Total Reviews Card */}
          <div className="md:col-span-4 bg-primary p-10 rounded-[2.5rem] relative overflow-hidden group shadow-xl shadow-primary/20">
            <div className="relative z-10 space-y-6">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.3em]">Total Reviews</p>
              <h3 className="text-6xl font-serif font-bold text-white tracking-tighter italic">24</h3>
              <p className="text-xs text-blue-100/60 font-medium leading-relaxed">
                Ranked in the top 5% of contributors for the Physical Sciences department this year.
              </p>
            </div>
            <Star className="absolute bottom-[-20px] right-[-20px] w-32 h-32 text-white opacity-10 group-hover:scale-110 transition-transform duration-700" />
          </div>

          {/* Network Reach Card */}
          <div className="md:col-span-8 bg-[#EBF1FF] p-10 rounded-[2.5rem] border border-primary/5 flex items-center justify-between gap-12 group">
            <div className="space-y-8 flex-1">
              <div className="space-y-4">
                <h3 className="text-2xl font-serif font-bold text-primary tracking-tight">Scholar Network Reach</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-md">
                  Your reviews have helped shape <span className="text-primary font-bold underline decoration-accent underline-offset-4">12 major publications</span> in the last 6 months. Influence score updated.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-accent border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden">
                      <Users className="w-5 h-5" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">+14 Collaborators</span>
              </div>
            </div>
            
            {/* Progress Circle (Simplified) */}
            <div className="relative w-32 h-32 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364" strokeDashoffset="44" className="text-accent transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">88%</span>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default PeerReviewInbox;
