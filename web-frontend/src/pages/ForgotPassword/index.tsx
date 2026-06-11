import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setStep(2);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length === 6) setStep(3);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length >= 8) setStep(4);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your email address and we'll send you an OTP to reset your password.</p>
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:ring-2 focus:ring-[#0A192F]/30 focus:border-[#0A192F] outline-none"
                  />
                </div>
                <button type="submit" className="w-full bg-[#0A192F] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#040d1a] transition-colors shadow-sm">
                  Send OTP
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-500 text-sm mb-6">We sent a 6-digit code to <span className="font-semibold text-gray-800">{email}</span>.</p>
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, i) => (
                    <input key={i} id={`otp-${i}`} type="text" value={digit} onChange={e => handleOtpChange(i, e.target.value)}
                      className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A192F]/30 focus:border-[#0A192F] outline-none"
                    />
                  ))}
                </div>
                <button type="submit" className="w-full bg-[#0A192F] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#040d1a] transition-colors shadow-sm">
                  Verify Code
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Create New Password</h2>
              <p className="text-gray-500 text-sm mb-6">Your new password must be at least 8 characters long.</p>
              <form onSubmit={handleReset} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:ring-2 focus:ring-[#0A192F]/30 focus:border-[#0A192F] outline-none"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2 flex gap-1 h-1.5">
                      <div className={`flex-1 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-red-400'}`}></div>
                      <div className={`flex-1 rounded-full ${password.length >= 10 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      <div className={`flex-1 rounded-full ${password.length >= 12 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    </div>
                  )}
                </div>
                <button type="submit" className="w-full bg-[#0A192F] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#040d1a] transition-colors shadow-sm">
                  Reset Password
                </button>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-green-200">✓</div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Password Reset!</h2>
              <p className="text-gray-500 text-sm mb-6">You can now use your new password to log in.</p>
              <Link to="/login" className="w-full inline-block bg-[#0A192F] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#040d1a] transition-colors shadow-sm">
                Return to Login
              </Link>
            </div>
          )}

          {step < 4 && (
            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm font-semibold text-gray-500 hover:text-[#0A192F]">
                ← Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
