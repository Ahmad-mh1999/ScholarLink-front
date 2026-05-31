import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Heart, 
  Bookmark, 
  Quote, 
  Star, 
  Download, 
  MessageSquare, 
  Share2, 
  User, 
  Calendar, 
  Eye, 
  CheckCircle2, 
  ChevronDown, 
  Send,
  Loader2
} from 'lucide-react';
import { 
  useGetArticleBySlugQuery, 
  useLikeArticleMutation, 
  useBookmarkArticleMutation, 
  useRateArticleMutation, 
  useGetCommentsQuery, 
  usePostCommentMutation,
  useGetCitationQuery,
  useLikeCommentMutation,
  useRecommendJournalsQuery,
  useGetArticleReviewsQuery
} from '../api/baseApi';
import CitationModal from '../components/CitationModal';
import RatingModal from '../components/RatingModal';
import ShareModal from '../components/ShareModal';

// Sub-component: Floating Action Bar
const FloatingActions = ({ article, onLike, onBookmark, onRate, onCite, onShare }) => {
  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 z-40 animate-in fade-in slide-in-from-left-8 duration-700">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-gray-100 p-2 flex flex-col gap-2">
        <button 
          onClick={onLike}
          className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 ${article?.is_liked ? 'bg-red-50 text-red-500' : 'text-gray-400 hover:bg-gray-50 hover:text-primary'}`}
        >
          <Heart className={`w-5 h-5 ${article?.is_liked ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold">{article?.likes_count || 0}</span>
        </button>
        <button 
          onClick={onBookmark}
          className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 ${article?.is_bookmarked ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:bg-gray-50 hover:text-primary'}`}
        >
          <Bookmark className={`w-5 h-5 ${article?.is_bookmarked ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold">SAVE</span>
        </button>
        <button 
          onClick={onCite}
          className="p-3 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-primary transition-all flex flex-col items-center gap-1"
        >
          <Quote className="w-5 h-5" />
          <span className="text-[10px] font-bold">CITE</span>
        </button>
        <div className="h-px bg-gray-50 mx-2 my-1" />
        <button className="p-3 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-accent transition-all flex flex-col items-center gap-1">
          <Star className="w-5 h-5" />
          <span className="text-[10px] font-bold">{article?.average_rating || '4.8'}</span>
        </button>
      </div>
      <button 
        onClick={onShare}
        className="bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-110 transition-transform flex items-center justify-center"
      >
        <Share2 className="w-5 h-5" />
      </button>
    </div>
  );
};

// Sub-component: Comment Item
const CommentItem = ({ comment, onReply, onLike }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary overflow-hidden border-2 border-white shadow-sm">
        <User className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="text-sm font-bold text-primary">{comment.user_name}</h4>
          {comment.is_author && (
            <span className="px-2 py-0.5 bg-accent/10 text-accent text-[9px] font-bold rounded-full uppercase tracking-widest">Author</span>
          )}
          <span className="text-[10px] text-gray-300 font-medium">{comment.created_at_formatted}</span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed font-medium mb-4">{comment.content}</p>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onLike(comment.id)}
            className={`flex items-center gap-2 text-[10px] font-bold transition-colors ${comment.is_liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
          >
            <Heart className={`w-3.5 h-3.5 ${comment.is_liked ? 'fill-current' : ''}`} />
            <span>{comment.likes_count || 0}</span>
          </button>
          <button onClick={() => onReply(comment.id)} className="text-[10px] font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">
            Reply
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ArticleDetail = () => {
  const { slug } = useParams();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [citationModal, setCitationModal] = useState(false);
  const [ratingModal, setRatingModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);

  const { data: article, isLoading, isError } = useGetArticleBySlugQuery(slug);
  const { data: commentsData } = useGetCommentsQuery(slug);
  const { data: journalsData } = useRecommendJournalsQuery({ 
    category_id: article?.category_id,
    field_of_study: article?.field_of_study
  });
  const { data: reviewsData } = useGetArticleReviewsQuery(article?.id);
  
  const [likeArticle] = useLikeArticleMutation();
  const [bookmarkArticle] = useBookmarkArticleMutation();
  const [likeComment] = useLikeCommentMutation();
  const [postComment, { isLoading: isPosting }] = usePostCommentMutation();

  const comments = React.useMemo(() => {
    if (!commentsData) return [];
    if (Array.isArray(commentsData)) return commentsData;
    if (Array.isArray(commentsData.results)) return commentsData.results;
    return [];
  }, [commentsData]);

  const handleLikeComment = async (commentId) => {
    try {
      await likeComment(commentId).unwrap();
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      await postComment({ slug, content: newComment, parentId: replyTo }).unwrap();
      setNewComment('');
      setReplyTo(null);
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  if (isError) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-primary">Article not found</h2>
      <p className="text-gray-400 mt-2">The research paper you are looking for does not exist or has been removed.</p>
    </div>
  );

  return (
    <>
    <div className="max-w-5xl mx-auto pb-20 relative">
      <FloatingActions 
        article={article} 
        onLike={() => likeArticle(slug)}
        onBookmark={() => bookmarkArticle(slug)}
        onCite={() => setCitationModal(true)}
        onRate={() => setRatingModal(true)}
        onShare={() => setShareModal(true)}
      />

      <article className="space-y-12">
        {/* Header Section */}
        <header className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-accent/5 text-accent text-[10px] font-bold rounded-full uppercase tracking-widest border border-accent/10">
              {article.category_name || 'Engineering'}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {article.field_name || 'Neural Architectures'}
            </span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-serif font-bold text-primary leading-[1.1] tracking-tight">
            {article.title}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-y border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent overflow-hidden border-2 border-white shadow-md">
                <User className="w-7 h-7" />
              </div>
              <div>
                <Link 
                  to={`/profile/${article.author_username || article.author?.username || 'aris-thorne'}`}
                  className="text-lg font-bold text-primary tracking-tight leading-none mb-1 hover:text-accent transition-colors block"
                >
                  {article.author_name || 'Dr. Aris Thorne'}
                </Link>
                <p className="text-xs font-medium text-gray-400 tracking-tight">
                  {article.author_role || 'Senior Research Lead'} • {article.institution || 'MIT Media Lab'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-widest">{article.created_at_formatted || 'Oct 24, 2023'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Eye className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-widest">{article.views_count || '1.2k'} views</span>
              </div>
            </div>
          </div>
        </header>

        {/* Abstract Section */}
        <section className="bg-[#F7FAFC] p-10 rounded-[2.5rem] border border-gray-100 relative overflow-hidden group">
          <div className="relative z-10 italic text-xl font-medium text-primary/80 leading-relaxed tracking-tight">
            <span className="not-italic font-bold text-primary mr-2 uppercase tracking-widest text-sm">Abstract:</span>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.abstract || "As deep learning models grow in complexity, the challenge of deploying them on resource-constrained edge devices becomes paramount. This study explores architectural optimizations that balance latency and accuracy."}
            </ReactMarkdown>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
        </section>

        {/* Main Content */}
        <div className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:text-gray-600 prose-p:leading-relaxed prose-p:text-lg prose-p:tracking-tight prose-strong:text-primary prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-code:text-accent prose-pre:bg-gray-50 prose-pre:p-4 prose-pre:rounded-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content || `## Introduction

The proliferation of Internet of Things (IoT) devices has led to a paradigm shift toward edge computing. 
Unlike centralized cloud processing, edge computing processes data locally, reducing latency and bandwidth consumption. 
However, the hardware constraints—limited memory, processing power, and battery life—pose significant challenges for modern neural networks.

## Methodology

Our research suggests that hardware-aware neural architecture search (NAS) provides the most robust path forward for autonomous systems requiring real-time inference.`}
          </ReactMarkdown>
        </div>

        {/* Download Section */}
        <div className="pt-8">
          {article?.pdf_file ? (
            <a
              href={article.pdf_file}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent hover:bg-[#287E7B] text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-teal-500/20"
            >
              <Download className="w-5 h-5" />
              <span>Download Full PDF</span>
            </a>
          ) : (
            <button disabled className="bg-gray-200 text-gray-400 px-10 py-5 rounded-2xl font-bold flex items-center gap-3 cursor-not-allowed">
              <Download className="w-5 h-5" />
              <span>PDF Not Available</span>
            </button>
          )}
        </div>

        {/* Recommended Journals Section */}
        {journalsData && journalsData.length > 0 && (
          <section className="pt-12">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-8">
              <Star className="w-7 h-7 text-accent" />
              <h2 className="text-2xl font-serif font-bold text-primary">Recommended Journals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {journalsData.map((journal) => (
                <div key={journal.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <h3 className="text-lg font-bold text-primary mb-2">{journal.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{journal.field_of_study}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span>ISSN: {journal.issn}</span>
                    {journal.impact_factor && (
                      <span>Impact Factor: {journal.impact_factor}</span>
                    )}
                  </div>
                  {journal.website && (
                    <a
                      href={journal.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent text-sm font-bold hover:underline"
                    >
                      Visit Journal →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section className="pt-20 space-y-12">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
            <MessageSquare className="w-7 h-7 text-primary" />
            <h2 className="text-2xl font-serif font-bold text-primary">Discussions ({comments.length})</h2>
          </div>

          {/* New Comment Box */}
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-4">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? "Write a reply..." : "Join the discussion..."}
                className="w-full bg-white border border-gray-100 rounded-3xl p-6 text-sm placeholder-gray-400 focus:ring-2 focus:ring-accent/20 outline-none transition-all shadow-sm min-h-[120px]"
              />
              <div className="flex justify-between items-center">
                {replyTo && (
                  <button onClick={() => setReplyTo(null)} className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors">
                    Cancel Reply
                  </button>
                )}
                <div className="flex-1" />
                <button 
                  onClick={handlePostComment}
                  disabled={isPosting || !newComment.trim()}
                  className="bg-primary hover:bg-[#152c4d] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span className="text-xs uppercase tracking-widest">Post Comment</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-10">
            {comments.length > 0 ? (
              comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} onReply={setReplyTo} onLike={handleLikeComment} />
              ))
            ) : (
              // Fallback demo comments
              <>
                <CommentItem comment={{ 
                  user_name: 'Prof. Sarah Jenkins', 
                  content: 'Great insights on quantization. Have you considered the impact of thermal throttling on long-term inference stability for the SCN model?',
                  created_at_formatted: '2 hours ago',
                  likes_count: 12,
                  replies: [{
                    user_name: 'Dr. Aris Thorne',
                    is_author: true,
                    content: 'Excellent point, Sarah. In section 4.2 of the full paper, we touch on dynamic voltage scaling (DVFS) impacts. Thermal throttling did occur in the ARM-Cortex tests after 30 minutes of continuous inference.',
                    created_at_formatted: '1 hour ago',
                    likes_count: 5
                  }]
                }} onReply={setReplyTo} onLike={handleLikeComment} />
                <CommentItem comment={{ 
                  user_name: 'Marcus Zhao', 
                  content: 'This is incredibly helpful for my senior thesis. The comparison table with the TPU accelerators is exactly what I needed.',
                  created_at_formatted: '5 hours ago',
                  likes_count: 4
                }} onReply={setReplyTo} onLike={handleLikeComment} />
              </>
            )}
          </div>
        </section>
      </article>
    </div>

    {/* Citation Modal */}
    {citationModal && (
      <CitationModal
        slug={slug}
        onClose={() => setCitationModal(false)}
      />
    )}

    {/* Rating Modal */}
    {ratingModal && (
      <RatingModal
        slug={slug}
        currentRating={article?.average_rating}
        onClose={() => setRatingModal(false)}
        onSuccess={() => setRatingModal(false)}
      />
    )}

    {/* Share Modal */}
    {shareModal && (
      <ShareModal
        slug={slug}
        onClose={() => setShareModal(false)}
      />
    )}
    </>
  );
};

export default ArticleDetail;
