import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Search,
  Bell,
  Plus,
  LayoutDashboard,
  FileText,
  BarChart2,
  CheckCircle,
  Edit,
  Eye,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MoreHorizontal,
  Users,
  BookOpen,
  BellRing,
  X,
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  useGetAdminUsersQuery,
  useGetAdminArticlesQuery,
  useGetAdminStatsQuery,
  useGetJournalsQuery,
  useSendNotificationMutation,
  useAdminPublishArticleMutation,
  useAcceptArticleMutation,
  useRejectArticleMutation,
  useAdminNominateJournalMutation,
  useGetAdminArticleJournalRecommendationsQuery,
} from '../api/baseApi';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users', 'articles', 'journals', 'notifications'
  
  // Notification form state
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [sendNotification] = useSendNotificationMutation();
  const [adminPublishArticle] = useAdminPublishArticleMutation();
  const [acceptArticle] = useAcceptArticleMutation();
  const [rejectArticle] = useRejectArticleMutation();
  const [adminNominateJournal] = useAdminNominateJournalMutation();
  
  const [reviewModal, setReviewModal] = useState({ open: false, article: null });
  const [nominateModal, setNominateModal] = useState({ open: false, article: null });
  const [rejectionMessage, setRejectionMessage] = useState('');

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useGetAdminUsersQuery();
  const { data: articlesData, isLoading: articlesLoading, refetch: refetchArticles } = useGetAdminArticlesQuery();
  const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery();
  const { data: journalsData, isLoading: journalsLoading, refetch: refetchJournals } = useGetJournalsQuery();

  // Chart Data - Articles by Major (Doughnut)
  const doughnutData = {
    labels: stats?.articles_by_category?.map(cat => cat.name) || ['Engineering', 'Medical', 'Technology'],
    datasets: [{
      data: stats?.articles_by_category?.map(cat => cat.count) || [42, 35, 23],
      backgroundColor: ['#1A365D', '#319795', '#CBD5E0'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const doughnutOptions = {
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    maintainAspectRatio: false
  };

  // Chart Data - Published per Month (Bar)
  const barData = {
    labels: stats?.monthly_articles?.map(m => m.month) || ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'],
    datasets: [{
      label: 'Published',
      data: stats?.monthly_articles?.map(m => m.count) || [45, 52, 68, 42, 38, 48],
      backgroundColor: (context) => {
        const index = context.dataIndex;
        return index === 2 ? '#1A365D' : '#F0F4F8'; // Highlight March
      },
      borderRadius: 6,
      borderSkipped: false,
    }]
  };

  const barOptions = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: { display: false }
    },
    maintainAspectRatio: false
  };

  // Chart Data - Active Authors (Line)
  const lineData = {
    labels: stats?.weekly_activity?.map(w => w.week) || ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    datasets: [{
      label: 'Articles',
      data: stats?.weekly_activity?.map(w => w.count) || [30, 45, 60, 55, 70, 65, 90, 85],
      borderColor: '#1A365D',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
      fill: true,
      backgroundColor: 'rgba(26, 54, 93, 0.05)',
    }]
  };

  const lineOptions = {
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { display: false }
    },
    maintainAspectRatio: false
  };
  
  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: notificationTitle,
        message: notificationMessage,
        ...(sendToAll ? { send_to_all: true } : { user_id: parseInt(selectedUserId) }),
      };
      await sendNotification(payload).unwrap();
      alert('Notification sent successfully!');
      // Reset form
      setNotificationTitle('');
      setNotificationMessage('');
      setSelectedUserId('');
      setSendToAll(true);
    } catch (err) {
      console.error('Failed to send notification:', err);
      alert('Failed to send notification: ' + (err?.data?.error || err?.message));
    }
  };

  const calculateCostCoverage = (points) => {
    if (!points) return 0;
    if (points >= 100) return 20;
    if (points >= 200) return 40;
    if (points >= 500) return 60;
    if (points >= 1000) return 100;
    return 0;
  };

  return (
    <div className="flex h-screen bg-zinc-100 text-slate-800 font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-slate-100 flex flex-col shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-lg font-bold tracking-wide text-indigo-300">Super Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Users className="w-4 h-4" />
            Users Management
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition ${activeTab === 'articles' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <FileText className="w-4 h-4" />
            Manuscripts & Data
          </button>

          <button
            onClick={() => setActiveTab('journals')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition ${activeTab === 'journals' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <BookOpen className="w-4 h-4" />
            Academic Journals
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition ${activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <BellRing className="w-4 h-4" />
            Notifications System
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-4 rounded-lg text-xs transition font-semibold text-center"
          >
            Exit Dashboard
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-zinc-200 h-16 flex items-center justify-between px-8">
          <div>
            <div className="text-xs font-semibold text-indigo-700 uppercase tracking-widest">Super Administration</div>
            <h1 className="text-xl font-bold text-slate-900">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'users' && 'Users Management'}
              {activeTab === 'articles' && 'Manuscripts & Data'}
              {activeTab === 'journals' && 'Academic Journals'}
              {activeTab === 'notifications' && 'Notifications System'}
            </h1>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              {/* Top Header Section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h1 className="text-3xl font-serif font-bold text-primary tracking-tight">Dashboard Overview</h1>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Articles by Major Chart */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-primary">Articles by Major</h3>
                    <button className="text-gray-300 hover:text-primary"><MoreHorizontal className="w-5 h-5" /></button>
                  </div>
                  <div className="relative h-48 mb-8">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-bold text-primary leading-none">{stats?.total_articles || 842}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {stats?.articles_by_category?.map((cat, index) => (
                      <div key={cat.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#1A365D', '#319795', '#CBD5E0'][index] || '#1A365D' }}></div>
                          <span className="font-bold text-gray-500">{cat.name}</span>
                        </div>
                        <span className="font-bold text-primary">{cat.count}</span>
                      </div>
                    )) || (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                            <span className="font-bold text-gray-500">Engineering</span>
                          </div>
                          <span className="font-bold text-primary">42</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>
                            <span className="font-bold text-gray-500">Medical</span>
                          </div>
                          <span className="font-bold text-primary">35</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                            <span className="font-bold text-gray-500">Technology</span>
                          </div>
                          <span className="font-bold text-primary">23</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Published per Month Chart */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-primary">Published per Month</h3>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">Last 6 Months</span>
                  </div>
                  <div className="flex-1 min-h-[200px]">
                    <Bar data={barData} options={barOptions} />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-4 px-2">
                    {barData.labels.map(label => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                </div>

                {/* Active Authors Chart */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-primary">Platform Activity</h3>
                    <div className="flex items-center gap-1 text-green-500">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs font-bold">12.5%</span>
                    </div>
                  </div>
                  <div className="flex-1 min-h-[160px] -mx-4">
                    <Line data={lineData} options={lineOptions} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">This Quarter</p>
                      <p className="text-xl font-bold text-primary">{stats?.quarterly_reviews || 2482}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Reviews</p>
                      <p className="text-xl font-bold text-primary">{stats?.total_reviews || 842}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-primary">{stats?.total_users || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Published Articles</p>
                  <p className="text-2xl font-bold text-primary">{stats?.published || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Under Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats?.under_review || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Articles</p>
                  <p className="text-2xl font-bold text-primary">{stats?.total_articles || 0}</p>
                </div>
              </div>

              {/* Recent Articles & Recent Accounts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                {/* Recent Articles */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-primary">Recent Articles</h3>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold" onClick={() => setActiveTab('articles')}>
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(Array.isArray(articlesData) ? articlesData : articlesData?.results || articlesData?.data || []).slice(0,5).map((article) => (
                      <div key={article.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                        <div>
                          <p className="font-bold text-gray-900">{article.title}</p>
                          <p className="text-[10px] text-gray-500 mt-1">By: {typeof article.author === 'object' ? article.author.username : article.author || 'Unknown'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          article.status === 'published' ? 'bg-green-100 text-green-800' :
                          article.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {article.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Accounts */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-primary">Recent Accounts</h3>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold" onClick={() => setActiveTab('users')}>
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(Array.isArray(usersData) ? usersData : usersData?.results || usersData?.data || []).slice(0,5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                        <div>
                          <p className="font-bold text-gray-900">{user.first_name} {user.last_name}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{user.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'reviewer' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-200 overflow-hidden">
                <div className="p-8 border-b border-zinc-200 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Registered Users</h2>
                  <button
                    className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
                    onClick={() => refetchUsers()}
                    disabled={usersLoading}
                  >
                    {usersLoading ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-50 border-b text-zinc-600 text-xs font-semibold uppercase">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Institution</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Points</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(Array.isArray(usersData) ? usersData : usersData?.results || usersData?.data || []).map((user) => (
                        <tr key={user.id} className="hover:bg-[#F8FAFC] transition-colors group">
                          <td className="px-8 py-6">
                            <p className="font-bold text-primary mb-1">{user.first_name} {user.last_name}</p>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">@{user.username}</p>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm font-bold text-gray-600">{user.email}</p>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm font-medium text-gray-500">{user.institution || '—'}</p>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${
                              user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'reviewer' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-8 py-6 font-semibold text-indigo-700">
                            {user.points?.total || 0}
                          </td>
                          <td className="px-8 py-6 text-center">
                            <button className="text-indigo-700 hover:text-indigo-900 font-semibold">
                              View Full Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="font-bold text-primary">Manuscripts</h3>
                <div className="flex items-center gap-3">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-bold text-gray-500 transition-all"
                    onClick={() => refetchArticles()}
                    disabled={articlesLoading}
                  >
                    {articlesLoading ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#FBFCFE]">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Article Title</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Author</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nominated Journal</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(Array.isArray(articlesData) ? articlesData : articlesData?.results || articlesData?.data || []).map((article) => (
                      <tr key={article?.slug || article?.id} className="hover:bg-[#F8FAFC] transition-colors group">
                        <td className="px-8 py-6">
                          <p className="font-bold text-primary mb-1 group-hover:text-accent transition-colors">{article?.title}</p>
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">ID: {article?.id || '—'}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-gray-600">{
                            typeof article?.author === 'object' ? article?.author?.username : article?.author || 'Unknown'
                          }</p>
                        </td>
                        <td className="px-8 py-6 text-indigo-700 font-semibold">
                          {
                            typeof article?.nominated_journal === 'object' ? article?.nominated_journal?.name : article?.nominated_journal || 'None'
                          }
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${
                            article?.status === 'published' ? 'bg-green-100 text-green-800' :
                            article?.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {article?.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={() => setReviewModal({ open: true, article })}
                              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Review
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  await adminPublishArticle(article.slug).unwrap();
                                  alert('Article published successfully!');
                                  refetchArticles();
                                } catch (err) {
                                  console.error('Failed to publish article:', err);
                                  alert('Failed to publish article: ' + (err?.data?.detail || err?.message));
                                }
                              }}
                              disabled={article.status !== 'nominated'}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                article.status === 'nominated' 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Publish
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Journals Tab */}
          {activeTab === 'journals' && (
            <div className="space-y-6">
              <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-200 overflow-hidden">
                <div className="p-8 border-b border-zinc-200 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Academic Journals</h2>
                  <button
                    className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
                    onClick={() => refetchJournals()}
                    disabled={journalsLoading}
                  >
                    {journalsLoading ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-50 border-b text-zinc-600 text-xs font-semibold uppercase">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Journal Name</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Field of Study</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Impact Factor</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Access Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(Array.isArray(journalsData) ? journalsData : journalsData?.results || journalsData?.data || []).map((journal) => (
                        <tr key={journal?.id || journal?.name} className="hover:bg-[#F8FAFC] transition-colors group">
                          <td className="px-8 py-6 font-bold text-primary">{journal?.name}</td>
                          <td className="px-8 py-6 text-gray-500">{journal?.field_of_study}</td>
                          <td className="px-8 py-6 font-bold text-yellow-600">{journal?.impact_factor ?? '—'}</td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${
                              journal?.publication_type === 'open_access' ? 'bg-teal-100 text-teal-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {journal?.publication_type === 'open_access' ? 'Open Access' : 'Subscription'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-200 p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Send Notifications</h2>
              <form onSubmit={handleSendNotification} className="space-y-4 max-w-2xl">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Title</label>
                  <input 
                    type="text" 
                    required 
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)} 
                    className="w-full p-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="Notification title"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Message</label>
                  <textarea 
                    required 
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    className="w-full p-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={4}
                    placeholder="Notification message"
                  ></textarea>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Recipients</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="recipient" 
                        checked={sendToAll}
                        onChange={(e) => setSendToAll(e.target.checked)}
                      />
                      Send to all users
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="recipient" 
                        checked={!sendToAll}
                        onChange={(e) => setSendToAll(!e.target.checked)}
                      />
                      Send to specific user
                    </label>
                  </div>
                  {!sendToAll && (
                    <select 
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="mt-2 w-full p-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      required={!sendToAll}
                    >
                      <option value="">Select a user...</option>
                      {(Array.isArray(usersData) ? usersData : usersData?.results || usersData?.data || []).map(user => (
                        <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.username})</option>
                      ))}
                    </select>
                  )}
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-semibold"
                >
                  Send Notification
                </button>
              </form>
            </div>
          )}

          {/* Review Modal */}
          {reviewModal.open && reviewModal.article && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between">
                  <h2 className="text-2xl font-serif font-bold text-primary">Review Article</h2>
                  <button 
                    onClick={() => setReviewModal({ open: false, article: null })}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-8 space-y-8">
                  {/* Article Header */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-1.5 bg-accent/5 text-accent text-[10px] font-bold rounded-full uppercase tracking-widest">
                        {reviewModal.article.category_name || reviewModal.article?.category?.name || 'Uncategorized'}
                      </span>
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-primary">{reviewModal.article.title}</h3>
                  </div>
                  
                  {/* Abstract */}
                  {reviewModal.article.abstract && (
                    <section className="bg-[#F7FAFC] p-8 rounded-[2rem] border border-gray-100">
                      <p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Abstract</p>
                      <p className="text-gray-700 italic text-lg">{reviewModal.article.abstract}</p>
                    </section>
                  )}
                  
                  {/* Content */}
                  {reviewModal.article.content && (
                    <section>
                      <p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Content</p>
                      <div className="prose prose-slate max-w-none">
                        <ReactMarkdown>{reviewModal.article.content}</ReactMarkdown>
                      </div>
                    </section>
                  )}
                  
                  {/* PDF File */}
                  {reviewModal.article.pdf_file && (
                    <div className="pt-4">
                      <a 
                        href={reviewModal.article.pdf_file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-accent hover:bg-[#287E7B] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all"
                      >
                        <Download className="w-5 h-5" />
                        Download PDF
                      </a>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="pt-8 border-t border-gray-100 flex flex-col gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Rejection Reason</label>
                      <textarea
                        value={rejectionMessage}
                        onChange={(e) => setRejectionMessage(e.target.value)}
                        placeholder="Enter a reason for rejecting this article (optional)"
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={async () => {
                          try {
                            await rejectArticle({
                              slug: reviewModal.article.slug,
                              rejection_reason: rejectionMessage
                            }).unwrap();
                            alert('Article rejected successfully!');
                            refetchArticles();
                            setReviewModal({ open: false, article: null });
                            setRejectionMessage('');
                          } catch (err) {
                            console.error('Failed to reject article:', err);
                            alert('Failed to reject article: ' + (err?.data?.detail || err?.message));
                          }
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold transition-all"
                      >
                        Reject Article
                      </button>
                      
                      <button
                        onClick={async () => {
                          try {
                            await acceptArticle(reviewModal.article.slug).unwrap();
                            alert('Article accepted successfully!');
                            refetchArticles();
                            setReviewModal({ open: false, article: null });
                            setNominateModal({ open: true, article: reviewModal.article });
                          } catch (err) {
                            console.error('Failed to accept article:', err);
                            alert('Failed to accept article: ' + (err?.data?.detail || err?.message));
                          }
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold transition-all"
                      >
                        Accept Article
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nominate Journal Modal */}
          {nominateModal.open && nominateModal.article && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <NominateJournalModal 
                article={nominateModal.article} 
                onClose={() => setNominateModal({ open: false, article: null })} 
                onSuccess={() => {
                  refetchArticles();
                  setNominateModal({ open: false, article: null });
                }}
                calculateCostCoverage={calculateCostCoverage}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const NominateJournalModal = ({ article, onClose, onSuccess, calculateCostCoverage }) => {
  const [selectedJournalId, setSelectedJournalId] = useState('');
  const { data: recommendationsData } = useGetAdminArticleJournalRecommendationsQuery(article.slug);
  const [adminNominateJournal] = useAdminNominateJournalMutation();
  
  const allJournals = useGetJournalsQuery();
  const journals = recommendationsData?.recommendations || (Array.isArray(allJournals.data) ? allJournals.data : allJournals.data?.results || allJournals.data?.data || []);
  
  const authorPoints = typeof article.author === 'object' ? article.author.points?.total : 0;
  const coveragePercent = calculateCostCoverage(authorPoints);
  
  return (
    <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-primary">Nominate Journal</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-8 space-y-8">
        {/* Author Points */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-gray-100">
          <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-2">Author Points</p>
          <p className="text-4xl font-bold text-primary">{authorPoints || 0} <span className="text-lg font-medium text-gray-500">pts</span></p>
          <p className="text-sm text-gray-600 mt-2">Cost Coverage: <span className="font-bold text-green-700">{coveragePercent}%</span></p>
        </div>
        
        {/* Journals List */}
        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-700 uppercase tracking-widest">Select Journal</p>
          <div className="space-y-4">
            {journals.map(journal => (
              <div 
                key={journal.id} 
                onClick={() => setSelectedJournalId(journal.id)} 
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedJournalId == journal.id 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-primary text-lg">{journal.name || journal.title}</p>
                    <p className="text-sm text-gray-500">{journal.field_of_study}</p>
                  </div>
                  <div className="text-right">
                    {journal.impact_factor && (
                      <p className="text-sm font-bold text-yellow-700">IF: {journal.impact_factor}</p>
                    )}
                    {journal.publication_fee && (
                      <p className="text-sm text-gray-500">Fee: ${(parseFloat(journal.publication_fee) || 0).toFixed(2)}</p>
                    )}
                  </div>
                </div>
                
                {selectedJournalId == journal.id && journal.publication_fee && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">Cost Breakdown</p>
                      <div className="flex gap-6 mt-2">
                        <span className="text-sm">
                          Total: <span className="font-bold text-primary">${(parseFloat(journal.publication_fee) || 0).toFixed(2)}</span>
                        </span>
                        <span className="text-sm">
                          Coverage: <span className="font-bold text-green-700">{coveragePercent}%</span>
                        </span>
                        <span className="text-sm">
                          User Pays: <span className="font-bold text-indigo-700">
                            ${((parseFloat(journal.publication_fee) || 0) * (1 - coveragePercent / 100)).toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <button
          disabled={!selectedJournalId}
          onClick={async () => {
            try {
              await adminNominateJournal({
                slug: article.slug,
                journal_id: selectedJournalId
              }).unwrap();
              alert('Journal nominated successfully!');
              onSuccess();
            } catch (err) {
              console.error('Failed to nominate journal:', err);
              alert('Failed to nominate journal: ' + (err?.data?.detail || err?.message));
            }
          }}
          className={`w-full px-8 py-4 rounded-xl font-bold transition-all ${
            selectedJournalId ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Nominate Journal
        </button>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
