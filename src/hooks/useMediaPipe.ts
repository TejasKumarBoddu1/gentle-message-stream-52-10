
import { useEffect, useRef, useState, RefObject } from "react";
import { FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import { initializeFaceDetection } from "@/utils/mediapipe/faceDetection";
import { initializeHandDetection } from "@/utils/mediapipe/handDetection";
import { initializePoseDetection } from "@/utils/mediapipe/poseDetection";
import { isFacingForward, isBadPosture } from "@/utils/mediapipe/analytics";
import { drawHandLandmarks, drawFaceMeshLandmarks, drawPoseLandmarkers } from "@/lib/mediapipe/drawing";

export const useMediapipe = (
  videoRef: RefObject<HTMLVideoElement>,
  canvasRef: RefObject<HTMLCanvasElement>,
  overlayEnabled: boolean
) => {
  const [handPresence, setHandPresence] = useState(false);
  const [facePresence, setFacePresence] = useState(false);
  const [posePresence, setPosePresence] = useState(false);
  
  const [handDetectionCounter, setHandDetectionCounter] = useState(0);
  const [handDetectionDuration, setHandDetectionDuration] = useState(0);
  const [notFacingCounter, setNotFacingCounter] = useState(0);
  const [notFacingDuration, setNotFacingDuration] = useState(0);
  const [badPostureDetectionCounter, setBadPostureDetectionCounter] = useState(0);
  const [badPostureDuration, setBadPostureDuration] = useState(0);

  const isHandOnScreenRef = useRef(false);
  const notFacingRef = useRef(false);
  const hasBadPostureRef = useRef(false);

  const handDetectionStartTimeRef = useRef<number | null>(null);
  const notFacingStartTimeRef = useRef<number | null>(null);
  const badPostureStartTimeRef = useRef<number | null>(null);

  const faceLandmarkerRef = useRef<any>(null);
  const handLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        faceLandmarkerRef.current = await initializeFaceDetection(vision);
        handLandmarkerRef.current = await initializeHandDetection(vision);
        poseLandmarkerRef.current = await initializePoseDetection(vision);

        startDetection();
      } catch (error) {
        console.error("Failed to initialize MediaPipe:", error);
      }
    };

    initializeMediaPipe();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startDetection = () => {
    const detect = () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx && video.readyState >= 2) {
          const currentTime = performance.now();
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Face detection
          if (faceLandmarkerRef.current) {
            const faceResults = faceLandmarkerRef.current.detectForVideo(video, currentTime);
            const hasFace = faceResults.faceLandmarks.length > 0;
            setFacePresence(hasFace);

            if (hasFace && overlayEnabled) {
              const landmarks = faceResults.faceLandmarks[0];
              const drawingUtils = new DrawingUtils(ctx);
              drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 1 });

              const facingForward = isFacingForward(landmarks);
              
              if (!facingForward && !notFacingRef.current) {
                notFacingRef.current = true;
                notFacingStartTimeRef.current = Date.now();
                setNotFacingCounter(prev => prev + 1);
              } else if (facingForward && notFacingRef.current) {
                notFacingRef.current = false;
                if (notFacingStartTimeRef.current) {
                  const duration = (Date.now() - notFacingStartTimeRef.current) / 1000;
                  setNotFacingDuration(prev => prev + duration);
                  notFacingStartTimeRef.current = null;
                }
              }
            }
          }

          // Hand detection
          if (handLandmarkerRef.current) {
            const handResults = handLandmarkerRef.current.detectForVideo(video, currentTime);
            const hasHands = handResults.landmarks.length > 0;
            setHandPresence(hasHands);
            
            if (hasHands && !isHandOnScreenRef.current) {
              isHandOnScreenRef.current = true;
              handDetectionStartTimeRef.current = Date.now();
              setHandDetectionCounter(prev => prev + 1);
            } else if (!hasHands && isHandOnScreenRef.current) {
              isHandOnScreenRef.current = false;
              if (handDetectionStartTimeRef.current) {
                const duration = (Date.now() - handDetectionStartTimeRef.current) / 1000;
                setHandDetectionDuration(prev => prev + duration);
                handDetectionStartTimeRef.current = null;
              }
            }

            if (hasHands && overlayEnabled) {
              drawHandLandmarks(canvas, handResults.landmarks);
            }
          }

          // Pose detection
          if (poseLandmarkerRef.current) {
            const poseResults = poseLandmarkerRef.current.detectForVideo(video, currentTime);
            const hasPose = poseResults.landmarks.length > 0;
            setPosePresence(hasPose);

            if (hasPose && overlayEnabled) {
              const landmarks = poseResults.landmarks[0];
              drawPoseLandmarkers(canvas, poseResults.landmarks);

              const badPosture = isBadPosture(landmarks);
              
              if (badPosture && !hasBadPostureRef.current) {
                hasBadPostureRef.current = true;
                badPostureStartTimeRef.current = Date.now();
                setBadPostureDetectionCounter(prev => prev + 1);
              } else if (!badPosture && hasBadPostureRef.current) {
                hasBadPostureRef.current = false;
                if (badPostureStartTimeRef.current) {
                  const duration = (Date.now() - badPostureStartTimeRef.current) / 1000;
                  setBadPostureDuration(prev => prev + duration);
                  badPostureStartTimeRef.current = null;
                }
              }
            }
          }
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  };

  return {
    handPresence,
    facePresence,
    posePresence,
    handDetectionCounter,
    handDetectionDuration,
    notFacingCounter,
    notFacingDuration,
    badPostureDetectionCounter,
    badPostureDuration,
    isHandOnScreenRef,
    notFacingRef,
    hasBadPostureRef
  };
};
