/**
 * ManuscriptSubmission Component
 * ScholarLink Academic Platform
 * 
 * Features:
 * - PDF Manuscript Submission (multipart/form-data)
 * - Dynamic Category Selection
 * - Submission Formatting (Font, Margins, Figures)
 * - Active Journals Display with Guidelines
 * - Journal Recommendations after submission
 */

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  X, 
  Loader2, 
  Layers,
  Hash,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Star,
  ExternalLink
} from 'lucide-react';
import { 
  useCreateArticleMultipartMutation, 
  useGetCategoriesQuery,
  useGetPublicJournalsQuery,
  useGetRecommendedJournalsForArticleQuery,
  useGetLandingStatsQuery
} from '../api/baseApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Validation Schema
const schema = yup.object().shape({
  title: yup.string().required('Article title is required').max(255, 'Title must be less than 255 characters'),
  abstract: yup.string().required('Abstract is required').max(3000, 'Abstract must be less than 3000 characters'),
  category_id: yup.number().required('Please select a category').typeError('Please select a category'),
  location: yup.string().optional(),
});

const ManuscriptSubmission = () => {
  const navigate = useNavigate();
  
  // Local State
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submittedArticleId, setSubmittedArticleId] = useState(null);
  const [expandedJournalId, setExpandedJournalId] = useState(null);
  const [expandedRecJournalId, setExpandedRecJournalId] = useState(null);
  const [apiErrors, setApiErrors] = useState(null);

  // API Hooks
  const [createArticle, { isLoading: isSubmitting }] = useCreateArticleMultipartMutation();
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const { data: journalsData, isLoading: isLoadingJournals } = useGetPublicJournalsQuery();
  const { data: recommendationsData, isLoading: isLoadingRecommendations } = useGetRecommendedJournalsForArticleQuery(submittedArticleId, { skip: !submittedArticleId });
  const { data: statsData } = useGetLandingStatsQuery();

  // Data Formatting
  const categoriesList = useMemo(() => {
    if (!categoriesData) return [];
    if (Array.isArray(categoriesData)) return categoriesData;
    if (Array.isArray(categoriesData.results)) return categoriesData.results;
    return [];
  }, [categoriesData]);

  const journalsList = useMemo(() => {
    if (!journalsData) return [];
    if (Array.isArray(journalsData)) return journalsData;
    if (Array.isArray(journalsData.results)) return journalsData.results;
    return [];
  }, [journalsData]);

  // Form Setup
  const defaultValues = {
    title: '',
    abstract: '',
    category_id: '',
    location: '',
  }
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues
  });

  // Handlers
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
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

  const handleFormSubmit = async (data) => {
    setApiErrors(null);
    
    if (!pdfFile) {
      setApiErrors({ pdf_file: ['Please upload your manuscript PDF.'] });
      toast.error('Please upload your manuscript PDF.');
      return;
    }

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('abstract', data.abstract);
    formData.append('category_id', data.category_id);
    formData.append('location', data.location || '');
    formData.append('tags', tags.join(','));
    formData.append('pdf_file', pdfFile);

    try {
      const result = await createArticle(formData).unwrap();
      setSubmittedArticleId(result.id);
      setSubmissionSuccess(true);
      setApiErrors(null);
      toast.success('Manuscript submitted successfully for academic review!');
    } catch (err) {
      console.error('Submission failed:', err);
      
      // Handle different error structures
      if (err.data) {
        if (typeof err.data === 'object') {
          setApiErrors(err.data);
          // Show a general toast
          const fieldErrors = Object.values(err.data).flat();
          toast.error(fieldErrors[0] || 'Failed to submit manuscript. Please check all fields.');
        } else if (err.data.detail) {
          toast.error(err.data.detail);
        } else {
          toast.error('Failed to submit manuscript. Please try again.');
        }
      } else {
        toast.error('Failed to submit manuscript. Please try again.');
      }
    }
  };

  if (isLoadingCategories) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-accent mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
        <div className="space-y-2">
          <span className="bg-accent/10 text-accent text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            Submission Portal
          </span>
          <h1 className="text-4xl font-serif font-bold text-primary tracking-tight">
            Manuscript Submission
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

      {submissionSuccess ? (
        /* Success State with Recommendations */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-primary mb-4">Submission Successful!</h2>
            <p className="text-gray-600 mb-8">Your manuscript has been submitted and is now under review.</p>
            
            {/* Journal Recommendations */}
            {isLoadingRecommendations ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : recommendationsData?.journals && recommendationsData.journals.length > 0 ? (
              <div className="text-left">
                <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent" /> Recommended Journals
                </h3>
                <div className="space-y-4">
                  {recommendationsData.journals.map((journal) => (
                    <div key={journal.id} className="bg-[#F7FAFC] rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-primary">{journal.name}</h4>
                          <p className="text-sm text-accent font-medium">Matches your field: {journal.field_of_study}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-lg">
                            IF: {journal.impact_factor}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedRecJournalId(expandedRecJournalId === journal.id ? null : journal.id)}
                        className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-2 hover:underline"
                      >
                        {expandedRecJournalId === journal.id ? (
                          <><ChevronUp className="w-4 h-4" /> Hide Requirements</>
                        ) : (
                          <><ChevronDown className="w-4 h-4" /> View Requirements</>
                        )}
                      </button>
                      {expandedRecJournalId === journal.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Publication Type</p>
                            <p className="font-medium text-primary">{journal.publication_type === 'open_access' ? 'Open Access' : 'Subscription'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Publication Fee</p>
                            <p className="font-medium text-primary">{journal.publication_fee === '0.00' ? 'Free' : `$${journal.publication_fee}`}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-6 italic">
                  Our team will review your submission and nominate the most suitable journal within 2-4 weeks.
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No journal recommendations available at this time.</p>
            )}
            
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-8 bg-primary text-white rounded-2xl px-10 py-4 font-bold hover:opacity-90 transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        /* Submission Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: The Form */}
          <div className="lg:col-span-8 space-y-8">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 space-y-10">
                
                {/* Section 1: Research Information */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <FileText className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-bold text-primary uppercase tracking-widest">Research Information</h2>
                  </div>

                  {/* Title Input */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-1 flex justify-between">
                      Research Title <span className="text-red-500">*</span> <span className="text-gray-300 font-normal">{watch('title')?.length || 0}/500</span>
                    </label>
                    <input 
                      {...register('title')}
                      placeholder="Enter the full title of your research paper..."
                      className={`w-full bg-[#F7FAFC] border-none rounded-2xl py-4 px-6 text-lg font-serif font-bold text-primary placeholder:text-gray-300 focus:ring-4 focus:ring-accent/5 transition-all outline-none ${(apiErrors?.title) ? 'ring-2 ring-red-500/20' : ''}`}
                    />
                    {(apiErrors?.title) && (
                      <div className="text-xs text-red-500 font-bold px-1">
                        {Array.isArray(apiErrors.title) ? apiErrors.title[0] : apiErrors.title.message || apiErrors.title}
                      </div>
                    )}
                  </div>

                  {/* Abstract Area */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-1 flex justify-between">
                      Abstract Summary <span className="text-red-500">*</span> <span className="text-gray-300 font-normal">{watch('abstract')?.length || 0}/3000</span>
                    </label>
                    <textarea 
                      {...register('abstract')}
                      rows={6}
                      placeholder="Provide a concise summary of your research objectives, methodology, and key findings..."
                      className={`w-full bg-[#F7FAFC] border-none rounded-2xl py-4 px-6 text-sm leading-relaxed text-gray-600 placeholder:text-gray-300 focus:ring-4 focus:ring-accent/5 transition-all outline-none resize-none ${(apiErrors?.abstract) ? 'ring-2 ring-red-500/20' : ''}`}
                    />
                    {(apiErrors?.abstract) && (
                      <div className="text-xs text-red-500 font-bold px-1">
                        {Array.isArray(apiErrors.abstract) ? apiErrors.abstract[0] : apiErrors.abstract.message || apiErrors.abstract}
                      </div>
                    )}
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                      <Layers className="w-3 h-3" /> Research Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('category_id')}
                      className={`w-full bg-[#F7FAFC] border-none rounded-2xl py-4 px-6 text-sm font-bold text-primary focus:ring-4 focus:ring-accent/5 outline-none cursor-pointer appearance-none ${(apiErrors?.category_id) ? 'ring-2 ring-red-500/20' : ''}`}
                    >
                      <option value="">Select a Category...</option>
                      {categoriesList.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {(apiErrors?.category_id) && (
                      <div className="text-xs text-red-500 font-bold px-1">
                        {Array.isArray(apiErrors.category_id) ? apiErrors.category_id[0] : apiErrors.category_id.message || apiErrors.category_id}
                      </div>
                    )}
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

                  {/* Location */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-1">
                      Research Location <span className="text-gray-300 font-normal">(Optional)</span>
                    </label>
                    <input 
                      {...register('location')}
                      placeholder="e.g. Cambridge, MA, USA"
                      className="w-full bg-[#F7FAFC] border-none rounded-2xl py-4 px-6 text-sm font-bold text-primary placeholder:text-gray-300 focus:ring-4 focus:ring-accent/5 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Section 2: Manuscript Upload */}
                <div className="space-y-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <Upload className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-bold text-primary uppercase tracking-widest">Manuscript Upload</h2>
                  </div>

                  {/* PDF Upload Area */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                      Manuscript PDF File <span className="text-red-500">*</span>
                    </label>
                    <div 
                      onClick={() => document.getElementById('pdf-upload').click()}
                      className={`h-[200px] border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-5 cursor-pointer transition-all group ${pdfFile ? 'border-green-500/30 bg-green-50/30' : 'border-accent/20 bg-accent/5 hover:bg-accent/10'} ${apiErrors?.pdf_file ? 'border-red-500 bg-red-50/30' : ''}`}
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
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-accent" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-accent uppercase tracking-widest mb-1">Upload PDF Manuscript</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Drag and drop or click to browse (Max 50MB)</p>
                          </div>
                        </>
                      )}
                    </div>
                    {(apiErrors?.pdf_file) && (
                      <div className="text-xs text-red-500 font-bold px-1">
                        {Array.isArray(apiErrors.pdf_file) ? apiErrors.pdf_file[0] : apiErrors.pdf_file.message || apiErrors.pdf_file}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-8 border-t border-gray-50">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-accent text-white rounded-2xl py-5 font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Submit Manuscript for Academic Review
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Block 1: Formatting Guidelines */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 space-y-6">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent" /> Formatting Guidelines
              </h3>
              <div className="space-y-4">
                <div className="bg-[#F7FAFC] rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Font</p>
                  <p className="text-sm font-medium text-primary">12pt Times New Roman, double-spaced</p>
                </div>
                <div className="bg-[#F7FAFC] rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Margins</p>
                  <p className="text-sm font-medium text-primary">1 inch on all sides</p>
                </div>
                <div className="bg-[#F7FAFC] rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Figures</p>
                  <p className="text-sm font-medium text-primary">300 DPI, max 5 inches wide</p>
                </div>
                <div className="bg-[#F7FAFC] rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Citation Style</p>
                  <p className="text-sm font-medium text-primary">APA 7th Edition</p>
                </div>
              </div>
            </div>

            {/* Block 2: Submission Rules */}
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
            </div>

            {/* Block 2: Platform Metrics */}
            <div className="bg-[#F7FAFC] rounded-[2.5rem] p-8 border border-gray-100 space-y-4">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Platform Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Articles</p>
                  <p className="text-xl font-serif font-bold text-primary">{statsData?.total_articles || '0'}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Citations</p>
                  <p className="text-xl font-serif font-bold text-primary">{statsData?.total_citations || '0'}</p>
                </div>
              </div>
            </div>

            {/* Block 3: Active Journals */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 space-y-6">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" /> Active Journals
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {isLoadingJournals ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  </div>
                ) : journalsList.length > 0 ? (
                  journalsList.map((journal) => (
                    <div key={journal.id} className="bg-[#F7FAFC] rounded-2xl p-4 border border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-primary mb-1">{journal.name}</h4>
                          <p className="text-xs text-accent font-medium">{journal.field_of_study}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-1 rounded-lg">
                            IF: {journal.impact_factor}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${journal.publication_type === 'open_access' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {journal.publication_type === 'open_access' ? 'Open Access' : 'Subscription'}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-primary mb-2">
                        {journal.publication_fee === '0.00' ? 'Free' : `$${journal.publication_fee}`}
                      </p>
                      <button
                        onClick={() => setExpandedJournalId(expandedJournalId === journal.id ? null : journal.id)}
                        className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-1 hover:underline"
                      >
                        {expandedJournalId === journal.id ? (
                          <><ChevronUp className="w-3 h-3" /> Hide Guidelines</>
                        ) : (
                          <><ChevronDown className="w-3 h-3" /> View Guidelines</>
                        )}
                      </button>
                      {expandedJournalId === journal.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-xs">
                          {journal.font_guidelines && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Font</p>
                              <p className="text-gray-600">{journal.font_guidelines}</p>
                            </div>
                          )}
                          {journal.margin_guidelines && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Margins</p>
                              <p className="text-gray-600">{journal.margin_guidelines}</p>
                            </div>
                          )}
                          {journal.figure_guidelines && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Figures</p>
                              <p className="text-gray-600">{journal.figure_guidelines}</p>
                            </div>
                          )}
                          {journal.citation_style && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Citation</p>
                              <p className="text-gray-600">{journal.citation_style}</p>
                            </div>
                          )}
                          {(journal.min_word_count || journal.max_word_count) && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Word Limit</p>
                              <p className="text-gray-600">
                                {journal.min_word_count && `Min: ${journal.min_word_count}`}
                                {journal.min_word_count && journal.max_word_count && ' | '}
                                {journal.max_word_count && `Max: ${journal.max_word_count}`}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">No active journals available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManuscriptSubmission;
