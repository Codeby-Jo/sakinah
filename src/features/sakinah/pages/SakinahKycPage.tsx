import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SakinahJourneyFrame, 
  SakinahHeader, 
  SakinahButton,
  SakinahChoiceChip,
  DevFallbackBadge
} from '../components';
import { startKycFlow, submitKycSandbox } from '../services/sakinahApi';

export const SakinahKycPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>('aadhaar');
  const [loading, setLoading] = useState(false);
  const [vendorStatus, setVendorStatus] = useState<string>('PENDING');

  useEffect(() => {
    startKycFlow().then(res => {
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
      // In a real flow, we would redirect to vendor SDK
      // Here we hit the sandbox completion endpoint
      await submitKycSandbox({
        verified_name: "Ayman (Sandbox)",
        verified_age: 28,
        verified_gender: "MALE"
      });
      navigate('/sakinah/liveness');
    } catch (e: any) {
      alert(e.message || "KYC Sandbox failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="Let's verify you" 
        subtitle="So this stays a safe, real space" 
        onBack={() => navigate(-1)} 
      />

      <div className="mb-4">
        {vendorStatus === 'VENDOR_NOT_CONFIGURED' ? (
          <DevFallbackBadge message="Production vendor pending. Verification disabled." />
        ) : (
          <DevFallbackBadge message="Production KYC vendor pending. Safe sandbox mode." />
        )}
      </div>

      <div className="sk-meta-row sk-fx sk-d1">
        <div className="sk-meta !flex-none !w-full">
          <div className="flex gap-[6px]">
            <div className="flex-1 h-[4px] rounded-[4px] bg-[var(--sk-gold)]" />
            <div className="flex-1 h-[4px] rounded-[4px] bg-[var(--sk-gold)]" />
            <div className="flex-1 h-[4px] rounded-[4px] bg-[var(--sk-line-soft)]" />
            <div className="flex-1 h-[4px] rounded-[4px] bg-[var(--sk-line-soft)]" />
          </div>
        </div>
      </div>

      <div className="sk-notice sk-fx sk-d1" style={{ borderColor: 'rgba(127,176,122,.25)', background: 'rgba(127,176,122,.04)' }}>
        <div className="ni" style={{ color: 'var(--sk-green)', background: 'rgba(127,176,122,.08)', borderColor: 'rgba(127,176,122,.2)' }}>✓</div>
        <div>
          <b>Phone number</b>
          <p>+91 ••••• ••741 · confirmed</p>
        </div>
      </div>

      <div className="sk-reflect sk-fx sk-d2">
        <div className="q !text-[15px]">Government ID — choose one</div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <SakinahChoiceChip 
            label="Aadhaar · DigiLocker" 
            selected={selectedId === 'aadhaar'} 
            onClick={() => setSelectedId('aadhaar')} 
            className="!m-0 text-center"
          />
          <SakinahChoiceChip 
            label="Passport" 
            selected={selectedId === 'passport'} 
            onClick={() => setSelectedId('passport')} 
            className="!m-0 text-center"
          />
          <SakinahChoiceChip 
            label="PAN" 
            selected={selectedId === 'pan'} 
            onClick={() => setSelectedId('pan')} 
            className="!m-0 text-center"
          />
          <SakinahChoiceChip 
            label="Voter ID" 
            selected={selectedId === 'voter'} 
            onClick={() => setSelectedId('voter')} 
            className="!m-0 text-center"
          />
        </div>
      </div>

      <div className="sk-insight sk-fx sk-d3" style={{ borderColor: 'var(--sk-green)', color: '#bcd6b8' }}>
        Your ID is <b style={{ color: '#9cc596' }}>minimised and encrypted</b> — only name, age, gender; raw Aadhaar never stored; <b style={{ color: '#9cc596' }}>never shown to a match</b>. It keeps out fakes and makes a banned person stay banned.
      </div>

      <div className="sk-fx sk-d3 mt-4">
        <SakinahButton variant="primary" onClick={handleVerify} disabled={loading || vendorStatus === 'VENDOR_NOT_CONFIGURED'}>
          {loading ? 'Verifying...' : 'Verify with DigiLocker →'}
        </SakinahButton>
      </div>
    </SakinahJourneyFrame>
  );
};
