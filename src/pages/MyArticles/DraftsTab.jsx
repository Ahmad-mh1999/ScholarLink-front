import React from 'react';
import { FileText, Clock, Eye, Edit3, Trash2, Send, ExternalLink, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArticleRow = ({ article, onDelete, onEdit }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-gray-100 text-gray-500 border-gray-200">
            Draft
          </span>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last modified {article.updated_at_formatted || '2 days ago'}
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
        <Link to={`/article/${article.slug}`} className="p-3 text-gray-400 hover:text-primary hover:bg-[#F7FAFC] rounded-xl transition-all" title="Preview">
          <ExternalLink className="w-5 h-5" />
        </Link>
        <button onClick={() => onEdit(article.slug)} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit">
          <Edit3 className="w-5 h-5" />
        </button>
        <button onClick={() => onDelete(article)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete">
          <Trash2 className="w-5 h-5" />
        </button>
        <button className="ml-2 bg-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#152c4d] transition-all flex items-center gap-2 shadow-lg shadow-primary/10">
          <Send className="w-3.5 h-3.5" />
          Submit
        </button>
      </div>
    </div>
  </div>
);

const DraftsTab = ({ articles, isLoading, onDelete, onEdit }) => {
  if (isLoading) return <div className="space-y-6">{[1, 2].map(i => <div key={i} className="h-32 bg-white rounded-[2rem] animate-pulse"></div>)}</div>;

  if (!articles || articles.length === 0) return (
    <div className="bg-white p-20 rounded-[3rem] border border-gray-50 text-center space-y-6 animate-in zoom-in duration-500">
      <div className="w-24 h-24 bg-[#F7FAFC] rounded-[2rem] flex items-center justify-center mx-auto text-gray-200">
        <Inbox className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-serif font-bold text-primary tracking-tight">No Drafts Found</h3>
        <p className="text-gray-400 font-medium max-w-sm mx-auto italic">Your unfinished manuscripts will appear here for further editing and refinement.</p>
      </div>
    </div>
  );

  return <div className="space-y-6">{articles.map(article => <ArticleRow key={article.id} article={article} onDelete={onDelete} onEdit={onEdit} />)}</div>;
};

export default DraftsTab;
