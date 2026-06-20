import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShieldCheck, SpinnerGap, FilePlus } from '@phosphor-icons/react';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahButton, SakinahOnboardingShell, SakinahToast, LivenessVerification } from '../components';
import { setProgress, getProgress } from '../services/sakinahProgress';

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const SakinahKycPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateKyc, setKycCompleted } = useOnboarding();
  
  const [kycState, setKycState] = useState<'IDLE' | 'PROCESSING' | 'VERIFIED'>('IDLE');
  
  const currentRole = getProgress().role;
  const isLookingForSomeoneElse = currentRole === 'LOOKING_FOR_SOMEONE_ELSE';
  
  const [isLivenessPassed, setIsLivenessPassed] = useState(false);
  const isLocked = isLookingForSomeoneElse ? false : !isLivenessPassed;

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // File Uploads
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoError, setProfilePhotoError] = useState('');
  
  const [dlFile, setDlFile] = useState<File | null>(null);
  const [dlError, setDlError] = useState('');
  
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportError, setPassportError] = useState('');

  const [voterIdFile, setVoterIdFile] = useState<File | null>(null);
  const [voterIdError, setVoterIdError] = useState('');

  const [docGroupError, setDocGroupError] = useState('');

  // Aadhaar or Voter ID string
  const [idNumber, setIdNumber] = useState('');
  const [idError, setIdError] = useState('');

  const validateFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      return `File exceeds 10MB limit.`;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Invalid format. Only JPG, PNG, PDF allowed.`;
    }
    return '';
  };



  const handleDlChange = (f: File | null) => {
    setDlFile(f);
    setDocGroupError(''); // Clear group error if they upload something
    if (f) {
      const err = validateFile(f);
      setDlError(err);
    } else {
      setDlError('');
    }
  };

  const handlePassportChange = (f: File | null) => {
    setPassportFile(f);
    setDocGroupError('');
    if (f) {
      const err = validateFile(f);
      setPassportError(err);
    } else {
      setPassportError('');
    }
  };

  const handleVoterIdChange = (f: File | null) => {
    setVoterIdFile(f);
    setDocGroupError('');
    if (f) {
      const err = validateFile(f);
      setVoterIdError(err);
    } else {
      setVoterIdError('');
    }
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Aadhaar: exactly 12 numeric digits
    const val = e.target.value.replace(/[^0-9]/g, '').substring(0, 12);
    setIdNumber(val);
    if (val.length > 0 && val.length < 12) {
      setIdError('Aadhaar number must be exactly 12 digits.');
    } else if (val.length === 12) {
      setIdError('');
    } else {
      setIdError('');
    }
  };

  const handleSubmit = async () => {
    let hasError = false;

    if (!isLookingForSomeoneElse && !isLivenessPassed) {
      setProfilePhotoError('Liveness incomplete');
      hasError = true;
    }
    
    if (isLookingForSomeoneElse && !profilePhoto) {
      setProfilePhotoError('A profile photo is required.');
      hasError = true;
    }
    if (!idNumber || idNumber.length !== 12 || !/^[0-9]{12}$/.test(idNumber)) {
      setIdError('Valid Aadhaar Number (12 digits) is required.');
      hasError = true;
    }
    
    if (dlError || passportError || voterIdError) {
      hasError = true;
    }

    if (!dlFile && !passportFile && !voterIdFile) {
      setDocGroupError('Please upload at least one identity document.');
      hasError = true;
    }

    if (hasError) return;

    setKycState('PROCESSING');
    
    // Simulate Backend API call
    await new Promise(r => setTimeout(r, 2000));
    setKycState('VERIFIED');
    
    try {
      updateKyc('aadhaarNumber', idNumber); 
      const primaryDoc = dlFile || passportFile || voterIdFile;
      if (primaryDoc && primaryDoc instanceof File) {
        updateKyc('frontImage', URL.createObjectURL(primaryDoc));
      }
      if (profilePhoto && profilePhoto instanceof File) {
        updateKyc('selfieImage', URL.createObjectURL(profilePhoto));
      }
    } catch (err) {
      console.error("Non-fatal error creating object URL:", err);
    }
    
    await new Promise(r => setTimeout(r, 1500));
    
    setKycCompleted(true);
    const currentRole = getProgress().role || 'SEEKER';
    setProgress({ 
      role: currentRole, 
      account_completed: true, 
      kyc_completed: true, 
      profile_completed: false, 
      preferences_completed: false, 
      review_completed: false 
    });
    navigate('/matrimony/profile-creation');
  };

  const FileUpload = ({ label, file, error, onChange, required = false, disabled = false }: any) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
      <div className={`relative flex flex-col items-center justify-center border border-dashed ${error ? 'border-red-500/50 bg-red-500/5' : file ? 'border-[#4BB543]/50 bg-[#4BB543]/5 shadow-[0_0_15px_rgba(75,181,67,0.1)]' : 'border-[#D4AF37]/30 bg-[#050816] hover:bg-[#D4AF37]/5'} rounded-[20px] p-6 transition-all duration-300 group overflow-hidden`}>
        <input 
          type="file" 
          ref={fileInputRef} 
          accept=".jpg,.jpeg,.png,.pdf" 
          className="hidden" 
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) onChange(e.target.files[0]);
            e.target.value = '';
          }} 
        />
        <div className={`flex flex-col items-center text-center z-10 cursor-pointer w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => !disabled && fileInputRef.current?.click()}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${file ? 'bg-[#4BB543]/20 text-[#4BB543] scale-110' : 'bg-gradient-to-br from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/20 text-[#D4AF37] group-hover:scale-110'}`}>
            {file ? <CheckCircle size={28} weight="fill" /> : <FilePlus size={28} weight="duotone" />}
          </div>
          <span className="text-[13px] text-white font-medium tracking-wide mb-1.5">{label} {required && <span className="text-red-400">*</span>}</span>
          {file ? (
            <span className="text-[11px] text-[#4BB543] font-medium truncate w-full max-w-[120px]">{file.name}</span>
          ) : (
            <span className="text-[11px] text-[#F5D77A]/50">JPG, PNG, PDF</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {toast && <SakinahToast message={toast.message} onClose={() => setToast(null)} type={toast.type} />}
      <SakinahOnboardingShell
        step={2}
        title="Identity Verification"
        subtitle="Verify your identity to unlock matching. No live camera required."
      >
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0B1020]/60 border border-[#D4AF37]/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[32px] p-6 md:p-10 backdrop-blur-3xl"
          >
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#D4AF37]/10">
              <h3 className="text-[#F5D77A] text-2xl font-serif flex items-center gap-3">
                <ShieldCheck size={28} weight="duotone" className="text-[#D4AF37]" />
                Identity Documents
              </h3>
            </div>

            <div className="space-y-10">
              {/* Liveness Verification or Photo Upload */}
              <div className="flex flex-col gap-4">
                <label className="text-[11px] text-[#D4AF37] uppercase tracking-[0.2em] font-semibold">
                  1. {isLookingForSomeoneElse ? 'Profile Photo' : 'Liveness Verification'}
                </label>
                <div className="w-full">
                  {isLookingForSomeoneElse ? (
                    <div className="max-w-[200px]">
                      <FileUpload 
                        label="Upload Photo" 
                        file={profilePhoto} 
                        error={profilePhotoError} 
                        onChange={(f: File | null) => {
                          setProfilePhoto(f);
                          if (f) setProfilePhotoError(validateFile(f));
                          else setProfilePhotoError('A profile photo is required.');
                        }} 
                      />
                    </div>
                  ) : (
                    <LivenessVerification 
                      onSuccess={(file) => {
                        setProfilePhoto(file);
                        setProfilePhotoError('');
                        setIsLivenessPassed(true);
                        setToast({ message: 'Liveness Verification Successful! KYC fields unlocked.', type: 'success' });
                      }}
                      onError={(err) => setProfilePhotoError(err)}
                    />
                  )}
                  {profilePhotoError && <p className="text-[11px] text-red-400 mt-2 pl-1">{profilePhotoError}</p>}
                </div>
              </div>

              {/* ID Number */}
              <div className={`flex flex-col gap-4 transition-opacity duration-300 ${isLocked ? 'opacity-40 pointer-events-none' : ''}`}>
                <label className="text-[11px] text-[#D4AF37] uppercase tracking-[0.2em] font-semibold">2. Verification ID Number</label>
                <div className="max-w-md">
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={12}
                    placeholder="Enter 12-digit Aadhaar Number"
                    value={idNumber}
                    onChange={handleIdChange}
                    className={`w-full px-5 py-4 bg-[#050816]/80 backdrop-blur-xl border ${idError ? 'border-red-500/50' : 'border-[#D4AF37]/30'} rounded-[16px] text-[15px] text-white tracking-widest outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all`}
                    disabled={kycState === 'PROCESSING' || kycState === 'VERIFIED' || isLocked}
                  />
                  {idError && <p className="text-[11px] text-red-400 mt-2 pl-1">{idError}</p>}
                </div>
              </div>

              {/* Documents */}
              <div className={`flex flex-col gap-4 transition-opacity duration-300 ${isLocked ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex flex-col">
                  <label className="text-[11px] text-[#D4AF37] uppercase tracking-[0.2em] font-semibold mb-1">3. Upload Document Proof</label>
                  <p className="text-[13px] text-white/50 mb-4">Please provide a clear picture of at least <span className="text-[#D4AF37] font-medium">one</span> of the following documents.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <div className="flex flex-col">
                    <FileUpload label="Voter ID" file={voterIdFile} error={voterIdError} onChange={handleVoterIdChange} disabled={isLocked} />
                    {voterIdError && <p className="text-[11px] text-red-400 mt-2 pl-1">{voterIdError}</p>}
                  </div>
                  <div className="flex flex-col">
                    <FileUpload label="Driving License" file={dlFile} error={dlError} onChange={handleDlChange} disabled={isLocked} />
                    {dlError && <p className="text-[11px] text-red-400 mt-2 pl-1">{dlError}</p>}
                  </div>
                  <div className="flex flex-col">
                    <FileUpload label="Passport" file={passportFile} error={passportError} onChange={handlePassportChange} disabled={isLocked} />
                    {passportError && <p className="text-[11px] text-red-400 mt-2 pl-1">{passportError}</p>}
                  </div>
                </div>
                {docGroupError && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] px-4 py-3 rounded-xl mt-2 flex items-center gap-2">
                    {docGroupError}
                  </motion.div>
                )}
              </div>

              <div className="pt-6 mt-4">
                {kycState === 'IDLE' && (
                  <SakinahButton
                    type="button"
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={isLocked}
                    className={`w-full md:w-auto md:min-w-[280px] py-[18px] text-[15px] font-semibold transition-all rounded-[16px] ${isLocked ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#050816] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]'} border-0 float-right`}
                  >
                    Submit for Verification →
                  </SakinahButton>
                )}
                {kycState === 'PROCESSING' && (
                  <div className="w-full md:w-auto md:min-w-[280px] py-[18px] bg-gradient-to-r from-[#D4AF37]/10 to-[#F5D77A]/10 border border-[#D4AF37]/30 rounded-[16px] flex items-center justify-center gap-3 text-[#F5D77A] text-[15px] font-medium float-right">
                    <SpinnerGap className="animate-spin" size={20} />
                    Validating...
                  </div>
                )}
                {kycState === 'VERIFIED' && (
                  <div className="w-full md:w-auto md:min-w-[280px] py-[18px] bg-[#4BB543]/10 border border-[#4BB543]/30 rounded-[16px] flex items-center justify-center gap-2 text-[#4BB543] text-[15px] font-bold float-right shadow-[0_0_20px_rgba(75,181,67,0.2)]">
                    <CheckCircle size={22} weight="fill" /> Verification Complete!
                  </div>
                )}
                <div className="clear-both"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </SakinahOnboardingShell>
    </>
  );
};
export default SakinahKycPage;
