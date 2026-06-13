import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  BookOpen,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  Award,
  HelpCircle
} from 'lucide-react';
import {
  useGetJournalsQuery,
  useAdminNominateJournalMutation,
  useGetAdminArticlesQuery,
} from '../api/baseApi';

const AdminJournalNomination = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  
  const [adminNominateJournal, { isLoading: isNominating }] = useAdminNominateJournalMutation();
  const { data: articlesData, isLoading: isArticlesLoading } = useGetAdminArticlesQuery();
  const { data: journalsData, isLoading: isJournalsLoading } = useGetJournalsQuery();

  const [selectedJournalId, setSelectedJournalId] = useState('');

  // جلب المقالة المحددة
  const articlesArray = Array.isArray(articlesData) ? articlesData : articlesData?.results || articlesData?.data || [];
  const article = articlesArray?.find(a => a.slug === slug);

  // نظام النقاط الصارم المطلوب وتغطية التكاليف
  const calculateCostCoverage = (points) => {
    if (!points) return 0;
    const pts = parseInt(points, 10) || 0;
    if (pts >= 1000) return 100; // 100% تغطية كاملة
    if (pts >= 500) return 60;   // 60% خصم
    if (pts >= 200) return 40;   // 40% خصم
    if (pts >= 100) return 20;   // 20% خصم
    return 0;
  };

  const authorPoints = article?.points || 0;
  const coveragePercent = calculateCostCoverage(authorPoints);
  const journalsArray = Array.isArray(journalsData) ? journalsData : journalsData?.results || journalsData?.data || [];

  const handleNominateJournal = async () => {
    if (!selectedJournalId) {
      toast.error('Please select a journal to nominate');
      return;
    }
    try {
      await adminNominateJournal({
        slug: article.slug,
        journal_id: selectedJournalId
      }).unwrap();
      toast.success('Journal nominated successfully! Returning to admin queue...');
      // الحل للمشكلة الثالثة: التوجيه مباشرة إلى لوحة تحكم الأدمن
      navigate('/admin-dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.detail || 'Failed to nominate journal');
    }
  };

  if (isArticlesLoading || isJournalsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
        <p className="text-gray-700 font-bold mb-4">Manuscript context not found.</p>
        <button onClick={() => navigate('/admin-dashboard')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 px-6 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(`/admin/article-review/${slug}`)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Journal Nomination Workflow</h1>
          <p className="text-xs text-gray-500">Nominate approved manuscript to publishers</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* List of Available Journals */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Available System Journals ({journalsArray.length})</h2>
            
            {journalsArray.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border text-gray-500">
                No active journals found in database.
              </div>
            ) : (
              journalsArray.map((journal) => {
                const baseFee = parseFloat(journal.publication_fee) || 0;
                const discountAmount = baseFee * (coveragePercent / 100);
                const finalFee = Math.max(0, baseFee - discountAmount);

                return (
                  <div
                    key={journal.id}
                    onClick={() => setSelectedJournalId(journal.id)}
                    className={`bg-white rounded-2xl p-6 border transition-all cursor-pointer flex flex-col md:flex-row justify-between gap-4 ${
                      selectedJournalId === journal.id
                        ? 'border-indigo-600 ring-2 ring-indigo-600/10 bg-indigo-50/5'
                        : 'border-gray-100 hover:border-gray-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${selectedJournalId === journal.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-400'}`}>
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{journal.name || journal.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Field: {journal.field_of_study || 'N/A'}</p>
                        <p className="text-xs text-gray-400 mt-1">Publisher: {journal.publisher || 'Independent'}</p>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-700 rounded-md">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Impact Factor: {journal.impact_factor || '0.0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Info Block */}
                    <div className="flex flex-col justify-between items-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-50 min-w-[180px]">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Standard Publication Fee</p>
                        <p className="text-sm font-semibold text-gray-500 line-through">${baseFee.toFixed(2)}</p>
                      </div>
                      
                      <div className="text-right mt-2 md:mt-0">
                        <p className="text-xs text-emerald-600 font-bold">Price After Points Discount</p>
                        <p className="text-xl font-black text-emerald-600">${finalFee.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar Computation Calculation & Dynamic Points Box */}
          <div className="space-y-6">
            
            {/* البوكس الصغير المطور لعرض وتوضيح نظام نقاط المستخدم والتغطية */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-white/10 rounded-xl text-amber-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-indigo-200 uppercase">Author Subsidy Status</h3>
                  <p className="text-xs text-slate-300">Point system currency coverage matrix</p>
                </div>
              </div>

              {/* رصيد نقاط المستخدم الحالي */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Author Total Points:</span>
                  <span className="text-xl font-black text-amber-400">{authorPoints} Pts</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                  <span className="text-sm text-slate-300">Eligible Fee Subsidy:</span>
                  <span className="text-lg font-bold text-emerald-400">{coveragePercent}% Discount</span>
                </div>
              </div>

              {/* بوكس صغير يوضح قواعد النظام داخلياً للأدمن والكاتب */}
              <div className="text-[11px] text-slate-300 space-y-1.5 bg-black/20 p-3 rounded-xl border border-white/5">
                <p className="font-bold text-indigo-300 flex items-center gap-1 mb-1">
                  <HelpCircle className="w-3 h-3" /> System Coverage Matrix:
                </p>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>1000 Pts or more</span>
                  <span className="font-bold text-emerald-400">100% Full Free Coverage</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>500 - 999 Pts</span>
                  <span className="font-bold text-amber-400">60% Partial Coverage</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>200 - 499 Pts</span>
                  <span className="font-bold text-slate-200">40% Partial Coverage</span>
                </div>
                <div className="flex justify-between">
                  <span>100 - 199 Pts</span>
                  <span className="font-bold text-slate-200">20% Minimum Subsidy</span>
                </div>
              </div>
            </div>

            {/* Final Submission Block */}
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-50">
              <button
                disabled={!selectedJournalId || isNominating}
                onClick={handleNominateJournal}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
                  selectedJournalId && !isNominating
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/10' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isNominating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Confirm Journal Nomination
              </button>
              <p className="text-[11px] text-gray-400 text-center mt-2.5">
                Submitting this will bind the paper metadata to the target journal vendor pipeline.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminJournalNomination;