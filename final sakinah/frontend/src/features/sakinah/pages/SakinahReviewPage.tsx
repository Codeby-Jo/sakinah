import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, WarningCircle, PencilSimple, ShieldCheck, User, Heart, IdentificationCard, EnvelopeSimple, Phone, Camera, X } from '@phosphor-icons/react';
import { auth as firebaseAuth } from '@/config/firebase.config';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahButton, SakinahOnboardingShell } from '../components';
import { setProgress, getNextRoute, getProgress } from '../services/sakinahProgress';

import { onAuthStateChanged } from 'firebase/auth';

export const SakinahReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { auth: contextAuth, kyc, profile, preferences, setOnboardingComplete, updateProfile } = useOnboarding();
  const isWali = getProgress().role === 'LOOKING_FOR_SOMEONE_ELSE' || getProgress().role === 'WALI_VIEW';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(contextAuth.email || null);

  React.useEffect(() => {
    let unsubscribe = () => {};
    try {
      // The Firebase V9 modular functions crash when passed a Proxy stub
      // so we use an inline try-catch to safely handle it
      unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        if (user?.email) {
          setUserEmail(user.email);
        }
      });
    } catch (e) {
      // Ignore stub proxy errors
    }
    return () => unsubscribe();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Maximum size is 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile('profilePhoto', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const { updateSakinahProfile, updateSakinahPreferences } = await import('../services/sakinahApi');

      // 1. Save profile to server — AWAIT before doing anything else
      await updateSakinahProfile({
        ...profile,
        firstName: profile.firstName || kyc.aadhaarName?.split(' ')[0] || '',
        lastName: profile.lastName || kyc.aadhaarName?.split(' ').slice(1).join(' ') || ''
      });

      // 2. Save preferences to server — AWAIT
      await updateSakinahPreferences(preferences);

      // 3. Only mark complete and navigate AFTER both succeed
      setOnboardingComplete(true);
      setProgress({
        account_completed: true,
        kyc_completed: true,
        profile_completed: true,
        preferences_completed: true,
        review_completed: true
      });

      navigate('/matrimony/dashboard');
    } catch (err: any) {
      // Save failed — stay on page, show real error to user
      const msg = err?.message?.includes('fetch')
        ? 'Could not connect to the server. Please check your internet and try again.'
        : (err?.message || 'Failed to save your profile. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ title, editPath, icon: Icon }: any) => (
    <div className="flex justify-between items-center mb-6 border-b border-[#D4AF37]/10 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
          <Icon size={20} className="text-[#F5D77A]" weight="fill" />
        </div>
        <h3 className="text-[#F5D77A] text-[22px] font-serif font-bold tracking-wide">
          {title}
        </h3>
      </div>
      <button 
        onClick={() => navigate(editPath)}
        className="text-[#D4AF37] hover:text-[#050816] hover:bg-[#D4AF37] transition-all px-4 py-2 rounded-full border border-[#D4AF37]/50 flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(212,175,55,0.1)]"
      >
        <PencilSimple size={14} weight="bold" /> Edit
      </button>
    </div>
  );

  const DataItem = ({ label, value }: { label: string, value: any }) => {
    if (value === undefined || value === null || value === '' || value === false || (Array.isArray(value) && value.length === 0)) return null;
    let displayValue = String(value);
    if (value === true) displayValue = 'Yes';

    return (
      <div className="flex flex-col bg-[#050816]/80 rounded-xl p-4 md:p-5 border border-[rgba(212,175,55,0.08)] shadow-[inset_0_0_15px_rgba(0,0,0,0.3)] hover:border-[rgba(212,175,55,0.3)] hover:shadow-[0_0_15px_rgba(212,175,55,0.05)] transition-all">
        <span className="text-[10px] text-[#F5D77A]/70 uppercase tracking-widest mb-1.5 font-bold">{label}</span>
        <span className="text-[15px] font-medium text-white/95 leading-snug">{displayValue}</span>
      </div>
    );
  };

  const ChipList = ({ label, items }: { label: string, items: string[] }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="flex flex-col md:col-span-2 lg:col-span-3 bg-[#050816]/80 rounded-xl p-5 border border-[rgba(212,175,55,0.08)] shadow-[inset_0_0_15px_rgba(0,0,0,0.3)] mt-2 hover:border-[rgba(212,175,55,0.3)] hover:shadow-[0_0_15px_rgba(212,175,55,0.05)] transition-all">
        <span className="text-[10px] text-[#F5D77A]/70 uppercase tracking-widest mb-3 font-bold">{label}</span>
        <div className="flex flex-wrap gap-2.5">
          {items.map(item => (
             <span key={item} className="px-3.5 py-1.5 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 text-[#F5D77A] rounded-full text-[13px] font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
               {item}
             </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <SakinahOnboardingShell
      step={5}
      title="Review Profile"
      subtitle="Please review your details before submitting to the Sakinah Matchmaking committee."
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex flex-col gap-6"
      >
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] flex items-center gap-3">
            <WarningCircle size={20} />
            {error}
          </div>
        )}

        <div className="bg-[#111826] border border-[#D4AF37]/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-[0_0_30px_rgba(212,175,55,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(212,175,55,0.1)_0%,transparent_70%)] pointer-events-none" />
          <div 
            onClick={() => setShowReminder(true)}
            className="w-24 h-24 rounded-full border-2 border-[#D4AF37] p-1 shrink-0 bg-[#0B1020] overflow-hidden cursor-pointer group relative"
          >
            {profile.profilePhoto ? (
              <>
                <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]" />
                <div className="absolute inset-1 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                  <Camera size={24} className="text-white" />
                </div>
              </>
            ) : (
              <>
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#D4A853] to-[#A37B31] flex items-center justify-center text-[#0A0E16] text-[32px] font-serif font-bold shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
                  {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : (kyc.aadhaarName ? kyc.aadhaarName.charAt(0).toUpperCase() : 'S')}
                </div>
                <div className="absolute inset-1 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                  <Camera size={24} className="text-white" />
                </div>
              </>
            )}
          </div>
          <div className="flex-1 text-center md:text-left z-10">
            <h2 className="text-[28px] font-serif text-[#F5D77A] mb-2">
              {`${profile.firstName || ''} ${profile.lastName || ''}`.trim() || kyc.aadhaarName || 'User Profile'}
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {isWali && (
                <span className="px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  <ShieldCheck size={14} weight="fill" /> Managed By Wali
                </span>
              )}
              {isWali && (
                <span className="px-3 py-1 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] rounded-full text-[11px] font-bold tracking-wide shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                  Searching For Someone Else
                </span>
              )}
              <span className="px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                <CheckCircle size={14} weight="fill" /> Verified Profile
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Account & Identity Card */}
          <div className="bg-[#0B1020]/80 border border-[rgba(212,175,55,0.3)] rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-xl">
             <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#D4AF37] to-[#F5D77A] opacity-50" />
             <SectionHeader title="Account & Identity" icon={IdentificationCard} editPath="/matrimony/register" />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                      <EnvelopeSimple size={20} />
                   </div>
                   <div>
                     <div className="text-[10px] text-[#F5D77A]/50 uppercase tracking-widest font-medium">Email Address</div>
                     <div className="text-[14px] text-white/90">{userEmail || contextAuth?.email || 'Not provided'}</div>
                   </div>
                </div>
                <div className="col-span-1 sm:col-span-2 pt-4 mt-2 border-t border-white/5">
                   <div className="flex justify-between items-center bg-[#050816] p-4 rounded-xl border border-white/5">
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] text-[#F5D77A]/50 uppercase tracking-widest font-medium">Sakinah Identity</span>
                         <span className="text-[13px] text-white">{kyc.aadhaarName || 'Verified User'}</span>
                         <span className="text-[11px] text-[#D4AF37] font-medium tracking-wide">
                            {/* @ts-ignore */}
                            {profile.sakinah_id ? `ID: ${profile.sakinah_id}` : 'SAK ID generated upon submission'}
                         </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 text-[11px] font-bold uppercase tracking-wider">
                         <CheckCircle weight="fill" /> Verified
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Profile Basics */}
          <div className="bg-[#0B1020]/80 border border-[rgba(212,175,55,0.3)] rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-xl">
             <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#D4AF37] to-[#F5D77A] opacity-50" />
             <SectionHeader title="Your Profile Basics" icon={User} editPath="/matrimony/profile-creation" />
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <DataItem label="Full Name" value={`${profile.firstName || ''} ${profile.lastName || ''}`.trim() || kyc.aadhaarName || 'Not provided'} />
                <DataItem label="Date of Birth" value={profile.dateOfBirth} />
                <DataItem label="Age" value={profile.age} />
                <DataItem label="Gender" value={profile.gender} />
                <DataItem label="Location" value={profile.location} />
                <DataItem label="Marital Status" value={profile.marital_status} />
                <DataItem label="Education/Occupation" value={profile.education_occupation} />
                <DataItem label="Marriage Readiness" value={profile.marriage_readiness} />
             </div>
          </div>

          {/* Match Preferences */}
          <div className="bg-[#0B1020]/80 border border-[rgba(212,175,55,0.3)] rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-xl">
             <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#D4AF37] to-[#F5D77A] opacity-50" />
             <SectionHeader title="Match Preferences" icon={Heart} editPath="/matrimony/preferences" />
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {/* Highlights */}
                <DataItem label="Preferred Age Range" value={preferences.minAge && preferences.maxAge ? `${preferences.minAge} - ${preferences.maxAge} years` : undefined} />
                <DataItem label="Marital Status" value={preferences.maritalStatus} />
                <DataItem label="Religious Alignment" value={preferences.religiousPracticePref} />
                <DataItem label="Communication Style" value={preferences.communicationStyle} />
                <DataItem label="Family Involvement" value={preferences.familyInvolvement} />

                {/* Arrays as Chips */}
                <ChipList label="Preferred Locations" items={preferences.locationPref} />
                <ChipList label="Education / Work Preferences" items={preferences.educationPref} />
                <ChipList 
                   label="Caste / Sect Preference" 
                   items={preferences.openToAllCastes ? ['Open to all castes'] : preferences.castePref} 
                />
                <ChipList label="Strict Dealbreakers" items={preferences.dealbreakers} />
             </div>
          </div>
        </div>

        <div className="mt-6 mb-8">
          <SakinahButton
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-[#D4AF37] via-[#F5D77A] to-[#D4AF37] bg-[length:200%_100%] animate-gradient text-[#050816] shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(212,175,55,0.6)] transition-all font-bold rounded-2xl text-[16px]"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="block w-5 h-5 border-2 border-[#050816]/30 border-t-[#050816] rounded-full"
                />
                Submitting Profile...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={22} weight="fill" />
                Submit Profile for Review
              </span>
            )}
          </SakinahButton>
          <p className="text-center text-[12px] text-white/40 mt-4 font-medium tracking-wide">
            You will be notified via email once your profile is approved.
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showReminder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowReminder(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#0B1020] border border-[#D4AF37]/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A]" />
              <button 
                onClick={() => setShowReminder(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4 border border-[#D4AF37]/20">
                  <Camera size={32} className="text-[#D4AF37]" weight="duotone" />
                </div>
                <h3 className="text-xl font-serif text-[#F5D77A] mb-2">Upload Profile Photo</h3>
                <p className="text-[14px] text-white/80 leading-relaxed mb-6">
                  Before you upload, please ensure your photo is decent, modest, and presented in a halal manner. 🤍
                </p>
                
                <input 
                  type="file" 
                  id="review-photo-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    handlePhotoUpload(e);
                    setShowReminder(false);
                  }}
                />
                
                <SakinahButton
                  variant="primary"
                  onClick={() => document.getElementById('review-photo-upload')?.click()}
                  className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#050816] font-semibold rounded-xl"
                >
                  Continue to Upload
                </SakinahButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </SakinahOnboardingShell>
  );
};

export default SakinahReviewPage;
