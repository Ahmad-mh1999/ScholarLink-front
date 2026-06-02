import React from "react";
import {
  FileText,
  Clock,
  Eye,
  ExternalLink,
  ShieldAlert,
  Inbox,
  UserPlus,
  Zap,
  Loader2,
  Download,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useExpediteReviewMutation } from "../../api/baseApi";
import { useGetMyPointsQuery } from "../../api/baseApi";
import toast from "react-hot-toast";

const getStatusClasses = (status) => {
  switch (status) {
    case "nominated":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "under_review":
    default:
      return "bg-orange-50 text-orange-600 border-orange-100";
  }
};

const ArticleRow = ({
  article,
  onWithdraw,
  onAssignReviewer,
  onExpediteReview,
  userPoints,
}) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusClasses(article.status)}`}
          >
            {(article.status || "under_review").replace(/_/g, " ")}
          </span>
          {article.is_priority && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-accent/10 text-accent border-accent/20 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Priority
            </span>
          )}
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Submitted {article.created_at_formatted || "3 days ago"}
          </span>
        </div>
        <h3 className="text-xl font-bold text-primary tracking-tight group-hover:text-accent transition-colors line-clamp-1">
          {article.title}
        </h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-bold">
              {article.views_count || 0} Views
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-bold">
              {article.category_name || "General Research"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {article.status === "published" && article.pdf_file && (
          <a
            href={article.pdf_file}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 text-gray-400 hover:text-primary hover:bg-[#F7FAFC] rounded-xl transition-all"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </a>
        )}
        <Link
          to={`/article/${article.slug}`}
          className="p-3 text-gray-400 hover:text-primary hover:bg-[#F7FAFC] rounded-xl transition-all"
          title="View"
        >
          <ExternalLink className="w-5 h-5" />
        </Link>
        <button
          onClick={() => onAssignReviewer(article)}
          className="p-3 text-gray-400 hover:text-accent hover:bg-[#F7FAFC] rounded-xl transition-all"
          title="Assign Reviewer"
        >
          <UserPlus className="w-5 h-5" />
        </button>
        {!article.is_priority && (
          <button
            onClick={() => onExpediteReview(article.id)}
            disabled={userPoints < 50}
            className="p-3 text-gray-400 hover:text-amber-500 hover:bg-[#F7FAFC] rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title={`Expedite Review (-50 points)`}
          >
            <Zap className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => onWithdraw(article)}
          className="ml-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border-2 border-red-100 text-red-500 hover:bg-red-50 transition-all flex items-center gap-2"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Withdraw
        </button>
      </div>
    </div>
  </div>
);

const UnderReviewTab = ({
  articles,
  isLoading,
  onWithdraw,
  onAssignReviewer,
}) => {
  const { data: myPoints } = useGetMyPointsQuery();
  const [expediteReview, { isLoading: isExpediting }] =
    useExpediteReviewMutation();

  const userPoints = myPoints?.total || 0;

  const handleExpediteReview = async (articleId) => {
    if (userPoints < 50) {
      toast.error(
        "Insufficient points. You need 50 points to expedite review.",
      );
      return;
    }

    try {
      await expediteReview(articleId).unwrap();
      toast.success(
        "Review expedited successfully! Your article is now marked as priority.",
      );
    } catch (error) {
      toast.error(error.data?.error || "Failed to expedite review");
    }
  };

  if (isLoading)
    return (
      <div className="space-y-6">
        {[1].map((i) => (
          <div
            key={i}
            className="h-32 bg-white rounded-[2rem] animate-pulse"
          ></div>
        ))}
      </div>
    );

  if (!articles || articles.length === 0)
    return (
      <div className="bg-white p-20 rounded-[3rem] border border-gray-50 text-center space-y-6 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-[#F7FAFC] rounded-[2rem] flex items-center justify-center mx-auto text-gray-200">
          <Inbox className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif font-bold text-primary tracking-tight">
            No Manuscripts Under Review
          </h3>
          <p className="text-gray-400 font-medium max-w-sm mx-auto italic">
            Your submitted work is currently being evaluated by our peer review
            board. New updates will appear here.
          </p>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {userPoints >= 1000 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-[2rem] border border-amber-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <Zap className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-amber-900">
              Publication Cost Support Eligible
            </h4>
            <p className="text-sm text-amber-700">
              You are eligible for full publication cost support on your
              submissions!
            </p>
          </div>
        </div>
      )}
      <div className="space-y-6">
        {articles.map((article) => (
          <ArticleRow
            key={article.id}
            article={article}
            onWithdraw={onWithdraw}
            onAssignReviewer={onAssignReviewer}
            onExpediteReview={handleExpediteReview}
            userPoints={userPoints}
          />
        ))}
      </div>
    </div>
  );
};

export default UnderReviewTab;
