import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
interface EvidenceFile {
  file: File;
  type: 'screenshot' | 'recording';
  previewUrl?: string;
}

interface SakinahReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
  /** Backend user ID of the profile being reported. Required for production. */
  reportedUserId?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const REPORT_REASONS = [
  { value: 'fake_profile',          label: 'Fake Profile',              icon: '🎭' },
  { value: 'inappropriate_content', label: 'Inappropriate Content',     icon: '⚠️' },
  { value: 'misleading_info',       label: 'Misleading Information',    icon: '❌' },
  { value: 'harassment',            label: 'Harassment or Abuse',       icon: '🚫' },
  { value: 'spam',                  label: 'Spam or Scam',              icon: '📢' },
  { value: 'underage',              label: 'Suspected Underage Profile', icon: '🔞' },
  { value: 'impersonation',         label: 'Impersonation',             icon: '👤' },
  { value: 'other',                 label: 'Other',                     icon: '📝' },
];

const ACCEPTED_IMAGE_TYPES  = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
const ACCEPTED_VIDEO_TYPES  = ['video/mp4', 'video/quicktime'];
const MAX_IMAGE_SIZE_BYTES  = 10 * 1024 * 1024;  // 10 MB
const MAX_VIDEO_SIZE_BYTES  = 50 * 1024 * 1024;  // 50 MB

// ─── Component ────────────────────────────────────────────────────────────────
export const SakinahReportModal: React.FC<SakinahReportModalProps> = ({
  isOpen,
  onClose,
  profileName,
  reportedUserId,
}) => {
  // Form state
  const [step, setStep]                 = useState<'form' | 'success'>('form');
  const [reason, setReason]             = useState('');
  const [description, setDescription]  = useState('');
  const [additionalNotes, setNotes]     = useState('');
  const [evidenceFiles, setEvidence]    = useState<EvidenceFile[]>([]);
  const [fileErrors, setFileErrors]     = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError]       = useState('');

  // Refs
  const screenshotRef  = useRef<HTMLInputElement>(null);
  const recordingRef   = useRef<HTMLInputElement>(null);

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFileAdd = useCallback((files: FileList | null, type: 'screenshot' | 'recording') => {
    if (!files) return;
    const errors: string[] = [];
    const valid: EvidenceFile[] = [];

    Array.from(files).forEach(file => {
      const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
      const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);

      if (type === 'screenshot' && !isImage) {
        errors.push(`${file.name}: Only PNG, JPEG, PDF accepted for screenshots.`);
        return;
      }
      if (type === 'recording' && !isVideo) {
        errors.push(`${file.name}: Only MP4 and MOV accepted for recordings.`);
        return;
      }
      if (type === 'screenshot' && file.size > MAX_IMAGE_SIZE_BYTES) {
        errors.push(`${file.name}: File exceeds 10 MB limit.`);
        return;
      }
      if (type === 'recording' && file.size > MAX_VIDEO_SIZE_BYTES) {
        errors.push(`${file.name}: File exceeds 50 MB limit.`);
        return;
      }

      const previewUrl = isImage && file.type !== 'application/pdf'
        ? URL.createObjectURL(file)
        : undefined;

      valid.push({ file, type, previewUrl });
    });

    setFileErrors(errors);
    setEvidence(prev => [...prev, ...valid]);
  }, []);

  const removeEvidence = useCallback((idx: number) => {
    setEvidence(prev => {
      const next = [...prev];
      if (next[idx]?.previewUrl) URL.revokeObjectURL(next[idx].previewUrl!);
      next.splice(idx, 1);
      return next;
    });
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!reason) { setFormError('Please select a reason for reporting.'); return; }
    if (description.trim().length < 20) {
      setFormError('Please provide a description of at least 20 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('reported_user_id', reportedUserId || profileName);
      formData.append('reason',           reason);
      formData.append('description',      description.trim());
      formData.append('additional_notes', additionalNotes.trim());
      formData.append('timestamp',        new Date().toISOString());

      evidenceFiles.forEach((ev) => {
        formData.append(`evidence_file`, ev.file, ev.file.name);
      });

      // Send to backend
      try {
        const token = localStorage.getItem('sakinah_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/v1/nis/moderation/reports`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        
        if (!res.ok) {
           const err = await res.json();
           setFormError(err.detail || 'Failed to submit report.');
           setIsSubmitting(false);
           return;
        }
      } catch (e) {
        setFormError('Network error connecting to backend.');
        setIsSubmitting(false);
        return;
      }

      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Reset on close ────────────────────────────────────────────────────────
  const handleClose = () => {
    setStep('form');
    setReason('');
    setDescription('');
    setNotes('');
    setEvidence([]);
    setFileErrors([]);
    setFormError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0A0E16]/85 backdrop-blur-md"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative z-10 bg-[#0E1421] border border-red-500/20 rounded-[28px] w-full max-w-[540px] shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden my-4"
          onClick={e => e.stopPropagation()}
        >
          {/* ── Success Screen ─────────────────────────────────────────── */}
          {step === 'success' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-10 flex flex-col items-center justify-center text-center min-h-[320px]"
            >
              <div className="w-20 h-20 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center text-[32px] mb-5">
                ✅
              </div>
              <h3 className="text-[22px] font-serif text-[#EDE7DA] mb-3">Report Submitted</h3>
              <p className="text-[14px] text-[var(--sk-ink-dim)] max-w-[320px] leading-relaxed mb-2">
                Thank you for helping keep Sakinah safe. Your report has been received and is under review by our moderation team.
              </p>
              <p className="text-[12px] text-[var(--sk-ink-faint)] max-w-[300px] leading-relaxed mt-1">
                ⚠️ No immediate action will be taken. Reports are reviewed by admins only. Users are never automatically banned.
              </p>
              <button
                onClick={handleClose}
                className="mt-8 px-8 py-3 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] text-[var(--sk-ink)] rounded-xl text-[14px] font-medium transition-all"
              >
                Close
              </button>
            </motion.div>

          ) : (
          /* ── Form ─────────────────────────────────────────────────── */
          <form onSubmit={handleSubmit} className="flex flex-col max-h-[88vh] overflow-y-auto">

            {/* Header */}
            <div className="sticky top-0 z-10 p-6 border-b border-[rgba(255,255,255,0.06)] bg-[#0E1421]/95 backdrop-blur-sm flex justify-between items-start">
              <div>
                <h3 className="text-[20px] font-serif text-[#EDE7DA] flex items-center gap-2">
                  <span className="text-red-400">🚩</span> Report Profile
                </h3>
                <p className="text-[13px] text-[var(--sk-ink-dim)] mt-1">
                  Reporting <span className="text-[var(--sk-gold)] font-medium">{profileName}</span>
                </p>
              </div>
              <button type="button" onClick={handleClose}
                className="text-[var(--sk-ink-dim)] hover:text-white transition-colors w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[rgba(255,255,255,0.06)] text-[18px]">
                ✕
              </button>
            </div>

            {/* Notice */}
            <div className="mx-6 mt-5 p-3 rounded-xl bg-[rgba(212,168,83,0.06)] border border-[rgba(212,168,83,0.2)] text-[12px] text-[var(--sk-gold)] flex items-start gap-2">
              <span className="mt-0.5 shrink-0">ℹ️</span>
              <span>Reports are reviewed by our admin team. No user will be automatically banned. Admins decide all actions after reviewing evidence.</span>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">

              {/* 1. Reason */}
              <div>
                <label className="block text-[13px] font-semibold text-[#EDE7DA] mb-3 tracking-wide uppercase">
                  1. Reason <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {REPORT_REASONS.map(r => (
                    <label key={r.value}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all text-[13px] ${
                        reason === r.value
                          ? 'bg-red-500/10 border-red-500/40 text-red-300'
                          : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-[var(--sk-ink-dim)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.12)]'
                      }`}>
                      <input type="radio" name="reason" value={r.value}
                        checked={reason === r.value}
                        onChange={e => setReason(e.target.value)}
                        className="accent-red-500 shrink-0" />
                      <span>{r.icon}</span>
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. Description */}
              <div>
                <label className="block text-[13px] font-semibold text-[#EDE7DA] mb-2 tracking-wide uppercase">
                  2. Description <span className="text-red-400">*</span>
                </label>
                <p className="text-[12px] text-[var(--sk-ink-faint)] mb-3">
                  Describe what happened in detail. Minimum 20 characters.
                </p>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. This profile is using photos that appear to be stolen from another social media account. The bio information is inconsistent and the account was created very recently..."
                  className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.14)] focus:border-red-500/30 rounded-xl p-4 text-[14px] text-[#EDE7DA] outline-none transition-colors h-[110px] resize-none placeholder:text-[var(--sk-ink-faint)]"
                  required
                />
                <div className="text-right text-[11px] text-[var(--sk-ink-faint)] mt-1">
                  {description.length} characters {description.length < 20 && <span className="text-red-400">(min 20)</span>}
                </div>
              </div>

              {/* 3. Evidence Upload */}
              <div>
                <label className="block text-[13px] font-semibold text-[#EDE7DA] mb-2 tracking-wide uppercase">
                  3. Upload Evidence <span className="text-[var(--sk-ink-faint)] font-normal text-[11px] normal-case">(Optional but recommended)</span>
                </label>
                <p className="text-[12px] text-[var(--sk-ink-faint)] mb-4">
                  Screenshots (PNG, JPEG, PDF · max 10 MB) or screen recordings (MP4, MOV · max 50 MB)
                </p>

                {/* Drop zones */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Screenshot */}
                  <button type="button"
                    onClick={() => screenshotRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-[rgba(255,255,255,0.12)] hover:border-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.04)] transition-all text-center">
                    <span className="text-[28px]">📷</span>
                    <span className="text-[12px] text-[var(--sk-ink-dim)] font-medium">Add Screenshot</span>
                    <span className="text-[10px] text-[var(--sk-ink-faint)]">PNG · JPEG · PDF</span>
                  </button>
                  <input ref={screenshotRef} type="file"
                    accept="image/png,image/jpeg,image/jpg,application/pdf"
                    multiple className="hidden"
                    onChange={e => handleFileAdd(e.target.files, 'screenshot')} />

                  {/* Recording */}
                  <button type="button"
                    onClick={() => recordingRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-[rgba(255,255,255,0.12)] hover:border-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.04)] transition-all text-center">
                    <span className="text-[28px]">🎥</span>
                    <span className="text-[12px] text-[var(--sk-ink-dim)] font-medium">Add Recording</span>
                    <span className="text-[10px] text-[var(--sk-ink-faint)]">MP4 · MOV</span>
                  </button>
                  <input ref={recordingRef} type="file"
                    accept="video/mp4,video/quicktime"
                    multiple className="hidden"
                    onChange={e => handleFileAdd(e.target.files, 'recording')} />
                </div>

                {/* File errors */}
                {fileErrors.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {fileErrors.map((err, i) => (
                      <p key={i} className="text-[11px] text-red-400 flex items-center gap-1.5">
                        <span>⚠</span>{err}
                      </p>
                    ))}
                  </div>
                )}

                {/* Added files */}
                {evidenceFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {evidenceFiles.map((ev, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-xl">
                        {ev.previewUrl ? (
                          <img src={ev.previewUrl} alt="evidence" className="w-10 h-10 object-cover rounded-lg shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-[rgba(212,168,83,0.1)] rounded-lg flex items-center justify-center text-[18px] shrink-0">
                            {ev.type === 'recording' ? '🎥' : '📄'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] text-[var(--sk-ink)] font-medium truncate">{ev.file.name}</div>
                          <div className="text-[10px] text-[var(--sk-ink-faint)]">
                            {(ev.file.size / 1024 / 1024).toFixed(1)} MB · {ev.type}
                          </div>
                        </div>
                        <button type="button" onClick={() => removeEvidence(i)}
                          className="text-[var(--sk-ink-faint)] hover:text-red-400 transition-colors text-[16px] shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Additional Notes */}
              <div>
                <label className="block text-[13px] font-semibold text-[#EDE7DA] mb-2 tracking-wide uppercase">
                  4. Additional Notes <span className="text-[var(--sk-ink-faint)] font-normal text-[11px] normal-case">(Optional)</span>
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any other context that may help our moderation team..."
                  className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.14)] focus:border-[rgba(212,168,83,0.3)] rounded-xl p-4 text-[14px] text-[#EDE7DA] outline-none transition-colors h-[80px] resize-none placeholder:text-[var(--sk-ink-faint)]"
                />
              </div>

              {/* Form error */}
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] flex items-center gap-2">
                  <span>⚠</span> {formError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 p-5 border-t border-[rgba(255,255,255,0.06)] bg-[#0E1421]/95 backdrop-blur-sm flex gap-3 justify-end">
              <button type="button" onClick={handleClose}
                className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-[var(--sk-ink-dim)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reason}
                className="px-7 py-2.5 rounded-xl text-[13px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 min-w-[130px] justify-center"
              >
                {isSubmitting ? (
                  <><span className="inline-block w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <>🚩 Submit Report</>
                )}
              </button>
            </div>
          </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
