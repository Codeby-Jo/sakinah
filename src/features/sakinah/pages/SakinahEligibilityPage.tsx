import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SakinahShell, SakinahHeader, SafetyNotice, DevFallbackBadge, SakinahButton, SakinahCard, SakinahLoadingState } from '../components';
import { getSakinahEligibility } from '../services/sakinahApi';

type EligibilityState = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'HUMAN_REVIEW_REQUIRED' | 'REJECTED' | 'BANNED';

export const SakinahEligibilityPage: React.FC = () => {
  const [status, setStatus] = useState<EligibilityState | null>(null);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getSakinahEligibility()
      .then((res: any) => {
        setStatus(res.status || 'VERIFIED');
      })
      .catch((err) => {
        console.warn('Backend offline, using dev fallback for SakinahEligibility', err);
        setIsOfflineFallback(true);
        setStatus('VERIFIED');
      });
  }, []);

  if (!status) {
    return <SakinahLoadingState fullPage message="Verifying security status..." />;
  }

  return (
    <SakinahShell>
      <SakinahHeader title="Verification" subtitle="SECURITY GATE" />

      <main className="flex flex-col gap-6 mt-8">
        <h2 className="font-serif text-[24px] text-[#EDE7DA]">
          Safety First
        </h2>
        
        <p className="text-[14px] font-light text-[#9aa0ac] leading-[1.6]">
          To ensure a secure environment for everyone seeking marriage, we enforce strict identity and safety checks.
        </p>

        {isOfflineFallback && <DevFallbackBadge />}

        <SakinahCard className="mt-4 bg-gradient-to-br from-[#111826] to-[#0f1521]">
          <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#D4A853] mb-4">
            Current Status
          </h3>
          
          <div className="font-serif text-[20px] text-[#EDE7DA] mb-2">
            {status === 'NOT_STARTED' && "Verification Required"}
            {status === 'PENDING' && "Under Review"}
            {status === 'VERIFIED' && "Verified & Approved"}
            {status === 'HUMAN_REVIEW_REQUIRED' && "Manual Review Required"}
            {status === 'REJECTED' && "Application Declined"}
            {status === 'BANNED' && "Access Revoked"}
          </div>

          <p className="text-[13px] text-[#9aa0ac] font-light mt-4">
            {status === 'NOT_STARTED' && "Please complete the KYC verification to proceed into Sakinah."}
            {status === 'PENDING' && "Our system is reviewing your submitted documents."}
            {status === 'VERIFIED' && "Alhamdulillah. You may now proceed."}
            {status === 'HUMAN_REVIEW_REQUIRED' && "Your profile has been flagged for manual verification by our team."}
            {status === 'REJECTED' && "We are unable to verify your profile at this time."}
            {status === 'BANNED' && "You have been permanently removed from Sakinah."}
          </p>
        </SakinahCard>

        {status === 'HUMAN_REVIEW_REQUIRED' && (
          <SafetyNotice message="Our trust and safety team will review your account details to ensure community standards are upheld." />
        )}

        {status === 'VERIFIED' && (
          <SakinahButton 
            onClick={() => navigate('/matrimony/profile')}
            size="lg"
            className="mt-4"
          >
            Continue
          </SakinahButton>
        )}

      </main>
    </SakinahShell>
  );
};
