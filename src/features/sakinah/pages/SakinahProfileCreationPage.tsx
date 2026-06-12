import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SakinahJourneyFrame, 
  SakinahHeader,
  SakinahButton,
  SakinahInput,
  SakinahSelect,
  SakinahTextarea
} from '../components';

const STEPS = [
  'Basic Information',
  'Location',
  'Religious Information',
  'Education',
  'Career',
  'Family Information',
  'Lifestyle',
  'About Yourself',
  'Photos',
  'Verification'
];

export const SakinahProfileCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = () => {
    const newErrors: any = {};
    if (currentStep === 1) {
      if (!formData.fullName) newErrors.fullName = 'Required';
      if (!formData.gender) newErrors.gender = 'Required';
      if (!formData.dob) newErrors.dob = 'Required';
      if (!formData.height) newErrors.height = 'Required';
      if (!formData.maritalStatus) newErrors.maritalStatus = 'Required';
    }
    // Minimal validation for other steps just to enforce flow
    if (currentStep === 2 && !formData.country) newErrors.country = 'Required';
    if (currentStep === 3 && !formData.religion) newErrors.religion = 'Required';
    if (currentStep === 8 && !formData.bio) newErrors.bio = 'Required';
    if (currentStep === 10 && !formData.email) newErrors.email = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep < STEPS.length) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
      } else {
        navigate('/sakinah/preferences');
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    } else {
      navigate('/sakinah/liveness');
    }
  };

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="Profile Creation" 
        subtitle={`Step ${currentStep} of 10 · ${STEPS[currentStep - 1]}`} 
        onBack={prevStep} 
      />

      <div className="w-full bg-[rgba(255,255,255,0.05)] h-[4px] rounded-full mt-2 mb-6 overflow-hidden">
        <div 
          className="h-full bg-[var(--sk-gold)] transition-all duration-300"
          style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="bg-[rgba(255,255,255,0.01)] border border-[var(--sk-line-soft)] rounded-[20px] p-5 sk-fx sk-d1 mb-6">
        {currentStep === 1 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-[20px] text-[var(--sk-gold)] mb-2">Basic Information</h3>
            <SakinahInput label="Full Name" value={formData.fullName || ''} onChange={e => handleChange('fullName', e.target.value)} required error={errors.fullName} />
            <SakinahSelect label="Gender" value={formData.gender || ''} onChange={e => handleChange('gender', e.target.value)} required error={errors.gender} options={[{value:'male',label:'Male'}, {value:'female',label:'Female'}]} />
            <SakinahInput label="Date of Birth" type="date" value={formData.dob || ''} onChange={e => handleChange('dob', e.target.value)} required error={errors.dob} />
            <div className="flex gap-4">
              <SakinahInput label="Height (cm)" type="number" className="flex-1" value={formData.height || ''} onChange={e => handleChange('height', e.target.value)} required error={errors.height} />
              <SakinahInput label="Weight (kg) - Optional" type="number" className="flex-1" value={formData.weight || ''} onChange={e => handleChange('weight', e.target.value)} />
            </div>
            <SakinahSelect label="Marital Status" value={formData.maritalStatus || ''} onChange={e => handleChange('maritalStatus', e.target.value)} required error={errors.maritalStatus} options={[{value:'never_married',label:'Never Married'}, {value:'divorced',label:'Divorced'}, {value:'widowed',label:'Widowed'}]} />
            <SakinahInput label="Mother Tongue" value={formData.motherTongue || ''} onChange={e => handleChange('motherTongue', e.target.value)} />
            <SakinahInput label="Nationality" value={formData.nationality || ''} onChange={e => handleChange('nationality', e.target.value)} />
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-[20px] text-[var(--sk-gold)] mb-2">Location</h3>
            <SakinahInput label="Country" value={formData.country || ''} onChange={e => handleChange('country', e.target.value)} required error={errors.country} />
            <SakinahInput label="State/Province" value={formData.state || ''} onChange={e => handleChange('state', e.target.value)} />
            <SakinahInput label="City" value={formData.city || ''} onChange={e => handleChange('city', e.target.value)} />
            <SakinahInput label="Postal Code" value={formData.postalCode || ''} onChange={e => handleChange('postalCode', e.target.value)} />
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-[20px] text-[var(--sk-gold)] mb-2">Religious Information</h3>
            <SakinahSelect label="Religion" value={formData.religion || ''} onChange={e => handleChange('religion', e.target.value)} required error={errors.religion} options={[{value:'islam',label:'Islam'}]} />
            <SakinahInput label="Sect/Maslak (Optional)" value={formData.sect || ''} onChange={e => handleChange('sect', e.target.value)} />
            <SakinahSelect label="Prayer Status" value={formData.prayer || ''} onChange={e => handleChange('prayer', e.target.value)} options={[{value:'always',label:'Always'}, {value:'sometimes',label:'Sometimes'}, {value:'rarely',label:'Rarely'}]} />
            <SakinahSelect label="Islamic Dress (Hijab/Beard)" value={formData.dress || ''} onChange={e => handleChange('dress', e.target.value)} options={[{value:'yes',label:'Yes'}, {value:'no',label:'No'}, {value:'planning',label:'Planning to'}]} />
            <SakinahSelect label="Quran Reading" value={formData.quran || ''} onChange={e => handleChange('quran', e.target.value)} options={[{value:'daily',label:'Daily'}, {value:'weekly',label:'Weekly'}, {value:'occasionally',label:'Occasionally'}]} />
          </div>
        )}

        {currentStep === 4 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-[20px] text-[var(--sk-gold)] mb-2">Education</h3>
            <SakinahSelect label="Highest Qualification" value={formData.qualification || ''} onChange={e => handleChange('qualification', e.target.value)} options={[{value:'bachelors',label:'Bachelors'}, {value:'masters',label:'Masters'}, {value:'phd',label:'PhD'}, {value:'other',label:'Other'}]} />
            <SakinahInput label="Institution" value={formData.institution || ''} onChange={e => handleChange('institution', e.target.value)} />
            <SakinahInput label="Field of Study" value={formData.fieldOfStudy || ''} onChange={e => handleChange('fieldOfStudy', e.target.value)} />
          </div>
        )}

        {currentStep === 5 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-[20px] text-[var(--sk-gold)] mb-2">Career</h3>
            <SakinahInput label="Occupation" value={formData.occupation || ''} onChange={e => handleChange('occupation', e.target.value)} />
            <SakinahInput label="Company" value={formData.company || ''} onChange={e => handleChange('company', e.target.value)} />
            <SakinahSelect label="Employment Type" value={formData.employmentType || ''} onChange={e => handleChange('employmentType', e.target.value)} options={[{value:'fulltime',label:'Full Time'}, {value:'parttime',label:'Part Time'}, {value:'business',label:'Business Owner'}]} />
            <SakinahInput label="Income Range" value={formData.income || ''} onChange={e => handleChange('income', e.target.value)} />
          </div>
        )}

        {currentStep === 6 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-[20px] text-[var(--sk-gold)] mb-2">Family Information</h3>
            <SakinahInput label="Father's Occupation" value={formData.father || ''} onChange={e => handleChange('father', e.target.value)} />
            <SakinahInput label="Mother's Occupation" value={formData.mother || ''} onChange={e => handleChange('mother', e.target.value)} />
            <SakinahSelect label="Family Type" value={formData.familyType || ''} onChange={e => handleChange('familyType', e.target.value)} options={[{value:'nuclear',label:'Nuclear'}, {value:'joint',label:'Joint'}]} />
            <SakinahInput label="Number of Siblings" type="number" value={formData.siblings || ''} onChange={e => handleChange('siblings', e.target.value)} />
          </div>
        )}

        {currentStep === 7 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-[20px] text-[var(--sk-gold)] mb-2">Lifestyle</h3>
            <SakinahSelect label="Food Preference" value={formData.food || ''} onChange={e => handleChange('food', e.target.value)} options={[{value:'halal_only',label:'Halal Only'}, {value:'vegetarian',label:'Vegetarian'}, {value:'anything',label:'Anything'}]} />
            <SakinahSelect label="Smoking" value={formData.smoking || ''} onChange={e => handleChange('smoking', e.target.value)} options={[{value:'no',label:'No'}, {value:'yes',label:'Yes'}, {value:'occasionally',label:'Occasionally'}]} />
            <SakinahInput label="Hobbies & Interests" value={formData.hobbies || ''} onChange={e => handleChange('hobbies', e.target.value)} />
          </div>
        )}

        {currentStep === 8 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-[20px] text-[var(--sk-gold)] mb-2">About Yourself</h3>
            <SakinahTextarea 
              label="Bio (Tell us about your personality)" 
              value={formData.bio || ''} 
              onChange={e => handleChange('bio', e.target.value)} 
              required 
              error={errors.bio} 
              rows={4}
            />
            <SakinahTextarea 
              label="Goals & Expectations" 
              value={formData.goals || ''} 
              onChange={e => handleChange('goals', e.target.value)} 
              rows={4}
            />
          </div>
        )}

        {currentStep === 9 && (
          <div className="flex flex-col gap-4 text-center py-6">
            <h3 className="font-serif text-[20px] text-[var(--sk-gold)] mb-2">Photos</h3>
            <p className="text-[13px] text-[var(--sk-ink-dim)] mb-4">Upload a clear photo. Don't worry—photos are blurred by default and only revealed when you grant explicit permission.</p>
            <div className="w-[120px] h-[120px] mx-auto rounded-full bg-[rgba(255,255,255,0.05)] border border-[var(--sk-line)] flex items-center justify-center cursor-pointer hover:border-[var(--sk-gold)] transition-colors">
              <span className="text-[30px] text-[var(--sk-ink-faint)]">+</span>
            </div>
            <span className="text-[11px] text-[var(--sk-gold-soft)] mt-2">Upload Profile Photo</span>
          </div>
        )}

        {currentStep === 10 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-[20px] text-[var(--sk-gold)] mb-2">Final Verification</h3>
            <SakinahInput label="Email Address" type="email" value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} required error={errors.email} />
            <SakinahInput label="Phone Number" type="tel" value={formData.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
            <div className="p-4 rounded-xl bg-[rgba(127,176,122,0.1)] border border-[rgba(127,176,122,0.2)] mt-4">
              <div className="flex items-center gap-3">
                <span className="text-[18px] text-[var(--sk-green)]">✓</span>
                <div>
                  <div className="text-[13px] font-medium text-[var(--sk-green)]">Identity Confirmed</div>
                  <div className="text-[11px] text-[var(--sk-ink-dim)] mt-1">Liveness check completed previously.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 sk-fx sk-d2">
        {currentStep > 1 && (
          <button 
            onClick={prevStep}
            className="flex-1 py-3 bg-transparent border border-[var(--sk-line-soft)] hover:border-[var(--sk-gold)] text-[var(--sk-gold)] rounded-xl transition-all font-medium text-[14px]"
          >
            Back
          </button>
        )}
        <SakinahButton variant="primary" onClick={nextStep} className="flex-1">
          {currentStep === STEPS.length ? 'Continue to Preferences →' : 'Save & Continue →'}
        </SakinahButton>
      </div>
    </SakinahJourneyFrame>
  );
};
