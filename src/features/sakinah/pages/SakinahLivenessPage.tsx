import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SakinahJourneyFrame, 
  SakinahHeader, 
  SakinahButton,
  DevFallbackBadge
} from '../components';
import { startLivenessFlow, submitLivenessSandbox } from '../services/sakinahApi';

export const SakinahLivenessPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vendorStatus, setVendorStatus] = useState<string>('PENDING');

  useEffect(() => {
    startLivenessFlow().then(res => {
      setVendorStatus(res.status);
    }).catch(err => {
      console.error(err);
      setVendorStatus('ERROR');
    });
  }, []);

  const handleVerify = async () => {
    if (vendorStatus === 'VENDOR_NOT_CONFIGURED') {
      alert("Vendor is not configured for production yet.");
      return;
    }

    setLoading(true);
    try {
      await submitLivenessSandbox({
        liveness_status: "STRONG",
        face_match_status: "STRONG"
      });
      setIsVerified(true);
    } catch (e: any) {
      alert(e.message || "Liveness Sandbox failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="One quick look" 
        subtitle="Liveness · stays private" 
        onBack={() => navigate(-1)} 
      />

      <div className="mb-4">
        {vendorStatus === 'VENDOR_NOT_CONFIGURED' ? (
          <DevFallbackBadge message="Production vendor pending. Verification disabled." />
        ) : (
          <DevFallbackBadge message="Production Liveness vendor pending. No real selfie collected." />
        )}
      </div>

      <div className="sk-portrait sk-fx sk-d1">
        <div className="aura" style={{ borderStyle: 'dashed', color: 'var(--sk-gold-dim)' }}>
          ◉
        </div>
      </div>

      <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-[14px] text-center sk-fx sk-d2">
        Center your face and blink once — proves you're real and matches your ID. <b style={{ color: '#9cc596', fontWeight: 500 }}>No one but the system ever sees it.</b>
      </p>

      {!isVerified ? (
        <div className="sk-fx sk-d3 mt-4">
          <SakinahButton variant="primary" onClick={handleVerify} disabled={loading || vendorStatus === 'VENDOR_NOT_CONFIGURED'}>
            {loading ? 'Verifying...' : 'Capture & verify'}
          </SakinahButton>
        </div>
      ) : (
        <div className="sk-fx sk-rise mt-4">
          <div className="flex flex-wrap gap-[7px] justify-center my-[14px]">
            <span className="inline-flex items-center gap-[6px] text-[11px] text-[var(--sk-green)] border border-[rgba(127,176,122,0.25)] rounded-[30px] px-[12px] py-[5px] bg-[rgba(212,168,83,0.05)]">
              ✓ Phone
            </span>
            <span className="inline-flex items-center gap-[6px] text-[11px] text-[var(--sk-green)] border border-[rgba(127,176,122,0.25)] rounded-[30px] px-[12px] py-[5px] bg-[rgba(212,168,83,0.05)]">
              ✓ ID verified
            </span>
            <span className="inline-flex items-center gap-[6px] text-[11px] text-[var(--sk-green)] border border-[rgba(127,176,122,0.25)] rounded-[30px] px-[12px] py-[5px] bg-[rgba(212,168,83,0.05)]">
              ✓ Photo-matched
            </span>
          </div>
          <SakinahButton variant="primary" onClick={() => navigate('/matrimony/profile-creation')}>
            Create Profile →
          </SakinahButton>
        </div>
      )}
    </SakinahJourneyFrame>
  );
};
