import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import axios from 'axios';

const EmailVerification = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`/api/v1/auth/verify-email/${uid}/${token}/`);
      setStatus('success');
      setMessage(response.data?.message || 'Email verified successfully!');
    } catch (err) {
      setStatus('error');
      setMessage(err?.response?.data?.detail || 'Invalid or expired verification link. Please request a new one.');
    }
  };

  useEffect(() => {
    if (uid && token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link. Missing required parameters.');
    }
  }, [uid, token]);

  const handleRetry = () => {
    setIsRetrying(true);
    verifyEmail().finally(() => setIsRetrying(false));
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {status === 'loading' && (
          <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-50 text-center space-y-6">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-primary tracking-tight">Verifying Your Email</h3>
              <p className="text-gray-400 font-medium">Please wait while we confirm your email address...</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-50 text-center space-y-8 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-primary tracking-tight">Email Verified!</h3>
              <p className="text-gray-400 font-medium">{message}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-accent hover:bg-[#287E7B] text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20"
            >
              Continue to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-50 text-center space-y-8 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-primary tracking-tight">Verification Failed</h3>
              <p className="text-gray-400 font-medium">{message}</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full bg-primary hover:bg-[#152c4d] text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isRetrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border-2 border-gray-100 text-gray-400 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
              >
                Return to Home
              </button>
            </div>
            <div className="pt-6 border-t border-gray-50">
              <p className="text-[10px] text-gray-300 font-medium">
                Need a new verification link? <Link to="/resend-verification" className="text-accent hover:underline">Request here</Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
