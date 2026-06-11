import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SakinahShell, SakinahHeader, DevFallbackBadge, SakinahSelect, SakinahTextarea, SakinahButton } from '../components';
import { updateSakinahProfile } from '../services/sakinahApi';

export const SakinahProfileSignalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [errorFallback, setErrorFallback] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [approach, setApproach] = useState('');
  const [prayer, setPrayer] = useState('');
  const [timeline, setTimeline] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFallback('');
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!approach) errors.approach = 'Please select your approach.';
    if (!prayer) errors.prayer = 'Please select a prayer frequency.';
    if (!timeline) errors.timeline = 'Please select a timeline.';
    if (!note.trim()) errors.note = 'Please provide a short note about your journey.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorFallback('Please complete all required fields before continuing.');
      return;
    }

    setIsPending(true);
    try {
      await updateSakinahProfile({ timelineToMarry: timeline });
      navigate('/sakinah/preferences');
    } catch (err) {
      console.warn('Backend offline, using dev fallback for SakinahProfileSignals', err);
      setErrorFallback('Backend unreachable. Proceeding in Development Preview Mode.');
      setTimeout(() => navigate('/sakinah/preferences'), 1000);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <SakinahShell>
      <SakinahHeader title="Your Profile" subtitle="CHARACTER & SIGNALS" />

      <main className="mt-6 flex flex-col gap-6">
        <p className="text-[14px] font-light text-[#9aa0ac] leading-[1.6]">
          Share your values, practices, and outlook. These signals help us find meaningful alignment, without reducing you to public labels or scores.
        </p>

        {errorFallback && <DevFallbackBadge message={errorFallback} />}

        <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit} noValidate>
          <SakinahSelect
            label="Sect / Thought"
            value={approach}
            onChange={(e) => { setApproach(e.target.value); setFieldErrors(prev => ({...prev, approach: ''})); }}
            placeholder="Choose your approach"
            required
            error={fieldErrors.approach}
            options={[
              { value: 'sunni', label: 'Sunni' },
              { value: 'shia', label: 'Shia' },
              { value: 'just_muslim', label: 'Just Muslim' },
            ]}
          />

          <SakinahSelect
            label="Prayer Frequency"
            value={prayer}
            onChange={(e) => { setPrayer(e.target.value); setFieldErrors(prev => ({...prev, prayer: ''})); }}
            placeholder="Choose a frequency"
            required
            error={fieldErrors.prayer}
            options={[
              { value: 'always', label: 'Always Prays' },
              { value: 'usually', label: 'Usually Prays' },
              { value: 'sometimes', label: 'Sometimes Prays' },
              { value: 'working_on_it', label: 'Working on it' },
            ]}
          />

          <SakinahSelect
            label="Timeline to Marry"
            value={timeline}
            onChange={(e) => { setTimeline(e.target.value); setFieldErrors(prev => ({...prev, timeline: ''})); }}
            placeholder="Choose a timeline"
            required
            error={fieldErrors.timeline}
            options={[
              { value: 'asap', label: 'As soon as possible' },
              { value: '1_year', label: 'Within 1 year' },
              { value: '2_years', label: 'Within 2 years' },
            ]}
          />

          <SakinahTextarea
            label="A short note about your journey"
            value={note}
            onChange={(e) => { setNote(e.target.value); setFieldErrors(prev => ({...prev, note: ''})); }}
            rows={4}
            placeholder="What are you looking to build together?"
            className="md:col-span-2"
            required
            error={fieldErrors.note}
          />

          <div className="md:col-span-2">
            <SakinahButton 
              type="submit" 
              disabled={isPending}
              size="lg"
              className="mt-4"
            >
              {isPending ? 'Saving...' : 'Save Signals'}
            </SakinahButton>
          </div>
        </form>
      </main>
    </SakinahShell>
  );
};
