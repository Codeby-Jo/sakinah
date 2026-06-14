import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahButton, SakinahHeader } from '../components';

const OtpInput: React.FC<{ length: number; value: string; onChange: (v: string) => void }> = ({ length, value, onChange }) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const chars = value.split('');
    chars[idx] = val;
    const newVal = chars.join('').slice(0, length);
    onChange(newVal);
    if (val && idx < length - 1) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) inputs.current[idx - 1]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-[48px] h-[56px] text-center text-[20px] font-serif bg-[#111826] border border-[rgba(255,255,255,0.06)] focus:border-[var(--sk-gold)] rounded-[12px] text-[var(--sk-ink)] outline-none transition-colors"
        />
      ))}
    </div>
  );
};

export const SakinahVerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const { auth, setOtpVerified } = useOnboarding();
  
  // State for Email
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // State for Phone
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isSendingPhone, setIsSendingPhone] = useState(false);

  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const sendEmailOtp = () => {
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailOtpSent(true);
      setResendTimer(30);
    }, 1000);
  };

  const sendPhoneOtp = () => {
    setIsSendingPhone(true);
    setTimeout(() => {
      setIsSendingPhone(false);
      setPhoneOtpSent(true);
      setResendTimer(30);
    }, 1000);
  };

  const verifyEmail = () => {
    if (emailOtp.length !== 6) { setError('Enter the 6-digit email OTP'); return; }
    setEmailVerified(true);
    setError('');
  };

  const verifyPhone = () => {
    if (phoneOtp.length !== 6) { setError('Enter the 6-digit phone OTP'); return; }
    setPhoneVerified(true);
    setError('');
  };

  const handleContinue = () => {
    if (!emailVerified || !phoneVerified) {
      setError('Please verify both email and phone before continuing.');
      return;
    }
    setOtpVerified(true);
    navigate('/kyc');
  };

  return (
    <div className="sk-viewport">
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-b from-[#0A0E16] to-[#0d121c]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[480px]"
        >
          <SakinahHeader title="Verify Identity" subtitle="Step 2 of 6 · OTP Verification" onBack={() => navigate('/register')} />

          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[4px] rounded-full mb-8 overflow-hidden">
            <motion.div className="h-full bg-[var(--sk-gold)]" initial={{ width: 0 }} animate={{ width: '32%' }} transition={{ duration: 0.5 }} />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 rounded-xl bg-[rgba(201,138,138,0.1)] border border-[rgba(201,138,138,0.2)] text-[var(--sk-rose)] text-[12px] text-center">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email OTP Section */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-[rgba(255,255,255,0.02)] border border-[var(--sk-line-soft)] rounded-[20px] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-[18px] text-[var(--sk-ink)]">Email Verification</h3>
                <p className="text-[12px] text-[var(--sk-ink-dim)] mt-1">{auth.email || 'your email'}</p>
              </div>
              {emailVerified && <span className="text-[var(--sk-green)] text-[14px] bg-[rgba(127,176,122,0.1)] px-3 py-1 rounded-full">✓ Verified</span>}
            </div>
            
            {!emailVerified && (
              <>
                {!emailOtpSent ? (
                  <SakinahButton variant="secondary" onClick={sendEmailOtp} disabled={isSendingEmail} className="w-full">
                    {isSendingEmail ? 'Sending...' : 'Send Email OTP'}
                  </SakinahButton>
                ) : (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <OtpInput length={6} value={emailOtp} onChange={setEmailOtp} />
                    <div className="mt-4 flex gap-3">
                      <SakinahButton variant="secondary" onClick={verifyEmail} className="flex-1 border-[var(--sk-gold)] text-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.1)]">
                        Verify Code
                      </SakinahButton>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>

          {/* Phone OTP Section */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-[rgba(255,255,255,0.02)] border border-[var(--sk-line-soft)] rounded-[20px] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-[18px] text-[var(--sk-ink)]">Phone Verification</h3>
                <p className="text-[12px] text-[var(--sk-ink-dim)] mt-1">{auth.phone || 'your phone'}</p>
              </div>
              {phoneVerified && <span className="text-[var(--sk-green)] text-[14px] bg-[rgba(127,176,122,0.1)] px-3 py-1 rounded-full">✓ Verified</span>}
            </div>

            {!phoneVerified && (
              <>
                {!phoneOtpSent ? (
                  <SakinahButton variant="secondary" onClick={sendPhoneOtp} disabled={isSendingPhone} className="w-full">
                    {isSendingPhone ? 'Sending...' : 'Send Phone OTP'}
                  </SakinahButton>
                ) : (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <OtpInput length={6} value={phoneOtp} onChange={setPhoneOtp} />
                    <div className="mt-4 flex gap-3">
                      <SakinahButton variant="secondary" onClick={verifyPhone} className="flex-1 border-[var(--sk-gold)] text-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.1)]">
                        Verify Code
                      </SakinahButton>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>

          {/* Resend Logic (Shared) */}
          {(emailOtpSent || phoneOtpSent) && (!emailVerified || !phoneVerified) && (
            <div className="text-center text-[12px] text-[var(--sk-ink-faint)] mb-6">
              {resendTimer > 0 ? (
                <span>Resend OTP in {resendTimer}s</span>
              ) : (
                <button onClick={() => setResendTimer(30)} className="text-[var(--sk-gold)] hover:underline">
                  Resend OTP
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <SakinahButton variant="ghost" onClick={() => navigate('/register')} className="flex-1">Back</SakinahButton>
            <SakinahButton
              variant="primary"
              onClick={handleContinue}
              disabled={!emailVerified || !phoneVerified}
              className="flex-1 shadow-[0_0_20px_rgba(212,168,83,0.3)] hover:shadow-[0_0_30px_rgba(212,168,83,0.5)] transition-shadow"
            >
              Continue to KYC →
            </SakinahButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
