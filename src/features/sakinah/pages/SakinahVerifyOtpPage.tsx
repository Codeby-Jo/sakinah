import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EnvelopeSimple, DeviceMobile, CheckCircle, ArrowCounterClockwise } from '@phosphor-icons/react';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahButton, SakinahOnboardingShell } from '../components';

// ── OTP digit strip ────────────────────────────────────────────────────────
const OtpStrip: React.FC<{ length?: number; value: string; onChange: (v: string) => void; disabled?: boolean }> = ({
  length = 6, value, onChange, disabled,
}) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleChange = (i: number, v: string) => {
    if (v.length > 1) v = v[v.length - 1];
    const chars = value.padEnd(length, ' ').split('');
    chars[i] = v || ' ';
    const next = chars.join('').trimEnd();
    onChange(next);
    if (v && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2.5 justify-center">
      {Array.from({ length }).map((_, i) => (
        <motion.input
          key={i}
          ref={el => { refs.current[i] = el; }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-11 h-14 text-center text-[20px] font-serif rounded-2xl border outline-none transition-all duration-200 ${
            value[i]
              ? 'bg-[rgba(212,168,83,0.08)] border-[#D4A853]/50 text-[#D4A853] shadow-[0_0_14px_rgba(212,168,83,0.2)]'
              : 'bg-white/[0.03] border-white/[0.08] text-white focus:border-[#D4A853]/40 focus:bg-[rgba(212,168,83,0.04)]'
          } ${disabled ? 'opacity-50 cursor-default' : ''}`}
        />
      ))}
    </div>
  );
};

// ── Section card ───────────────────────────────────────────────────────────
interface SectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  verified: boolean;
  sent: boolean;
  sending: boolean;
  otp: string;
  onOtpChange: (v: string) => void;
  onSend: () => void;
  onVerify: () => void;
  delay?: number;
}

const VerifySection: React.FC<SectionProps> = ({
  icon, title, subtitle, verified, sent, sending, otp, onOtpChange, onSend, onVerify, delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className={`rounded-[24px] border p-6 transition-all duration-500 ${
      verified
        ? 'bg-green-500/[0.06] border-green-500/25'
        : 'bg-white/[0.025] border-white/[0.06]'
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${verified ? 'bg-green-500/15 text-green-400' : 'bg-white/[0.05] text-white/40'}`}>
          {verified ? <CheckCircle size={18} weight="fill" /> : icon}
        </div>
        <div>
          <h3 className="text-[14px] font-medium text-white">{title}</h3>
          <p className="text-[11px] text-white/35">{subtitle}</p>
        </div>
      </div>
      {verified && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-[11px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full"
        >
          ✓ Verified
        </motion.span>
      )}
    </div>

    {!verified && (
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div key="send" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SakinahButton
              variant="secondary"
              onClick={onSend}
              disabled={sending}
              className="w-full py-3"
            >
              {sending ? (
                <span className="flex items-center gap-2 justify-center">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="block w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full"
                  />
                  Sending OTP…
                </span>
              ) : `Send OTP to ${title.split(' ')[0]}`}
            </SakinahButton>
          </motion.div>
        ) : (
          <motion.div key="verify" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <OtpStrip value={otp} onChange={onOtpChange} />
            <SakinahButton
              variant="primary"
              onClick={onVerify}
              disabled={otp.length < 6}
              className="w-full py-3"
            >
              Verify Code
            </SakinahButton>
          </motion.div>
        )}
      </AnimatePresence>
    )}
  </motion.div>
);

// ── Page ───────────────────────────────────────────────────────────────────
export const SakinahVerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const { auth, setOtpVerified } = useOnboarding();

  const [emailSent, setEmailSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingPhone, setSendingPhone] = useState(false);

  const [error, setError] = useState('');
  const [resend, setResend] = useState(0);

  useEffect(() => {
    if (resend > 0) {
      const t = setTimeout(() => setResend(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resend]);

  const sendOtp = (type: 'email' | 'phone') => {
    if (type === 'email') { setSendingEmail(true); setTimeout(() => { setSendingEmail(false); setEmailSent(true); setResend(30); }, 900); }
    else { setSendingPhone(true); setTimeout(() => { setSendingPhone(false); setPhoneSent(true); setResend(30); }, 900); }
  };

  const verifyOtp = (type: 'email' | 'phone') => {
    // Accept any 6-digit code in demo mode
    if (type === 'email') { setEmailVerified(true); setError(''); }
    else { setPhoneVerified(true); setError(''); }
  };

  const handleContinue = () => {
    if (!emailVerified || !phoneVerified) { setError('Please verify both email and phone.'); return; }
    setOtpVerified(true);
    navigate('/matrimony/kyc');
  };

  const bothDone = emailVerified && phoneVerified;

  return (
    <SakinahOnboardingShell
      step={2}
      title="Verify Identity"
      subtitle="We'll send a one-time code to confirm your email and phone."
    >
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <VerifySection
          icon={<EnvelopeSimple size={17} />}
          title="Email Verification"
          subtitle={auth.email || 'your email address'}
          verified={emailVerified}
          sent={emailSent}
          sending={sendingEmail}
          otp={emailOtp}
          onOtpChange={setEmailOtp}
          onSend={() => sendOtp('email')}
          onVerify={() => verifyOtp('email')}
          delay={0.1}
        />
        <VerifySection
          icon={<DeviceMobile size={17} />}
          title="Phone Verification"
          subtitle={auth.phone || 'your phone number'}
          verified={phoneVerified}
          sent={phoneSent}
          sending={sendingPhone}
          otp={phoneOtp}
          onOtpChange={setPhoneOtp}
          onSend={() => sendOtp('phone')}
          onVerify={() => verifyOtp('phone')}
          delay={0.2}
        />
      </div>

      {/* Resend */}
      {(emailSent || phoneSent) && (!emailVerified || !phoneVerified) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex items-center justify-center gap-2 text-[12px]">
          {resend > 0 ? (
            <span className="text-white/25">Resend in {resend}s</span>
          ) : (
            <button onClick={() => setResend(30)} className="flex items-center gap-1.5 text-[#D4A853]/60 hover:text-[#D4A853] transition-colors">
              <ArrowCounterClockwise size={13} /> Resend OTP
            </button>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex gap-3 mt-8"
      >
        <SakinahButton variant="ghost" onClick={() => navigate('/matrimony/register')} className="flex-1 py-4 border border-white/[0.07]">
          Back
        </SakinahButton>
        <SakinahButton
          variant="primary"
          onClick={handleContinue}
          disabled={!bothDone}
          className="flex-1 py-4 shadow-[0_0_24px_rgba(212,168,83,0.25)] hover:shadow-[0_0_36px_rgba(212,168,83,0.4)] transition-all"
        >
          {bothDone ? 'Continue to KYC →' : `${!emailVerified && !phoneVerified ? 'Verify both' : !emailVerified ? 'Verify email' : 'Verify phone'} first`}
        </SakinahButton>
      </motion.div>
    </SakinahOnboardingShell>
  );
};
