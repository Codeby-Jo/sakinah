import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { Camera, WarningCircle, CheckCircle, SpinnerGap } from '@phosphor-icons/react';

export type LivenessStep = 'START' | 'LOADING' | 'DETECT_FACE' | 'BLINK' | 'TURN_LEFT' | 'TURN_RIGHT' | 'LOOK_STRAIGHT' | 'CAPTURED';

interface Props {
  onSuccess: (file: File) => void;
  onError?: (err: string) => void;
}

export const LivenessVerification: React.FC<Props> = ({ onSuccess, onError }) => {
  const [step, setStep] = useState<LivenessStep>('START');
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const stepRef = useRef<LivenessStep>('START');
  useEffect(() => { stepRef.current = step; }, [step]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  const startVerification = async () => {
    // Show the video element immediately
    setStep('DETECT_FACE');

    // 1. Start camera instantly
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
      setErrorMsg('Camera permission denied');
      if (onError) onError('Camera permission denied');
      setStep('START');
      return;
    }

    // 2. Load model in background
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Model loading timed out')), 20000)
      );

      const loadPromise = async () => {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 2 
        });
        return landmarker;
      };

      const landmarker = await Promise.race([loadPromise(), timeoutPromise]) as FaceLandmarker;
      landmarkerRef.current = landmarker;
      
      // 3. Start detection loop
      detectFrame();
    } catch (err: any) {
      console.error('Failed to load liveness model:', err);
      setErrorMsg('Camera unavailable');
      if (onError) onError('Camera unavailable');
      setStep('START');
      stopCamera();
    }
  };

  let lastVideoTime = -1;
  const detectFrame = async () => {
    if (!videoRef.current || !landmarkerRef.current) return;
    
    // Stop loop if captured
    if (stepRef.current === 'CAPTURED' || stepRef.current === 'START' || stepRef.current === 'LOADING') return;

    if (videoRef.current.currentTime !== lastVideoTime) {
      lastVideoTime = videoRef.current.currentTime;
      const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
      
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        if (results.faceLandmarks.length > 1) {
          setErrorMsg('Multiple faces detected');
        } else {
          setErrorMsg(''); // Clear error
          const landmarks = results.faceLandmarks[0];
          const blendshapes = results.faceBlendshapes?.[0]?.categories;

          const nose = landmarks[1];
          const leftEar = landmarks[234];
          const rightEar = landmarks[454];

          // Distances (assumes non-mirrored landmarks relative to image, but video is mirrored by CSS usually. MediaPipe operates on the raw video frame)
          const dLeft = Math.abs(nose.x - leftEar.x);
          const dRight = Math.abs(rightEar.x - nose.x);
          const ratio = dLeft / dRight;

          const blinkLeft = blendshapes?.find(b => b.categoryName === 'eyeBlinkLeft')?.score || 0;
          const blinkRight = blendshapes?.find(b => b.categoryName === 'eyeBlinkRight')?.score || 0;
          const isBlinking = blinkLeft > 0.4 && blinkRight > 0.4;

          const isLookingLeft = ratio < 0.55; // Nose closer to left ear
          const isLookingRight = ratio > 1.8; // Nose closer to right ear
          const isLookingStraight = ratio > 0.7 && ratio < 1.4;

          const current = stepRef.current;
          
          if (current === 'DETECT_FACE') {
            if (isLookingStraight) setStep('BLINK');
          } else if (current === 'BLINK') {
            if (isBlinking) setStep('TURN_LEFT');
          } else if (current === 'TURN_LEFT') {
            if (isLookingLeft) setStep('TURN_RIGHT');
          } else if (current === 'TURN_RIGHT') {
            if (isLookingRight) setStep('LOOK_STRAIGHT');
          } else if (current === 'LOOK_STRAIGHT') {
            if (isLookingStraight) {
              setStep('CAPTURED');
              captureFaceImage();
              return; // Stop detection
            }
          }
        }
      } else {
        setErrorMsg('Face not detected');
      }
    }
    requestRef.current = requestAnimationFrame(detectFrame);
  };

  const captureFaceImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Flip horizontally because we visually mirror the video
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'liveness_capture.jpg', { type: 'image/jpeg' });
          onSuccess(file);
          // Don't stop camera here to keep "captured" preview alive if we want, or stop it
          // The prompt says "Camera must remain active during verification. Do not stop camera automatically."
          // But after verification success? We can stop it or freeze it.
          // Let's stop the stream to freeze the last frame and save resources.
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const getInstructionText = () => {
    switch (step) {
      case 'DETECT_FACE': return 'Center your face inside the frame';
      case 'BLINK': return 'Please blink your eyes';
      case 'TURN_LEFT': return 'Turn your head to the left';
      case 'TURN_RIGHT': return 'Turn your head to the right';
      case 'LOOK_STRAIGHT': return 'Look directly at the camera';
      case 'CAPTURED': return 'Liveness Verification Successful';
      default: return '';
    }
  };

  const getErrorHelpText = () => {
    if (errorMsg) return errorMsg;
    switch (step) {
      case 'BLINK': return 'Blink not detected';
      case 'TURN_LEFT': return 'Left movement not detected';
      case 'TURN_RIGHT': return 'Right movement not detected';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {step === 'START' && (
        <div className="flex flex-col items-center justify-center p-8 bg-[#050816]/80 border border-[#D4AF37]/30 rounded-[20px]">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4">
            <Camera size={32} className="text-[#D4AF37]" weight="duotone" />
          </div>
          <h4 className="text-white text-lg font-medium mb-2">Live Liveness Verification</h4>
          <p className="text-sm text-white/60 text-center mb-6 max-w-sm">
            We need to verify you are a real person. You will be asked to perform simple actions like blinking or turning your head.
          </p>
          <button
            onClick={startVerification}
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

      {step === 'LOADING' && (
        <div className="flex flex-col items-center justify-center p-10 bg-[#050816]/80 border border-[#D4AF37]/30 rounded-[20px]">
          <SpinnerGap className="animate-spin text-[#D4AF37] mb-4" size={40} />
          <p className="text-[#F5D77A] font-medium tracking-wide">Initializing Camera & Models...</p>
        </div>
      )}

      {step !== 'START' && step !== 'LOADING' && (
        <div className="relative overflow-hidden rounded-[24px] border-2 border-[#D4AF37]/40 bg-black aspect-video sm:aspect-[4/3] md:aspect-video flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.15)]">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-500 ${step === 'CAPTURED' ? 'opacity-50 grayscale' : 'opacity-100'} scale-x-[-1]`}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Overlay UI */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6 pointer-events-none">
            {/* Top Bar */}
            <div className="flex justify-between items-start w-full">
              <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={step}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-[#F5D77A] font-semibold text-sm tracking-wide"
                  >
                    {getInstructionText()}
                  </motion.p>
                </AnimatePresence>
              </div>
              
              {step === 'CAPTURED' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-[#4BB543]/20 backdrop-blur-md p-2 rounded-full border border-[#4BB543]/50">
                  <CheckCircle size={28} weight="fill" className="text-[#4BB543]" />
                </motion.div>
              )}
            </div>

            {/* Error / Helper Text */}
            <AnimatePresence>
              {step !== 'CAPTURED' && (errorMsg || step !== 'DETECT_FACE') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-500/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-red-400 self-center max-w-sm text-center shadow-lg"
                >
                  <p className="text-white text-[13px] font-medium flex items-center justify-center gap-2">
                    <WarningCircle size={18} weight="bold" />
                    {getErrorHelpText()}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Outline guide */}
            {step !== 'CAPTURED' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-64 border-2 border-dashed border-[#F5D77A]/50 rounded-[40%] opacity-50" />
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Progress Dots */}
      {step !== 'START' && step !== 'LOADING' && (
        <div className="flex items-center justify-center gap-2 mt-2">
          {['DETECT_FACE', 'BLINK', 'TURN_LEFT', 'TURN_RIGHT', 'LOOK_STRAIGHT'].map((s, idx) => {
            const steps = ['DETECT_FACE', 'BLINK', 'TURN_LEFT', 'TURN_RIGHT', 'LOOK_STRAIGHT'];
            const currentIndex = step === 'CAPTURED' ? 99 : steps.indexOf(step as any);
            const isCompleted = currentIndex > idx;
            const isCurrent = currentIndex === idx;
            return (
              <motion.div
                key={s}
                className={`h-1.5 rounded-full ${isCompleted ? 'bg-[#4BB543]' : isCurrent ? 'bg-[#F5D77A]' : 'bg-white/10'}`}
                animate={{ width: isCurrent ? 24 : 8 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LivenessVerification;
