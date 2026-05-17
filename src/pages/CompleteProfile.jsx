import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Upload, 
  User, 
  GraduationCap, 
  BookOpen, 
  Link as LinkIcon, 
  Linkedin, 
  Globe, 
  X, 
  ChevronRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useUpdateProfileMutation } from '../api/baseApi';
import { useSelector } from 'react-redux';

// Validation Schema
const schema = yup.object().shape({
  institution: yup.string().required('Institution is required'),
  major: yup.string().required('Field of study is required'),
  academic_status: yup.string().required('Academic status is required'),
  graduation_year: yup.string().required('Graduation year is required'),
  bio: yup.string().max(300, 'Bio must be less than 300 words').required('Bio is required'),
  orcid_id: yup.string().matches(/^(\d{4}-){3}\d{3}[\dX]$|^$/, 'Invalid ORCID format (e.g. 0000-0002-1825-0097)'),
  linkedin_url: yup.string().url('Invalid URL').nullable(),
  personal_website: yup.string().url('Invalid URL').nullable(),
});

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  
  // Local States
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      academic_status: 'undergraduate'
    }
  });

  const bioValue = watch('bio', '');
  const wordCount = bioValue.trim() ? bioValue.trim().split(/\s+/).length : 0;

  // Avatar Handlers
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, []);

  // Tags Handlers
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => formData.append(key, data[key]));
      if (avatarFile) formData.append('avatar', avatarFile);
      formData.append('expertise_tags', JSON.stringify(tags));

      await updateProfile(formData).unwrap();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleSkip = () => {
    // In a real app, you'd use a toast library here
    alert("You can complete your profile later from settings");
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Progress Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <p className="text-accent font-bold text-xs uppercase tracking-[0.2em] mb-4">Step 2 of 3</p>
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Let's complete your academic profile</h1>
          <p className="text-gray-400 font-medium italic">Help other researchers find and connect with you based on your expertise.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-50 overflow-hidden flex flex-col lg:flex-row animate-in zoom-in-95 duration-700">
          
          {/* Left Side: Live Preview */}
          <div className="lg:w-1/3 bg-[#F8FAFC] p-10 flex flex-col items-center justify-center border-r border-gray-50">
            <div className="relative group mb-8">
              <div 
                className={`w-48 h-48 rounded-full border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-300 ${isDragging ? 'scale-110 border-accent' : 'scale-100'}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="bg-white w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <User className="w-20 h-20 mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Drop Image</span>
                  </div>
                )}
                
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer rounded-full">
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Change Photo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif font-bold text-primary">{user?.first_name} {user?.last_name}</h2>
              <p className="text-accent font-bold text-sm tracking-tight">{watch('major') || 'Field of Study'}</p>
              <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-medium">
                <GraduationCap className="w-4 h-4" />
                <span>{watch('institution') || 'Institution Name'}</span>
              </div>
            </div>

            {/* Tags Preview */}
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-white border border-gray-100 text-[10px] font-bold text-gray-500 rounded-full uppercase tracking-widest">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:w-2/3 p-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Institution */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-accent" />
                    Institution / University
                  </label>
                  <input 
                    {...register('institution')}
                    placeholder="e.g. Stanford University"
                    className={`w-full bg-[#F7FAFC] border-none rounded-2xl py-4 px-6 text-sm placeholder-gray-300 focus:ring-2 focus:ring-accent/20 transition-all outline-none ${errors.institution ? 'ring-2 ring-red-100' : ''}`}
                  />
                  {errors.institution && <p className="text-[10px] text-red-500 font-bold ml-4">{errors.institution.message}</p>}
                </div>

                {/* Major */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent" />
                    Field of Study / Major
                  </label>
                  <input 
                    {...register('major')}
                    placeholder="e.g. Computational Biology"
                    className={`w-full bg-[#F7FAFC] border-none rounded-2xl py-4 px-6 text-sm placeholder-gray-300 focus:ring-2 focus:ring-accent/20 transition-all outline-none ${errors.major ? 'ring-2 ring-red-100' : ''}`}
                  />
                  {errors.major && <p className="text-[10px] text-red-500 font-bold ml-4">{errors.major.message}</p>}
                </div>

                {/* Academic Status */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Academic Status</label>
                  <select 
                    {...register('academic_status')}
                    className="w-full bg-[#F7FAFC] border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-accent/20 transition-all outline-none appearance-none"
                  >
                    <option value="undergraduate">Undergraduate Student</option>
                    <option value="graduate">Graduate Student</option>
                    <option value="phd">PhD Candidate</option>
                    <option value="professor">Professor</option>
                    <option value="researcher">Independent Researcher</option>
                  </select>
                </div>

                {/* Graduation Year */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Graduation Year</label>
                  <input 
                    {...register('graduation_year')}
                    placeholder="e.g. 2024"
                    className="w-full bg-[#F7FAFC] border-none rounded-2xl py-4 px-6 text-sm placeholder-gray-300 focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Short Bio / About Me</label>
                  <span className={`text-[10px] font-bold ${wordCount > 300 ? 'text-red-500' : 'text-gray-300'}`}>
                    {wordCount} / 300 words
                  </span>
                </div>
                <textarea 
                  {...register('bio')}
                  rows="4"
                  placeholder="Tell the community about your research interests and academic journey..."
                  className="w-full bg-[#F7FAFC] border-none rounded-[2rem] py-5 px-8 text-sm placeholder-gray-300 focus:ring-2 focus:ring-accent/20 transition-all outline-none resize-none"
                ></textarea>
                {errors.bio && <p className="text-[10px] text-red-500 font-bold ml-4">{errors.bio.message}</p>}
              </div>

              {/* Expertise Tags */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expertise Tags (Press Enter to add)</label>
                <div className="bg-[#F7FAFC] p-4 rounded-2xl flex flex-wrap gap-2 items-center min-h-[64px]">
                  {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-white shadow-sm text-xs font-bold text-primary rounded-xl">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer text-gray-400 hover:text-red-500" onClick={() => removeTag(tag)} />
                    </span>
                  ))}
                  <input 
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "Add skills e.g. Machine Learning, Physics..." : ""}
                    className="bg-transparent border-none outline-none text-sm flex-1 min-w-[120px]"
                  />
                </div>
              </div>

              {/* Optional Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    ORCID ID
                  </label>
                  <input 
                    {...register('orcid_id')}
                    placeholder="0000-0000-0000-0000"
                    className="w-full bg-[#F7FAFC] border-none rounded-2xl py-4 px-6 text-sm placeholder-gray-300 focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                  />
                  {errors.orcid_id && <p className="text-[10px] text-red-500 font-bold ml-4">{errors.orcid_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-accent" />
                    LinkedIn Profile
                  </label>
                  <input 
                    {...register('linkedin_url')}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-[#F7FAFC] border-none rounded-2xl py-4 px-6 text-sm placeholder-gray-300 focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 flex flex-col sm:flex-row items-center gap-6">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:flex-1 bg-accent hover:bg-[#287E7B] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-teal-500/20 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                  <span>Save & Continue to Dashboard</span>
                </button>
                <button 
                  type="button"
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-primary text-sm font-bold transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-gray-300 font-medium uppercase tracking-[0.2em]">
            Your information is used for academic verification and peer-networking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
