import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import axiosInstance from '../api/axios';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      await axiosInstance.post('auth/forgot-password/', data);
      setSuccess(true);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout heroTitle="Reset Link Sent">
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="bg-accent/10 p-6 rounded-full mb-8">
            <Mail className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-4xl font-serif text-primary mb-4">Check Your Email</h2>
          <p className="text-gray-500 mb-8 max-w-sm font-medium">We've sent a password reset link to your email address. Please follow the instructions to reset your password.</p>
          <Link to="/login" className="flex items-center gap-2 text-accent font-bold hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Login</span>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      heroTitle="Recover Your Academic Account"
      heroText="Enter your registered email address and we'll send you a link to reset your password and regain access to your research."
    >
      <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-colors mb-12">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Login</span>
      </Link>

      <h2 className="text-4xl font-serif text-primary mb-2 tracking-tight">Forgot Password</h2>
      <p className="text-gray-400 mb-10 font-medium">We'll help you get back into ScholarLink</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {serverError && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100">{serverError}</div>}
        
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">Registered Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="e.g. researcher@university.edu"
            className="w-full px-8 py-5 bg-[#EBF1FF] rounded-[2rem] border-none placeholder-gray-300 focus:ring-2 focus:ring-primary transition-all text-primary font-medium"
          />
          {errors.email && <p className="text-red-500 text-xs px-4">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-[#287E7B] text-white py-6 rounded-[2rem] font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-teal-500/20"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <>
              <span className="text-lg">Send Reset Link</span>
              <Mail className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
