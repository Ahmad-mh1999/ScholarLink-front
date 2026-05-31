import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AuthLayout from '../layouts/AuthLayout';
import axiosInstance from '../api/axios';
import { setCredentials } from '../features/auth/authSlice';
import tokenService from '../services/tokenService';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowRight } from 'lucide-react';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { fetchCurrentUser } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      console.log('[AUTH DEBUG] Sending login request...');
      const response = await axiosInstance.post('auth/login/', data);
      
      console.log('[AUTH DEBUG] Login Response:', response.data);
      
      const { access, refresh } = response.data;
      
      if (!access) {
        throw new Error('No access token received from login');
      }

      // 1. Save tokens first so subsequent requests are authenticated
      tokenService.setTokens(access, refresh);
      
      // 2. IMMEDIATELY fetch fresh user data from /users/me/
      // This ensures we have the latest role even if the token or login response is stale
      const freshUser = await fetchCurrentUser();
      
      if (!freshUser) {
        throw new Error('Failed to fetch user profile after login');
      }

      console.log('[AUTH DEBUG] Fresh User from /me/:', freshUser);
      console.log('[AUTH DEBUG] Final Role:', freshUser?.role);
      console.log('[AUTH DEBUG] Is Admin?', freshUser?.is_staff === true || freshUser?.role === 'admin');

      const isSuperAdmin = !!(freshUser?.is_superuser || freshUser?.role === 'admin' || freshUser?.role === 'super_admin');
      const nextPath = isSuperAdmin ? '/super-admin-dashboard' : '/';
      navigate(nextPath);

    } catch (err) {
      console.error('[AUTH DEBUG] Login error:', err.response?.data || err.message);
      setServerError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      heroText="Access your research dashboard, collaborate with peers, and continue your academic journey."
    >
      <h2 className="text-4xl font-serif text-primary mb-2 tracking-tight">Sign In</h2>
      <p className="text-gray-400 mb-8 font-medium">Continue your academic contribution</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100">{serverError}</div>}
        
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">Email Address</label>
          <input
            {...register('email')}
            type="email"
            placeholder="e.g. researcher@university.edu"
            className="w-full px-8 py-5 bg-[#EBF1FF] rounded-[2rem] border-none placeholder-gray-300 focus:ring-2 focus:ring-primary transition-all text-primary font-medium"
          />
          {errors.email && <p className="text-red-500 text-xs px-4">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
            <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">
              Forgot Password?
            </Link>
          </div>
          <input
            {...register('password')}
            type="password"
            placeholder="........"
            className="w-full px-8 py-5 bg-[#EBF1FF] rounded-[2rem] border-none placeholder-gray-300 focus:ring-2 focus:ring-primary transition-all text-primary"
          />
          {errors.password && <p className="text-red-500 text-xs px-4">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-[#287E7B] text-white py-6 rounded-[2rem] font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 mt-8 shadow-lg shadow-teal-500/20"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <>
              <span className="text-lg">Sign In</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500 pt-4 font-medium">
          Don't have an account? <Link to="/register" className="text-accent font-bold hover:underline ml-1">Create Account</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
