import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import { 
  SakinahInput, SakinahSelect, SakinahTextarea, SakinahButton, SakinahHeader,
  SakinahDatePicker, SakinahSearchableSelect, SakinahMultiSelect, 
  SakinahLocationCascade, SakinahFileUpload 
} from '../components';

const STEPS = [
  'Candidate Basic Details', 'Religious Details', 'Education', 'Career',
  'Family Details', 'Lifestyle', 'Photos', 'Partner Preferences',
  'Additional Preferences', 'Review & Submit',
];

const SECT_OPTIONS = ['Sunni', 'Shafi\'i', 'Hanafi', 'Maliki', 'Hanbali', 'Salafi', 'Ahle Hadith', 'Ja\'fari'].map(v => ({value:v,label:v}));
const ISLAMIC_EDU_OPTIONS = ['None', 'Basic Islamic Education', 'Madrasa Education', 'Hafiz', 'Alim', 'Mufti', 'Islamic Studies Graduate'].map(v => ({value:v,label:v}));
const OCCUPATION_OPTIONS = ['Student', 'Software Engineer', 'Doctor', 'Teacher', 'Business', 'Government Employee', 'Lawyer', 'Accountant', 'Entrepreneur', 'Freelancer', 'Homemaker'].map(v => ({value:v,label:v}));
const LANGUAGE_OPTIONS = ['English', 'Arabic', 'Tamil', 'Malayalam', 'Hindi', 'Urdu', 'Bengali', 'Telugu', 'Kannada', 'French', 'German', 'Other'].map(v => ({value:v,label:v}));
const INTEREST_OPTIONS = ['Reading', 'Traveling', 'Cooking', 'Sports', 'Quran Study', 'Charity', 'Photography', 'Fitness', 'Gardening', 'Business', 'Technology', 'Writing', 'Hiking', 'Volunteering'].map(v => ({value:v,label:v}));

export const SakinahWaliCandidateProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, preferences, updatePreference, isWaliViewOnly, setIsWaliViewOnly } = useOnboarding();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const v = (f: string) => (profile as any)[f] || '';
  const pv = (f: string) => (preferences as any)[f]?.value || '';
  const pp = (f: string) => (preferences as any)[f]?.priority || 'flexible';
  const set = (f: string, val: string | number) => {
    updateProfile(f, val);
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!v('fullName')) e.fullName = 'Required';
      if (!v('gender')) e.gender = 'Required';
      if (!v('dob')) e.dob = 'Required';
      if (!v('motherTongue')) e.motherTongue = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < STEPS.length) { setStep(step + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else handleSubmit();
  };

  const prev = () => {
    if (step > 1) { setStep(step - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else navigate('/wali/verify');
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsWaliViewOnly(true);
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
          <SakinahDatePicker label="Date of Birth" value={v('dob')} onChange={(d, age) => { set('dob', d); set('age', age); }} required error={errors.dob} />
          {v('age') ? <p className="text-[12px] text-[var(--sk-ink-dim)] -mt-2">Calculated Age: <strong className="text-[var(--sk-gold)]">{v('age')} years</strong></p> : null}
          <div className="flex gap-4">
            <SakinahInput label="Height (cm)" type="number" className="flex-1" value={v('height')} onChange={e => set('height', e.target.value)} />
            <SakinahInput label="Weight (kg)" type="number" className="flex-1" value={v('weight')} onChange={e => set('weight', e.target.value)} />
          </div>
          <SakinahSelect label="Marital Status" value={v('maritalStatus')} onChange={e => set('maritalStatus', e.target.value)} options={[{value:'never_married',label:'Never Married'},{value:'divorced',label:'Divorced'},{value:'widowed',label:'Widowed'}]} placeholder="Select" />
          <SakinahSearchableSelect label="Mother Tongue" value={v('motherTongue')} onChange={v => set('motherTongue', v)} options={LANGUAGE_OPTIONS} allowOther required error={errors.motherTongue} />
          <SakinahLocationCascade 
            value={{ country: v('country'), state: v('state'), district: v('district'), city: v('city') }}
            onChange={loc => {
              set('country', loc.country);
              set('state', loc.state);
              set('district', loc.district);
              set('city', loc.city);
            }}
          />
        </div>
      );
      case 2: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Candidate Religious Details</h3>
          <SakinahSelect label="Religion" value={v('religion')} onChange={e => set('religion', e.target.value)} options={[{value:'islam',label:'Islam'}]} placeholder="Select" />
          <SakinahSearchableSelect label="Sect / Madhab" value={v('sect')} onChange={v => set('sect', v)} options={SECT_OPTIONS} allowOther />
          <SakinahSelect label="Prayer Status" value={v('prayerStatus')} onChange={e => set('prayerStatus', e.target.value)} options={[{value:'5_daily',label:'All 5 daily'},{value:'most',label:'Most'},{value:'sometimes',label:'Sometimes'}]} placeholder="Select" />
          <SakinahSearchableSelect label="Islamic Education" value={v('islamicEducation')} onChange={v => set('islamicEducation', v)} options={ISLAMIC_EDU_OPTIONS} allowOther />
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
          <SakinahSearchableSelect label="Occupation" value={v('occupation')} onChange={v => set('occupation', v)} options={OCCUPATION_OPTIONS} allowOther />
          <SakinahInput label="Company" value={v('company')} onChange={e => set('company', e.target.value)} />
          <SakinahInput label="Annual Income" value={v('annualIncome')} onChange={e => set('annualIncome', e.target.value)} />
          <SakinahInput label="Work Location" value={v('workLocation')} onChange={e => set('workLocation', e.target.value)} />
        </div>
      );
      case 5: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Candidate Family</h3>
          <SakinahSearchableSelect label="Father's Occupation" value={v('fatherOccupation')} onChange={v => set('fatherOccupation', v)} options={OCCUPATION_OPTIONS} allowOther />
          <SakinahSearchableSelect label="Mother's Occupation" value={v('motherOccupation')} onChange={v => set('motherOccupation', v)} options={OCCUPATION_OPTIONS} allowOther />
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
          <SakinahMultiSelect label="Languages" value={v('languages')} onChange={v => set('languages', v)} options={LANGUAGE_OPTIONS} placeholder="Select languages..." />
          <SakinahMultiSelect label="Interests" value={v('interests')} onChange={v => set('interests', v)} options={INTEREST_OPTIONS} placeholder="Select interests..." />
        </div>
      );
      case 7: return (
        <div className="flex flex-col gap-4 text-center py-2">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Candidate Photos</h3>
          <p className="text-[12px] text-[var(--sk-ink-dim)] max-w-[320px] mx-auto">Photos are blurred by default. Upload a clear, recent photo of the candidate.</p>
          <div className="w-full text-left">
            <SakinahFileUpload label="Profile Photo" accepts="image" value={v('photo1')} onChange={f => set('photo1', f ? URL.createObjectURL(f) : '')} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2 text-left">
            <SakinahFileUpload label="Photo 2" accepts="image" value={v('photo2')} onChange={f => set('photo2', f ? URL.createObjectURL(f) : '')} />
            <SakinahFileUpload label="Photo 3" accepts="image" value={v('photo3')} onChange={f => set('photo3', f ? URL.createObjectURL(f) : '')} />
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
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-[rgba(127,176,122,0.08)] border border-[rgba(127,176,122,0.2)] text-center"
            >
              <div className="text-[14px] text-[var(--sk-green)] flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[var(--sk-green)] border-t-transparent rounded-full animate-spin" />
                Generating Candidate ID...
              </div>
            </motion.div>
          )}
        </div>
      );
      default: return null;
    }
  };

  if (isWaliViewOnly) {
    return (
      <div className="sk-viewport flex items-center justify-center min-h-screen bg-[#0A0E16]">
        <div className="text-center p-8 bg-[rgba(201,138,138,0.05)] border border-[rgba(201,138,138,0.2)] rounded-[20px] max-w-[400px]">
          <div className="text-[40px] mb-4">🚫</div>
          <h2 className="font-serif text-[24px] text-[var(--sk-rose)] mb-2">Permission Denied</h2>
          <p className="text-[14px] text-[var(--sk-ink-dim)] leading-relaxed">
            Wali accounts have read-only access. You cannot edit the candidate's profile or preferences.
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
      <div className="min-h-screen flex items-start justify-center px-6 py-12 bg-gradient-to-b from-[#0A0E16] to-[#0d121c]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[560px]"
        >
          <SakinahHeader
            title="Candidate Profile"
            subtitle={`Step ${step} of ${STEPS.length} · ${STEPS[step - 1]}`}
            onBack={prev}
          />

          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[4px] rounded-full mb-2 overflow-hidden">
            <motion.div 
              className="h-full bg-[var(--sk-gold)]" 
              initial={{ width: 0 }}
              animate={{ width: `${16 + (step / STEPS.length) * 84}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
          <div className="flex gap-[3px] mb-8">
            {STEPS.map((_, i) => (
              <div key={i} className={`flex-1 h-[3px] rounded-full transition-colors duration-300 ${i + 1 <= step ? 'bg-[var(--sk-gold)]' : 'bg-[rgba(255,255,255,0.06)]'}`} />
            ))}
          </div>

          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] shadow-2xl rounded-[20px] p-6 mb-8 relative overflow-hidden backdrop-blur-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <SakinahButton variant="ghost" onClick={prev} className="flex-1 hover:bg-[rgba(255,255,255,0.05)]">Back</SakinahButton>
            <SakinahButton variant="primary" onClick={next} disabled={isSubmitting} className="flex-1 shadow-[0_0_20px_rgba(212,168,83,0.3)] hover:shadow-[0_0_30px_rgba(212,168,83,0.5)] transition-shadow">
              {step === STEPS.length ? (isSubmitting ? 'Submitting...' : 'Submit Profile ✓') : 'Save & Continue →'}
            </SakinahButton>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
