import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  BookOpen,
  ChevronRight,
  Plus,
  Tag,
  Users,
  Calendar,
  Lock,
  Link as LinkIcon
} from 'lucide-react';
import { useGetCategoriesQuery, useCreateArticleMutation } from '../api/baseApi';

// ═══════════════════════════════════════════════════════════════════
// Paper Card Component - Individual paper upload form
// ═══════════════════════════════════════════════════════════════════
const PaperCard = ({ 
  paper, 
  index, 
  onUpdate, 
  onRemove, 
  categories, 
  isUploading, 
  uploadStatus 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (field, value) => {
    onUpdate(index, { ...paper, [field]: value });
  };

  const addTag = (tag) => {
    if (tag.trim() && !paper.keywords.includes(tag.trim())) {
      handleChange('keywords', [...paper.keywords, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove) => {
    handleChange('keywords', paper.keywords.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden
      ${isExpanded ? 'shadow-lg border-gray-100' : 'shadow-sm border-gray-50'}
      ${uploadStatus === 'success' ? 'border-green-200 bg-green-50/30' : ''}
      ${uploadStatus === 'error' ? 'border-red-200 bg-red-50/30' : ''}
    `}>
      {/* Card Header */}
      <div 
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all
            ${uploadStatus === 'success' ? 'bg-green-100 text-green-600' : 
              uploadStatus === 'error' ? 'bg-red-100 text-red-600' : 
              'bg-accent/10 text-accent'}
          `}>
            {uploadStatus === 'success' ? <CheckCircle2 className="w-6 h-6" /> :
             uploadStatus === 'error' ? <AlertCircle className="w-6 h-6" /> :
             <FileText className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-bold text-primary text-sm">
              {paper.title || `Paper ${index + 1}`}
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {paper.fileName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {uploadStatus === 'uploading' && (
            <Loader2 className="w-5 h-5 text-accent animate-spin" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <ChevronRight className={`w-5 h-5 text-gray-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {/* Expandable Form */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-5">
          {/* Title */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={paper.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter paper title..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-primary placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>

          {/* Abstract */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
              Abstract <span className="text-red-500">*</span>
            </label>
            <textarea
              value={paper.abstract}
              onChange={(e) => handleChange('abstract', e.target.value)}
              placeholder="Enter abstract..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-primary placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
            />
          </div>

          {/* Authors */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                Authors (comma separated)
              </span>
            </label>
            <input
              type="text"
              value={paper.authors}
              onChange={(e) => handleChange('authors', e.target.value)}
              placeholder="Dr. John Smith, Dr. Jane Doe, ..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-primary placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>

          {/* Category & Year Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={paper.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none cursor-pointer"
              >
                <option value="">Select category</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Publication Year
                </span>
              </label>
              <input
                type="number"
                value={paper.publicationYear}
                onChange={(e) => handleChange('publicationYear', e.target.value)}
                placeholder="2024"
                min="1900"
                max="2099"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-primary placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Keywords
              </span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {paper.keywords.map((tag, i) => (
                <span 
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add keyword and press Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-primary placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>

          {/* Access Level */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Access Level
              </span>
            </label>
            <div className="flex gap-3">
              {['public', 'private', 'institutional'].map((level) => (
                <button
                  key={level}
                  onClick={() => handleChange('accessLevel', level)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                    ${paper.accessLevel === level 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* DOI */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
              <span className="flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                DOI (optional)
              </span>
            </label>
            <input
              type="text"
              value={paper.doi}
              onChange={(e) => handleChange('doi', e.target.value)}
              placeholder="10.xxxx/xxxxx"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-primary placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Main Bulk Upload Component
// ═══════════════════════════════════════════════════════════════════
const BulkPaperUpload = () => {
  const fileInputRef = useRef(null);
  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const [createArticle, { isLoading: isCreating }] = useCreateArticleMutation();
  
  const [papers, setPapers] = useState([
    {
      fileName: 'paper1.pdf',
      file: null,
      title: '',
      abstract: '',
      authors: '',
      category: '',
      keywords: [],
      publicationYear: new Date().getFullYear(),
      accessLevel: 'public',
      doi: ''
    },
    {
      fileName: 'paper2.pdf',
      file: null,
      title: '',
      abstract: '',
      authors: '',
      category: '',
      keywords: [],
      publicationYear: new Date().getFullYear(),
      accessLevel: 'public',
      doi: ''
    },
    {
      fileName: 'paper3.pdf',
      file: null,
      title: '',
      abstract: '',
      authors: '',
      category: '',
      keywords: [],
      publicationYear: new Date().getFullYear(),
      accessLevel: 'public',
      doi: ''
    },
    {
      fileName: 'paper4.pdf',
      file: null,
      title: '',
      abstract: '',
      authors: '',
      category: '',
      keywords: [],
      publicationYear: new Date().getFullYear(),
      accessLevel: 'public',
      doi: ''
    }
  ]);

  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadResults, setUploadResults] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [globalSuccess, setGlobalSuccess] = useState(null);

  const handleFileSelect = (index, file) => {
    const updatedPapers = [...papers];
    updatedPapers[index] = {
      ...updatedPapers[index],
      file: file,
      fileName: file.name,
      title: file.name.replace('.pdf', '').replace(/_/g, ' ').replace(/-/g, ' ')
    };
    setPapers(updatedPapers);
  };

  const handleUpdatePaper = (index, updatedPaper) => {
    const updatedPapers = [...papers];
    updatedPapers[index] = updatedPaper;
    setPapers(updatedPapers);
  };

  const handleRemovePaper = (index) => {
    setPapers(papers.filter((_, i) => i !== index));
  };

  const validatePaper = (paper) => {
    const errors = [];
    if (!paper.title.trim()) errors.push('Title is required');
    if (!paper.abstract.trim()) errors.push('Abstract is required');
    if (!paper.category) errors.push('Category is required');
    return errors;
  };

  const handleUploadAll = async () => {
    setGlobalError(null);
    setGlobalSuccess(null);

    // Validate all papers
    for (let i = 0; i < papers.length; i++) {
      const errors = validatePaper(papers[i]);
      if (errors.length > 0) {
        setGlobalError(`Paper ${i + 1}: ${errors.join(', ')}`);
        return;
      }
    }

    // Upload papers sequentially
    for (let i = 0; i < papers.length; i++) {
      const paper = papers[i];
      
      setUploadProgress(prev => ({ ...prev, [i]: 'uploading' }));

      try {
        const formData = new FormData();
        
        // Add PDF file
        if (paper.file) {
          formData.append('pdf_file', paper.file);
        }
        
        // Add metadata
        formData.append('title', paper.title);
        formData.append('abstract', paper.abstract);
        formData.append('authors', paper.authors);
        formData.append('category', paper.category);
        formData.append('publication_year', paper.publicationYear);
        formData.append('access_level', paper.accessLevel);
        if (paper.doi) formData.append('doi', paper.doi);
        
        // Add keywords as JSON
        if (paper.keywords.length > 0) {
          formData.append('keywords', JSON.stringify(paper.keywords));
        }

        await createArticle(formData).unwrap();
        
        setUploadProgress(prev => ({ ...prev, [i]: 'success' }));
        setUploadResults(prev => ({ ...prev, [i]: { success: true } }));
      } catch (error) {
        console.error(`Failed to upload paper ${i + 1}:`, error);
        setUploadProgress(prev => ({ ...prev, [i]: 'error' }));
        setUploadResults(prev => ({ 
          ...prev, 
          [i]: { success: false, error: error.message || 'Upload failed' } 
        }));
      }
    }

    const successCount = Object.values(uploadResults).filter(r => r?.success).length;
    if (successCount === papers.length) {
      setGlobalSuccess(`All ${papers.length} papers uploaded successfully!`);
    } else {
      setGlobalSuccess(`${successCount} of ${papers.length} papers uploaded successfully.`);
    }
  };

  const handleAddMore = () => {
    setPapers([...papers, {
      fileName: `paper${papers.length + 1}.pdf`,
      file: null,
      title: '',
      abstract: '',
      authors: '',
      category: '',
      keywords: [],
      publicationYear: new Date().getFullYear(),
      accessLevel: 'public',
      doi: ''
    }]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-accent/10 p-2 rounded-xl">
              <Upload className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-primary tracking-tight">
              Bulk Paper Upload
            </h1>
          </div>
          <p className="text-sm text-gray-400 font-medium ml-14">
            Upload multiple scientific papers with complete metadata
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Alerts */}
        {globalError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{globalError}</p>
          </div>
        )}

        {globalSuccess && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{globalSuccess}</p>
          </div>
        )}

        {/* Paper List */}
        <div className="space-y-4">
          {papers.map((paper, index) => (
            <PaperCard
              key={index}
              paper={paper}
              index={index}
              onUpdate={handleUpdatePaper}
              onRemove={handleRemovePaper}
              categories={categories}
              isUploading={uploadProgress[index] === 'uploading'}
              uploadStatus={uploadProgress[index]}
            />
          ))}
        </div>

        {/* Add More Button */}
        <button
          onClick={handleAddMore}
          className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-accent hover:border-accent hover:bg-accent/5 transition-all flex items-center justify-center gap-2 font-bold text-sm"
        >
          <Plus className="w-5 h-5" />
          Add Another Paper
        </button>

        {/* Upload Button */}
        <div className="sticky bottom-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-400 font-medium">
            {papers.length} papers ready to upload
          </div>
          <button
            onClick={handleUploadAll}
            disabled={isCreating}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload All Papers
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkPaperUpload;
