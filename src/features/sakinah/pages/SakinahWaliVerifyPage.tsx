import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SakinahButton, SakinahHeader } from '../components';

export const SakinahWaliVerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const [otpVerified, setOtpVerified] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(p => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const verifyOtp = () => {
    if (otp.length < 6) return;
    setLoading(true);
    setTimeout(() => { setOtpVerified(true); setLoading(false); }, 800);
  };

  const uploadId = () => {
    setLoading(true);
    setTimeout(() => { setIdUploaded(true); setLoading(false); }, 1000);
  };

  const allDone = otpVerified && idUploaded && consentGiven;

  return (
    <div className="sk-viewport">
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">
          <SakinahHeader title="Verify Wali" subtitle="Step 2 · OTP & Identity" onBack={() => navigate('/wali/register')} />

          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[4px] rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-[var(--sk-gold)] transition-all duration-500" style={{ width: '16%' }} />
          </div>

          {/* OTP */}
          <div className="sk-card p-5 mb-4 sk-fx sk-d1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-[17px] text-[var(--sk-ink)]">OTP Verification</h3>
              {otpVerified && <span className="text-[var(--sk-green)] text-[13px]">✓ Verified</span>}
            </div>
            {!otpVerified && (
              <>
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full bg-[#111826] border border-[rgba(255,255,255,0.06)] focus:border-[var(--sk-gold)] rounded-[12px] p-3 text-[16px] text-center text-[var(--sk-ink)] outline-none transition-colors tracking-[8px] mb-3"
                />
                <SakinahButton variant="secondary" size="sm" onClick={verifyOtp} disabled={loading || otp.length < 6}>
                  {loading ? 'Verifying...' : 'Verify'}
                </SakinahButton>
                <div className="text-center text-[11px] text-[var(--sk-ink-faint)] mt-2">
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : <button onClick={() => setResendTimer(30)} className="text-[var(--sk-gold)]">Resend OTP</button>}
                </div>
              </>
            )}
          </div>

          {/* Government ID */}
          <div className="sk-card p-5 mb-4 sk-fx sk-d2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-[17px] text-[var(--sk-ink)]">Government ID</h3>
                <p className="text-[11px] text-[var(--sk-ink-dim)] mt-1">Upload your Aadhaar, Passport or ID</p>
              </div>
              {idUploaded ? (
                <span className="text-[var(--sk-green)] text-[13px]">✓ Uploaded</span>
              ) : (
                <button onClick={uploadId} disabled={loading} className="px-4 py-2 text-[12px] border border-[var(--sk-line)] rounded-lg text-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.05)] transition-colors disabled:opacity-50">
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              )}
            </div>
          </div>

          {/* Consent */}
          <div className="sk-card p-5 mb-6 sk-fx sk-d3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consentGiven} onChange={() => setConsentGiven(!consentGiven)} className="mt-1 w-4 h-4 accent-[var(--sk-gold)] cursor-pointer" />
              <div>
                <div className="text-[13px] text-[var(--sk-ink)]">Consent Declaration</div>
                <p className="text-[11px] text-[var(--sk-ink-dim)] mt-1 leading-[1.5]">
                  I declare that I am the legitimate guardian (wali) of the candidate. I have their consent to create this matrimonial profile. I agree to Sakinah's Terms of Service.
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-3 sk-fx sk-d4">
            <SakinahButton variant="ghost" onClick={() => navigate('/wali/register')} className="flex-1">Back</SakinahButton>
            <SakinahButton variant="primary" onClick={() => navigate('/wali/candidate-profile')} disabled={!allDone} className="flex-1">Continue →</SakinahButton>
          </div>
        </div>
      </div>
    </div>
  );
};
