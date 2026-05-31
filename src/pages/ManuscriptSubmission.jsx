/**
 * ManuscriptSubmission Component
 * [Platform Name] Academic Platform
 * 
 * Features:
 * - PDF Manuscript Submission (multipart/form-data)
 * - Dynamic Category Selection (Multi-select)
 * - Role-based submission logic (Normal user vs Admin/Reviewer)
 * - Real-time WebSocket Notifications
 * - Admin Notification Center (Specific User / Broadcast)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Loader2, 
  Info,
  Layers,
  Globe,
  Lock,
  Hash,
  Send,
  User,
  Users,
  Bell,
  Trash2,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  CheckCircle2,
  MapPin,
  Clock,
  ExternalLink,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  useCreateArticleMutation, 
  useUpdateArticleMutation, 
  useGetArticleBySlugQuery, 
  useGetCategoriesQuery, 
  useGetAdminUsersQuery,
  useModerateArticleMutation,
  useSendNotificationMutation,
  useCheckFormattingEligibilityQuery,
  useGetMyPointsQuery
} from '../api/baseApi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import useWebSocketNotifications from '../hooks/useWebSocketNotifications';

// Validation Schema
const schema = yup.object().shape({
  title: yup.string().required('Article title is required').min(10, 'Title must be at least 10 characters'),
  abstract: yup.string().required('Abstract is required').max(3000, 'Abstract must be less than 3000 characters'),
  category_id: yup.number().required('Please select a category').typeError('Please select a category'),
  location: yup.string().optional(),
  author_id: yup.string().optional(),
});

const ManuscriptSubmission = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get('edit');
  const isEditMode = !!editSlug;
  
  // Auth & Roles
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.is_staff === true || user?.role === 'admin' || user?.role === 'super_admin';
  const isModerator = user?.role === 'moderator' || user?.role === 'reviewer';
  const canApproveImmediately = isAdmin || isModerator;

  // Local State
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [existingPdfFile, setExistingPdfFile] = useState(null);
  const [adminNotify, setAdminNotify] = useState({ target: 'user', userId: '', title: '', message: '' });

  // API Hooks
  const [createArticle] = useCreateArticleMutation();
  const [updateArticle] = useUpdateArticleMutation();
  const [moderateArticle] = useModerateArticleMutation();
  const [sendNotification] = useSendNotificationMutation();
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const { data: editArticle, isLoading: isLoadingArticle } = useGetArticleBySlugQuery(editSlug, { skip: !editSlug });
  const { data: usersData } = useGetAdminUsersQuery({}, { skip: !isAdmin });
  const { data: formattingEligibility } = useCheckFormattingEligibilityQuery();
  const { data: myPoints } = useGetMyPointsQuery();

  const userPoints = myPoints?.total || 0;

  // WebSocket hook for real-time updates

  const { isConnected } = useWebSocketNotifications();

  // Data Formatting
  const categoriesList = useMemo(() => {
    if (!categoriesData) return [];
    if (Array.isArray(categoriesData)) return categoriesData;
    if (Array.isArray(categoriesData.results)) return categoriesData.results;
    return [];
  }, [categoriesData]);

  const usersList = useMemo(() => {
    if (!usersData) return [];
    if (Array.isArray(usersData)) return usersData;
    if (Array.isArray(usersData.results)) return usersData.results;
    return [];
  }, [usersData]);

  // Form Setup
  const defaultValues = {
    title: '',
    abstract: '',
    category_id: '',
    location: '',
    author_id: '',
  }
  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues
  });

  // Populate for Edit Mode
  useEffect(() => {
    if (editArticle && isEditMode) {
      reset({
        title: editArticle.title || '',
        abstract: editArticle.abstract || '',
        category_id: editArticle.category?.id || '',
        location: editArticle.location || '',
        author_id: editArticle.author?.id || '',
      });
      if (editArticle.tags?.length) setTags(editArticle.tags);
      if (editArticle.pdf_file) setExistingPdfFile(editArticle.pdf_file);
    }
  }, [editArticle, isEditMode, reset]);

  // Handlers
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      toast.error('Please upload a valid PDF file');
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleFormSubmit = async (data, statusOverride = null) => {
    console.log('Submission started...', { data, statusOverride });
    
    if (!pdfFile && !existingPdfFile) {
      toast.error('Please upload your manuscript PDF');
      return;
    }

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('abstract', data.abstract);
    formData.append('category_id', data.category_id); // Backend expects category_id
    
    if (data.location) formData.append('location', data.location);
    if (isAdmin && data.author_id) formData.append('author_id', data.author_id);
    
    // Status Logic: 
    // If Admin/Reviewer clicks "Approve & Publish", status is 'published'.
    // If a normal user clicks "Submit", status is 'under_review'.
    const finalStatus = statusOverride || (canApproveImmediately ? 'published' : 'under_review');
    formData.append('status', finalStatus);

    // Tags
    if (tags.length > 0) formData.append('tags', tags.join(','));
    
    // PDF File
    if (pdfFile) formData.append('pdf_file', pdfFile);

    console.log('Sending FormData payload:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      if (isEditMode) {
        await updateArticle({ slug: editSlug, formData }).unwrap();
        toast.success('Manuscript updated successfully');
      } else {
        await createArticle(formData).unwrap();
        if (finalStatus === 'published') {
          toast.success('Article published immediately!');
        } else {
          toast.success('Manuscript submitted for review. Admin and Reviewers have been notified.');
        }
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Submission failed:', err);
      toast.error(err.data?.detail || err.data?.message || 'Failed to submit manuscript. Please check all fields.');
    }
  };

  const handleSendAdminNotification = async () => {
    if (!adminNotify.title || !adminNotify.message) {
      toast.error('Notification title and message are required');
      return;
    }
    try {
      await sendNotification({
        target_type: adminNotify.target,
        user_id: adminNotify.userId,
        title: adminNotify.title,
        message: adminNotify.message
      }).unwrap();
      toast.success('Broadcast notification sent successfully');
      setAdminNotify({ ...adminNotify, title: '', message: '' });
    } catch (err) {
      toast.error('Failed to send notification');
    }
  };

  if (isEditMode && isLoadingArticle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-accent mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Manuscript...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-accent/10 text-accent text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              {isEditMode ? 'Edit Mode' : 'Submission Portal'}
            </span>
            <span className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${isConnected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <Bell className="w-3 h-3" /> {isConnected ? 'Real-time Connected' : 'Offline'}
            </span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-primary tracking-tight">
            {isEditMode ? 'Modify Research Manuscript' : 'Manuscript Submission'}
          </h1>
          <p className="text-gray-400 font-medium">Contribute your academic research to the global knowledge repository.</p>
        </div>
        <div className="hidden md:flex flex-col items-end">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-50 flex items-center justify-center mb-2">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Academic Standard v6.0</p>
        </div>
      </div>

      {/* Formatting Guidelines Section */}
      {formattingEligibility?.guidelines && (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary tracking-tight">Submission Guidelines</h2>
              <p className="text-sm text-gray-400">Ensure your manuscript meets the required formatting standards</p>
            </div>
          </div>

          {/* Points-based Status Banner */}
          {userPoints >= 1000 ? (
            <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 rounded-2xl border border-accent/20 mb-8 flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/15 rounded-xl flex items-center justify-center text-accent">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-primary">Premium Automated Layout Tuning Activated</h4>
                <p className="text-sm text-gray-600">Our engineering team will automatically reformat this manuscript to meet the target journal specs free of charge.</p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-2xl border border-amber-200 mb-8 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-amber-900">Manual Layout Tuning Required</h4>
                <p className="text-sm text-amber-700">The manuscript must be manually formatted to comply with the target journal guidelines before submission.</p>
              </div>
            </div>
          )}


          {/* Visible Formatting Rules (Target Journal) */}
          <div className="mb-8 rounded-[2rem] border border-gray-100 bg-[#F7FAFC] p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileCheck className="w-5 h-5 text-accent" />
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Target Journal Formatting Rules</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Font size</p>
                <p className="text-sm font-bold text-primary">{formattingEligibility.guidelines.font_size}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Margins</p>
                <p className="text-sm font-bold text-primary">{formattingEligibility.guidelines.margins}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Figure scale</p>
                <p className="text-sm font-bold text-primary">{formattingEligibility.guidelines.figure_scale_dimensions || formattingEligibility.guidelines.image_dimensions}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Line spacing</p>
                <p className="text-sm font-bold text-primary">{formattingEligibility.guidelines.line_spacing}</p>
              </div>
            </div>
          </div>

          {/* Guidelines List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Document Layout</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-primary">Font Size</p>
                    <p className="text-xs text-gray-400">{formattingEligibility.guidelines.font_size}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-primary">Margins</p>
                    <p className="text-xs text-gray-400">{formattingEligibility.guidelines.margins}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-primary">Line Spacing</p>
                    <p className="text-xs text-gray-400">{formattingEligibility.guidelines.line_spacing}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Content Requirements</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-primary">Figure Scale Dimensions</p>
                    <p className="text-xs text-gray-400">{formattingEligibility.guidelines.figure_scale_dimensions || formattingEligibility.guidelines.image_dimensions}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-primary">Citation Style</p>
                    <p className="text-xs text-gray-400">{formattingEligibility.guidelines.citation_style}</p>
                  </div>
                </div>
                {(formattingEligibility.guidelines.min_word_count || formattingEligibility.guidelines.max_word_count) && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-primary">Word Count</p>
                      <p className="text-xs text-gray-400">
                        {formattingEligibility.guidelines.min_word_count && `Min: ${formattingEligibility.guidelines.min_word_count}`}
                        {formattingEligibility.guidelines.min_word_count && formattingEligibility.guidelines.max_word_count && ' | '}
                        {formattingEligibility.guidelines.max_word_count && `Max: ${formattingEligibility.guidelines.max_word_count}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {formattingEligibility.guidelines.additional_requirements && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Additional Requirements</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{formattingEligibility.guidelines.additional_requirements}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: The Form */}
        <div className="lg:col-span-8 space-y-8">
          <form onSubmit={handleSubmit((d) => handleFormSubmit(d))} className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 space-y-10">
              
              {/* Title Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-1 flex justify-between">
                  Research Title <span className="text-gray-300 font-normal">{watch('title')?.length || 0}/255</span>
                </label>
                <input 
                  {...register('title')}
                  placeholder="Enter the full title of your research paper..."
                  className={`w-full bg-[#F7FAFC] border-none rounded-2xl py-5 px-8 text-xl font-serif font-bold text-primary placeholder:text-gray-300 focus:ring-4 focus:ring-accent/5 transition-all outline-none ${errors.title ? 'ring-2 ring-red-500/20' : ''}`}
                />
                {errors.title && <p className="text-xs text-red-500 font-bold px-1">{errors.title.message}</p>}
              </div>

              {/* Abstract Area */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-1 flex justify-between">
                  Abstract Summary <span className="text-gray-300 font-normal">Max 3000 chars</span>
                </label>
                <textarea 
                  {...register('abstract')}
                  rows={8}
                  placeholder="Provide a concise summary of your research objectives, methodology, and key findings..."
                  className={`w-full bg-[#F7FAFC] border-none rounded-3xl py-6 px-8 text-sm leading-relaxed text-gray-600 placeholder:text-gray-300 focus:ring-4 focus:ring-accent/5 transition-all outline-none resize-none ${errors.abstract ? 'ring-2 ring-red-500/20' : ''}`}
                />
                {errors.abstract && <p className="text-xs text-red-500 font-bold px-1">{errors.abstract.message}</p>}
              </div>

              {/* Category Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                    <Layers className="w-3 h-3" /> Research Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('category_id')}
                    className={`w-full bg-[#F7FAFC] border-none rounded-2xl py-4 px-6 text-sm font-bold text-primary focus:ring-4 focus:ring-accent/5 outline-none cursor-pointer appearance-none ${errors.category_id ? 'ring-2 ring-red-500/20' : ''}`}
                  >
                    <option value="">Select a Category...</option>
                    {categoriesList.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category_id && <p className="text-xs text-red-500 font-bold px-1">{errors.category_id.message}</p>}
                </div>
              </div>

              {/* Keywords Tagging */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                  <Hash className="w-3 h-3" /> Research Keywords <span className="text-gray-300 font-normal">(Optional)</span>
                </label>
                <div className="bg-[#F7FAFC] p-2 rounded-2xl flex flex-wrap gap-2 min-h-[60px] items-center">
                  {tags.map(tag => (
                    <span key={tag} className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-primary flex items-center gap-2 shadow-sm border border-gray-100">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setTags(tags.filter(t => t !== tag))} />
                    </span>
                  ))}
                  <input 
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type and press Enter..."
                    className="bg-transparent border-none outline-none text-sm font-medium text-primary p-2 flex-grow min-w-[150px]"
                  />
                </div>
              </div>

              {/* PDF Upload Area */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                  <Upload className="w-3 h-3" /> Manuscript PDF File <span className="text-red-500">*</span>
                </label>
                <div 
                  onClick={() => document.getElementById('pdf-upload').click()}
                  className={`h-[240px] border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-5 cursor-pointer transition-all group ${pdfFile ? 'border-green-500/30 bg-green-50/30' : 'border-accent/20 bg-accent/5 hover:bg-accent/10'}`}
                >
                  <input id="pdf-upload" type="file" hidden accept=".pdf" onChange={handleFileUpload} />
                  {pdfFile ? (
                    <>
                      <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-primary">{pdfFile.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{(pdfFile.size / (1024*1024)).toFixed(2)} MB • File Validated</p>
                      </div>
                    </>
                  ) : existingPdfFile ? (
                    <>
                      <div className="w-16 h-16 bg-accent text-white rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-primary">Current: {existingPdfFile.split('/').pop()}</p>
                        <p className="text-[10px] font-bold text-accent uppercase mt-1">Click to Replace Manuscript</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-accent" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-accent uppercase tracking-widest mb-1">Upload PDF Manuscript</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Drag and drop or click to browse</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-gray-50">
                {canApproveImmediately ? (
                  <>
                    <button 
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSubmit(d => handleFormSubmit(d, 'published'))}
                      className="flex-1 bg-accent text-white rounded-2xl py-5 font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                      Approve & Publish Immediately
                    </button>
                    <button 
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSubmit(d => handleFormSubmit(d, 'under_review'))}
                      className="bg-primary text-white rounded-2xl px-10 py-5 font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Clock className="w-5 h-5" /> Submit for Review
                    </button>
                  </>
                ) : (
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white rounded-2xl py-5 font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Submit Manuscript for Academic Review
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => navigate(-1)}
                  className="bg-gray-50 text-gray-400 rounded-2xl px-10 py-5 font-bold hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Admin & Guidelines */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Admin Notification Center */}
          {isAdmin && (
            <div className="bg-primary text-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/20 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-bold font-serif">Admin Notification Center</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex bg-white/10 p-1 rounded-xl">
                  <button 
                    onClick={() => setAdminNotify({ ...adminNotify, target: 'user' })}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${adminNotify.target === 'user' ? 'bg-white text-primary shadow-sm' : 'text-white/60 hover:text-white'}`}
                  >
                    Direct User
                  </button>
                  <button 
                    onClick={() => setAdminNotify({ ...adminNotify, target: 'all' })}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${adminNotify.target === 'all' ? 'bg-white text-primary shadow-sm' : 'text-white/60 hover:text-white'}`}
                  >
                    Broadcast All
                  </button>
                </div>

                {adminNotify.target === 'user' && (
                  <select 
                    value={adminNotify.userId}
                    onChange={(e) => setAdminNotify({ ...adminNotify, userId: e.target.value })}
                    className="w-full bg-white/10 border-none rounded-xl py-3 px-4 text-xs font-bold text-white placeholder:text-white/40 focus:ring-2 focus:ring-accent/50 outline-none"
                  >
                    <option value="" className="bg-primary">Select Recipient...</option>
                    {usersList.map(u => (
                      <option key={u.id} value={u.id} className="bg-primary">{u.first_name} {u.last_name} (@{u.username})</option>
                    ))}
                  </select>
                )}

                <input 
                  value={adminNotify.title}
                  onChange={(e) => setAdminNotify({ ...adminNotify, title: e.target.value })}
                  placeholder="Notification Title..."
                  className="w-full bg-white/10 border-none rounded-xl py-3 px-4 text-xs font-bold text-white placeholder:text-white/40 focus:ring-2 focus:ring-accent/50 outline-none"
                />
                
                <textarea 
                  value={adminNotify.message}
                  onChange={(e) => setAdminNotify({ ...adminNotify, message: e.target.value })}
                  placeholder="Notification content..."
                  className="w-full bg-white/10 border-none rounded-xl py-3 px-4 text-xs font-medium text-white placeholder:text-white/40 focus:ring-2 focus:ring-accent/50 outline-none h-24 resize-none"
                />

                <button 
                  onClick={handleSendAdminNotification}
                  className="w-full bg-accent text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-teal-500/20"
                >
                  <Send className="w-4 h-4" /> Dispatch Alert
                </button>
              </div>
            </div>
          )}

          {/* Guidelines Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" /> Submission Rules
            </h3>
            <ul className="space-y-4">
              {[
                { title: 'Originality', desc: 'Work must be original and not published elsewhere.' },
                { title: 'File Format', desc: 'Manuscripts must be in high-quality PDF format.' },
                { title: 'Peer Review', desc: 'Standard review takes 2-4 weeks for approval.' },
                { title: 'Ethics', desc: 'Adhere to academic honesty and citation standards.' }
              ].map((rule, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider">{rule.title}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{rule.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-6 border-t border-gray-50">
              <a href="#" className="flex items-center justify-between text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">
                View Full Guidelines <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-[#F7FAFC] rounded-[2.5rem] p-8 border border-gray-100 space-y-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-gray-400" /> Platform Metrics
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Articles</p>
                <p className="text-xl font-serif font-bold text-primary">2.4k+</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Citations</p>
                <p className="text-xl font-serif font-bold text-primary">12k+</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Support */}
      <div className="text-center pt-8">
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
          [Platform Name] Academic Trust & Integrity System
        </p>
      </div>
    </div>
  );
};

export default ManuscriptSubmission;
