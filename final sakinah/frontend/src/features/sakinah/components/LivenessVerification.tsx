import React, { useEffect, useRef, useState } from 'react';
import { Camera, WarningCircle, CheckCircle, ArrowUUpLeft, SpinnerGap } from '@phosphor-icons/react';
import { useLivenessDetection } from '../hooks/useLivenessDetection';

export type LivenessStep = 'START' | 'CAMERA' | 'CAPTURED';

interface Props {
  onSuccess: (file: File) => void;
  onError?: (err: string) => void;
}

export const LivenessVerification: React.FC<Props> = ({ onSuccess, onError }) => {
  const [step, setStep] = useState<LivenessStep>('START');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { livenessState, isComplete, isModelLoaded, error: livenessError, resetLiveness } = useLivenessDetection(videoRef);

  useEffect(() => {
    if (livenessError) {
      setErrorMsg(livenessError);
      if (onError) onError(livenessError);
    }
  }, [livenessError, onError]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setErrorMsg('');
    resetLiveness();
    setStep('CAMERA');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
    } catch (err) {
      console.error('Camera permission denied', err);
      setErrorMsg('Camera permission denied. Please allow access.');
      if (onError) onError('Camera permission denied. Please allow access.');
      setStep('START');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageUrl);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'profile_capture.jpg', { type: 'image/jpeg' });
          setCapturedFile(file);
        }
      }, 'image/jpeg', 0.9);
      
      setStep('CAPTURED');
      stopCamera();
    }
  };

  useEffect(() => {
    if (isComplete && step === 'CAMERA') {
      // Small delay to let user realize they succeeded before capturing
      const t = setTimeout(() => {
        capturePhoto();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isComplete, step]);

  const retakePhoto = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedFile) {
      onSuccess(capturedFile);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {step === 'START' && (
        <div className="flex flex-col items-center justify-center p-8 bg-[#050816]/80 border border-[#D4AF37]/30 rounded-[20px]">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4">
            <Camera size={32} className="text-[#D4AF37]" weight="duotone" />
          </div>
          <h4 className="text-white text-lg font-medium mb-2">Liveness Verification</h4>
          <p className="text-sm text-white/60 text-center mb-6 max-w-sm">
            Please allow camera access. You will be asked to perform a few actions to verify you are a real person before your photo is automatically captured.
          </p>
          <button
            onClick={startCamera}
            className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#050816] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
          >
            Start Verification
          </button>
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex gap-2 items-center">
              <WarningCircle size={18} /> {errorMsg}
            </div>
          )}
        </div>
      )}

      {step === 'CAMERA' && (
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-[24px] border-2 border-[#D4AF37]/40 bg-black aspect-video sm:aspect-[4/3] md:aspect-video flex flex-col items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.15)] group">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {!isModelLoaded && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                <SpinnerGap className="animate-spin text-[#D4AF37] mb-2" size={32} />
                <p className="text-[#D4AF37] text-sm font-medium">Loading Liveness Model...</p>
              </div>
            )}
          </div>
          
          {/* Liveness Status UI */}
          {isModelLoaded && (
            <div className="bg-[#050816]/80 border border-[#D4AF37]/30 rounded-[16px] p-4 text-sm">
              <h4 className="text-[#F5D77A] font-medium mb-3 uppercase tracking-wider text-xs">Verification Steps</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs font-medium">
                <div className={`flex items-center gap-2 ${livenessState.faceDetected ? 'text-[#4BB543]' : 'text-white/40'}`}>
                  {livenessState.faceDetected ? <CheckCircle size={16} weight="fill" /> : <div className="w-4 h-4 rounded-full border border-white/40" />}
                  <span>Face visible</span>
                </div>
                <div className={`flex items-center gap-2 ${livenessState.blinkDetected ? 'text-[#4BB543]' : 'text-white/40'}`}>
                  {livenessState.blinkDetected ? <CheckCircle size={16} weight="fill" /> : <div className="w-4 h-4 rounded-full border border-white/40" />}
                  <span>Blink</span>
                </div>
                <div className={`flex items-center gap-2 ${livenessState.turnLeftDetected && livenessState.turnRightDetected ? 'text-[#4BB543]' : 'text-white/40'}`}>
                  {livenessState.turnLeftDetected && livenessState.turnRightDetected ? <CheckCircle size={16} weight="fill" /> : <div className="w-4 h-4 rounded-full border border-white/40" />}
                  <span>Turn L/R</span>
                </div>
                <div className={`flex items-center gap-2 ${livenessState.lookStraightDetected ? 'text-[#4BB543]' : 'text-white/40'}`}>
                  {livenessState.lookStraightDetected ? <CheckCircle size={16} weight="fill" /> : <div className="w-4 h-4 rounded-full border border-white/40" />}
                  <span>Look straight</span>
                </div>
              </div>
              <div className="mt-3 text-center text-[#D4AF37] font-semibold text-xs h-4">
                {isComplete ? 'Verification successful! Capturing...' : 'Please complete the steps above.'}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'CAPTURED' && capturedImage && (
        <div className="flex flex-col items-center gap-4">
          <div className="relative overflow-hidden rounded-[24px] border-2 border-[#4BB543]/40 bg-black aspect-video sm:aspect-[4/3] md:aspect-video flex items-center justify-center shadow-[0_0_30px_rgba(75,181,67,0.15)] w-full">
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            <div className="absolute top-4 right-4 bg-[#4BB543]/20 backdrop-blur-md p-2 rounded-full border border-[#4BB543]/50">
              <CheckCircle size={28} weight="fill" className="text-[#4BB543]" />
            </div>
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
               <span className="text-white text-xs font-semibold">Liveness Verified</span>
            </div>
          </div>
          
          <div className="flex gap-4 w-full max-w-sm">
            <button
              onClick={retakePhoto}
              className="flex-1 py-3 px-4 flex items-center justify-center gap-2 bg-[#050816] border border-[#D4AF37]/40 text-[#D4AF37] font-semibold rounded-xl hover:bg-[#D4AF37]/10 transition-colors"
            >
              <ArrowUUpLeft size={20} /> Retake
            </button>
            <button
              onClick={confirmPhoto}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#050816] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} weight="bold" /> Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivenessVerification;

