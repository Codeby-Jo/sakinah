import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, UploadSimple, WarningCircle, Image as ImageIcon } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOnboarding, type SeekerProfile } from '../context/OnboardingContext';
import { 
  SakinahButton, 
  SakinahOnboardingShell,
  SakinahSelect,
  SakinahAnimatedCardGroup,
  SakinahSegmentedControl,
  SakinahLocationSelect
} from '../components';
import { setProgress, getNextRoute } from '../services/sakinahProgress';

const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'First Name is required'),
  lastName: z.string().trim().min(1, 'Last Name is required'),
  dateOfBirth: z.string().min(1, 'Date of Birth is required'),
  age: z.string()
    .min(1, 'Age is required')
    .refine((val) => Number(val) <= 80, { message: 'Must be 80 or younger' }),
  gender: z.enum(['Male', 'Female'], { message: 'Please select your gender' }),
  location: z.string().trim().min(1, 'Location is required'),
  marital_status: z.enum(['Never Married', 'Divorced', 'Widowed', 'Annulled'], { message: 'Marital status is required' }),
  education_occupation: z.string().trim().min(1, 'Education and Occupation are required'),
  religious_practice_and_islamic_home: z.enum(['Practicing', 'Flexible'], { message: 'Please select your practice level' }),
  marriage_readiness: z.enum(['Ready', 'Not Ready'], { message: 'Please select readiness timeline' }),
  profilePhoto: z.string().optional(),
}).refine((data) => {
  if (data.gender === 'Male' && Number(data.age) < 21) return false;
  if (data.gender === 'Female' && Number(data.age) < 18) return false;
  return true;
}, {
  message: "Not legal age to marry",
  path: ["age"]
});

export const SakinahProfileCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { handleSubmit, watch, setValue, trigger, formState: { errors, isValid } } = useForm<z.infer<typeof profileSchema>>({
    resolver: async (data, context, options) => {
      const result = await zodResolver(profileSchema)(data, context, options);
      const isMaleUnderage = data.gender === 'Male' && Number(data.age) < 21;
      const isFemaleUnderage = data.gender === 'Female' && Number(data.age) < 18;
      
      if (isMaleUnderage || isFemaleUnderage) {
        return {
          values: result.values,
          errors: {
            ...result.errors,
            age: {
              type: 'manual',
              message: isMaleUnderage ? 'Males must be at least 21 years old' : 'Females must be at least 18 years old'
            }
          }
        };
      }
      return result;
    },
    defaultValues: {
      ...(profile as any)
    },
    mode: 'onChange'
  });

  const dateOfBirth = watch('dateOfBirth');
  useEffect(() => {
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let calculatedAge = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        calculatedAge--;
      }
      // Ensure we don't set negative age if future date is selected
      if (calculatedAge < 0) calculatedAge = 0;
      setValue('age', String(calculatedAge), { shouldValidate: true });
    } else {
      setValue('age', '', { shouldValidate: true });
    }
  }, [dateOfBirth, setValue]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Maximum size is 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('profilePhoto', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setLoading(true);
    try {
      Object.entries(data).forEach(([key, value]) => {
        updateProfile(key as keyof SeekerProfile, value);
      });
      
      setShowSuccess(true);
      await new Promise(r => setTimeout(r, 1500));
      setProgress({ profile_completed: true, preferences_completed: false, review_completed: false });
      navigate(getNextRoute());
    } finally {
      setLoading(false);
    }
  };

  const FieldError = ({ error }: { error?: string }) => (
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          className="text-[11px] text-red-400"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );

  return (
    <SakinahOnboardingShell
      step={3}
      title="Profile Basics"
      subtitle="Tell us about yourself so we can find your perfect match."
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
            <h2 className="text-2xl font-serif text-[#F5D77A] mb-2">Profile Basics Complete</h2>
            <p className="text-white/60">Saving your details...</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="w-full max-w-3xl mx-auto bg-[#0B1020]/80 border border-[rgba(212,175,55,0.3)] rounded-3xl p-6 md:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
          >
            <form onSubmit={handleSubmit(onSubmit as any)} className={`flex flex-col gap-8`}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Gender - Moved to Top */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">1. Gender</label>
                  <SakinahSegmentedControl
                    value={watch('gender') || ''}
                    onChange={(v) => {
                      setValue('gender', v as 'Male' | 'Female', { shouldValidate: true });
                      trigger('age');
                    }}
                    options={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' }
                    ]}
                  />
                  <FieldError error={errors.gender?.message} />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">2. Date of Birth</label>
                  <input
                    type="date"
                    {...watch('dateOfBirth') !== undefined ? { value: watch('dateOfBirth') } : {}}
                    onChange={(e) => setValue('dateOfBirth', e.target.value, { shouldValidate: true })}
                    className="w-full bg-[#050816]/40 backdrop-blur-xl border border-[rgba(212,175,55,0.3)] text-white placeholder-white/20 rounded-xl px-4 py-4 text-[15px] outline-none transition-all duration-300 focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20 hover:border-[rgba(212,175,55,0.3)] [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                  />
                  <FieldError error={errors.dateOfBirth?.message} />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Age (Auto-calculated)</label>
                  <input
                    type="text"
                    value={watch('age') || ''}
                    readOnly
                    placeholder="Auto-calculated from DOB"
                    className={`w-full bg-[#050816]/20 backdrop-blur-xl border border-[rgba(212,175,55,0.1)] ${errors.age ? 'text-red-400' : 'text-white/50'} rounded-xl px-4 py-4 text-[15px] outline-none cursor-not-allowed`}
                  />
                  <FieldError error={errors.age?.message} />
                </div>

              </div>

              {watch('gender') && watch('age') && ((watch('gender') === 'Male' && Number(watch('age')) < 21) || (watch('gender') === 'Female' && Number(watch('age')) < 18)) ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center mt-8">
                  <h4 className="text-red-400 font-bold mb-2">Age Requirement Not Met</h4>
                  <p className="text-red-400/80 text-[14px]">
                    You must be at least {watch('gender') === 'Male' ? '21' : '18'} years old to register. You cannot proceed further.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-[#D4AF37]/10">
                
                {/* Profile Photo */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Profile Photo</label>
                  
                  <div className="p-4 mb-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl flex items-start gap-3">
                    <WarningCircle size={20} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <p className="text-[#F5D77A] text-[12px] italic opacity-90 leading-relaxed">
                      "Please ensure your photo is decent, modest, and presented in a halal manner."
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-28 h-28 rounded-full border-2 border-dashed border-[#D4AF37]/40 bg-[#050816]/40 flex items-center justify-center overflow-hidden relative group">
                      {watch('profilePhoto') ? (
                        <>
                          <img src={watch('profilePhoto')} alt="Profile" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
                            <Camera size={24} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[#D4AF37]/50 cursor-pointer w-full h-full hover:bg-[#D4AF37]/10 transition-colors" onClick={() => document.getElementById('photo-upload')?.click()}>
                          <ImageIcon size={32} weight="duotone" />
                          <span className="text-[10px] mt-1 font-medium uppercase tracking-wider">Upload</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <input 
                        type="file" 
                        id="photo-upload" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handlePhotoUpload}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        className="w-full sm:w-auto py-2.5 px-5 text-[13px] border border-[#D4AF37]/40 text-[#D4AF37] font-semibold rounded-xl hover:bg-[#D4AF37]/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <UploadSimple size={16} />
                        Choose Photo
                      </button>
                      <p className="text-white/40 text-[11px] mt-2 text-center sm:text-left">Maximum file size: 5MB. Supported formats: JPG, PNG.</p>
                    </div>
                  </div>
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">First Name</label>
                  <input
                    type="text"
                    {...watch('firstName') !== undefined ? { value: watch('firstName') } : {}}
                    onChange={(e) => setValue('firstName', e.target.value, { shouldValidate: true })}
                    placeholder="First Name"
                    className="w-full bg-[#050816]/40 backdrop-blur-xl border border-[rgba(212,175,55,0.3)] text-white placeholder-white/20 rounded-xl px-4 py-4 text-[15px] outline-none transition-all duration-300 focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20 hover:border-[rgba(212,175,55,0.3)]"
                  />
                  <FieldError error={errors.firstName?.message} />
                </div>
                
                {/* Last Name */}
                <div>
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Last Name</label>
                  <input
                    type="text"
                    {...watch('lastName') !== undefined ? { value: watch('lastName') } : {}}
                    onChange={(e) => setValue('lastName', e.target.value, { shouldValidate: true })}
                    placeholder="Last Name"
                    className="w-full bg-[#050816]/40 backdrop-blur-xl border border-[rgba(212,175,55,0.3)] text-white placeholder-white/20 rounded-xl px-4 py-4 text-[15px] outline-none transition-all duration-300 focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20 hover:border-[rgba(212,175,55,0.3)]"
                  />
                  <FieldError error={errors.lastName?.message} />
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Location</label>
                  <SakinahLocationSelect 
                    value={watch('location') || ''}
                    onChange={(v) => setValue('location', v, { shouldValidate: true })}
                    error={!!errors.location?.message}
                  />
                  <FieldError error={errors.location?.message} />
                </div>

                {/* Marital Status */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Marital Status</label>
                  <SakinahAnimatedCardGroup
                    columns={2}
                    value={watch('marital_status') || ''}
                    onChange={(v) => setValue('marital_status', v as 'Never Married' | 'Divorced' | 'Widowed' | 'Annulled', { shouldValidate: true })}
                    options={[
                      { value: 'Never Married', label: 'Never Married', description: 'Seeking first marriage' },
                      { value: 'Divorced', label: 'Divorced', description: 'Previously married' },
                      { value: 'Widowed', label: 'Widowed', description: 'Spouse passed away' },
                      { value: 'Annulled', label: 'Annulled', description: 'Marriage annulled' },
                    ]}
                  />
                  <FieldError error={errors.marital_status?.message} />
                </div>

                {/* Education & Occupation */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Current Status (Education & Occupation)</label>
                  <SakinahAnimatedCardGroup
                    columns={2}
                    value={watch('education_occupation') || ''}
                    onChange={(v) => setValue('education_occupation', v, { shouldValidate: true })}
                    options={[
                      { value: 'Student', label: 'Student', description: 'Currently studying full-time' },
                      { value: 'Graduate Working', label: 'Graduate Working', description: 'Employed professional' },
                      { value: 'Business', label: 'Business Owner', description: 'Entrepreneur or self-employed' },
                      { value: 'Not Specified', label: 'Other / Prefer not to say', description: 'Will discuss later' },
                    ]}
                  />
                  <FieldError error={errors.education_occupation?.message} />
                </div>

                {/* Religious Practice */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Religious Practice Level</label>
                  <SakinahSegmentedControl
                    value={watch('religious_practice_and_islamic_home') || ''}
                    onChange={(v) => setValue('religious_practice_and_islamic_home', v as 'Practicing' | 'Flexible', { shouldValidate: true })}
                    options={[
                      { value: 'Practicing', label: 'Practicing' },
                      { value: 'Flexible', label: 'Flexible' },
                    ]}
                  />
                  <FieldError error={errors.religious_practice_and_islamic_home?.message} />
                </div>

                {/* Marriage Readiness */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] text-[#F5D77A]/60 uppercase mb-3 font-medium tracking-widest">Marriage Readiness</label>
                  <SakinahAnimatedCardGroup
                    columns={2}
                    value={watch('marriage_readiness') || ''}
                    onChange={(v) => setValue('marriage_readiness', v as 'Ready' | 'Not Ready', { shouldValidate: true })}
                    options={[
                      { value: 'Ready', label: 'Ready', description: 'Looking to marry soon' },
                      { value: 'Not Ready', label: 'Not Ready', description: 'Not looking to marry yet' },
                    ]}
                  />
                  <FieldError error={errors.marriage_readiness?.message} />
                </div>

              </div>
              )}

              {!(watch('gender') && watch('age') && ((watch('gender') === 'Male' && Number(watch('age')) < 21) || (watch('gender') === 'Female' && Number(watch('age')) < 18))) && (
              <div className="mt-6 pt-6 border-t border-[rgba(212,175,55,0.1)] flex flex-col gap-2">
                {!isValid && (
                  <p className="text-center text-[#F5D77A]/50 text-[11px] uppercase tracking-wider font-medium mb-1">
                    Please complete all fields to continue.
                  </p>
                )}
                <SakinahButton
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 transition-all font-semibold rounded-2xl text-[16px] bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#050816] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving Details...' : 'Complete Profile Basics'}
                </SakinahButton>
              </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </SakinahOnboardingShell>
  );
};
export default SakinahProfileCreationPage;
