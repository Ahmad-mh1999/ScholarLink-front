/**
 * ResendVerification Page
 * Purpose: Allow users to request a new email verification link
 * Route: /resend-verification
 * Backend: POST /api/v1/auth/resend-verification/
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Mail, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  Send,
  AlertCircle
} from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import axiosInstance from '../api/axios';

// Validation schema
const schema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const ResendVerification = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    
    try {
      await axiosInstance.post('auth/resend-verification/', data);
      setSuccess(true);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.email?.[0] ||
                          'Failed to resend verification email. Please try again.';
      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-50 text-center space-y-8">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h2 className="text-3xl font-serif font-bold text-primary tracking-tight">
                Check Your Email
              </h2>
              <p className="text-gray-400 font-medium leading-relaxed">
                We've sent a new verification link to your email address. Please check your inbox and click the link to verify your account.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-[#F7FAFC] p-6 rounded-2xl text-left">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-primary mb-1">Didn't receive it?</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Check your spam or junk folder</li>
                    <li>• Make sure your email address is correct</li>
                    <li>• Wait a few minutes and try again</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <Link
                to="/login"
                className="w-full bg-accent hover:bg-[#287E7B] text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20"
              >
                Go to Login
              </Link>
              <button
                onClick={() => setSuccess(false)}
                className="w-full text-gray-400 hover:text-primary font-bold text-sm transition-colors"
              >
                Resend to another email
              </button>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Back Link */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-primary font-bold text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Main Card */}
        <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-50">
          {/* Header */}
          <div className="text-center space-y-4 mb-10">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-10 h-10 text-accent" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary tracking-tight">
                Resend Verification
              </h2>
              <p className="text-gray-400 font-medium mt-2">
                Enter your email address and we'll send you a new verification link.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Enter your registered email"
                  className="w-full bg-[#F7FAFC] border-2 border-transparent focus:border-accent/20 rounded-2xl py-4 pl-14 pr-5 text-sm placeholder-gray-400 outline-none transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{serverError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-[#287E7B] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Verification Link
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-50 text-center space-y-3">
            <p className="text-sm text-gray-400">
              Already verified?{' '}
              <Link to="/login" className="text-accent font-bold hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent font-bold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-xs text-gray-300 mt-8">
          If you're still having trouble, please contact our support team for assistance.
        </p>
      </div>
    </AuthLayout>
  );
};

export default ResendVerification;
