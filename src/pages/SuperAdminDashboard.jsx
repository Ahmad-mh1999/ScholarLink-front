/**
 * Super Admin Dashboard - Complete admin interface for ScholarLink
 * Features: Overview stats, user management, article management, peer review, categories
 */

import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Users,
  FileText,
  Search,
  Settings,
  Tag,
  BarChart3,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
  Shield,
  BookOpen,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  ChevronRight,
  LogOut,
  Loader2,
  Filter,
  Bell,
  Layers,
  ShieldCheck,
  Upload,
  X,
  Mail,
  GraduationCap
} from 'lucide-react';

// Import API hooks
import {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteUserMutation,
  useGetAdminArticlesQuery,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useModerateArticleMutation,
  useAssignReviewerMutation,
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../api/baseApi';

/**
 * Stats Card Component
 */
const StatsCard = ({ title, value, change, icon: Icon, color = 'primary' }) => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl bg-${color}/10 flex items-center justify-center`}>
        <Icon className={`w-6 h-6 text-${color}`} />
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
          change >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
    <h4 className="text-2xl font-bold text-primary">{value?.toLocaleString() || '0'}</h4>
  </div>
);

/**
 * Dashboard Overview Tab
 */
const DashboardOverview = () => {
  const { data: stats, isLoading } = useGetAdminStatsQuery();
  const { data: latestArticlesData } = useGetAdminArticlesQuery({ ordering: '-created_at', limit: 5 });
  const { data: latestUsersData } = useGetAdminUsersQuery({ ordering: '-date_joined', limit: 5 });

  const overviewStats = [
    {
      title: 'Total Users',
      value: stats?.total_users,
      icon: Users,
      color: 'primary'
    },
    {
      title: 'Total Articles',
      value: stats?.total_articles,
      icon: FileText,
      color: 'accent'
    },
    {
      title: 'Under Review',
      value: stats?.under_review,
      icon: Search,
      color: 'orange'
    },
    {
      title: 'Published',
      value: stats?.published,
      icon: BookOpen,
      color: 'green'
    }
  ];

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-bold text-primary mb-2">Loading Stats...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Articles */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary">Latest Articles</h3>
            <button className="text-sm text-accent font-medium hover:opacity-80">View All</button>
          </div>
          <div className="space-y-4">
            {latestArticlesData?.results?.map((article) => (
              <div key={article.slug} className="flex items-start gap-4 p-4 bg-[#F7FAFC] rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-primary truncate">{article.title}</p>
                  <p className="text-xs text-gray-500">{article.author_name} • {article.category_name}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(article.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary">Latest Users</h3>
            <button className="text-sm text-accent font-medium hover:opacity-80">View All</button>
          </div>
          <div className="space-y-4">
            {latestUsersData?.results?.map((user) => (
              <div key={user.id} className="flex items-center gap-4 p-4 bg-[#F7FAFC] rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-primary truncate">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user.role === 'reviewer' ? 'bg-blue-50 text-blue-600' :
                      user.role === 'moderator' ? 'bg-orange-50 text-orange-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {user.role}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(user.date_joined).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * User Management Tab
 */
const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const { data: usersData, isLoading, refetch } = useGetAdminUsersQuery({ 
    search: searchTerm,
    role: roleFilter === 'all' ? undefined : roleFilter
  });
  const [updateUser] = useUpdateAdminUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const usersList = useMemo(() => {
    if (!usersData) return [];
    if (Array.isArray(usersData)) return usersData;
    if (Array.isArray(usersData.results)) return usersData.results;
    return [];
  }, [usersData]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser({ id: userId, role: newRole }).unwrap();
      toast.success('User role updated');
      refetch();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleVerify = async (userId) => {
    try {
      await updateUser({ id: userId, is_verified: true }).unwrap();
      toast.success('User verified');
      refetch();
    } catch (err) {
      toast.error('Failed to verify user');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await updateUser({ id: userId, is_active: !currentStatus }).unwrap();
      toast.success(`User ${!currentStatus ? 'restored' : 'suspended'}`);
      refetch();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId).unwrap();
      toast.success('User deleted');
      refetch();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin mx-auto mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 bg-white p-6 rounded-3xl border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-[#F7FAFC] rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-6 py-3 bg-[#F7FAFC] rounded-2xl outline-none"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="reviewer">Reviewer</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#FBFCFE]">
            <tr>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verification</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {usersList.map((user) => (
              <tr key={user.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-primary">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="text-sm font-medium p-1 rounded bg-gray-50 border-none"
                  >
                    <option value="user">User</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    {user.is_verified ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleVerify(user.id)}
                        className="text-xs font-bold text-accent hover:underline"
                      >
                        Verify Now
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    user.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {user.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      className={`p-2 rounded-xl transition-all ${
                        user.is_active ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'
                      }`}
                      title={user.is_active ? 'Suspend' : 'Restore'}
                    >
                      {user.is_active ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Article Management Tab
 */
const ArticleManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: articlesData, isLoading, refetch } = useGetAdminArticlesQuery({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter
  });
  
  const [updateArticle] = useUpdateArticleMutation();
  const [deleteArticle] = useDeleteArticleMutation();
  const [moderateArticle] = useModerateArticleMutation();

  const articlesList = useMemo(() => {
    if (!articlesData) return [];
    if (Array.isArray(articlesData)) return articlesData;
    if (Array.isArray(articlesData.results)) return articlesData.results;
    return [];
  }, [articlesData]);

  const handleStatusChange = async (slug, newStatus) => {
    try {
      await moderateArticle({ slug, status: newStatus }).unwrap();
      toast.success(`Article ${newStatus}`);
      refetch();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await deleteArticle(slug).unwrap();
      toast.success('Article deleted');
      refetch();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin mx-auto mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 bg-white p-6 rounded-3xl border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-[#F7FAFC] rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-6 py-3 bg-[#F7FAFC] rounded-2xl outline-none"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="under_review">Under Review</option>
          <option value="draft">Draft</option>
          <option value="rejected">Rejected</option>
        </select>
        <Link 
          to="/submit" 
          className="px-6 py-3 bg-accent text-white rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-5 h-5" /> New Article
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FBFCFE]">
            <tr>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Article</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Author</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {articlesList.map((article) => (
              <tr key={article.slug} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-8 py-6">
                  <p className="font-bold text-primary truncate max-w-xs">{article.title}</p>
                  <p className="text-xs text-gray-400">{article.category_name}</p>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-medium text-gray-600">{article.author_name}</p>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    article.status === 'published' ? 'bg-green-50 text-green-600' :
                    article.status === 'under_review' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {article.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-center gap-2">
                    <Link to={`/article/${article.slug}`} className="p-2 text-primary hover:bg-primary/5 rounded-xl"><Eye className="w-5 h-5" /></Link>
                    <button onClick={() => handleDelete(article.slug)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Peer Review Tab
 */
const PeerReviewManagement = () => {
  const { data: pendingArticles, isLoading, refetch } = useGetAdminArticlesQuery({ status: 'under_review' });
  const [moderateArticle] = useModerateArticleMutation();
  const [assignReviewer] = useAssignReviewerMutation();

  const pendingList = useMemo(() => {
    if (!pendingArticles) return [];
    if (Array.isArray(pendingArticles)) return pendingArticles;
    if (Array.isArray(pendingArticles.results)) return pendingArticles.results;
    return [];
  }, [pendingArticles]);

  const handleModerate = async (slug, status) => {
    const feedback = status === 'rejected' ? window.prompt('Provide feedback for rejection:') : '';
    if (status === 'rejected' && feedback === null) return;

    try {
      await moderateArticle({ slug, status, feedback }).unwrap();
      toast.success(`Article ${status}`);
      refetch();
    } catch (err) {
      toast.error('Moderation failed');
    }
  };

  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin mx-auto mt-20" />;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-primary">Articles Pending Moderation</h2>
      <div className="grid grid-cols-1 gap-6">
        {pendingList.map((article) => (
          <div key={article.slug} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-primary text-lg mb-1">{article.title}</h3>
              <p className="text-sm text-gray-500 mb-2">by {article.author_name} • {article.category_name}</p>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.created_at).toLocaleDateString()}</span>
                {article.pdf_file && <a href={article.pdf_file} target="_blank" className="flex items-center gap-1 text-accent hover:underline"><FileText className="w-3 h-3" /> View PDF</a>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleModerate(article.slug, 'published')}
                className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all"
              >
                Approve & Publish
              </button>
              <button 
                onClick={() => handleModerate(article.slug, 'rejected')}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {pendingList.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No articles currently pending review.</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Categories Management Tab
 */
const CategoriesManagement = () => {
  const { data: categories, isLoading, refetch } = useGetAdminCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const categoriesList = useMemo(() => {
    if (!categories) return [];
    if (Array.isArray(categories)) return categories;
    if (Array.isArray(categories.results)) return categories.results;
    return [];
  }, [categories]);

  const handleAddCategory = async () => {
    const name = window.prompt('Category Name:');
    if (!name) return;
    const description = window.prompt('Description:');
    try {
      await createCategory({ name, description }).unwrap();
      toast.success('Category created');
      refetch();
    } catch (err) {
      toast.error('Failed to create category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await deleteCategory(id).unwrap();
      toast.success('Category deleted');
      refetch();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin mx-auto mt-20" />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">Manage Categories</h2>
        <button 
          onClick={handleAddCategory}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-bold hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesList.map((category) => (
          <div key={category.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group">
            <button 
              onClick={() => handleDelete(category.id)}
              className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
              <Tag className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-primary text-lg mb-1">{category.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{category.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent uppercase tracking-widest">{category.slug}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{category.article_count || 0} Articles</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// Main Super Admin Dashboard Component
const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.is_staff === true || user?.role === 'admin' || user?.role === 'super_admin';
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'reviews', label: 'Moderation', icon: ShieldCheck },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardOverview />;
      case 'users': return <UserManagement />;
      case 'articles': return <ArticleManagement />;
      case 'reviews': return <PeerReviewManagement />;
      case 'categories': return <CategoriesManagement />;
      case 'settings': return (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Settings className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary mb-2">System Settings</h3>
          <p className="text-gray-400 font-medium">Coming soon.</p>
        </div>
      );
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col fixed h-screen z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl">
            <BookOpen className="text-accent w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-primary tracking-tight leading-none">ScholarLink</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Super Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group
                ${activeTab === item.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-500 hover:bg-[#F7FAFC] hover:text-primary'}`}
            >
              <div className="flex items-center gap-4">
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-gray-50">
          <button 
            onClick={() => dispatch(logout())}
            className="flex items-center gap-4 text-red-500 font-bold text-sm hover:opacity-80 transition-opacity w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-72">
        <header className="h-20 bg-white border-b border-gray-100 px-12 flex items-center justify-between sticky top-0 z-40">
          <h2 className="text-lg font-bold text-primary capitalize">
            {sidebarItems.find(i => i.id === activeTab)?.label}
          </h2>

          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-bold text-gray-400 hover:text-primary transition-colors">Back to App</Link>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-primary leading-none mb-1">{user?.first_name || user?.username}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
