import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

export default function EmailVerification() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  // In a real app, this would check the URL for a token or wait for a webhook.
  // For this prototype, we'll simulate verification after clicking the dev button.
  
  const handleResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    }, 1500);
  };

  const simulateVerification = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      setTimeout(() => {
        navigate('/profile-setup');
      }, 2000);
    }, 1500);
  };

  if (verified) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm border border-green-200">
          ✓
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Email Verified!</h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          Alhamdulillah, your email has been successfully verified. You are now being redirected to complete your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 bg-[#0A192F]/5 text-[#0A192F] rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner border border-[#0A192F]/10">
        ✉️
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Verify Your Email</h1>
      <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
        We've sent a verification link to your email address. 
        Please click the link to verify your account and continue your matrimonial journey.
      </p>

      <div className="space-y-4 w-full max-w-xs">
        <button 
          onClick={simulateVerification}
          disabled={verifying}
          className="w-full bg-[#0A192F] text-white py-3.5 rounded-full font-bold hover:bg-[#040d1a] transition-all shadow-sm disabled:opacity-70 flex justify-center items-center gap-2"
        >
          {verifying ? (
            <><span className="animate-spin">⚙️</span> Verifying...</>
          ) : (
            '[Dev] Simulate Click Link'
          )}
        </button>

        <button 
          onClick={handleResend}
          disabled={resending || resendSuccess}
          className="w-full bg-white text-[#0A192F] py-3.5 rounded-full font-bold border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
        >
          {resending ? 'Sending...' : resendSuccess ? 'Email Sent!' : 'Resend Verification Email'}
        </button>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-100 max-w-sm w-full">
        <p className="text-sm text-gray-400">
          Didn't receive it? Check your spam folder or contact support.
        </p>
      </div>
    </div>
  );
}
