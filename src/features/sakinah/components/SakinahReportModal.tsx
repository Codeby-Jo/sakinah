import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SakinahReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
}

const REPORT_REASONS = [
  'Fake Profile',
  'Inappropriate Behaviour',
  'Misleading Information',
  'Harassment',
  'Spam',
  'Suspicious Activity',
  'Inappropriate Photos',
  'Other'
];

export const SakinahReportModal: React.FC<SakinahReportModalProps> = ({ isOpen, onClose, profileName }) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [otherDetails, setOtherDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset state when opened
  React.useEffect(() => {
    if (isOpen) {
      setSelectedReason('');
      setOtherDetails('');
      setIsSubmitted(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!selectedReason) return;
    setIsSubmitted(true);
    // In a real app, send to backend here
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-[#0A0E16]/80 backdrop-blur-sm"
            onClick={!isSubmitted ? onClose : undefined}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[480px] bg-[#111826] border border-[rgba(255,255,255,0.08)] rounded-[24px] shadow-2xl overflow-hidden"
          >
            {isSubmitted ? (
              <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-16 h-16 rounded-full bg-[rgba(127,176,122,0.1)] border border-[rgba(127,176,122,0.2)] flex items-center justify-center mb-6">
                  <span className="text-[24px] text-[var(--sk-green)]">✓</span>
                </div>
                <h3 className="font-serif text-[24px] text-[#EDE7DA] mb-3">Report Submitted</h3>
                <p className="text-[14px] text-[#9aa0ac] leading-relaxed max-w-[300px]">
                  Thank you. Your report has been submitted and will be reviewed by our moderation team.
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full max-h-[85vh]">
                <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center shrink-0">
                  <div>
                    <h2 className="font-serif text-[20px] text-[var(--sk-rose)] flex items-center gap-2">
                      <span>🚩</span> Report Profile
                    </h2>
                    <p className="text-[12px] text-[#9aa0ac] mt-1">Reporting {profileName}</p>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[rgba(255,255,255,0.05)] text-[#5f6675] hover:text-[#EDE7DA] flex items-center justify-center transition-colors">✕</button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                  <p className="text-[13px] text-[#EDE7DA] mb-4">Please select a reason for reporting this profile:</p>
                  <div className="flex flex-col gap-2">
                    {REPORT_REASONS.map(reason => (
                      <label key={reason} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedReason === reason ? 'bg-[rgba(201,138,138,0.1)] border-[var(--sk-rose)]' : 'border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.02)]'}`}>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedReason === reason ? 'border-[var(--sk-rose)]' : 'border-[#5f6675]'}`}>
                          {selectedReason === reason && <div className="w-2 h-2 rounded-full bg-[var(--sk-rose)]" />}
                        </div>
                        <span className={`text-[14px] ${selectedReason === reason ? 'text-[var(--sk-rose)]' : 'text-[#9aa0ac]'}`}>{reason}</span>
                      </label>
                    ))}
                  </div>

                  <AnimatePresence>
                    {selectedReason === 'Other' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        <textarea 
                          value={otherDetails}
                          onChange={(e) => setOtherDetails(e.target.value)}
                          placeholder="Please provide more details..."
                          className="w-full bg-[#0A0E16] border border-[rgba(255,255,255,0.08)] focus:border-[var(--sk-rose)] rounded-[12px] p-4 text-[13px] text-[#EDE7DA] outline-none min-h-[100px] resize-y placeholder-[#5f6675] transition-colors"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-6 border-t border-[rgba(255,255,255,0.05)] flex gap-3 shrink-0 bg-[#111826]">
                  <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[rgba(255,255,255,0.1)] text-[#9aa0ac] hover:text-[#EDE7DA] hover:bg-[rgba(255,255,255,0.05)] transition-colors text-[14px] font-medium">
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={!selectedReason || (selectedReason === 'Other' && !otherDetails.trim())}
                    className="flex-[1.5] py-3 rounded-xl bg-[var(--sk-rose)] text-white font-medium hover:bg-[#b57373] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[14px]"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
