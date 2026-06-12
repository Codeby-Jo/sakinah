import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahInput, SakinahSelect, SakinahTextarea, SakinahButton, SakinahHeader } from '../components';

const STEPS = [
  'Candidate Basic Details', 'Religious Details', 'Education', 'Career',
  'Family Details', 'Lifestyle', 'Photos', 'Partner Preferences',
  'Additional Preferences', 'Review & Submit',
];

export const SakinahWaliCandidateProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, preferences, updatePreference } = useOnboarding();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const v = (f: string) => (profile as any)[f] || '';
  const pv = (f: string) => (preferences as any)[f]?.value || '';
  const pp = (f: string) => (preferences as any)[f]?.priority || 'flexible';
  const set = (f: string, val: string) => {
    updateProfile(f, val);
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!v('fullName')) e.fullName = 'Required';
      if (!v('gender')) e.gender = 'Required';
      if (!v('dob')) e.dob = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < STEPS.length) { setStep(step + 1); window.scrollTo(0, 0); }
    else handleSubmit();
  };

  const prev = () => {
    if (step > 1) { setStep(step - 1); window.scrollTo(0, 0); }
    else navigate('/wali/verify');
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/wali/dashboard');
    }, 1500);
  };

  const renderStep = () => {
    switch(step) {
      case 1: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Candidate Basic Details</h3>
          <p className="text-[12px] text-[var(--sk-ink-dim)] -mt-2">Enter the details of the person you're finding a match for.</p>
          <SakinahInput label="Full Name" value={v('fullName')} onChange={e => set('fullName', e.target.value)} required error={errors.fullName} />
          <SakinahSelect label="Gender" value={v('gender')} onChange={e => set('gender', e.target.value)} required error={errors.gender} options={[{value:'male',label:'Male'},{value:'female',label:'Female'}]} placeholder="Select" />
          <SakinahInput label="Date of Birth" type="date" value={v('dob')} onChange={e => set('dob', e.target.value)} required error={errors.dob} />
          <div className="flex gap-4">
            <SakinahInput label="Height (cm)" type="number" className="flex-1" value={v('height')} onChange={e => set('height', e.target.value)} />
            <SakinahInput label="Weight (kg)" type="number" className="flex-1" value={v('weight')} onChange={e => set('weight', e.target.value)} />
          </div>
          <SakinahSelect label="Marital Status" value={v('maritalStatus')} onChange={e => set('maritalStatus', e.target.value)} options={[{value:'never_married',label:'Never Married'},{value:'divorced',label:'Divorced'},{value:'widowed',label:'Widowed'}]} placeholder="Select" />
          <SakinahInput label="Mother Tongue" value={v('motherTongue')} onChange={e => set('motherTongue', e.target.value)} />
        </div>
      );
      case 2: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Candidate Religious Details</h3>
          <SakinahSelect label="Religion" value={v('religion')} onChange={e => set('religion', e.target.value)} options={[{value:'islam',label:'Islam'}]} placeholder="Select" />
          <SakinahInput label="Sect" value={v('sect')} onChange={e => set('sect', e.target.value)} placeholder="e.g. Sunni" />
          <SakinahSelect label="Prayer Status" value={v('prayerStatus')} onChange={e => set('prayerStatus', e.target.value)} options={[{value:'5_daily',label:'All 5 daily'},{value:'most',label:'Most'},{value:'sometimes',label:'Sometimes'}]} placeholder="Select" />
          <SakinahInput label="Islamic Education" value={v('islamicEducation')} onChange={e => set('islamicEducation', e.target.value)} />
          <SakinahSelect label="Religious Lifestyle" value={v('religiousLifestyle')} onChange={e => set('religiousLifestyle', e.target.value)} options={[{value:'very_practicing',label:'Very Practicing'},{value:'practicing',label:'Practicing'},{value:'moderate',label:'Moderate'}]} placeholder="Select" />
        </div>
      );
      case 3: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Candidate Education</h3>
          <SakinahSelect label="Qualification" value={v('qualification')} onChange={e => set('qualification', e.target.value)} options={[{value:'high_school',label:'High School'},{value:'bachelors',label:"Bachelor's"},{value:'masters',label:"Master's"},{value:'phd',label:'PhD'}]} placeholder="Select" />
          <SakinahInput label="Degree" value={v('degree')} onChange={e => set('degree', e.target.value)} />
          <SakinahInput label="Institution" value={v('college')} onChange={e => set('college', e.target.value)} />
        </div>
      );
      case 4: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Candidate Career</h3>
          <SakinahInput label="Occupation" value={v('occupation')} onChange={e => set('occupation', e.target.value)} />
          <SakinahInput label="Company" value={v('company')} onChange={e => set('company', e.target.value)} />
          <SakinahInput label="Annual Income" value={v('annualIncome')} onChange={e => set('annualIncome', e.target.value)} />
          <SakinahInput label="Work Location" value={v('workLocation')} onChange={e => set('workLocation', e.target.value)} />
        </div>
      );
      case 5: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Candidate Family</h3>
          <SakinahInput label="Father's Occupation" value={v('fatherOccupation')} onChange={e => set('fatherOccupation', e.target.value)} />
          <SakinahInput label="Mother's Occupation" value={v('motherOccupation')} onChange={e => set('motherOccupation', e.target.value)} />
          <SakinahSelect label="Family Type" value={v('familyType')} onChange={e => set('familyType', e.target.value)} options={[{value:'nuclear',label:'Nuclear'},{value:'joint',label:'Joint'}]} placeholder="Select" />
          <SakinahSelect label="Family Values" value={v('familyValues')} onChange={e => set('familyValues', e.target.value)} options={[{value:'conservative',label:'Conservative'},{value:'moderate',label:'Moderate'},{value:'liberal',label:'Liberal'}]} placeholder="Select" />
          <div className="flex gap-4">
            <SakinahInput label="Brothers" type="number" className="flex-1" value={v('brothers')} onChange={e => set('brothers', e.target.value)} />
            <SakinahInput label="Sisters" type="number" className="flex-1" value={v('sisters')} onChange={e => set('sisters', e.target.value)} />
          </div>
        </div>
      );
      case 6: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Candidate Lifestyle</h3>
          <SakinahSelect label="Food Preference" value={v('foodPreference')} onChange={e => set('foodPreference', e.target.value)} options={[{value:'halal_only',label:'Halal Only'},{value:'vegetarian',label:'Vegetarian'}]} placeholder="Select" />
          <SakinahSelect label="Smoking" value={v('smoking')} onChange={e => set('smoking', e.target.value)} options={[{value:'never',label:'Never'},{value:'occasionally',label:'Occasionally'}]} placeholder="Select" />
          <SakinahInput label="Languages" value={v('languages')} onChange={e => set('languages', e.target.value)} placeholder="e.g. English, Urdu" />
          <SakinahInput label="Interests" value={v('interests')} onChange={e => set('interests', e.target.value)} placeholder="e.g. Reading, Sports" />
        </div>
      );
      case 7: return (
        <div className="flex flex-col gap-4 items-center text-center py-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Candidate Photos</h3>
          <p className="text-[12px] text-[var(--sk-ink-dim)] max-w-[320px]">Photos are blurred by default. Upload a clear, recent photo of the candidate.</p>
          <div className="w-[120px] h-[120px] rounded-full bg-[rgba(255,255,255,0.03)] border-2 border-dashed border-[var(--sk-line)] flex items-center justify-center cursor-pointer hover:border-[var(--sk-gold)] transition-colors">
            <span className="text-[28px] text-[var(--sk-ink-faint)]">+</span>
          </div>
          <div className="flex gap-3 mt-3">
            {[1, 2].map(i => (
              <div key={i} className="w-[64px] h-[64px] rounded-xl bg-[rgba(255,255,255,0.03)] border border-dashed border-[var(--sk-line-soft)] flex items-center justify-center cursor-pointer hover:border-[var(--sk-gold)] transition-colors">
                <span className="text-[16px] text-[var(--sk-ink-faint)]">+</span>
              </div>
            ))}
          </div>
        </div>
      );
      case 8: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Desired Partner Preferences</h3>
          <p className="text-[12px] text-[var(--sk-ink-dim)] -mt-2">What are you looking for in a partner for your candidate?</p>
          {[
            { label: 'Age Range', field: 'ageMin', placeholder: 'e.g. 22-28' },
            { label: 'Height', field: 'heightMin', placeholder: 'e.g. 160+ cm' },
            { label: 'Education', field: 'minQualification', placeholder: 'e.g. Bachelor\'s+' },
            { label: 'Profession', field: 'preferredProfession', placeholder: 'e.g. Doctor, Engineer' },
          ].map(row => (
            <div key={row.field} className="flex gap-3">
              <SakinahInput label={row.label} className="flex-1" value={pv(row.field)} onChange={e => updatePreference(row.field, { value: e.target.value })} placeholder={row.placeholder} />
              <div className="w-[120px] mt-5">
                <SakinahSelect value={pp(row.field)} onChange={e => updatePreference(row.field, { priority: e.target.value as any })} options={[{value:'must_have',label:'Must Have'},{value:'preferred',label:'Preferred'},{value:'flexible',label:'Flexible'}]} />
              </div>
            </div>
          ))}
        </div>
      );
      case 9: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Additional Preferences</h3>
          {[
            { label: 'Religion', field: 'religion' },
            { label: 'Country', field: 'country' },
            { label: 'Family Values', field: 'familyValues', type: 'select' as const, options: [{value:'conservative',label:'Conservative'},{value:'moderate',label:'Moderate'},{value:'any',label:'Any'}] },
          ].map(row => (
            <div key={row.field} className="flex gap-3">
              {row.type === 'select' ? (
                <SakinahSelect label={row.label} className="flex-1" value={pv(row.field)} onChange={e => updatePreference(row.field, { value: e.target.value })} options={row.options!} placeholder="Select" />
              ) : (
                <SakinahInput label={row.label} className="flex-1" value={pv(row.field)} onChange={e => updatePreference(row.field, { value: e.target.value })} />
              )}
              <div className="w-[120px] mt-5">
                <SakinahSelect value={pp(row.field)} onChange={e => updatePreference(row.field, { priority: e.target.value as any })} options={[{value:'must_have',label:'Must Have'},{value:'preferred',label:'Preferred'},{value:'flexible',label:'Flexible'}]} />
              </div>
            </div>
          ))}
          <SakinahTextarea label="Additional Expectations" value={pv('additionalExpectations')} onChange={e => updatePreference('additionalExpectations', { value: e.target.value })} rows={3} placeholder="Any other expectations or requirements..." />
        </div>
      );
      case 10: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Review & Submit</h3>
          <p className="text-[12px] text-[var(--sk-ink-dim)]">Please review the information below. After submission, a Candidate ID will be generated.</p>
          <div className="bg-[rgba(255,255,255,0.01)] border border-[var(--sk-line-soft)] rounded-[14px] overflow-hidden">
            {[
              { l: 'Candidate Name', v: v('fullName') },
              { l: 'Gender', v: v('gender') },
              { l: 'DOB', v: v('dob') },
              { l: 'Religion', v: v('religion') },
              { l: 'Qualification', v: v('qualification') },
              { l: 'Occupation', v: v('occupation') },
              { l: 'Family Type', v: v('familyType') },
            ].filter(i => i.v).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center px-4 py-3 border-b border-[var(--sk-line-soft)] last:border-0">
                <span className="text-[12px] text-[var(--sk-ink-dim)]">{item.l}</span>
                <span className="text-[13px] text-[var(--sk-ink)] font-medium">{item.v}</span>
              </div>
            ))}
          </div>
          {isSubmitting && (
            <div className="p-4 rounded-xl bg-[rgba(127,176,122,0.08)] border border-[rgba(127,176,122,0.2)] text-center">
              <div className="text-[14px] text-[var(--sk-green)]">✓ Generating Candidate ID...</div>
            </div>
          )}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="sk-viewport">
      <div className="min-h-screen flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-[520px]">
          <SakinahHeader
            title="Candidate Profile"
            subtitle={`Step ${step} of ${STEPS.length} · ${STEPS[step - 1]}`}
            onBack={prev}
          />

          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[4px] rounded-full mb-2 overflow-hidden">
            <div className="h-full bg-[var(--sk-gold)] transition-all duration-500" style={{ width: `${16 + (step / STEPS.length) * 84}%` }} />
          </div>
          <div className="flex gap-[3px] mb-6">
            {STEPS.map((_, i) => (
              <div key={i} className={`flex-1 h-[3px] rounded-full transition-colors ${i + 1 <= step ? 'bg-[var(--sk-gold)]' : 'bg-[rgba(255,255,255,0.06)]'}`} />
            ))}
          </div>

          <div className="bg-[rgba(255,255,255,0.01)] border border-[var(--sk-line-soft)] rounded-[20px] p-5 mb-6 sk-fx sk-d1">
            {renderStep()}
          </div>

          <div className="flex gap-3 sk-fx sk-d2">
            <SakinahButton variant="ghost" onClick={prev} className="flex-1">Back</SakinahButton>
            <SakinahButton variant="primary" onClick={next} disabled={isSubmitting} className="flex-1">
              {step === STEPS.length ? (isSubmitting ? 'Submitting...' : 'Submit Profile ✓') : 'Save & Continue →'}
            </SakinahButton>
          </div>
        </div>
      </div>
    </div>
  );
};
