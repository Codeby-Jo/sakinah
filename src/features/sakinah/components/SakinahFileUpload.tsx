import React, { useState, useRef, useCallback } from 'react';

export interface SakinahFileUploadProps {
  label: string;
  description?: string;
  accepts: 'image' | 'document';
  value: string | null; // URL or File name
  onChange: (file: File | null) => void;
  error?: string;
  required?: boolean;
}

export const SakinahFileUpload: React.FC<SakinahFileUploadProps> = ({
  label, description, accepts, value, onChange, error, required
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(value);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = accepts === 'image' 
    ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  const allowedExtensions = accepts === 'image' ? 'JPG, JPEG, PNG, WEBP' : 'PDF, DOC, DOCX';

  const validateFile = (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      setUploadError(`Invalid file type. Only ${allowedExtensions} allowed.`);
      return false;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      setUploadError('File is too large. Maximum size is 5MB.');
      return false;
    }
    setUploadError(null);
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      // Simulate upload progress
      setProgress(10);
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            onChange(file);
            if (accepts === 'image') {
              const reader = new FileReader();
              reader.onload = (e) => setPreview(e.target?.result as string);
              reader.readAsDataURL(file);
            } else {
              setPreview(file.name);
            }
            return 100;
          }
          return p + 20;
        });
      }, 100);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setProgress(0);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#D4A853] flex items-center gap-2">
        {label}
        {required && <span className="text-[#D4A853]/60">*</span>}
      </label>
      {description && <p className="text-[12px] text-[#5f6675]">{description}</p>}
      
      <div 
        onClick={() => !progress || progress === 100 ? fileInputRef.current?.click() : null}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`w-full relative overflow-hidden rounded-[14px] border-2 border-dashed ${
          error || uploadError ? 'border-red-500/50 bg-red-500/5' : 
          isDragging ? 'border-[#D4A853] bg-[#D4A853]/5' : 
          'border-[rgba(255,255,255,0.06)] bg-[#111826] hover:border-[rgba(255,255,255,0.12)]'
        } min-h-[140px] flex flex-col items-center justify-center p-6 cursor-pointer transition-colors group`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept={accepts === 'image' ? '.jpg,.jpeg,.png,.webp' : '.pdf,.doc,.docx'}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) handleFile(e.target.files[0]);
          }}
        />

        {preview && progress === 100 ? (
          <div className="w-full flex items-center justify-between">
            {accepts === 'image' ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[8px] overflow-hidden bg-black/20">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[13px] text-[#EDE7DA] font-medium">Image uploaded</span>
                  <span className="text-[11px] text-[#5f6675]">Click to replace</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[8px] bg-[rgba(212,168,83,0.1)] flex items-center justify-center text-[#D4A853]">
                  📄
                </div>
                <div className="flex flex-col text-left max-w-[200px]">
                  <span className="text-[13px] text-[#EDE7DA] font-medium truncate">{preview}</span>
                  <span className="text-[11px] text-[#5f6675]">Document uploaded</span>
                </div>
              </div>
            )}
            <button onClick={onRemove} className="text-[#5f6675] hover:text-red-400 p-2">✕</button>
          </div>
        ) : progress > 0 && progress < 100 ? (
          <div className="w-full max-w-[200px]">
            <div className="flex justify-between text-[11px] text-[#EDE7DA] mb-2">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
              <div className="h-full bg-[#D4A853] transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <span className="text-[28px] text-[#5f6675] group-hover:text-[#D4A853] transition-colors mb-2">
              {accepts === 'image' ? '📸' : '📄'}
            </span>
            <span className="text-[14px] text-[#EDE7DA] font-medium">Click or drag & drop</span>
            <span className="text-[11px] text-[#5f6675] mt-1">
              {accepts === 'image' ? 'JPG, PNG, WEBP (max 5MB)' : 'PDF, DOC, DOCX (max 5MB)'}
            </span>
          </div>
        )}
      </div>
      {(error || uploadError) && <p className="text-[11px] text-[#e87c7c] mt-1 pl-1">{error || uploadError}</p>}
    </div>
  );
};
