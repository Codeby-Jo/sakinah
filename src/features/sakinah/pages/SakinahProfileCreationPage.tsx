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
  'Basic Details', 'Location', 'Religious Details', 'Education',
  'Career', 'Family Details', 'Lifestyle', 'About Yourself', 'Photos',
];

const SECT_OPTIONS = ['Sunni', 'Shafi\'i', 'Hanafi', 'Maliki', 'Hanbali', 'Salafi', 'Ahle Hadith', 'Ja\'fari'].map(v => ({value:v,label:v}));
const ISLAMIC_EDU_OPTIONS = ['None', 'Basic Islamic Education', 'Madrasa Education', 'Hafiz', 'Alim', 'Mufti', 'Islamic Studies Graduate'].map(v => ({value:v,label:v}));
const OCCUPATION_OPTIONS = ['Student', 'Software Engineer', 'Doctor', 'Teacher', 'Business', 'Government Employee', 'Lawyer', 'Accountant', 'Entrepreneur', 'Freelancer', 'Homemaker'].map(v => ({value:v,label:v}));
const LANGUAGE_OPTIONS = ['English', 'Arabic', 'Tamil', 'Malayalam', 'Hindi', 'Urdu', 'Bengali', 'Telugu', 'Kannada', 'French', 'German', 'Other'].map(v => ({value:v,label:v}));
const INTEREST_OPTIONS = ['Reading', 'Traveling', 'Cooking', 'Sports', 'Quran Study', 'Charity', 'Photography', 'Fitness', 'Gardening', 'Business', 'Technology', 'Writing', 'Hiking', 'Volunteering'].map(v => ({value:v,label:v}));

export const SakinahProfileCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, profileStep, setProfileStep, isWaliViewOnly } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const step = profileStep;

  if (isWaliViewOnly) {
    return (
      <div className="sk-viewport flex items-center justify-center min-h-screen bg-[#0A0E16]">
        <div className="text-center p-8 bg-[rgba(201,138,138,0.05)] border border-[rgba(201,138,138,0.2)] rounded-[20px] max-w-[400px]">
          <div className="text-[40px] mb-4">🚫</div>
          <h2 className="font-serif text-[24px] text-[var(--sk-rose)] mb-2">Permission Denied</h2>
          <p className="text-[14px] text-[var(--sk-ink-dim)] leading-relaxed">
            Wali accounts have read-only access. You cannot edit the candidate's profile.
          </p>
          <SakinahButton variant="secondary" onClick={() => navigate('/wali/dashboard')} className="mt-6">
            Return to Dashboard
          </SakinahButton>
        </div>
      </div>
    );
  }

  const v = (field: string) => (profile as any)[field] || '';
  const set = (field: string, val: string | number) => {
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
      if (!v('motherTongue')) e.motherTongue = 'Required';
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/preferences');
    }
  };

  const prev = () => {
    if (step > 1) { 
      setProfileStep(step - 1); 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
    else navigate('/kyc');
  };

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Basic Details</h3>
          <SakinahInput label="Full Name" value={v('fullName')} onChange={e => set('fullName', e.target.value)} required error={errors.fullName} />
          <SakinahSelect label="Gender" value={v('gender')} onChange={e => set('gender', e.target.value)} required error={errors.gender} options={[{value:'male',label:'Male'},{value:'female',label:'Female'}]} placeholder="Select gender" />
          <SakinahDatePicker 
            label="Date of Birth" 
            value={v('dob')} 
            onChange={(d, age) => { set('dob', d); set('age', age); }} 
            required error={errors.dob} 
          />
          {v('age') ? <p className="text-[12px] text-[var(--sk-ink-dim)] -mt-2">Calculated Age: <strong className="text-[var(--sk-gold)]">{v('age')} years</strong></p> : null}
          <div className="flex gap-4">
            <SakinahInput label="Height (cm)" type="number" className="flex-1" value={v('height')} onChange={e => set('height', e.target.value)} required error={errors.height} />
            <SakinahInput label="Weight (kg)" type="number" className="flex-1" value={v('weight')} onChange={e => set('weight', e.target.value)} />
          </div>
          <SakinahSelect label="Marital Status" value={v('maritalStatus')} onChange={e => set('maritalStatus', e.target.value)} required error={errors.maritalStatus} options={[{value:'never_married',label:'Never Married'},{value:'divorced',label:'Divorced'},{value:'widowed',label:'Widowed'},{value:'annulled',label:'Annulled'}]} placeholder="Select" />
          <SakinahSearchableSelect label="Mother Tongue" value={v('motherTongue')} onChange={v => set('motherTongue', v)} options={['English', 'Urdu', 'Arabic', 'Tamil', 'Hindi', 'Bengali', 'Malayalam', 'Gujarati', 'Punjabi', 'Somali', 'Turkish', 'French', 'Other']} allowOther required error={errors.motherTongue} />
          <SakinahInput label="Nationality" value={v('nationality')} onChange={e => set('nationality', e.target.value)} placeholder="e.g. Indian, British" />
        </div>
      );
      case 2: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Location</h3>
          <SakinahLocationCascade 
            value={{ country: v('country'), state: v('state'), district: v('district'), city: v('city') }}
            onChange={loc => {
              set('country', loc.country);
              set('state', loc.state);
              set('district', loc.district);
              set('city', loc.city);
            }}
            errors={{ country: errors.country, state: errors.state, city: errors.city }}
          />
          <SakinahInput label="Postal Code" value={v('postalCode')} onChange={e => set('postalCode', e.target.value)} />
        </div>
      );
      case 3: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Religious Details</h3>
          <SakinahSelect label="Religion" value={v('religion')} onChange={e => set('religion', e.target.value)} required error={errors.religion} options={[{value:'islam',label:'Islam'}]} placeholder="Select" />
          <SakinahSearchableSelect label="Sect / Madhab" value={v('sect')} onChange={v => set('sect', v)} options={SECT_OPTIONS} allowOther placeholder="Search sect..." />
          <SakinahSelect label="Prayer Status" value={v('prayerStatus')} onChange={e => set('prayerStatus', e.target.value)} options={[{value:'5_daily',label:'All 5 daily prayers'},{value:'most',label:'Most prayers'},{value:'sometimes',label:'Sometimes'},{value:'rarely',label:'Rarely'},{value:'working_on_it',label:'Working on it'}]} placeholder="Select" />
          <SakinahSelect label="Quran Reading" value={v('quranReading')} onChange={e => set('quranReading', e.target.value)} options={[{value:'daily',label:'Daily'},{value:'weekly',label:'Weekly'},{value:'occasionally',label:'Occasionally'},{value:'rarely',label:'Rarely'}]} placeholder="Select" />
          <SakinahSelect label="Hijab / Beard" value={v('hijabBeard')} onChange={e => set('hijabBeard', e.target.value)} options={[{value:'yes',label:'Yes'},{value:'no',label:'No'},{value:'planning',label:'Planning to'}]} placeholder="Select" />
          <SakinahSearchableSelect label="Islamic Education" value={v('islamicEducation')} onChange={v => set('islamicEducation', v)} options={ISLAMIC_EDU_OPTIONS} allowOther />
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
          <SakinahSearchableSelect label="Occupation" value={v('occupation')} onChange={v => set('occupation', v)} options={OCCUPATION_OPTIONS} allowOther />
          <SakinahInput label="Company" value={v('company')} onChange={e => set('company', e.target.value)} />
          <SakinahSelect label="Employment Type" value={v('employmentType')} onChange={e => set('employmentType', e.target.value)} options={[{value:'employed',label:'Employed'},{value:'self_employed',label:'Self-Employed'},{value:'business',label:'Business Owner'},{value:'student',label:'Student'},{value:'not_working',label:'Not Working'}]} placeholder="Select" />
          <SakinahInput label="Annual Income" value={v('annualIncome')} onChange={e => set('annualIncome', e.target.value)} placeholder="e.g. 5-10 LPA" />
          <SakinahInput label="Work Location" value={v('workLocation')} onChange={e => set('workLocation', e.target.value)} />
        </div>
      );
      case 6: return (
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Family Details</h3>
          <SakinahSearchableSelect label="Father's Occupation" value={v('fatherOccupation')} onChange={v => set('fatherOccupation', v)} options={OCCUPATION_OPTIONS} allowOther />
          <SakinahSearchableSelect label="Mother's Occupation" value={v('motherOccupation')} onChange={v => set('motherOccupation', v)} options={OCCUPATION_OPTIONS} allowOther />
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
          <SakinahMultiSelect label="Languages Spoken" value={v('languages')} onChange={v => set('languages', v)} options={LANGUAGE_OPTIONS} placeholder="Select languages..." />
          <SakinahMultiSelect label="Interests & Hobbies" value={v('interests')} onChange={v => set('interests', v)} options={INTEREST_OPTIONS} placeholder="Select interests..." />
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
        <div className="flex flex-col gap-4 text-center py-2">
          <h3 className="font-serif text-[20px] text-[var(--sk-gold)]">Upload Photos</h3>
          <p className="text-[13px] text-[var(--sk-ink-dim)] mb-2 max-w-[400px] mx-auto">
            Photos are blurred by default and only revealed with your explicit permission. Upload a clear, recent photo.
          </p>
          <div className="w-full text-left">
            <SakinahFileUpload 
              label="Profile Photo" 
              accepts="image" 
              value={v('photo1')} 
              onChange={f => set('photo1', f ? URL.createObjectURL(f) : '')} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <SakinahFileUpload label="Photo 2 (Optional)" accepts="image" value={v('photo2')} onChange={f => set('photo2', f ? URL.createObjectURL(f) : '')} />
            <SakinahFileUpload label="Photo 3 (Optional)" accepts="image" value={v('photo3')} onChange={f => set('photo3', f ? URL.createObjectURL(f) : '')} />
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="sk-viewport">
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-b from-[#0A0E16] to-[#0d121c]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[560px]"
        >
          <SakinahHeader
            title="Create Profile"
            subtitle={`Step 4 of 6 · ${STEPS[step - 1]} (${step}/${STEPS.length})`}
            onBack={prev}
          />

          {/* Progress */}
          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[4px] rounded-full mb-2 overflow-hidden">
            <motion.div 
              className="h-full bg-[var(--sk-gold)]" 
              initial={{ width: 0 }}
              animate={{ width: `${48 + (step / STEPS.length) * 17}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>

          {/* Step indicator pills */}
          <div className="flex gap-[3px] mb-8">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-[3px] rounded-full transition-colors duration-300 ${i + 1 <= step ? 'bg-[var(--sk-gold)]' : 'bg-[rgba(255,255,255,0.06)]'}`}
              />
            ))}
          </div>

          {/* Form with Slide Transition */}
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

          {/* Actions */}
          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <SakinahButton variant="ghost" onClick={prev} className="flex-1 hover:bg-[rgba(255,255,255,0.05)]">
              Back
            </SakinahButton>
            <SakinahButton variant="primary" onClick={next} className="flex-1 shadow-[0_0_20px_rgba(212,168,83,0.3)] hover:shadow-[0_0_30px_rgba(212,168,83,0.5)] transition-shadow">
              {step === STEPS.length ? 'Continue to Preferences →' : 'Save & Continue →'}
            </SakinahButton>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
