import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahButton, SakinahHeader } from '../components';

export const SakinahKycPage: React.FC = () => {
  const navigate = useNavigate();
  const { setKycCompleted } = useOnboarding();
  const [idUploaded, setIdUploaded] = useState(false);
  const [selfieVerified, setSelfieVerified] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);

  const allDone = idUploaded && selfieVerified && consentGiven;

  const simulateUpload = (cb: (v: boolean) => void) => {
    setLoading(true);
    setTimeout(() => { cb(true); setLoading(false); }, 1200);
  };

  const handleContinue = () => {
    if (!allDone) return;
    setKycCompleted(true);
    navigate('/profile-creation');
  };

  return (
    <div className="sk-viewport">
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">
          <SakinahHeader title="KYC Verification" subtitle="Step 3 of 6 · Identity Check" onBack={() => navigate('/verify-otp')} />

          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[4px] rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-[var(--sk-gold)] transition-all duration-500" style={{ width: '48%' }} />
          </div>

          <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-6 sk-fx sk-d1">
            We verify every user to ensure safety and authenticity. Your documents are encrypted and used <strong className="text-[var(--sk-ink)]">only</strong> for verification.
          </p>

          {/* Government ID */}
          <div className="sk-card p-5 mb-4 sk-fx sk-d2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-[17px] text-[var(--sk-ink)]">Government ID</h3>
                <p className="text-[11px] text-[var(--sk-ink-dim)] mt-1">Aadhaar, Passport, or National ID</p>
              </div>
              {idUploaded ? (
                <span className="text-[var(--sk-green)] text-[13px] font-medium">✓ Uploaded</span>
              ) : (
                <button
                  onClick={() => simulateUpload(setIdUploaded)}
                  disabled={loading}
                  className="px-4 py-2 text-[12px] border border-[var(--sk-line)] rounded-lg text-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.05)] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              )}
            </div>
          </div>

          {/* Selfie Verification */}
          <div className="sk-card p-5 mb-4 sk-fx sk-d3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-[17px] text-[var(--sk-ink)]">Selfie Verification</h3>
                <p className="text-[11px] text-[var(--sk-ink-dim)] mt-1">Liveness check — proves you're real</p>
              </div>
              {selfieVerified ? (
                <span className="text-[var(--sk-green)] text-[13px] font-medium">✓ Verified</span>
              ) : (
                <button
                  onClick={() => simulateUpload(setSelfieVerified)}
                  disabled={loading || !idUploaded}
                  className="px-4 py-2 text-[12px] border border-[var(--sk-line)] rounded-lg text-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.05)] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Capture'}
                </button>
              )}
            </div>
            {!idUploaded && (
              <p className="text-[10px] text-[var(--sk-ink-faint)] mt-2 italic">Upload ID first</p>
            )}
          </div>

          {/* Face Match Status */}
          {idUploaded && selfieVerified && (
            <div className="p-4 rounded-xl bg-[rgba(127,176,122,0.08)] border border-[rgba(127,176,122,0.2)] mb-4 sk-fx sk-d1">
              <div className="flex items-center gap-3">
                <span className="text-[20px] text-[var(--sk-green)]">✓</span>
                <div>
                  <div className="text-[13px] font-medium text-[var(--sk-green)]">Face Match: Strong</div>
                  <div className="text-[11px] text-[var(--sk-ink-dim)] mt-1">ID photo matches selfie with high confidence.</div>
                </div>
              </div>
            </div>
          )}

          {/* Consent */}
          <div className="sk-card p-5 mb-6 sk-fx sk-d4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={() => setConsentGiven(!consentGiven)}
                className="mt-1 w-4 h-4 accent-[var(--sk-gold)] cursor-pointer"
              />
              <div>
                <div className="text-[13px] text-[var(--sk-ink)]">Terms & Consent</div>
                <p className="text-[11px] text-[var(--sk-ink-dim)] mt-1 leading-[1.5]">
                  I consent to Sakinah verifying my identity for safety. I confirm that the information provided is true and accurate. I agree to the Terms of Service and Privacy Policy.
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 sk-fx sk-d5">
            <SakinahButton variant="ghost" onClick={() => navigate('/verify-otp')} className="flex-1">Back</SakinahButton>
            <SakinahButton variant="primary" onClick={handleContinue} disabled={!allDone} className="flex-1">
              Continue →
            </SakinahButton>
          </div>
        </div>
      </div>
    </div>
  );
};
