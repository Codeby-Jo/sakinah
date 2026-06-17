import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahInput, SakinahSelect, SakinahTextarea, SakinahButton, SakinahHeader } from '../components';

export const SakinahWaliRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { waliDetails, setWaliDetails } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: keyof typeof waliDetails, value: string) => {
    setWaliDetails(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!waliDetails.fullName) e.fullName = 'Required';
    if (!waliDetails.relationship) e.relationship = 'Required';
    if (!waliDetails.phone) e.phone = 'Required';
    if (!waliDetails.email) e.email = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (validate()) navigate('/matrimony/wali/verify');
  };

  return (
    <div className="sk-viewport">
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">
          <SakinahHeader title="Wali Registration" subtitle="Step 1 · Your Details" onBack={() => navigate('/matrimony/role')} />

          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[4px] rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-[var(--sk-gold)] transition-all duration-500" style={{ width: '8%' }} />
          </div>

          <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-6 sk-fx sk-d1">
            As a wali, you are the guardian managing this profile. Please provide your information first.
          </p>

          <div className="flex flex-col gap-4 sk-fx sk-d2">
            <SakinahInput label="Your Full Name" value={waliDetails.fullName} onChange={e => set('fullName', e.target.value)} required error={errors.fullName} />
            <SakinahSelect label="Relationship to Candidate" value={waliDetails.relationship} onChange={e => set('relationship', e.target.value)} required error={errors.relationship} options={[{value:'father',label:'Father'},{value:'mother',label:'Mother'},{value:'brother',label:'Brother'},{value:'sister',label:'Sister'},{value:'uncle',label:'Uncle'},{value:'aunt',label:'Aunt'},{value:'guardian',label:'Legal Guardian'},{value:'other',label:'Other'}]} placeholder="Select relationship" />
            <SakinahInput label="Phone Number" type="tel" value={waliDetails.phone} onChange={e => set('phone', e.target.value)} required error={errors.phone} placeholder="+91 XXXXXXXXXX" />
            <SakinahInput label="Email Address" type="email" value={waliDetails.email} onChange={e => set('email', e.target.value)} required error={errors.email} />
            <SakinahTextarea label="Address" value={waliDetails.address} onChange={e => set('address', e.target.value)} rows={2} placeholder="Your residential address" />
          </div>

          <div className="flex gap-3 mt-6 sk-fx sk-d3">
            <SakinahButton variant="ghost" onClick={() => navigate('/matrimony/role')} className="flex-1">Back</SakinahButton>
            <SakinahButton variant="primary" onClick={handleContinue} className="flex-1">Continue →</SakinahButton>
          </div>
        </div>
      </div>
    </div>
  );
};
