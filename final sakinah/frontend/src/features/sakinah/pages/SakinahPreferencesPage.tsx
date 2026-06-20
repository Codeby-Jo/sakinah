import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOnboarding, type PartnerPreferences } from '../context/OnboardingContext';
import { 
  SakinahButton, 
  SakinahOnboardingShell,
  SakinahAnimatedCardGroup,
  SakinahDualSlider,
  SakinahMultiSelectChips,
  SakinahMultiLocationSelect
} from '../components';
import { 
  Heart, 
  UsersThree, 
  Scales, 
  ChatCircleText, 
  Handshake, 
  ShieldCheck, 
  WarningCircle
} from '@phosphor-icons/react';
import { setProgress, getNextRoute } from '../services/sakinahProgress';

const prefSchema = z.object({
  minAge: z.string().min(1, 'Minimum age is required'),
  maxAge: z.string().min(1, 'Maximum age is required'),
  locationPref: z.array(z.string()),
  maritalStatus: z.string().min(1, 'Please select a marital status preference'),
  educationPref: z.array(z.string()),
  religiousPracticePref: z.string().min(1, 'Please select religious alignment'),
  familyInvolvement: z.string().min(1, 'Please select family involvement'),
  dealbreakers: z.array(z.string()),
  communicationStyle: z.string().min(1, 'Please select communication style'),
  repairStyle: z.string().min(1, 'Please select conflict repair style'),
  boundarySafety: z.string().min(1, 'Please select a boundary preference'),
  lifestyleFinances: z.string().min(1, 'Please select a lifestyle preference'),
});

export const SakinahPreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const { preferences, updatePreference } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(prefSchema),
    defaultValues: { 
      ...preferences,
      minAge: preferences.minAge || '22',
      maxAge: preferences.maxAge || '35',
      locationPref: Array.isArray(preferences.locationPref) ? preferences.locationPref : [],
      educationPref: Array.isArray(preferences.educationPref) ? preferences.educationPref : [],
      dealbreakers: Array.isArray(preferences.dealbreakers) ? preferences.dealbreakers : [],
      maritalStatus: preferences.maritalStatus || '',
      religiousPracticePref: preferences.religiousPracticePref || '',
      familyInvolvement: preferences.familyInvolvement || '',
      communicationStyle: preferences.communicationStyle || '',
      repairStyle: preferences.repairStyle || '',
      boundarySafety: preferences.boundarySafety || '',
      lifestyleFinances: preferences.lifestyleFinances || '',
    },
    mode: 'all'
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Just saving everything to context
      Object.entries(data).forEach(([key, value]) => {
        updatePreference(key as keyof PartnerPreferences, value as any);
      });
      
      setShowSuccess(true);
      await new Promise(r => setTimeout(r, 1500));
      setProgress({ preferences_completed: true, review_completed: false });
      navigate(getNextRoute());
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ icon: Icon, title, description }: any) => (
    <div className="mb-6 border-b border-[rgba(212,175,55,0.1)] pb-4">
      <div className="flex items-center gap-3 mb-2">
        <Icon size={24} className="text-[#D4AF37]" weight="fill" />
        <h3 className="text-[#D4AF37] text-xl font-serif">{title}</h3>
      </div>
      <p className="text-white/50 text-[13px]">{description}</p>
    </div>
  );

  const FieldError = ({ error }: { error?: string }) => (
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          className="text-[11px] text-red-400 flex items-center gap-1"
        >
          <WarningCircle size={12} />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );

  return (
    <SakinahOnboardingShell
      step={4}
      title="Match Preferences"
      subtitle="Help us understand exactly what you are looking for in a partner."
    >
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-[#0B1020]/80 border border-[#D4AF37]/50 rounded-3xl backdrop-blur-2xl shadow-[0_0_50px_rgba(212,175,55,0.2)]"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#8C6220] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.5)] mb-6"
            >
              <span className="text-[#050816] text-3xl font-bold">✓</span>
            </motion.div>
            <h2 className="text-2xl font-serif text-[#F5D77A] mb-2">Preferences Saved</h2>
            <p className="text-white/60">Finalizing your profile...</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="w-full max-w-3xl mx-auto bg-[#0B1020]/80 border border-[rgba(212,175,55,0.15)] rounded-3xl p-6 md:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
          >
            <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col gap-10`}>
              
              {/* SECTION: Demographics */}
              <div className="space-y-8">
                <SectionHeader 
                  icon={Heart} 
                  title="Demographics" 
                  description="Define the foundational criteria for your potential matches." 
                />
                
                <div className="bg-[#050816]/50 p-6 rounded-2xl border border-[rgba(212,175,55,0.05)]">
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-4 font-medium tracking-widest">Preferred Age Range</label>
                  <SakinahDualSlider
                    min={18}
                    max={70}
                    minVal={Number(watch('minAge')) || 22}
                    maxVal={Number(watch('maxAge')) || 35}
                    onChange={(min, max) => {
                      setValue('minAge', min.toString(), { shouldValidate: true });
                      setValue('maxAge', max.toString(), { shouldValidate: true });
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Preferred Locations</label>
                  <SakinahMultiLocationSelect
                    value={watch('locationPref') || []}
                    onChange={(v) => setValue('locationPref', v, { shouldValidate: true })}
                    placeholder="Search preferred locations..."
                  />
                  <FieldError error={(errors.locationPref as any)?.message} />
                </div>

                <div>
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Partner's Marital Status</label>
                  <SakinahAnimatedCardGroup
                    columns={2}
                    value={watch('maritalStatus') || ''}
                    onChange={(v) => setValue('maritalStatus', v, { shouldValidate: true })}
                    options={[
                      { value: 'Never Married', label: 'Never Married' },
                      { value: 'Divorced', label: 'Divorced' },
                      { value: 'Widowed', label: 'Widowed' },
                      { value: 'Any', label: 'Open To All' },
                    ]}
                  />
                  <FieldError error={(errors.maritalStatus as any)?.message} />
                </div>

                <div>
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Education / Work Preference</label>
                  <SakinahAnimatedCardGroup
                    columns={2}
                    multi={true}
                    value={watch('educationPref') || []}
                    onChange={(v) => setValue('educationPref', v, { shouldValidate: true })}
                    options={[
                      { value: 'Graduate', label: 'Graduate' },
                      { value: 'Working Professional', label: 'Working Professional' },
                      { value: 'Business', label: 'Business Owner' },
                      { value: 'Student', label: 'Student' },
                    ]}
                  />
                  <FieldError error={(errors.educationPref as any)?.message} />
                </div>
              </div>

              {/* SECTION: Values & Lifestyle */}
              <div className="space-y-8">
                <SectionHeader 
                  icon={Scales} 
                  title="Values & Lifestyle" 
                  description="Align on the core principles that will guide your marriage." 
                />

                <div>
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Religious Alignment</label>
                  <SakinahAnimatedCardGroup
                    columns={2}
                    value={watch('religiousPracticePref') || ''}
                    onChange={(v) => setValue('religiousPracticePref', v, { shouldValidate: true })}
                    options={[
                      { value: 'Required', label: 'Required (Strict Match)', description: 'Must strictly match my practice level' },
                      { value: 'Flexible', label: 'Flexible (Growing Together)', description: 'Open to someone growing in their deen' },
                    ]}
                  />
                  <FieldError error={(errors.religiousPracticePref as any)?.message} />
                </div>

                <div>
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Family / Wali Involvement</label>
                  <SakinahAnimatedCardGroup
                    columns={1}
                    value={watch('familyInvolvement') || ''}
                    onChange={(v) => setValue('familyInvolvement', v, { shouldValidate: true })}
                    options={[
                      { value: 'Standard', label: 'STANDARD', description: 'Wali involved at appropriate stages', icon: <UsersThree /> },
                      { value: 'Early', label: 'EARLY', description: 'Wali involved from the very first conversation', icon: <ShieldCheck /> },
                      { value: 'Later', label: 'LATER', description: 'Wali involved only after mutual agreement', icon: <Handshake /> },
                      { value: 'Family Led', label: 'FAMILY LED', description: 'Families lead the initial conversations', icon: <UsersThree weight="fill" /> },
                    ]}
                  />
                  <FieldError error={(errors.familyInvolvement as any)?.message} />
                </div>

                <div>
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Strict Dealbreakers</label>
                  <SakinahMultiSelectChips
                    options={['Smoking', 'No Prayer', 'Substance Abuse', 'Doesn\'t want kids', 'Different Sect', 'Relocating']}
                    value={watch('dealbreakers') || []}
                    onChange={(v) => setValue('dealbreakers', v, { shouldValidate: true })}
                  />
                  <FieldError error={(errors.dealbreakers as any)?.message} />
                </div>
              </div>

              {/* SECTION: Emotional Intelligence */}
              <div className="space-y-8">
                <SectionHeader 
                  icon={ChatCircleText} 
                  title="Emotional Intelligence" 
                  description="Find someone whose communication style matches your needs." 
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Communication Style</label>
                    <SakinahAnimatedCardGroup
                      columns={1}
                      value={watch('communicationStyle') || ''}
                      onChange={(v) => setValue('communicationStyle', v, { shouldValidate: true })}
                      options={[
                        { value: 'Calm', label: 'Calm', description: 'Thoughtful and reserved' },
                        { value: 'Open', label: 'Open', description: 'Shares feelings easily' },
                        { value: 'Direct', label: 'Direct', description: 'Straight to the point' },
                        { value: 'Expressive', label: 'Expressive', description: 'Highly emotional and articulate' },
                      ]}
                    />
                    <FieldError error={(errors.communicationStyle as any)?.message} />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Conflict Repair</label>
                    <SakinahAnimatedCardGroup
                      columns={1}
                      value={watch('repairStyle') || ''}
                      onChange={(v) => setValue('repairStyle', v, { shouldValidate: true })}
                      options={[
                        { value: 'Talk immediately', label: 'Talk Immediately', description: 'Resolve right away' },
                        { value: 'Needs space first', label: 'Needs Space First', description: 'Cooldown period' },
                        { value: 'Seek counsel', label: 'Seek Counsel', description: 'Involve a mediator' },
                      ]}
                    />
                    <FieldError error={(errors.repairStyle as any)?.message} />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Boundary & Emotional Safety</label>
                  <SakinahAnimatedCardGroup
                    columns={2}
                    value={watch('boundarySafety') || ''}
                    onChange={(v) => setValue('boundarySafety', v, { shouldValidate: true })}
                    options={[
                      { value: 'High Privacy', label: 'High Privacy', description: 'Keeps relationship strictly private' },
                      { value: 'Shared Circles', label: 'Shared Circles', description: 'Open with friends and family' },
                      { value: 'Independent', label: 'Independent', description: 'Maintains separate friendships' },
                      { value: 'Interdependent', label: 'Interdependent', description: 'Everything is shared' },
                    ]}
                  />
                  <FieldError error={(errors.boundarySafety as any)?.message} />
                </div>

                <div>
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Lifestyle & Finances</label>
                  <SakinahAnimatedCardGroup
                    columns={2}
                    value={watch('lifestyleFinances') || ''}
                    onChange={(v) => setValue('lifestyleFinances', v, { shouldValidate: true })}
                    options={[
                      { value: 'Traditional Provider', label: 'Traditional Provider', description: 'Husband provides entirely' },
                      { value: 'Shared Contribution', label: 'Shared Contribution', description: 'Both contribute financially' },
                      { value: 'Simple Living', label: 'Simple Living', description: 'Focus on deen over wealth' },
                      { value: 'Growth Oriented', label: 'Growth Oriented', description: 'Ambitious career goals' },
                    ]}
                  />
                  <FieldError error={(errors.lifestyleFinances as any)?.message} />
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-[rgba(212,175,55,0.1)] flex flex-col gap-2">
                <SakinahButton
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 transition-all font-semibold rounded-2xl text-[16px] bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#050816] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving Preferences...' : 'Complete Preferences'}
                </SakinahButton>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </SakinahOnboardingShell>
  );
};

export default SakinahPreferencesPage;
