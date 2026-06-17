import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahButton, SakinahHeader } from '../components';

const Section: React.FC<{ title: string; items: { label: string; value: string }[] }> = ({ title, items }) => (
  <div className="mb-5">
    <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--sk-gold-dim)] mb-3">{title}</div>
    <div className="bg-[rgba(255,255,255,0.01)] border border-[var(--sk-line-soft)] rounded-[14px] overflow-hidden">
      {items.filter(i => i.value).map((item, idx) => (
        <div key={idx} className="flex justify-between items-center px-4 py-3 border-b border-[var(--sk-line-soft)] last:border-0">
          <span className="text-[12px] text-[var(--sk-ink-dim)] font-light">{item.label}</span>
          <span className="text-[13px] text-[var(--sk-ink)] font-medium max-w-[200px] text-right truncate">{item.value}</span>
        </div>
      ))}
      {items.filter(i => i.value).length === 0 && (
        <div className="px-4 py-3 text-[12px] text-[var(--sk-ink-faint)] italic">Not provided</div>
      )}
    </div>
  </div>
);

export const SakinahReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, preferences, auth, setOnboardingComplete } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setOnboardingComplete(true);
      navigate('/matrimony/dashboard');
    }, 1500);
  };

  const prefLabel = (v: string) => {
    const map: Record<string, string> = { must_have: '🔴 Must Have', preferred: '🟡 Preferred', flexible: '🟢 Flexible' };
    return map[v] || v;
  };

  return (
    <div className="sk-viewport">
      <div className="min-h-screen flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-[560px]">
          <SakinahHeader title="Review Profile" subtitle="Step 6 of 6 · Final Review" onBack={() => navigate('/matrimony/preferences')} />

          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[4px] rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-[var(--sk-gold)] transition-all duration-500" style={{ width: '100%' }} />
          </div>

          <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-6 sk-fx sk-d1">
            Please review all your information before submitting. You can click <strong className="text-[var(--sk-gold-soft)]">Edit</strong> to go back and modify any section.
          </p>

          <div className="sk-fx sk-d2">
            {/* Account */}
            <Section title="Account" items={[
              { label: 'Email', value: auth.email },
              { label: 'Phone', value: auth.phone },
            ]} />

            {/* Basic */}
            <Section title="Basic Details" items={[
              { label: 'Full Name', value: profile.fullName },
              { label: 'Gender', value: profile.gender },
              { label: 'Date of Birth', value: profile.dob },
              { label: 'Height', value: profile.height ? `${profile.height} cm` : '' },
              { label: 'Weight', value: profile.weight ? `${profile.weight} kg` : '' },
              { label: 'Marital Status', value: profile.maritalStatus },
              { label: 'Mother Tongue', value: profile.motherTongue },
              { label: 'Nationality', value: profile.nationality },
            ]} />

            {/* Location */}
            <Section title="Location" items={[
              { label: 'Country', value: profile.country },
              { label: 'State', value: profile.state },
              { label: 'City', value: profile.city },
            ]} />

            {/* Religion */}
            <Section title="Religious Details" items={[
              { label: 'Religion', value: profile.religion },
              { label: 'Sect', value: profile.sect },
              { label: 'Madhab', value: profile.madhab },
              { label: 'Prayer Status', value: profile.prayerStatus },
              { label: 'Quran Reading', value: profile.quranReading },
              { label: 'Hijab/Beard', value: profile.hijabBeard },
              { label: 'Religious Lifestyle', value: profile.religiousLifestyle },
            ]} />

            {/* Education & Career */}
            <Section title="Education & Career" items={[
              { label: 'Qualification', value: profile.qualification },
              { label: 'Degree', value: profile.degree },
              { label: 'College', value: profile.college },
              { label: 'Occupation', value: profile.occupation },
              { label: 'Company', value: profile.company },
              { label: 'Income', value: profile.annualIncome },
            ]} />

            {/* Family */}
            <Section title="Family" items={[
              { label: "Father's Occupation", value: profile.fatherOccupation },
              { label: "Mother's Occupation", value: profile.motherOccupation },
              { label: 'Family Type', value: profile.familyType },
              { label: 'Family Values', value: profile.familyValues },
            ]} />

            {/* About */}
            <Section title="About" items={[
              { label: 'Bio', value: profile.bio },
              { label: 'Goals', value: profile.goals },
            ]} />

            {/* Partner Preferences */}
            <div className="mb-5">
              <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--sk-gold-dim)] mb-3">Partner Preferences</div>
              <div className="bg-[rgba(255,255,255,0.01)] border border-[var(--sk-line-soft)] rounded-[14px] overflow-hidden">
                {Object.entries(preferences).filter(([_, p]) => p.value).map(([key, pref]) => (
                  <div key={key} className="flex justify-between items-center px-4 py-3 border-b border-[var(--sk-line-soft)] last:border-0">
                    <span className="text-[12px] text-[var(--sk-ink-dim)] font-light capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="text-right">
                      <span className="text-[13px] text-[var(--sk-ink)] block">{pref.value}</span>
                      <span className="text-[10px] text-[var(--sk-ink-faint)]">{prefLabel(pref.priority)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 sk-fx sk-d3">
            <SakinahButton variant="ghost" onClick={() => navigate('/matrimony/profile-creation')} className="flex-1">
              Edit Profile
            </SakinahButton>
            <SakinahButton variant="primary" onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Submitting...' : 'Submit Profile ✓'}
            </SakinahButton>
          </div>
        </div>
      </div>
    </div>
  );
};
