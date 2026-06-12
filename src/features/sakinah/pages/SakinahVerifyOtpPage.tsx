import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

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
      setError('Please verify both email and phone');
      return;
    }
    setOtpVerified(true);
    navigate('/kyc');
  };

  return (
    <div className="sk-viewport">
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">
          <SakinahHeader title="Verify Identity" subtitle="Step 2 of 6 · OTP Verification" onBack={() => navigate('/register')} />

          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[4px] rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-[var(--sk-gold)] transition-all duration-500" style={{ width: '32%' }} />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[rgba(201,138,138,0.1)] border border-[rgba(201,138,138,0.2)] text-[var(--sk-rose)] text-[12px] text-center">
              {error}
            </div>
          )}

          {/* Email OTP */}
          <div className="sk-card p-6 mb-4 sk-fx sk-d1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-[18px] text-[var(--sk-ink)]">Email Verification</h3>
                <p className="text-[12px] text-[var(--sk-ink-dim)] mt-1">OTP sent to {auth.email || 'your email'}</p>
              </div>
              {emailVerified && <span className="text-[var(--sk-green)] text-[14px]">✓ Verified</span>}
            </div>
            {!emailVerified && (
              <>
                <OtpInput length={6} value={emailOtp} onChange={setEmailOtp} />
                <div className="mt-4">
                  <SakinahButton variant="secondary" size="sm" onClick={verifyEmail}>Verify Email</SakinahButton>
                </div>
              </>
            )}
          </div>

          {/* Phone OTP */}
          <div className="sk-card p-6 mb-4 sk-fx sk-d2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-[18px] text-[var(--sk-ink)]">Phone Verification</h3>
                <p className="text-[12px] text-[var(--sk-ink-dim)] mt-1">OTP sent to {auth.phone || 'your phone'}</p>
              </div>
              {phoneVerified && <span className="text-[var(--sk-green)] text-[14px]">✓ Verified</span>}
            </div>
            {!phoneVerified && (
              <>
                <OtpInput length={6} value={phoneOtp} onChange={setPhoneOtp} />
                <div className="mt-4">
                  <SakinahButton variant="secondary" size="sm" onClick={verifyPhone}>Verify Phone</SakinahButton>
                </div>
              </>
            )}
          </div>

          {/* Resend */}
          <div className="text-center text-[12px] text-[var(--sk-ink-faint)] mb-6 sk-fx sk-d3">
            {resendTimer > 0 ? (
              <span>Resend OTP in {resendTimer}s</span>
            ) : (
              <button onClick={() => setResendTimer(30)} className="text-[var(--sk-gold)] hover:underline">
                Resend OTP
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 sk-fx sk-d3">
            <SakinahButton variant="ghost" onClick={() => navigate('/register')} className="flex-1">Back</SakinahButton>
            <SakinahButton
              variant="primary"
              onClick={handleContinue}
              disabled={!emailVerified || !phoneVerified}
              className="flex-1"
            >
              Continue →
            </SakinahButton>
          </div>
        </div>
      </div>
    </div>
  );
};
