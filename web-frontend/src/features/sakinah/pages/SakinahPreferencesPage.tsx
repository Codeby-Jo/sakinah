import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SakinahJourneyFrame, 
  DevFallbackBadge, 
  SakinahSelect, 
  SakinahInput, 
  SakinahButton,
  SakinahHeader 
} from '../components';
import { updateSakinahPreferences } from '../services/sakinahApi';

export const SakinahPreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [errorFallback, setErrorFallback] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [relocation, setRelocation] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFallback('');
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!ageMin) errors.ageMin = 'Required';
    if (!ageMax) errors.ageMax = 'Required';
    if (ageMin && ageMax && parseInt(ageMin) > parseInt(ageMax)) {
      errors.ageMin = 'Min > Max';
    }
    if (!relocation) errors.relocation = 'Required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsPending(true);
    try {
      await updateSakinahPreferences({ relocationWillingness: relocation === 'yes' || relocation === 'flexible' });
      navigate('/sakinah/considered-few');
    } catch (err) {
      console.warn('Backend offline, using dev fallback for SakinahPreferences', err);
      setErrorFallback('Backend unreachable. Proceeding in Development Preview Mode.');
      setTimeout(() => navigate('/sakinah/considered-few'), 1000);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="Your preferences" 
        subtitle="Phase 3 · match alignment" 
        onBack={() => navigate('/sakinah/portrait')} 
      />

      <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-[14px] text-center sk-fx sk-d1">
        Define the qualities that are essential for your marriage. We use these to gently filter candidates so you only see those who align with your core boundaries.
      </p>

      {errorFallback && (
        <div className="mb-4 sk-fx sk-d1">
          <DevFallbackBadge message={errorFallback} />
        </div>
      )}

      <form className="mt-4 flex flex-col gap-[22px] sk-fx sk-d2" onSubmit={handleSubmit} noValidate>
        
        <div className="bg-[rgba(212,168,83,0.02)] border border-[rgba(212,168,83,0.15)] rounded-[13px] p-[16px]">
          <label className="block font-serif text-[16px] text-[var(--sk-gold)] mb-3">Age Range Preference</label>
          <div className="flex gap-[11px]">
            <SakinahInput 
              type="number" 
              placeholder="Min Age"
              className="flex-1"
              value={ageMin}
              onChange={(e) => { setAgeMin(e.target.value); setFieldErrors(prev => ({...prev, ageMin: ''})); }}
              required
              error={fieldErrors.ageMin}
            />
            <SakinahInput 
              type="number" 
              placeholder="Max Age"
              className="flex-1"
              value={ageMax}
              onChange={(e) => { setAgeMax(e.target.value); setFieldErrors(prev => ({...prev, ageMax: ''})); }}
              required
              error={fieldErrors.ageMax}
            />
          </div>
        </div>

        <div className="bg-[rgba(212,168,83,0.02)] border border-[rgba(212,168,83,0.15)] rounded-[13px] p-[16px]">
          <label className="block font-serif text-[16px] text-[var(--sk-gold)] mb-3">Willingness to Relocate</label>
          <SakinahSelect
            value={relocation}
            onChange={(e) => { setRelocation(e.target.value); setFieldErrors(prev => ({...prev, relocation: ''})); }}
            placeholder="Select your stance"
            required
            error={fieldErrors.relocation}
            options={[
              { value: 'yes', label: 'Yes, open to relocating' },
              { value: 'no', label: 'No, prefer to stay locally' },
              { value: 'flexible', label: "Flexible / Let's discuss" },
            ]}
          />
        </div>

        <div className="sk-fx sk-d3 mt-[11px]">
          <SakinahButton 
            type="submit" 
            variant="primary"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Save and View Candidates →'}
          </SakinahButton>
        </div>
      </form>
    </SakinahJourneyFrame>
  );
};
