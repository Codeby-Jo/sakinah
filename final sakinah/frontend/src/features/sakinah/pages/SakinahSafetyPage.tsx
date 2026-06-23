import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  SakinahJourneyFrame, 
  SakinahHeader, 
  SakinahButton, 
  SakinahSelect, 
  SakinahTextarea 
} from '../components';
import { submitReport } from '../services/sakinahApi';

export const SakinahSafetyPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Real reported user UID comes from URL: /matrimony/safety?uid=USER_ID&name=User+Name
  const reportedUid = searchParams.get('uid') || '';
  const reportedName = searchParams.get('name') || 'this user';

  const [isPending, setIsPending] = useState(false);
  const [reportStatus, setReportStatus] = useState<'IDLE' | 'SUCCESS'>('IDLE');
  const [reasonType, setReasonType] = useState('');
  const [details, setDetails] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setSubmitError('');

    const errors: Record<string, string> = {};
    if (!reasonType) errors.reasonType = 'Required';
    if (!details.trim()) errors.details = 'Required';
    if (!reportedUid) {
      setSubmitError('No user selected to report. Please go back and try again from their profile.');
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsPending(true);
    try {
      // Use real reportedUid — NOT 'mock_target'
      await submitReport(reportedUid, reasonType, 'HIGH', details);
      setReportStatus('SUCCESS');
      setReasonType('');
      setDetails('');
    } catch (err: any) {
      // Show real error — do NOT silently show "success"
      setSubmitError(
        err?.message?.includes('fetch')
          ? 'Could not connect to the server. Please check your internet and try again.'
          : (err?.message || 'Failed to submit report. Please try again.')
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="Your safety & privacy" 
        subtitle="OUR COMMITMENT" 
        onBack={() => navigate('/matrimony/home')} 
      />

      <div className="sk-insight sk-fx sk-d1 mb-5 border-[var(--sk-green)]" style={{ color: '#bcd6b8' }}>
        Sakinah is monitored for your safety. Report any inappropriate behavior, pressure, or requests for money immediately. <b>Your identity is never exposed to the reported person.</b>
      </div>

      <div className="bg-[rgba(212,168,83,0.02)] border border-[rgba(212,168,83,0.15)] rounded-[13px] p-[16px] mb-5 sk-fx sk-d2">
        <h3 className="font-serif text-[18px] text-[var(--sk-gold)] mb-2">Verified-only protection</h3>
        <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6]">
          Every profile here is verified. Never share your private phone number, home address, or financial information. Keep all communication inside Sakinah until both parties, and their families, have agreed to proceed.
        </p>
      </div>

      <div className="bg-[rgba(212,168,83,0.02)] border border-[rgba(212,168,83,0.15)] rounded-[13px] p-[16px] mb-5 sk-fx sk-d3">
        <h3 className="font-serif text-[18px] text-[var(--sk-gold)] mb-2">Photo & Watermark Security</h3>
        <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6]">
          If a photo is exchanged (only after mutual interest), it is heavily watermarked and protected from screenshots to preserve your dignity.
        </p>
      </div>
      
      <form className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[13px] p-[16px] space-y-[16px] sk-fx sk-d4" onSubmit={handleReport} noValidate>
        <h3 className="font-serif text-[18px] text-[#e79a9a] mb-1">
          Report an Incident{reportedUid ? ` — ${reportedName}` : ''}
        </h3>

        {/* Real error shown to user */}
        {submitError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-[12px] p-3 text-[13px] text-red-400 flex items-start gap-2">
            <span>⚠️</span>
            <div>
              <div className="font-bold mb-0.5">Submission Failed</div>
              <div>{submitError}</div>
            </div>
          </div>
        )}

        {reportStatus === 'SUCCESS' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-[12px] p-3 text-center text-[12px] text-green-400">
            Report submitted successfully. Our safety team will review this immediately.
          </div>
        )}

        <SakinahSelect
          value={reasonType}
          onChange={(e) => { setReasonType(e.target.value); setFieldErrors(prev => ({...prev, reasonType: ''})); }}
          placeholder="Select a reason"
          required
          error={fieldErrors.reasonType}
          options={[
            { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
            { value: 'pressure', label: 'Pressure or Coercion' },
            { value: 'financial', label: 'Request for Money' },
            { value: 'other', label: 'Other' },
          ]}
        />

        <SakinahTextarea
          value={details}
          onChange={(e) => { setDetails(e.target.value); setFieldErrors(prev => ({...prev, details: ''})); }}
          rows={4}
          placeholder="Please describe what happened..."
          required
          error={fieldErrors.details}
        />

        <div className="pt-2">
          <SakinahButton 
            type="submit"
            variant="ghost"
            disabled={isPending}
            className="text-[#e79a9a] hover:text-[#ffbaba] hover:bg-red-500/10 border-red-500/30 w-full justify-center"
          >
            {isPending ? 'Submitting securely...' : 'Submit Report'}
          </SakinahButton>
        </div>
      </form>
    </SakinahJourneyFrame>
  );
};
