import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import axiosInstance from '../api/axios';
import { Loader2, KeyRound, CheckCircle2 } from 'lucide-react';

const schema = yup.object().shape({
  password: yup.string().required('New password is required').min(8),
  password2: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      await axiosInstance.post(`auth/reset-password/${uid}/${token}/`, {
        password: data.password,
        password2: data.password2
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Token expired or invalid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout heroTitle="Password Updated">
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="bg-accent/10 p-6 rounded-full mb-8">
            <CheckCircle2 className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-4xl font-serif text-primary mb-4">Password Reset!</h2>
          <p className="text-gray-500 mb-8 max-w-sm font-medium">Your password has been successfully updated. You can now log in with your new credentials.</p>
          <p className="text-sm text-gray-400">Redirecting to login...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      heroTitle="Secure Your Research Account"
      heroText="Create a strong, unique password to ensure your academic contributions and data remain protected."
    >
      <div className="bg-primary/5 p-4 rounded-2xl flex items-center gap-4 mb-10 border border-primary/5">
        <KeyRound className="w-8 h-8 text-primary" />
        <div>
          <h4 className="text-sm font-bold text-primary">Secure Update</h4>
          <p className="text-xs text-gray-500 font-medium tracking-tight">Set a strong new password for your account.</p>
        </div>
      </div>

      <h2 className="text-4xl font-serif text-primary mb-2 tracking-tight">Reset Password</h2>
      <p className="text-gray-400 mb-10 font-medium">Protect your intellectual property</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100">{serverError}</div>}
        
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">New Password</label>
          <input
            {...register('password')}
            type="password"
            placeholder="........"
            className="w-full px-8 py-5 bg-[#EBF1FF] rounded-[2rem] border-none placeholder-gray-300 focus:ring-2 focus:ring-primary transition-all text-primary"
          />
          {errors.password && <p className="text-red-500 text-xs px-4">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">Confirm New Password</label>
          <input
            {...register('password2')}
            type="password"
            placeholder="........"
            className="w-full px-8 py-5 bg-[#EBF1FF] rounded-[2rem] border-none placeholder-gray-300 focus:ring-2 focus:ring-primary transition-all text-primary"
          />
          {errors.password2 && <p className="text-red-500 text-xs px-4">{errors.password2.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-[#287E7B] text-white py-6 rounded-[2rem] font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 mt-4 shadow-lg shadow-teal-500/20"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <>
              <span className="text-lg">Update Password</span>
              <CheckCircle2 className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500 pt-4 font-medium">
          Remembered your password? <Link to="/login" className="text-accent font-bold hover:underline">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
