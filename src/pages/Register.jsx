import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import axiosInstance from '../api/axios';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

const schema = yup.object().shape({
  username: yup.string().required('Username is required').min(3),
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  institution: yup.string().required('Institution is required'),
  field_of_study: yup.string().required('Field of study is required'),
  academic_status: yup.string().required('Academic status is required'),
  password: yup.string().required('Password is required').min(8),
  password2: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  terms: yup.boolean().oneOf([true], 'You must agree to terms'),
});

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      academic_status: '',
      terms: false,
    }
  });

  const termsChecked = watch('terms');

  const onInvalid = (formErrors) => {
    console.log('Register form validation errors:', formErrors);
    setServerError('Please correct the highlighted fields and try again.');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      const { terms, ...payload } = data;
      console.log('Register payload:', payload);
      await axiosInstance.post('auth/register/', payload);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.log('Register request error:', err);
      const responseData = err.response?.data;
      if (typeof responseData === 'string') {
        setServerError(responseData);
      } else if (responseData?.message) {
        setServerError(responseData.message);
      } else if (responseData && typeof responseData === 'object') {
        const messages = [];
        for (const [key, value] of Object.entries(responseData)) {
          if (Array.isArray(value)) {
            messages.push(`${key}: ${value.join(' ')}`);
          } else if (typeof value === 'string') {
            messages.push(`${key}: ${value}`);
          }
        }
        setServerError(messages.join('\n') || 'Registration failed. Please check your data.');
      } else {
        setServerError('Registration failed. Please check your data.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center text-center py-12">
          <CheckCircle2 className="w-16 h-16 text-accent mb-6" />
          <h2 className="text-3xl font-serif text-primary mb-4">Registration Successful!</h2>
          <p className="text-text mb-8">A verification email has been sent to your inbox. Please verify your account to continue.</p>
          <p className="text-sm text-gray-400">Redirecting to login...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout heroTitle="Empowering Global Research Collaboration">
      <h2 className="text-4xl font-serif text-primary mb-8 tracking-tight">Join the Academic Community</h2>
      
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
        {serverError && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{serverError}</div>}
        
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2">Username *</label>
          <input
            {...register('username')}
            placeholder="Username"
            className="w-full px-6 py-4 bg-[#EBF1FF] rounded-2xl border-none placeholder-gray-400 focus:ring-2 focus:ring-primary transition-all"
          />
          {errors.username && <p className="text-red-500 text-xs px-2">{errors.username.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2">First Name *</label>
            <input
              {...register('first_name')}
              placeholder="First Name"
              className="w-full px-6 py-4 bg-[#EBF1FF] rounded-2xl border-none placeholder-gray-400 focus:ring-2 focus:ring-primary"
            />
            {errors.first_name && <p className="text-red-500 text-xs px-2">{errors.first_name.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2">Last Name *</label>
            <input
              {...register('last_name')}
              placeholder="Last Name"
              className="w-full px-6 py-4 bg-[#EBF1FF] rounded-2xl border-none placeholder-gray-400 focus:ring-2 focus:ring-primary"
            />
            {errors.last_name && <p className="text-red-500 text-xs px-2">{errors.last_name.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2">Email *</label>
          <input
            {...register('email')}
            placeholder="Email"
            className="w-full px-6 py-4 bg-[#EBF1FF] rounded-2xl border-none placeholder-gray-400 focus:ring-2 focus:ring-primary"
          />
          {errors.email && <p className="text-red-500 text-xs px-2">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2">Institution *</label>
          <input
            {...register('institution')}
            placeholder="Institution"
            className="w-full px-6 py-4 bg-[#EBF1FF] rounded-2xl border-none placeholder-gray-400 focus:ring-2 focus:ring-primary"
          />
          {errors.institution && <p className="text-red-500 text-xs px-2">{errors.institution.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2">Field of Study *</label>
            <input
              {...register('field_of_study')}
              placeholder="Field of Study"
              className="w-full px-6 py-4 bg-[#EBF1FF] rounded-2xl border-none placeholder-gray-400 focus:ring-2 focus:ring-primary"
            />
            {errors.field_of_study && <p className="text-red-500 text-xs px-2">{errors.field_of_study.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2">Academic Status *</label>
            <select
              {...register('academic_status')}
              className="w-full px-6 py-4 bg-[#EBF1FF] rounded-2xl border-none text-gray-400 focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="">Select Status</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
              <option value="phd">PhD</option>
              <option value="professor">Professor</option>
              <option value="researcher">Researcher</option>
              <option value="other">Other</option>
            </select>
            {errors.academic_status && <p className="text-red-500 text-xs px-2">{errors.academic_status.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2">Password *</label>
            <input
              {...register('password')}
              type="password"
              placeholder="........"
              className="w-full px-6 py-4 bg-[#EBF1FF] rounded-2xl border-none placeholder-gray-400 focus:ring-2 focus:ring-primary"
            />
            {errors.password && <p className="text-red-500 text-xs px-2">{errors.password.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2">Confirm Password *</label>
            <input
              {...register('password2')}
              type="password"
              placeholder="........"
              className="w-full px-6 py-4 bg-[#EBF1FF] rounded-2xl border-none placeholder-gray-400 focus:ring-2 focus:ring-primary"
            />
            {errors.password2 && <p className="text-red-500 text-xs px-2">{errors.password2.message}</p>}
          </div>
        </div>

        <div className="flex items-start gap-2 px-2">
          <input
            {...register('terms')}
            type="checkbox"
            id="terms"
            className="w-4 h-4 mt-0.5 rounded text-accent border-gray-300 focus:ring-accent"
          />
          <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
            I agree to the Platform Publishing Rules, Privacy Policy, and Terms of Service.
          </label>
        </div>
        {errors.terms && <p className="text-red-500 text-xs px-2">{errors.terms.message}</p>}

        <button
          type="submit"
          disabled={loading || !termsChecked}
          className="w-full bg-accent hover:bg-[#287E7B] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-accent font-bold hover:underline">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
