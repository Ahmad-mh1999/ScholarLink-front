import React from 'react';
import { FileText, Clock, Eye, ExternalLink, RefreshCcw, Inbox, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArticleRow = ({ article, onResubmit }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-red-50 text-red-600 border-red-100">
            Rejected
          </span>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Decision on {article.updated_at_formatted || '5 days ago'}
          </span>
        </div>
        <h3 className="text-xl font-bold text-primary tracking-tight group-hover:text-accent transition-colors line-clamp-1">
          {article.title}
        </h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-bold">{article.views_count || 0} Views</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-bold">{article.category_name || 'General Research'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link to={`/article/${article.slug}`} className="p-3 text-gray-400 hover:text-primary hover:bg-[#F7FAFC] rounded-xl transition-all" title="View">
          <ExternalLink className="w-5 h-5" />
        </Link>
        <button onClick={() => onResubmit(article)} className="ml-2 bg-accent hover:bg-[#287E7B] text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20">
          <RefreshCcw className="w-3.5 h-3.5" />
          Resubmit
        </button>
      </div>
    </div>
  </div>
);

const RejectedTab = ({ articles, isLoading, onResubmit }) => {
  if (isLoading) return <div className="space-y-6">{[1].map(i => <div key={i} className="h-32 bg-white rounded-[2rem] animate-pulse"></div>)}</div>;

  if (!articles || articles.length === 0) return (
    <div className="bg-white p-20 rounded-[3rem] border border-gray-50 text-center space-y-6 animate-in zoom-in duration-500">
      <div className="w-24 h-24 bg-[#F7FAFC] rounded-[2rem] flex items-center justify-center mx-auto text-gray-200">
        <AlertCircle className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-serif font-bold text-primary tracking-tight">No Rejected Articles</h3>
        <p className="text-gray-400 font-medium max-w-sm mx-auto italic">All your submissions are either in review or published. Any work requiring revision or rejected will appear here.</p>
      </div>
    </div>
  );

  return <div className="space-y-6">{articles.map(article => <ArticleRow key={article.id} article={article} onResubmit={onResubmit} />)}</div>;
};

export default RejectedTab;
