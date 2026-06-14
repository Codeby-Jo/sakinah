import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding, type PartnerPreference } from '../context/OnboardingContext';
import { SakinahInput, SakinahSelect, SakinahTextarea, SakinahButton, SakinahHeader } from '../components';

const PrefRow: React.FC<{
  label: string;
  field: string;
  type?: 'input' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  placeholder?: string;
  pref: PartnerPreference;
  onChange: (field: string, pref: Partial<PartnerPreference>) => void;
}> = ({ label, field, type = 'input', options, placeholder, pref, onChange }) => (
  <div className="bg-[rgba(212,168,83,0.02)] border border-[rgba(212,168,83,0.12)] rounded-[14px] p-4 flex flex-col sm:flex-row gap-3">
    <div className="flex-1">
      {type === 'select' && options ? (
        <SakinahSelect label={label} value={pref.value} onChange={e => onChange(field, { value: e.target.value })} options={options} placeholder={placeholder || 'Select'} />
      ) : type === 'textarea' ? (
        <SakinahTextarea label={label} value={pref.value} onChange={e => onChange(field, { value: e.target.value })} rows={2} placeholder={placeholder} />
      ) : (
        <SakinahInput label={label} value={pref.value} onChange={e => onChange(field, { value: e.target.value })} placeholder={placeholder} />
      )}
    </div>
    <div className="sm:w-[130px] sm:mt-5">
      <SakinahSelect
        value={pref.priority}
        onChange={e => onChange(field, { priority: e.target.value as any })}
        options={[
          { value: 'must_have', label: 'Must Have' },
          { value: 'preferred', label: 'Preferred' },
          { value: 'flexible', label: 'Flexible' },
        ]}
      />
    </div>
  </div>
);

export const SakinahPreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const { preferences, updatePreference, isWaliViewOnly } = useOnboarding();

  if (isWaliViewOnly) {
    return (
      <div className="sk-viewport flex items-center justify-center min-h-screen bg-[#0A0E16]">
        <div className="text-center p-8 bg-[rgba(201,138,138,0.05)] border border-[rgba(201,138,138,0.2)] rounded-[20px] max-w-[400px]">
          <div className="text-[40px] mb-4">🚫</div>
          <h2 className="font-serif text-[24px] text-[var(--sk-rose)] mb-2">Permission Denied</h2>
          <p className="text-[14px] text-[var(--sk-ink-dim)] leading-relaxed">
            Wali accounts have read-only access. You cannot edit matchmaking preferences.
          </p>
          <SakinahButton variant="secondary" onClick={() => navigate('/wali/dashboard')} className="mt-6">
            Return to Dashboard
          </SakinahButton>
        </div>
      </div>
    );
  }

  return (
    <div className="sk-viewport">
      <div className="min-h-screen flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-[560px]">
          <SakinahHeader title="Partner Preferences" subtitle="Step 5 of 6 · What Matters to You" onBack={() => navigate('/profile-creation')} />

          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[4px] rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-[var(--sk-gold)] transition-all duration-500" style={{ width: '82%' }} />
          </div>

          <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-6 sk-fx sk-d1">
            Define the qualities that matter most in your life partner. Mark each as <strong className="text-[var(--sk-gold-soft)]">Must Have</strong>, <strong className="text-[var(--sk-gold-soft)]">Preferred</strong>, or <strong className="text-[var(--sk-gold-soft)]">Flexible</strong>.
          </p>

          <div className="flex flex-col gap-4 mb-8">
            {/* Basic */}
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--sk-gold-dim)] mt-2">Basic</div>
            <PrefRow label="Preferred Gender" field="preferredGender" type="select" options={[{value:'male',label:'Male'},{value:'female',label:'Female'}]} pref={preferences.preferredGender} onChange={updatePreference} />
            <div className="flex gap-3">
              <div className="flex-1">
                <PrefRow label="Min Age" field="ageMin" placeholder="e.g. 22" pref={preferences.ageMin} onChange={updatePreference} />
              </div>
              <div className="flex-1">
                <PrefRow label="Max Age" field="ageMax" placeholder="e.g. 30" pref={preferences.ageMax} onChange={updatePreference} />
              </div>
            </div>
            <PrefRow label="Min Height (cm)" field="heightMin" placeholder="e.g. 160" pref={preferences.heightMin} onChange={updatePreference} />
            <PrefRow label="Marital Status" field="maritalStatus" type="select" options={[{value:'never_married',label:'Never Married'},{value:'divorced',label:'Divorced'},{value:'any',label:'Any'}]} pref={preferences.maritalStatus} onChange={updatePreference} />

            {/* Religion */}
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--sk-gold-dim)] mt-4">Religion</div>
            <PrefRow label="Religion" field="religion" type="select" options={[{value:'islam',label:'Islam'}]} pref={preferences.religion} onChange={updatePreference} />
            <PrefRow label="Sect" field="sect" placeholder="e.g. Sunni" pref={preferences.sect} onChange={updatePreference} />
            <PrefRow label="Madhab" field="madhab" type="select" options={[{value:'hanafi',label:'Hanafi'},{value:'shafi',label:"Shafi'i"},{value:'maliki',label:'Maliki'},{value:'hanbali',label:'Hanbali'},{value:'any',label:'Any'}]} pref={preferences.madhab} onChange={updatePreference} />
            <PrefRow label="Religious Practice" field="religiousPractice" type="select" options={[{value:'very_practicing',label:'Very Practicing'},{value:'practicing',label:'Practicing'},{value:'moderate',label:'Moderate'},{value:'any',label:'Any'}]} pref={preferences.religiousPractice} onChange={updatePreference} />

            {/* Education & Career */}
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--sk-gold-dim)] mt-4">Education & Career</div>
            <PrefRow label="Minimum Qualification" field="minQualification" type="select" options={[{value:'any',label:'Any'},{value:'bachelors',label:'Bachelor\'s+'},{value:'masters',label:'Master\'s+'},{value:'phd',label:'PhD'}]} pref={preferences.minQualification} onChange={updatePreference} />
            <PrefRow label="Preferred Profession" field="preferredProfession" placeholder="e.g. Doctor, Engineer" pref={preferences.preferredProfession} onChange={updatePreference} />
            <PrefRow label="Income Range" field="incomeRange" placeholder="e.g. 5-10 LPA" pref={preferences.incomeRange} onChange={updatePreference} />

            {/* Location */}
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--sk-gold-dim)] mt-4">Location</div>
            <PrefRow label="Country" field="country" placeholder="e.g. India" pref={preferences.country} onChange={updatePreference} />
            <PrefRow label="State" field="state" placeholder="e.g. Tamil Nadu" pref={preferences.state} onChange={updatePreference} />
            <PrefRow label="City" field="city" placeholder="e.g. Chennai" pref={preferences.city} onChange={updatePreference} />

            {/* Lifestyle */}
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--sk-gold-dim)] mt-4">Lifestyle</div>
            <PrefRow label="Food Preference" field="foodPreference" type="select" options={[{value:'halal_only',label:'Halal Only'},{value:'any',label:'Any'}]} pref={preferences.foodPreference} onChange={updatePreference} />
            <PrefRow label="Smoking" field="smokingPreference" type="select" options={[{value:'never',label:'Never'},{value:'any',label:'Any'}]} pref={preferences.smokingPreference} onChange={updatePreference} />
            <PrefRow label="Drinking" field="drinkingPreference" type="select" options={[{value:'never',label:'Never'},{value:'any',label:'Any'}]} pref={preferences.drinkingPreference} onChange={updatePreference} />

            {/* Family */}
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--sk-gold-dim)] mt-4">Family</div>
            <PrefRow label="Family Values" field="familyValues" type="select" options={[{value:'conservative',label:'Conservative'},{value:'moderate',label:'Moderate'},{value:'liberal',label:'Liberal'},{value:'any',label:'Any'}]} pref={preferences.familyValues} onChange={updatePreference} />
            <PrefRow label="Family Type" field="familyType" type="select" options={[{value:'nuclear',label:'Nuclear'},{value:'joint',label:'Joint'},{value:'any',label:'Any'}]} pref={preferences.familyType} onChange={updatePreference} />

            {/* Additional */}
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--sk-gold-dim)] mt-4">Additional</div>
            <PrefRow label="Additional Expectations" field="additionalExpectations" type="textarea" placeholder="Anything else you'd like to share..." pref={preferences.additionalExpectations} onChange={updatePreference} />
          </div>

          <div className="flex gap-3 sk-fx sk-d2">
            <SakinahButton variant="ghost" onClick={() => navigate('/profile-creation')} className="flex-1">Back</SakinahButton>
            <SakinahButton variant="primary" onClick={() => navigate('/review')} className="flex-1">Review Profile →</SakinahButton>
          </div>
        </div>
      </div>
    </div>
  );
};
