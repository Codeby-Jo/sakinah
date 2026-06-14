import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SakinahButton, SakinahHeader, SakinahFileUpload } from '../components';

export const SakinahWaliVerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const [otpVerified, setOtpVerified] = useState(false);
  const [document, setDocument] = useState<File | null>(null);
  const [isValidated, setIsValidated] = useState(false);
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

  const validateDocuments = () => {
    setLoading(true);
    setTimeout(() => {
      setIsValidated(true);
      setLoading(false);
    }, 1500);
  };

  const allDone = otpVerified && document && isValidated && consentGiven;

  return (
    <div className="sk-viewport">
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-b from-[#0A0E16] to-[#0d121c]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[480px]"
        >
          <SakinahHeader title="Verify Wali" subtitle="Step 2 · OTP & Identity" onBack={() => navigate('/wali/register')} />

          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[4px] rounded-full mb-6 overflow-hidden">
            <motion.div className="h-full bg-[var(--sk-gold)]" initial={{ width: 0 }} animate={{ width: '16%' }} transition={{ duration: 0.5 }} />
          </div>

          <div className="space-y-4 mb-6">
            {/* 1. OTP */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[rgba(255,255,255,0.02)] border border-[var(--sk-line-soft)] rounded-[16px] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-[17px] text-[var(--sk-ink)]">1. OTP Verification</h3>
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
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </SakinahButton>
                  <div className="text-center text-[11px] text-[var(--sk-ink-faint)] mt-2">
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : <button onClick={() => setResendTimer(30)} className="text-[var(--sk-gold)] hover:underline">Resend OTP</button>}
                  </div>
                </>
              )}
            </motion.div>

            {/* 2. Government ID */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[rgba(255,255,255,0.02)] border border-[var(--sk-line-soft)] rounded-[16px] p-5">
              <SakinahFileUpload 
                label="2. Wali Government ID" 
                description="Upload Passport, Driving License, Aadhaar, or National ID" 
                accepts="document" 
                value={document ? document.name : null} 
                onChange={f => { setDocument(f); setIsValidated(false); }} 
              />
              {document && !isValidated && (
                <div className="mt-4 flex justify-center">
                  <SakinahButton variant="secondary" size="sm" onClick={validateDocuments} disabled={loading}>
                    {loading ? 'Verifying...' : 'Validate ID'}
                  </SakinahButton>
                </div>
              )}
              {isValidated && (
                <div className="mt-4 p-3 rounded-lg bg-[rgba(127,176,122,0.08)] text-center text-[12px] text-[var(--sk-green)]">
                  ✓ ID Verified Successfully
                </div>
              )}
            </motion.div>

            {/* 3. Consent */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[rgba(255,255,255,0.02)] border border-[var(--sk-line-soft)] rounded-[16px] p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={consentGiven} onChange={() => setConsentGiven(!consentGiven)} className="mt-1 w-4 h-4 accent-[var(--sk-gold)] cursor-pointer" />
                <div>
                  <div className="text-[13px] text-[var(--sk-ink)]">3. Consent Declaration</div>
                  <p className="text-[11px] text-[var(--sk-ink-dim)] mt-1 leading-[1.5]">
                    I declare that I am the legitimate guardian (wali) of the candidate. I have their consent to create this matrimonial profile. I agree to Sakinah's Terms of Service.
                  </p>
                </div>
              </label>
            </motion.div>
          </div>

          <div className="flex gap-3">
            <SakinahButton variant="ghost" onClick={() => navigate('/wali/register')} className="flex-1">Back</SakinahButton>
            <SakinahButton variant="primary" onClick={() => navigate('/wali/candidate-profile')} disabled={!allDone} className="flex-1 shadow-[0_0_20px_rgba(212,168,83,0.3)] hover:shadow-[0_0_30px_rgba(212,168,83,0.5)]">
              Continue →
            </SakinahButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
