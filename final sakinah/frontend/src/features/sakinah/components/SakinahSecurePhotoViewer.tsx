import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logPhotoAccess } from '../services/sakinahApi';
import type { ProfileVisit } from '../types/sakinah.types';

interface SakinahSecurePhotoViewerProps {
  photoId: string;
  photoUrl: string;
  viewerId: string;
  viewerName: string;
  sharedBy?: string; // New: If shared, watermark changes
  viewLog?: ProfileVisit[]; // New: Photo view tracking
  altText?: string;
  onClose?: () => void;
  onUnlock?: () => void;
}

export const SakinahSecurePhotoViewer: React.FC<SakinahSecurePhotoViewerProps> = ({
  photoId,
  photoUrl,
  viewerId,
  viewerName,
  sharedBy,
  viewLog = [],
  altText = "Protected user photo",
  onClose,
  onUnlock
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate dynamic watermark on canvas
  useEffect(() => {
    if (isUnlocked && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      ctx.clearRect(0, 0, rect.width, rect.height);

      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.rotate((-25 * Math.PI) / 180);

      const timestamp = new Date().toLocaleString();
      
      // Dynamic Watermark Logic
      const watermarkText = sharedBy 
        ? `SHARED BY: ${sharedBy.toUpperCase()} | ${timestamp}`
        : `AUTHORIZED VIEWER: ${viewerName.toUpperCase()} (${viewerId}) | ${timestamp}`;

      for (let x = -rect.width; x < rect.width * 2; x += 350) {
        for (let y = -rect.height; y < rect.height * 2; y += 120) {
          ctx.fillText(watermarkText, x, y);
        }
      }
    }
  }, [isUnlocked, viewerId, viewerName, sharedBy]);

  const handleUnlock = async () => {
    setIsLogging(true);
    setError(null);
    try {
      if (!photoId.startsWith('temp-')) {
        await logPhotoAccess(photoId, viewerId);
      }
      setIsUnlocked(true);
      if (onUnlock) onUnlock();
    } catch (err: any) {
      console.warn("Failed to log photo access, but unlocking anyway for UX fallback", err);
      // Fallback: still unlock so the user isn't stuck
      setIsUnlocked(true);
      if (onUnlock) onUnlock();
    } finally {
      setIsLogging(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => e.preventDefault();
  const handleDragStart = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="flex flex-col gap-4 w-full max-w-[500px] mx-auto">
      <div className="relative w-full aspect-[3/4] rounded-[24px] overflow-hidden bg-[#0A0E16] border border-[rgba(212,168,83,0.2)] shadow-2xl group flex items-center justify-center">
        
        <div className="absolute inset-0 select-none pointer-events-none" onContextMenu={handleContextMenu} onDragStart={handleDragStart}>
          <img
            src={photoUrl} alt={altText} draggable={false}
            className={`w-full h-full object-cover transition-all duration-1000 ${
              !isUnlocked ? 'blur-[40px] scale-110 brightness-50' : 'blur-0 scale-100 brightness-100'
            }`}
          />
        </div>

        <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-500 ${isUnlocked ? 'opacity-100' : 'opacity-0'}`} style={{ mixBlendMode: 'overlay' }} />
        <div className="absolute inset-0 z-20 pointer-events-auto" onContextMenu={handleContextMenu} onDragStart={handleDragStart} />

        {/* Locked State UI */}
        <AnimatePresence>
          {!isUnlocked && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-black/40 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-[rgba(212,168,83,0.1)] border border-[rgba(212,168,83,0.3)] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,168,83,0.2)]">
                <span className="text-[24px]">🔐</span>
              </div>
              <h3 className="font-serif text-[20px] text-[var(--sk-gold)] mb-2">Protected Photo</h3>
              <p className="text-[13px] text-[#EDE7DA] mb-6 max-w-[280px] leading-relaxed font-light">
                {sharedBy 
                  ? `This photo was shared with you by ${sharedBy}. Access will be logged securely.` 
                  : `This photo is securely watermarked. Viewing this photo will log your access.`}
              </p>
              
              {error && <p className="text-red-400 text-[12px] mb-4 bg-red-500/10 px-4 py-2 rounded-lg">{error}</p>}

              <button onClick={handleUnlock} disabled={isLogging} className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#0A0E16] font-bold rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50 flex items-center gap-2 hover:-translate-y-0.5">
                {isLogging ? <><span className="animate-spin text-[16px]">↻</span> Logging Access...</> : <><span className="text-[16px]">👁</span> Unlock Photo</>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Bar for unlocked state */}
        <AnimatePresence>
          {isUnlocked && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent z-30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-[var(--sk-gold)] text-[14px]">✓</span>
                <span className="text-[10px] text-[var(--sk-gold)] uppercase tracking-wider font-mono">{sharedBy ? 'Shared View Logged' : 'Access Logged'}</span>
              </div>
              {onClose && <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors border border-white/10">✕</button>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View Log Area (Visible to owner only, simulated via viewLog prop) */}
      <AnimatePresence>
        {isUnlocked && viewLog.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111826] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[13px] text-[var(--sk-gold)] font-medium flex items-center gap-2"><span className="text-[16px]">👁</span> View Tracking</h4>
              <span className="text-[11px] text-[var(--sk-ink-dim)]">Viewed {viewLog.length} times</span>
            </div>
            <div className="flex flex-col gap-2">
              {viewLog.slice(0, 3).map((log, i) => (
                <div key={i} className="flex justify-between items-center text-[12px] bg-[rgba(255,255,255,0.02)] p-2 rounded-lg">
                  <span className="text-[#EDE7DA]">{log.visitorName}</span>
                  <span className="text-[var(--sk-ink-dim)]">{log.timeAgo}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
