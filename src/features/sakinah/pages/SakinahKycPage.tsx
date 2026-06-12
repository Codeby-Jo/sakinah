import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SakinahButton, SakinahHeader, SakinahFileUpload } from '../components';

export const SakinahKycPage: React.FC = () => {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const startCamera = () => {
    setShowCamera(true);
  };

  const captureMockPhoto = () => {
    // Mock capturing a photo
    const mockFile = new File([""], "captured_photo.jpg", { type: "image/jpeg" });
    setPhoto(mockFile);
    setShowCamera(false);
    setIsValidated(false);
  };

  const validateDocuments = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsValidated(true);
    }, 1500);
  };

  const allDone = photo && document && consentGiven && isValidated;

  return (
    <div className="sk-viewport">
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-b from-[#0A0E16] to-[#0d121c]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[500px]"
        >
          <SakinahHeader title="Identity Verification" subtitle="Step 3 of 6 · KYC Requirements" onBack={() => navigate('/verify-otp')} />

          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[4px] rounded-full mb-6 overflow-hidden">
            <motion.div className="h-full bg-[var(--sk-gold)]" initial={{ width: 0 }} animate={{ width: '48%' }} transition={{ duration: 0.5 }} />
          </div>

          <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-6">
            To maintain a high-trust platform, we verify all seekers. Your documents are encrypted and never shared.
          </p>

          <div className="space-y-4 mb-6">
            
            {/* 1. Liveness / Profile Photo */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[rgba(255,255,255,0.02)] border border-[var(--sk-line-soft)] rounded-[16px] p-5">
              <h3 className="font-serif text-[17px] text-[var(--sk-ink)] mb-1">1. Live Photo Verification</h3>
              <p className="text-[11px] text-[var(--sk-ink-dim)] mb-4">Capture a live photo or upload a clear selfie to match your ID.</p>
              
              {!showCamera ? (
                <div className="flex flex-col gap-3">
                  <SakinahFileUpload 
                    label="Upload Photo" 
                    accepts="image" 
                    value={photo ? photo.name : null} 
                    onChange={f => { setPhoto(f); setIsValidated(false); }} 
                  />
                  <div className="flex items-center gap-4 my-1">
                    <div className="h-px bg-[rgba(255,255,255,0.05)] flex-1" />
                    <span className="text-[10px] text-[var(--sk-ink-faint)] uppercase">or</span>
                    <div className="h-px bg-[rgba(255,255,255,0.05)] flex-1" />
                  </div>
                  <button 
                    onClick={startCamera} 
                    className="w-full py-3 border border-[rgba(212,168,83,0.3)] rounded-[14px] text-[13px] text-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.05)] transition-colors flex justify-center items-center gap-2"
                  >
                    <span>📷</span> Capture Photo
                  </button>
                </div>
              ) : (
                <div className="w-full h-[200px] bg-black rounded-[14px] border border-[rgba(255,255,255,0.1)] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="w-32 h-32 border-2 border-dashed border-[var(--sk-gold)] rounded-full opacity-50 mb-4" />
                  <p className="text-[12px] text-[var(--sk-ink-dim)] absolute bottom-16">Position your face in the frame</p>
                  <button onClick={captureMockPhoto} className="absolute bottom-4 px-6 py-2 bg-[var(--sk-gold)] text-[#0A0E16] rounded-full text-[12px] font-medium hover:bg-[#E8C97A]">
                    Capture
                  </button>
                  <button onClick={() => setShowCamera(false)} className="absolute top-4 right-4 text-[20px] text-white/50 hover:text-white">✕</button>
                </div>
              )}
            </motion.div>

            {/* 2. Document Upload */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[rgba(255,255,255,0.02)] border border-[var(--sk-line-soft)] rounded-[16px] p-5">
              <SakinahFileUpload 
                label="2. Government ID" 
                description="Upload Passport, Driving License, or National ID (PDF, DOC, DOCX)" 
                accepts="document" 
                value={document ? document.name : null} 
                onChange={f => { setDocument(f); setIsValidated(false); }} 
              />
            </motion.div>

            {/* 3. Consent */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[rgba(255,255,255,0.02)] border border-[var(--sk-line-soft)] rounded-[16px] p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={consentGiven} onChange={() => { setConsentGiven(!consentGiven); setIsValidated(false); }} className="mt-1 w-4 h-4 accent-[var(--sk-gold)] cursor-pointer" />
                <div>
                  <div className="text-[13px] text-[var(--sk-ink)]">3. Data Processing Consent</div>
                  <p className="text-[11px] text-[var(--sk-ink-dim)] mt-1 leading-[1.5]">
                    I consent to Sakinah processing my biometric data and ID document solely for the purpose of identity verification.
                  </p>
                </div>
              </label>
            </motion.div>

            {/* Verification Status Checklist */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[rgba(255,255,255,0.02)] border border-[var(--sk-line-soft)] rounded-[16px] p-5">
              <h4 className="text-[12px] font-mono tracking-[0.1em] text-[var(--sk-gold-dim)] uppercase mb-3">Verification Checklist</h4>
              <div className="flex flex-col gap-2">
                <div className={`flex items-center gap-2 text-[13px] ${photo ? 'text-[var(--sk-green)]' : 'text-[var(--sk-ink-dim)]'}`}>
                  <span>{photo ? '✓' : '○'}</span> Profile Photo Uploaded
                </div>
                <div className={`flex items-center gap-2 text-[13px] ${document ? 'text-[var(--sk-green)]' : 'text-[var(--sk-ink-dim)]'}`}>
                  <span>{document ? '✓' : '○'}</span> Government ID Uploaded
                </div>
                <div className={`flex items-center gap-2 text-[13px] ${consentGiven ? 'text-[var(--sk-green)]' : 'text-[var(--sk-ink-dim)]'}`}>
                  <span>{consentGiven ? '✓' : '○'}</span> Consent Provided
                </div>
                <div className={`flex items-center gap-2 text-[13px] ${isValidated ? 'text-[var(--sk-green)]' : isVerifying ? 'text-[var(--sk-gold)]' : 'text-[var(--sk-ink-dim)]'}`}>
                  <span>{isValidated ? '✓' : isVerifying ? '⟳' : '○'}</span> {isValidated ? 'Verification Complete' : 'Verification Pending'}
                </div>
              </div>
            </motion.div>

          </div>

          {photo && document && consentGiven && !isValidated && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex justify-center">
              <SakinahButton variant="secondary" onClick={validateDocuments} disabled={isVerifying} className="w-full bg-[rgba(212,168,83,0.1)] text-[var(--sk-gold)] border-[var(--sk-gold)]">
                {isVerifying ? 'Verifying Documents...' : 'Validate & Verify →'}
              </SakinahButton>
            </motion.div>
          )}

          <div className="flex gap-3 mt-8">
            <SakinahButton variant="ghost" onClick={() => navigate('/verify-otp')} className="flex-1">Back</SakinahButton>
            <SakinahButton variant="primary" onClick={() => navigate('/profile-creation')} disabled={!allDone} className="flex-1 shadow-[0_0_20px_rgba(212,168,83,0.3)] hover:shadow-[0_0_30px_rgba(212,168,83,0.5)] transition-shadow">
              Continue to Profile →
            </SakinahButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
