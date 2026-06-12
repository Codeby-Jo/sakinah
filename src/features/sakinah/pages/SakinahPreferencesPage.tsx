import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SakinahJourneyFrame, 
  SakinahHeader,
  SakinahButton,
  SakinahInput,
  SakinahSelect
} from '../components';

const PreferenceRow = ({ label, options, onValueChange, onPriorityChange }: any) => (
  <div className="bg-[rgba(212,168,83,0.02)] border border-[rgba(212,168,83,0.15)] rounded-[13px] p-[16px] flex flex-col gap-3">
    <label className="block font-serif text-[16px] text-[var(--sk-gold)]">{label}</label>
    <div className="flex gap-3">
      <div className="flex-1">
        {options ? (
          <SakinahSelect onChange={onValueChange} options={options} />
        ) : (
          <SakinahInput onChange={onValueChange} placeholder="Enter preference" />
        )}
      </div>
      <div className="w-[120px]">
        <SakinahSelect 
          onChange={onPriorityChange} 
          options={[
            {value: 'flexible', label: 'Flexible'},
            {value: 'preferred', label: 'Preferred'},
            {value: 'required', label: 'Required'}
          ]} 
        />
      </div>
    </div>
  </div>
);

export const SakinahPreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      navigate('/sakinah/dashboard'); // Custom dashboard
    }, 1000);
  };

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="Partner Preferences" 
        subtitle="What matters most to you" 
        onBack={() => navigate('/sakinah/profile-creation')} 
      />

      <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-[24px] text-center sk-fx sk-d1">
        Define the qualities that are essential for your marriage. You can mark each as Required, Preferred, or Flexible.
      </p>

      <form className="flex flex-col gap-[16px] sk-fx sk-d2 pb-8" onSubmit={handleSubmit}>
        
        <div className="bg-[rgba(212,168,83,0.02)] border border-[rgba(212,168,83,0.15)] rounded-[13px] p-[16px] flex flex-col gap-3">
          <label className="block font-serif text-[16px] text-[var(--sk-gold)]">Age Range</label>
          <div className="flex gap-3">
            <SakinahInput type="number" placeholder="Min Age" className="flex-1" />
            <SakinahInput type="number" placeholder="Max Age" className="flex-1" />
            <div className="w-[120px]">
              <SakinahSelect options={[{value: 'required', label: 'Required'}, {value: 'preferred', label: 'Preferred'}, {value: 'flexible', label: 'Flexible'}]} />
            </div>
          </div>
        </div>

        <PreferenceRow label="Height Preference (cm)" />
        <PreferenceRow label="Marital Status" options={[{value:'never_married',label:'Never Married'}, {value:'divorced',label:'Divorced'}, {value:'widowed',label:'Widowed'}, {value:'any',label:'Any'}]} />
        <PreferenceRow label="Education Level" options={[{value:'bachelors',label:'Bachelors'}, {value:'masters',label:'Masters'}, {value:'phd',label:'PhD'}, {value:'any',label:'Any'}]} />
        <PreferenceRow label="Profession" />
        <PreferenceRow label="Income Level" />
        <PreferenceRow label="Country" />
        <PreferenceRow label="State/Province" />
        <PreferenceRow label="City" />
        <PreferenceRow label="Language" />
        <PreferenceRow label="Religious Practice" options={[{value:'practicing',label:'Practicing'}, {value:'moderate',label:'Moderate'}, {value:'flexible',label:'Flexible'}]} />
        <PreferenceRow label="Family Values" options={[{value:'conservative',label:'Conservative'}, {value:'moderate',label:'Moderate'}, {value:'liberal',label:'Liberal'}]} />
        <PreferenceRow label="Lifestyle Preferences" />

        <div className="sk-fx sk-d3 mt-6">
          <SakinahButton 
            type="submit" 
            variant="primary"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Complete Profile →'}
          </SakinahButton>
        </div>
      </form>
    </SakinahJourneyFrame>
  );
};
