import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, IdentificationCard, CheckCircle, SealCheck, UploadSimple } from '@phosphor-icons/react';
import { SakinahButton, SakinahOnboardingShell } from '../components';
import { useOnboarding } from '../context/OnboardingContext';

// ── Dropzone ───────────────────────────────────────────────────────────────
interface DropzoneProps {
  label: string;
  description?: string;
  accept: string;
  value: File | null;
  onChange: (f: File | null) => void;
  icon: React.ReactNode;
}

const Dropzone: React.FC<DropzoneProps> = ({ label, description, accept, value, onChange, icon }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onChange(file);
  }, [onChange]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 transition-all duration-300 ${
        value
          ? 'border-[#D4A853]/40 bg-[rgba(212,168,83,0.05)]'
          : dragging
          ? 'border-[#D4A853]/60 bg-[rgba(212,168,83,0.08)] scale-[1.01]'
          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.03]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => onChange(e.target.files?.[0] ?? null)}
      />
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
          value ? 'bg-[rgba(212,168,83,0.12)] text-[#D4A853]' : 'bg-white/[0.04] text-white/30'
        }`}>
          {value ? <CheckCircle size={22} weight="fill" /> : icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-[13px] font-medium transition-colors ${value ? 'text-[#D4A853]' : 'text-white/60'}`}>{label}</div>
          <div className="text-[11px] text-white/30 mt-0.5 truncate">
            {value ? value.name : (description || 'Click or drag to upload')}
          </div>
        </div>
        {!value && <UploadSimple size={16} className="text-white/20 shrink-0" />}
      </div>
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────
export const SakinahKycPage: React.FC = () => {
  const navigate = useNavigate();
  const { setKycCompleted } = useOnboarding();

  const [photo, setPhoto] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const capturePhoto = () => {
    const mock = new File([''], 'selfie.jpg', { type: 'image/jpeg' });
    setPhoto(mock);
    setCameraOpen(false);
    setVerified(false);
  };

  const canVerify = photo && document && consent && !verified;

  const runVerification = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      setKycCompleted(true);
    }, 2000);
  };

  const checks = [
    { label: 'Live photo captured', done: !!photo },
    { label: 'Government ID uploaded', done: !!document },
    { label: 'Consent provided', done: consent },
    { label: 'Identity verified', done: verified, pending: verifying },
  ];

  return (
    <SakinahOnboardingShell
      step={3}
      title="Identity Verification"
      subtitle="Your documents are encrypted and used solely for identity confirmation."
    >
      <div className="space-y-4">

        {/* 1. Live photo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.025] border border-white/[0.06] rounded-[24px] p-6"
        >
          <h3 className="text-[14px] font-medium text-white mb-1 flex items-center gap-2">
            <Camera size={16} className="text-[#D4A853]" /> Live Photo Verification
          </h3>
          <p className="text-[11px] text-white/30 mb-4">Capture a selfie or upload a clear photo to match your ID.</p>

          {cameraOpen ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full h-[200px] rounded-2xl bg-black border border-white/[0.08] flex flex-col items-center justify-center overflow-hidden"
            >
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-28 h-28 rounded-full border-2 border-dashed border-[#D4A853]/50 flex items-center justify-center"
              >
                <Camera size={32} className="text-[#D4A853]/40" />
              </motion.div>
              <p className="text-[11px] text-white/30 mt-3 absolute bottom-14">Position your face in the frame</p>
              <div className="absolute bottom-4 flex gap-3">
                <button onClick={capturePhoto} className="px-5 py-2 bg-[#D4A853] text-[#0A0E16] rounded-full text-[12px] font-semibold hover:bg-[#E8C97A] transition-colors">Capture</button>
                <button onClick={() => setCameraOpen(false)} className="px-5 py-2 bg-white/[0.08] text-white/60 rounded-full text-[12px] hover:bg-white/[0.12] transition-colors">Cancel</button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <Dropzone
                label="Upload Selfie"
                description="JPG, PNG — clear front-facing photo"
                accept="image/*"
                value={photo}
                onChange={f => { setPhoto(f); setVerified(false); }}
                icon={<Camera size={20} />}
              />
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/[0.05]" />
                <span className="text-[10px] text-white/25 uppercase tracking-wider">or</span>
                <div className="h-px flex-1 bg-white/[0.05]" />
              </div>
              <button
                onClick={() => setCameraOpen(true)}
                className="w-full py-3 rounded-2xl border border-[#D4A853]/20 text-[13px] text-[#D4A853]/70 hover:bg-[rgba(212,168,83,0.06)] hover:border-[#D4A853]/40 transition-all flex items-center justify-center gap-2"
              >
                <Camera size={16} /> Use Camera
              </button>
            </div>
          )}
        </motion.div>

        {/* 2. Government ID */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.025] border border-white/[0.06] rounded-[24px] p-6"
        >
          <h3 className="text-[14px] font-medium text-white mb-1 flex items-center gap-2">
            <IdentificationCard size={16} className="text-[#D4A853]" /> Government ID
          </h3>
          <p className="text-[11px] text-white/30 mb-4">Passport, National ID, or Driving License</p>
          <Dropzone
            label="Upload ID Document"
            description="PDF, JPG, PNG — front side clearly visible"
            accept="image/*,application/pdf"
            value={document}
            onChange={f => { setDocument(f); setVerified(false); }}
            icon={<IdentificationCard size={20} />}
          />
        </motion.div>

        {/* 3. Consent */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-[24px] border p-5 transition-all duration-300 cursor-pointer ${consent ? 'bg-[rgba(212,168,83,0.06)] border-[#D4A853]/25' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'}`}
          onClick={() => { setConsent(c => !c); setVerified(false); }}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${consent ? 'bg-[#D4A853] border-[#D4A853]' : 'border-white/20'}`}>
              {consent && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#0A0E16] text-[10px] font-bold">✓</motion.span>}
            </div>
            <div>
              <div className="text-[13px] font-medium text-white/80">Data Processing Consent</div>
              <p className="text-[11px] text-white/30 mt-1 leading-relaxed">
                I consent to Sakinah processing my biometric data and identity document solely for the purpose of verification. Data is encrypted and never shared with third parties.
              </p>
            </div>
          </label>
        </motion.div>

        {/* 4. Verification checklist */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.02] border border-white/[0.05] rounded-[24px] p-5"
        >
          <p className="text-[9px] uppercase tracking-[0.18em] text-white/25 mb-3">Verification Checklist</p>
          <div className="space-y-2.5">
            {checks.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all duration-300 ${
                  c.done ? 'bg-green-500/15 text-green-400' : c.pending ? 'bg-[rgba(212,168,83,0.1)] text-[#D4A853]' : 'bg-white/[0.04] text-white/25'
                }`}>
                  {c.done ? '✓' : c.pending ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="block">⟳</motion.span>
                  ) : '○'}
                </div>
                <span className={`text-[12px] transition-colors duration-300 ${c.done ? 'text-green-400' : c.pending ? 'text-[#D4A853]' : 'text-white/30'}`}>
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Verify button */}
      <AnimatePresence>
        {canVerify && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4">
            <SakinahButton
              variant="secondary"
              onClick={runVerification}
              disabled={verifying}
              className="w-full py-3.5 flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="block w-4 h-4 border-2 border-[#D4A853]/30 border-t-[#D4A853] rounded-full" />
                  Verifying your identity…
                </>
              ) : (
                <><SealCheck size={17} /> Validate & Verify</>
              )}
            </SakinahButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3 mt-6"
      >
        <SakinahButton variant="ghost" onClick={() => navigate('/matrimony/verify-otp')} className="flex-1 py-4 border border-white/[0.07]">
          Back
        </SakinahButton>
        <SakinahButton
          variant="primary"
          onClick={() => navigate('/matrimony/profile-creation')}
          disabled={!verified}
          className="flex-1 py-4 shadow-[0_0_24px_rgba(212,168,83,0.2)] hover:shadow-[0_0_36px_rgba(212,168,83,0.4)] transition-all"
        >
          Continue to Profile →
        </SakinahButton>
      </motion.div>
    </SakinahOnboardingShell>
  );
};
