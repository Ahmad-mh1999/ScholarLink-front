import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  AlertCircle,
  Trash2,
  Loader2,
  Inbox,
  Clock,
  Star,
  Download,
  ExternalLink,
} from "lucide-react";
import {
  useGetMyArticlesQuery,
  useDeleteArticleMutation,
} from "../api/baseApi";

const MyArticles = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("under_review");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch all articles
  const { data: articlesData, isLoading, isFetching } = useGetMyArticlesQuery();
  const [deleteArticle, { isLoading: isDeleting }] = useDeleteArticleMutation();

  // Filter articles by active tab and search term
  const filteredArticles = useMemo(() => {
    if (!articlesData?.results) return [];
    return articlesData.results.filter((article) => {
      const matchesStatus = article.status === activeTab;
      const matchesSearch = article.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [articlesData, activeTab, searchTerm]);

  // Calculate counts for each status
  const counts = useMemo(() => {
    if (!articlesData?.results)
      return { under_review: 0, nominated: 0, published: 0 };
    return articlesData.results.reduce(
      (acc, article) => {
        acc[article.status] = (acc[article.status] || 0) + 1;
        return acc;
      },
      { under_review: 0, nominated: 0, published: 0 },
    );
  }, [articlesData]);

  const tabs = [
    { id: "under_review", label: "Under Review", count: counts.under_review },
    { id: "nominated", label: "Nominated", count: counts.nominated },
    { id: "published", label: "Published", count: counts.published },
  ];

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteArticle(deleteConfirm.slug).unwrap();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  return (
    <>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-serif font-bold text-primary tracking-tight">
              My Articles
            </h1>
            <p className="text-gray-400 font-medium italic">
              Manage your research manuscripts and track their publication
              status.
            </p>
          </div>
          <Link
            to="/submit"
            className="bg-accent hover:bg-[#287E7B] text-white px-10 py-5 rounded-[2rem] font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-teal-500/20"
          >
            <Plus className="w-6 h-6" />
            <span>New Manuscript</span>
          </Link>
        </div>

        {/* Main Content Area */}
        <div className="space-y-8">
          {/* Tabs & Search Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-gray-100 pb-2">
            <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative pb-4 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2
                  ${activeTab === tab.id ? "text-primary" : "text-gray-300 hover:text-gray-500"}
                `}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold min-w-[20px] text-center
                    ${activeTab === tab.id ? "bg-accent text-white" : "bg-gray-100 text-gray-500"}
                  `}
                    >
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-accent rounded-full animate-in fade-in zoom-in duration-300" />
                  )}
                </button>
              ))}
            </div>

            <div className="relative group max-w-md w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent w-4 h-4 transition-colors" />
              <input
                type="text"
                placeholder="Filter by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 text-sm placeholder-gray-300 focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all outline-none"
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "under_review" && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900">Your manuscript is being reviewed.</p>
                    <p className="text-xs text-blue-700">Expected: 2-4 weeks</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {filteredArticles.map((article) => (
                    <div key={article.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-primary mb-2">{article.title}</h3>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-lg">Under Review</span>
                            <span className="text-xs text-gray-400">{new Date(article.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredArticles.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                      <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">No manuscripts under review</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === "nominated" && (
              <div className="space-y-6">
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-teal-900">Awaiting journal acceptance confirmation</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {filteredArticles.map((article) => (
                    <div key={article.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-primary mb-2">{article.title}</h3>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-lg">Nominated</span>
                            <span className="text-xs text-gray-400">{new Date(article.created_at).toLocaleDateString()}</span>
                          </div>
                          {article.nominated_journal && (
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xs font-bold text-accent">Nominated to:</span>
                              <span className="text-sm font-bold text-primary">{article.nominated_journal.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredArticles.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                      <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">No nominated manuscripts</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === "published" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {filteredArticles.map((article) => (
                    <div key={article.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-primary mb-2">{article.title}</h3>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-lg">Published</span>
                            <span className="text-xs text-gray-400">{new Date(article.created_at).toLocaleDateString()}</span>
                          </div>
                          {article.nominated_journal && (
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xs font-bold text-accent">Published in:</span>
                              <span className="text-sm font-bold text-primary">{article.nominated_journal.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                        {article.pdf_file && (
                          <a
                            href={article.pdf_file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                          >
                            <Download className="w-4 h-4" /> Download PDF
                          </a>
                        )}
                        <Link
                          to={`/articles/${article.slug}`}
                          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" /> View Article
                        </Link>
                      </div>
                    </div>
                  ))}
                  {filteredArticles.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                      <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">No published articles</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/20 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-serif font-bold text-primary tracking-tight">
                  Delete Manuscript?
                </h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="text-primary font-bold">
                    "{deleteConfirm.title}"
                  </span>
                  ? This action cannot be undone and all research data will be
                  permanently removed.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyArticles;
