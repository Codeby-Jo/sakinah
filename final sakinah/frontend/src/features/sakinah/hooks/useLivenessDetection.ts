import { useState, useEffect, useRef, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export type LivenessState = {
  faceDetected: boolean;
  blinkDetected: boolean;
  turnLeftDetected: boolean;
  turnRightDetected: boolean;
  lookStraightDetected: boolean;
  faceCount: number;
};

const INITIAL_STATE: LivenessState = {
  faceDetected: false,
  blinkDetected: false,
  turnLeftDetected: false,
  turnRightDetected: false,
  lookStraightDetected: false,
  faceCount: 0,
};

export const useLivenessDetection = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [livenessState, setLivenessState] = useState<LivenessState>(INITIAL_STATE);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);

  // We use refs for state to access latest inside the loop without re-triggering dependencies
  const stateRef = useRef<LivenessState>(INITIAL_STATE);
  
  // Track consecutive successful straight looks to ensure stability
  const straightLookFramesRef = useRef(0);

  const updateState = (updates: Partial<LivenessState>) => {
    stateRef.current = { ...stateRef.current, ...updates };
    setLivenessState({ ...stateRef.current });
  };

  const getHeadRotation = (matrix: number[]) => {
    // MediaPipe transformation matrix is 4x4 column-major 16-element array
    const m00 = matrix[0], m10 = matrix[1], m20 = matrix[2];
    const m11 = matrix[5], m21 = matrix[6];
    const m12 = matrix[9], m22 = matrix[10];

    const sy = Math.sqrt(m00 * m00 + m10 * m10);
    const singular = sy < 1e-6;

    let x, y, z;
    if (!singular) {
      x = Math.atan2(m21, m22); // pitch (up/down)
      y = Math.atan2(-m20, sy); // yaw (left/right)
      z = Math.atan2(m10, m00); // roll (tilt)
    } else {
      x = Math.atan2(-m12, m11);
      y = Math.atan2(-m20, sy);
      z = 0;
    }
    
    return {
      pitch: (x * 180) / Math.PI,
      yaw: (y * 180) / Math.PI,
      roll: (z * 180) / Math.PI
    };
  };

  const initModel = async () => {
    try {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      
      const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode: "VIDEO",
        numFaces: 2
      });

      faceLandmarkerRef.current = faceLandmarker;
      setIsModelLoaded(true);
    } catch (err: any) {
      console.error("Failed to load FaceLandmarker:", err);
      setError("Failed to load ML model for liveness verification.");
    }
  };

  const resetLiveness = useCallback(() => {
    stateRef.current = INITIAL_STATE;
    setLivenessState(INITIAL_STATE);
    straightLookFramesRef.current = 0;
  }, []);

  const processVideo = useCallback(() => {
    if (!videoRef.current || !faceLandmarkerRef.current) return;

    const video = videoRef.current;
    
    // Check if video has dimensions and is playing
    if (video.readyState >= 2 && video.videoWidth > 0) {
      let startTimeMs = performance.now();
      
      if (lastVideoTimeRef.current !== video.currentTime) {
        lastVideoTimeRef.current = video.currentTime;
        
        try {
          const results = faceLandmarkerRef.current.detectForVideo(video, startTimeMs);

          if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
            const currentFaceCount = results.faceBlendshapes.length;
            
            // FACE DETECTED
            if (!stateRef.current.faceDetected || stateRef.current.faceCount !== currentFaceCount) {
              updateState({ faceDetected: true, faceCount: currentFaceCount });
            }

            const blendshapes = results.faceBlendshapes[0].categories;
            const matrix = results.facialTransformationMatrixes?.[0]?.data;

            // BLINK DETECTION
            if (!stateRef.current.blinkDetected) {
              const leftBlink = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score || 0;
              const rightBlink = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score || 0;
              
              if (leftBlink > 0.4 || rightBlink > 0.4) {
                updateState({ blinkDetected: true });
              }
            }

            // HEAD POSE DETECTION
            if (matrix) {
              const { yaw, pitch } = getHeadRotation(Array.from(matrix));
              
              // Note: Yaw might be inverted based on camera mirroring.
              // We'll accept movement beyond 20 degrees in either direction as a turn.
              
              // Turn Left
              if (!stateRef.current.turnLeftDetected) {
                if (yaw > 20) {
                  updateState({ turnLeftDetected: true });
                }
              }
              
              // Turn Right
              if (stateRef.current.turnLeftDetected && !stateRef.current.turnRightDetected) {
                if (yaw < -20) {
                  updateState({ turnRightDetected: true });
                }
              }

              // Look Straight (only after turns are done)
              if (stateRef.current.turnLeftDetected && stateRef.current.turnRightDetected && !stateRef.current.lookStraightDetected) {
                // Must be looking straight (yaw near 0, pitch near 0) for a few consecutive frames to avoid false positives during movement
                if (Math.abs(yaw) < 10 && Math.abs(pitch) < 15) {
                  straightLookFramesRef.current += 1;
                  if (straightLookFramesRef.current > 5) {
                    updateState({ lookStraightDetected: true });
                  }
                } else {
                  straightLookFramesRef.current = 0;
                }
              }
            }

          } else {
            // NO FACE
            if (stateRef.current.faceDetected || stateRef.current.faceCount !== 0) {
              updateState({ faceDetected: false, faceCount: 0 });
            }
          }
        } catch (e) {
          console.error("Error during ML inference:", e);
        }
      }
    }

    // Continue loop if not complete
    if (!stateRef.current.lookStraightDetected) {
      requestRef.current = requestAnimationFrame(processVideo);
    }
  }, [videoRef]);

  // Start processing when model is loaded and video is available
  useEffect(() => {
    if (isModelLoaded && videoRef.current) {
      requestRef.current = requestAnimationFrame(processVideo);
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isModelLoaded, videoRef, processVideo]);

  // Initialize model on mount
  useEffect(() => {
    initModel();
    return () => {
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, []);

  const isComplete = 
    livenessState.faceDetected && 
    livenessState.blinkDetected && 
    livenessState.turnLeftDetected && 
    livenessState.turnRightDetected && 
    livenessState.lookStraightDetected;

  return {
    livenessState,
    isComplete,
    isModelLoaded,
    error,
    resetLiveness
  };
};
