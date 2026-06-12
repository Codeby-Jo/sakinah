import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahInput, SakinahSelect, SakinahTextarea, SakinahButton, SakinahHeader } from '../components';

const STEPS = [
  'Basic Details', 'Location', 'Religious Details', 'Education',
  'Career', 'Family Details', 'Lifestyle', 'About Yourself', 'Photos',
];

export const SakinahProfileCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, profileStep, setProfileStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const step = profileStep;

  const v = (field: string) => (profile as any)[field] || '';
  const set = (field: string, val: string) => {
    updateProfile(field, val);
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!v('fullName')) e.fullName = 'Required';
      if (!v('gender')) e.gender = 'Required';
      if (!v('dob')) e.dob = 'Required';
      if (!v('height')) e.height = 'Required';
      if (!v('maritalStatus')) e.maritalStatus = 'Required';
    }
    if (step === 2) {
      if (!v('country')) e.country = 'Required';
      if (!v('state')) e.state = 'Required';
      if (!v('city')) e.city = 'Required';
    }
    if (step === 3 && !v('religion')) e.religion = 'Required';
    if (step === 8 && !v('bio')) e.bio = 'Tell us about yourself';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < STEPS.length) {
      setProfileStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      navigate('/preferences');
    }
  };

  const prev = () => {
    if (step > 1) { setProfileStep(step - 1); window.scrollTo(0, 0); }
    else navigate('/kyc');
  };

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Basic Details</h3>
          <SakinahInput label="Full Name" value={v('fullName')} onChange={e => set('fullName', e.target.value)} required error={errors.fullName} />
          <SakinahSelect label="Gender" value={v('gender')} onChange={e => set('gender', e.target.value)} required error={errors.gender} options={[{value:'male',label:'Male'},{value:'female',label:'Female'}]} placeholder="Select gender" />
          <SakinahInput label="Date of Birth" type="date" value={v('dob')} onChange={e => set('dob', e.target.value)} required error={errors.dob} />
          <div className="flex gap-4">
            <SakinahInput label="Height (cm)" type="number" className="flex-1" value={v('height')} onChange={e => set('height', e.target.value)} required error={errors.height} />
            <SakinahInput label="Weight (kg)" type="number" className="flex-1" value={v('weight')} onChange={e => set('weight', e.target.value)} />
          </div>
          <SakinahSelect label="Marital Status" value={v('maritalStatus')} onChange={e => set('maritalStatus', e.target.value)} required error={errors.maritalStatus} options={[{value:'never_married',label:'Never Married'},{value:'divorced',label:'Divorced'},{value:'widowed',label:'Widowed'},{value:'annulled',label:'Annulled'}]} placeholder="Select" />
          <SakinahInput label="Mother Tongue" value={v('motherTongue')} onChange={e => set('motherTongue', e.target.value)} placeholder="e.g. Urdu, Tamil, Hindi" />
          <SakinahInput label="Nationality" value={v('nationality')} onChange={e => set('nationality', e.target.value)} placeholder="e.g. Indian, British" />
        </div>
      );
      case 2: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Location</h3>
          <SakinahInput label="Country" value={v('country')} onChange={e => set('country', e.target.value)} required error={errors.country} />
          <SakinahInput label="State / Province" value={v('state')} onChange={e => set('state', e.target.value)} required error={errors.state} />
          <SakinahInput label="District" value={v('district')} onChange={e => set('district', e.target.value)} />
          <SakinahInput label="City" value={v('city')} onChange={e => set('city', e.target.value)} required error={errors.city} />
          <SakinahInput label="Postal Code" value={v('postalCode')} onChange={e => set('postalCode', e.target.value)} />
        </div>
      );
      case 3: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Religious Details</h3>
          <SakinahSelect label="Religion" value={v('religion')} onChange={e => set('religion', e.target.value)} required error={errors.religion} options={[{value:'islam',label:'Islam'}]} placeholder="Select" />
          <SakinahInput label="Sect / Maslak" value={v('sect')} onChange={e => set('sect', e.target.value)} placeholder="e.g. Sunni, Shia" />
          <SakinahSelect label="Madhab" value={v('madhab')} onChange={e => set('madhab', e.target.value)} options={[{value:'hanafi',label:'Hanafi'},{value:'shafi',label:"Shafi'i"},{value:'maliki',label:'Maliki'},{value:'hanbali',label:'Hanbali'},{value:'other',label:'Other'}]} placeholder="Select" />
          <SakinahSelect label="Prayer Status" value={v('prayerStatus')} onChange={e => set('prayerStatus', e.target.value)} options={[{value:'5_daily',label:'All 5 daily prayers'},{value:'most',label:'Most prayers'},{value:'sometimes',label:'Sometimes'},{value:'rarely',label:'Rarely'},{value:'working_on_it',label:'Working on it'}]} placeholder="Select" />
          <SakinahSelect label="Quran Reading" value={v('quranReading')} onChange={e => set('quranReading', e.target.value)} options={[{value:'daily',label:'Daily'},{value:'weekly',label:'Weekly'},{value:'occasionally',label:'Occasionally'},{value:'rarely',label:'Rarely'}]} placeholder="Select" />
          <SakinahSelect label="Hijab / Beard" value={v('hijabBeard')} onChange={e => set('hijabBeard', e.target.value)} options={[{value:'yes',label:'Yes'},{value:'no',label:'No'},{value:'planning',label:'Planning to'}]} placeholder="Select" />
          <SakinahInput label="Islamic Education" value={v('islamicEducation')} onChange={e => set('islamicEducation', e.target.value)} placeholder="e.g. Hifz, Alimiyyah" />
          <SakinahSelect label="Religious Lifestyle" value={v('religiousLifestyle')} onChange={e => set('religiousLifestyle', e.target.value)} options={[{value:'very_practicing',label:'Very Practicing'},{value:'practicing',label:'Practicing'},{value:'moderate',label:'Moderate'},{value:'learning',label:'Learning & Growing'}]} placeholder="Select" />
        </div>
      );
      case 4: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Education</h3>
          <SakinahSelect label="Highest Qualification" value={v('qualification')} onChange={e => set('qualification', e.target.value)} options={[{value:'high_school',label:'High School'},{value:'diploma',label:'Diploma'},{value:'bachelors',label:'Bachelor\'s'},{value:'masters',label:'Master\'s'},{value:'phd',label:'PhD'},{value:'other',label:'Other'}]} placeholder="Select" />
          <SakinahInput label="Degree" value={v('degree')} onChange={e => set('degree', e.target.value)} placeholder="e.g. B.Tech, MBBS" />
          <SakinahInput label="College / Institution" value={v('college')} onChange={e => set('college', e.target.value)} />
          <SakinahInput label="Field of Study" value={v('fieldOfStudy')} onChange={e => set('fieldOfStudy', e.target.value)} placeholder="e.g. Computer Science" />
        </div>
      );
      case 5: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Career</h3>
          <SakinahInput label="Occupation" value={v('occupation')} onChange={e => set('occupation', e.target.value)} placeholder="e.g. Software Engineer" />
          <SakinahInput label="Company" value={v('company')} onChange={e => set('company', e.target.value)} />
          <SakinahSelect label="Employment Type" value={v('employmentType')} onChange={e => set('employmentType', e.target.value)} options={[{value:'employed',label:'Employed'},{value:'self_employed',label:'Self-Employed'},{value:'business',label:'Business Owner'},{value:'student',label:'Student'},{value:'not_working',label:'Not Working'}]} placeholder="Select" />
          <SakinahInput label="Annual Income" value={v('annualIncome')} onChange={e => set('annualIncome', e.target.value)} placeholder="e.g. 5-10 LPA" />
          <SakinahInput label="Work Location" value={v('workLocation')} onChange={e => set('workLocation', e.target.value)} />
        </div>
      );
      case 6: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Family Details</h3>
          <SakinahInput label="Father's Occupation" value={v('fatherOccupation')} onChange={e => set('fatherOccupation', e.target.value)} />
          <SakinahInput label="Mother's Occupation" value={v('motherOccupation')} onChange={e => set('motherOccupation', e.target.value)} />
          <SakinahSelect label="Family Type" value={v('familyType')} onChange={e => set('familyType', e.target.value)} options={[{value:'nuclear',label:'Nuclear'},{value:'joint',label:'Joint'},{value:'extended',label:'Extended'}]} placeholder="Select" />
          <SakinahSelect label="Family Values" value={v('familyValues')} onChange={e => set('familyValues', e.target.value)} options={[{value:'conservative',label:'Conservative'},{value:'moderate',label:'Moderate'},{value:'liberal',label:'Liberal'}]} placeholder="Select" />
          <div className="flex gap-4">
            <SakinahInput label="Brothers" type="number" className="flex-1" value={v('brothers')} onChange={e => set('brothers', e.target.value)} />
            <SakinahInput label="Sisters" type="number" className="flex-1" value={v('sisters')} onChange={e => set('sisters', e.target.value)} />
          </div>
        </div>
      );
      case 7: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Lifestyle</h3>
          <SakinahSelect label="Food Preference" value={v('foodPreference')} onChange={e => set('foodPreference', e.target.value)} options={[{value:'halal_only',label:'Halal Only'},{value:'vegetarian',label:'Vegetarian'},{value:'non_vegetarian',label:'Non-Vegetarian'},{value:'vegan',label:'Vegan'}]} placeholder="Select" />
          <SakinahSelect label="Smoking" value={v('smoking')} onChange={e => set('smoking', e.target.value)} options={[{value:'never',label:'Never'},{value:'occasionally',label:'Occasionally'},{value:'regularly',label:'Regularly'},{value:'quit',label:'Quit'}]} placeholder="Select" />
          <SakinahSelect label="Drinking" value={v('drinking')} onChange={e => set('drinking', e.target.value)} options={[{value:'never',label:'Never'},{value:'occasionally',label:'Occasionally'}]} placeholder="Select" />
          <SakinahInput label="Hobbies" value={v('hobbies')} onChange={e => set('hobbies', e.target.value)} placeholder="e.g. Reading, Calligraphy, Hiking" />
          <SakinahInput label="Languages Spoken" value={v('languages')} onChange={e => set('languages', e.target.value)} placeholder="e.g. English, Urdu, Arabic" />
          <SakinahInput label="Interests" value={v('interests')} onChange={e => set('interests', e.target.value)} placeholder="e.g. Islamic Studies, Technology" />
        </div>
      );
      case 8: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">About Yourself</h3>
          <SakinahTextarea label="Bio" value={v('bio')} onChange={e => set('bio', e.target.value)} required error={errors.bio} rows={4} placeholder="Tell us about your personality, values, and what makes you who you are..." />
          <SakinahTextarea label="Personality" value={v('personality')} onChange={e => set('personality', e.target.value)} rows={3} placeholder="How would your friends describe you?" />
          <SakinahTextarea label="Goals & Aspirations" value={v('goals')} onChange={e => set('goals', e.target.value)} rows={3} placeholder="Where do you see yourself in 5 years?" />
          <SakinahTextarea label="Expectations from Marriage" value={v('expectations')} onChange={e => set('expectations', e.target.value)} rows={3} placeholder="What does a happy marriage look like to you?" />
        </div>
      );
      case 9: return (
        <div className="flex flex-col gap-4 items-center text-center py-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Upload Photos</h3>
          <p className="text-[13px] text-[var(--sk-ink-dim)] mb-4 max-w-[340px]">
            Photos are blurred by default and only revealed with your explicit permission. Upload a clear, recent photo.
          </p>
          {/* Profile Photo */}
          <div className="w-[120px] h-[120px] rounded-full bg-[rgba(255,255,255,0.03)] border-2 border-dashed border-[var(--sk-line)] flex items-center justify-center cursor-pointer hover:border-[var(--sk-gold)] transition-colors group">
            <div className="text-center">
              <span className="text-[28px] text-[var(--sk-ink-faint)] group-hover:text-[var(--sk-gold)] transition-colors">+</span>
              <div className="text-[9px] text-[var(--sk-ink-faint)] mt-1">Profile Photo</div>
            </div>
          </div>
          {/* Additional */}
          <div className="flex gap-3 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-[72px] h-[72px] rounded-xl bg-[rgba(255,255,255,0.03)] border border-dashed border-[var(--sk-line-soft)] flex items-center justify-center cursor-pointer hover:border-[var(--sk-gold)] transition-colors">
                <span className="text-[18px] text-[var(--sk-ink-faint)]">+</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[var(--sk-ink-faint)] mt-2">You can add up to 4 photos. This step is optional.</p>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="sk-viewport">
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[520px]">
          <SakinahHeader
            title="Create Profile"
            subtitle={`Step 4 of 6 · ${STEPS[step - 1]} (${step}/${STEPS.length})`}
            onBack={prev}
          />

          {/* Progress */}
          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[4px] rounded-full mb-2 overflow-hidden">
            <div className="h-full bg-[var(--sk-gold)] transition-all duration-500" style={{ width: `${48 + (step / STEPS.length) * 17}%` }} />
          </div>

          {/* Step indicator pills */}
          <div className="flex gap-[3px] mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-[3px] rounded-full transition-colors ${i + 1 <= step ? 'bg-[var(--sk-gold)]' : 'bg-[rgba(255,255,255,0.06)]'}`}
              />
            ))}
          </div>

          {/* Form */}
          <div className="bg-[rgba(255,255,255,0.01)] border border-[var(--sk-line-soft)] rounded-[20px] p-5 mb-6 sk-fx sk-d1">
            {renderStep()}
          </div>

          {/* Actions */}
          <div className="flex gap-3 sk-fx sk-d2">
            <SakinahButton variant="ghost" onClick={prev} className="flex-1">
              Back
            </SakinahButton>
            <SakinahButton variant="primary" onClick={next} className="flex-1">
              {step === STEPS.length ? 'Continue to Preferences →' : 'Save & Continue →'}
            </SakinahButton>
          </div>
        </div>
      </div>
    </div>
  );
};
