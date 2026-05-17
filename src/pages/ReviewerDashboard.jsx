import React from 'react';
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
  MoreHorizontal
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
import { useGetPendingReviewsQuery, useGetReviewerStatsQuery } from '../api/baseApi';

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

const ReviewerDashboard = () => {
  const { data: pendingReviews, isLoading: isPendingLoading } = useGetPendingReviewsQuery();
  const { data: stats, isLoading: isStatsLoading } = useGetReviewerStatsQuery();

  // Chart Data - Articles by Major (Doughnut)
  const doughnutData = {
    labels: stats?.articles_by_category?.map(cat => cat.category_name) || ['Engineering', 'Medical', 'Technology'],
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
    labels: stats?.monthly_reviews?.map(m => m.month) || ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'],
    datasets: [{
      label: 'Published',
      data: stats?.monthly_reviews?.map(m => m.count) || [45, 52, 68, 42, 38, 48],
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
      label: 'Authors',
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

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-3xl font-serif font-bold text-primary tracking-tight">Dashboard Overview</h1>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-accent hover:bg-[#287E7B] text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-teal-500/20">
            <Plus className="w-5 h-5" />
            New Submission
          </button>
        </div>
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
              <div key={cat.category_name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#1A365D', '#319795', '#CBD5E0'][index] || '#1A365D' }}></div>
                  <span className="font-bold text-gray-500">{cat.category_name}</span>
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
                  <span className="font-bold text-primary">42%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>
                    <span className="font-bold text-gray-500">Medical</span>
                  </div>
                  <span className="font-bold text-primary">35%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                    <span className="font-bold text-gray-500">Technology</span>
                  </div>
                  <span className="font-bold text-primary">23%</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Published per Month Chart */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-primary">Published per Month</h3>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">Jan - Jun</span>
          </div>
          <div className="flex-1 min-h-[200px]">
            <Bar data={barData} options={barOptions} />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-4 px-2">
            <span>JAN</span>
            <span>FEB</span>
            <span>MAR</span>
            <span>APR</span>
            <span>MAY</span>
            <span>JUN</span>
          </div>
        </div>

        {/* Active Authors Chart */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-primary">Active Authors</h3>
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

      {/* Pending Review Queue Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-primary">Pending Review Queue</h3>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-500 transition-all">
              <Download className="w-3 h-3" />
              Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-500 transition-all">
              <Filter className="w-3 h-3" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FBFCFE]">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Article Title</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Author</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Date Submitted</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Major</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { title: 'Neuro-plasticity in Pediatric...', id: '#MRS-2024-001', author: 'Dr. Sarah Chen', date: 'Oct 12, 2024', major: 'Medical', color: 'bg-blue-50 text-blue-500' },
                { title: 'Blockchain Applications in Suppl...', id: '#MRS-2024-042', author: 'Marcus Thorne', date: 'Oct 14, 2024', major: 'Technology', color: 'bg-purple-50 text-purple-500' },
                { title: 'Structural Integrity of Sustainab...', id: '#MRS-2024-108', author: 'Prof. Alistair Cook', date: 'Oct 15, 2024', major: 'Engineering', color: 'bg-orange-50 text-orange-500' },
                { title: 'AI-Driven Diagnostic Tools for...', id: '#MRS-2024-089', author: 'Elena Rodriguez', date: 'Oct 16, 2024', major: 'Medical', color: 'bg-blue-50 text-blue-500' },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-[#F8FAFC] transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-bold text-primary mb-1 group-hover:text-accent transition-colors">{item.title}</p>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">ID: {item.id}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-gray-600">{item.author}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <p className="text-sm font-medium text-gray-500">{item.date}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${item.color}`}>
                      {item.major}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-3">
                      <button className="flex items-center gap-2 bg-accent hover:bg-[#287E7B] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </button>
                      <button className="p-2 text-green-500 bg-green-50 hover:bg-green-100 rounded-lg transition-all">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-orange-500 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-8 bg-[#FBFCFE] border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400">Showing 4 of 28 pending reviews</p>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-300 hover:text-primary transition-all"><ChevronLeft className="w-4 h-4" /></button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 bg-primary text-white text-xs font-bold rounded-lg shadow-md shadow-primary/20">1</button>
              <button className="w-8 h-8 hover:bg-gray-100 text-gray-500 text-xs font-bold rounded-lg transition-all">2</button>
              <button className="w-8 h-8 hover:bg-gray-100 text-gray-500 text-xs font-bold rounded-lg transition-all">3</button>
            </div>
            <button className="p-2 text-gray-300 hover:text-primary transition-all"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewerDashboard;
