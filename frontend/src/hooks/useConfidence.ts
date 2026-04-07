import { useState, useCallback, useRef, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import type { ConfidenceMetrics } from '../types';

interface UseConfidenceReturn {
  metrics: ConfidenceMetrics;
  isActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  error: string | null;
}

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

export function useConfidence(): UseConfidenceReturn {
  const [metrics, setMetrics] = useState<ConfidenceMetrics>({
    eyeContact: 0,
    posture: 0,
    focus: 0,
    calm: 0,
    overall: 0,
  });
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const modelsLoadedRef = useRef(false);
  const prevBoxRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const jitterHistoryRef = useRef<number[]>([]);
  const expressionHistoryRef = useRef<number[]>([]);

  const loadModels = async () => {
    if (modelsLoadedRef.current) return true;
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      modelsLoadedRef.current = true;
      return true;
    } catch (err) {
      console.error('Failed to load FaceAPI models:', err);
      return false;
    }
  };

  const startTracking = useCallback(async () => {
    try {
      const ok = await loadModels();
      if (!ok) {
        setError('Failed to load face detection models.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn("Autoplay prevented:", e);
        }
      }

      setIsActive(true);
      setError(null);

      // Wait a tick for video to stabilize
      await new Promise(r => setTimeout(r, 600));

      intervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;

        const result = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.35 }))
          .withFaceLandmarks(true)
          .withFaceExpressions();

        if (!result) {
          setError('No face detected — look directly at camera');
          setMetrics({ eyeContact: 0, posture: 0, focus: 0, calm: 0, overall: 0 });
          prevBoxRef.current = null;
          return;
        }

        setError(null);

        const { detection, landmarks, expressions } = result;
        const box = detection.box;
        const vw = videoRef.current.videoWidth || 640;
        const vh = videoRef.current.videoHeight || 480;

        // ═══════════════════════════════════════════════════
        // 1) EYE CONTACT — Iris centering via landmark points
        // ═══════════════════════════════════════════════════
        const leftEye = landmarks.getLeftEye();   // 6 landmark points
        const rightEye = landmarks.getRightEye();  // 6 landmark points

        const getIrisCenteredness = (eyePoints: faceapi.Point[]) => {
          // Compute the bounding box of the eye
          const xs = eyePoints.map(p => p.x);
          const ys = eyePoints.map(p => p.y);
          const eyeLeft = Math.min(...xs);
          const eyeRight = Math.max(...xs);
          const eyeTop = Math.min(...ys);
          const eyeBottom = Math.max(...ys);

          const eyeW = eyeRight - eyeLeft;
          const eyeH = eyeBottom - eyeTop;

          // Aspect ratio — closed eyes squish to near-zero height
          const aspect = eyeH / (eyeW || 1);
          if (aspect < 0.15) return 0; // Eyes closed

          // Centroid of all 6 points (approximates iris position)
          const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
          const cy = ys.reduce((a, b) => a + b, 0) / ys.length;

          // How far is the centroid from the geometric center of the eye box?
          const idealCx = (eyeLeft + eyeRight) / 2;
          const idealCy = (eyeTop + eyeBottom) / 2;

          const deviationX = Math.abs(cx - idealCx) / (eyeW / 2);
          const deviationY = Math.abs(cy - idealCy) / (eyeH / 2);

          return Math.max(0, 100 - (deviationX * 60 + deviationY * 40));
        };

        const leftScore = getIrisCenteredness(leftEye);
        const rightScore = getIrisCenteredness(rightEye);
        let eyeContact = Math.round((leftScore + rightScore) / 2);

        // Penalize if face center is far from frame center (looking away entirely)
        const faceCX = box.x + box.width / 2;
        const faceCY = box.y + box.height / 2;
        const offX = Math.abs(faceCX - vw / 2) / (vw / 2);
        const offY = Math.abs(faceCY - vh / 2) / (vh / 2);
        eyeContact = Math.round(eyeContact * (1 - offX * 0.5) * (1 - offY * 0.3));
        eyeContact = Math.max(0, Math.min(100, eyeContact));

        // ═══════════════════════════════════════════════════
        // 2) POSTURE — Head tilt, face size, vertical position
        // ═══════════════════════════════════════════════════
        const nose = landmarks.getNose();
        const jaw = landmarks.getJawOutline();

        // Head tilt angle from jaw endpoints
        const jawLeft = jaw[0];
        const jawRight = jaw[jaw.length - 1];
        const tiltAngle = Math.abs(Math.atan2(jawRight.y - jawLeft.y, jawRight.x - jawLeft.x) * (180 / Math.PI));

        // Face area ratio (ideal: 8-25% of frame)
        const faceArea = (box.width * box.height) / (vw * vh);

        // Vertical centering (face should be in upper-center third)
        const idealY = vh * 0.38;
        const verticalDev = Math.abs(faceCY - idealY) / (vh / 2);

        let postureScore = 100;

        // Tilt penalty (0° is perfect, penalize beyond 5°)
        postureScore -= Math.max(0, (tiltAngle - 5)) * 4;

        // Distance penalty  
        if (faceArea < 0.06) postureScore -= (0.06 - faceArea) * 800;   // too far / slouching
        if (faceArea > 0.30) postureScore -= (faceArea - 0.30) * 500;   // too close

        // Vertical position penalty
        postureScore -= verticalDev * 30;

        // Nose tip deviation from face center (leaning)
        const noseTip = nose[3]; // tip of nose
        const faceIdealCx = box.x + box.width / 2;
        const noseDev = Math.abs(noseTip.x - faceIdealCx) / (box.width / 2);
        postureScore -= noseDev * 25;

        postureScore = Math.max(0, Math.min(100, Math.round(postureScore)));

        // ═══════════════════════════════════════════════════
        // 3) FOCUS — Temporal stability (how still are you?)
        // ═══════════════════════════════════════════════════
        let focusScore = 85;
        const currentBox = { x: box.x, y: box.y, w: box.width, h: box.height };

        if (prevBoxRef.current) {
          const dx = Math.abs(currentBox.x - prevBoxRef.current.x);
          const dy = Math.abs(currentBox.y - prevBoxRef.current.y);
          const dw = Math.abs(currentBox.w - prevBoxRef.current.w);
          const jitter = dx + dy + dw;

          // Keep a rolling window of the last 10 jitter values
          jitterHistoryRef.current.push(jitter);
          if (jitterHistoryRef.current.length > 10) jitterHistoryRef.current.shift();

          const avgJitter = jitterHistoryRef.current.reduce((a, b) => a + b, 0) / jitterHistoryRef.current.length;

          // Scale: 0 jitter = 100%, 50+ pixels avg jitter = 0%
          focusScore = Math.max(0, Math.min(100, Math.round(100 - avgJitter * 2)));
        }
        prevBoxRef.current = currentBox;

        // ═══════════════════════════════════════════════════
        // 4) CALMNESS — Micro-expression analysis
        // ═══════════════════════════════════════════════════
        const { angry, disgusted, fearful, sad, surprised, neutral, happy } = expressions;

        // Negative expressions reduce calmness
        const negativeSum = (angry || 0) + (disgusted || 0) + (fearful || 0) + (sad || 0);
        const nervousSum = (surprised || 0) * 0.5;
        const positiveSum = (neutral || 0) * 1.0 + (happy || 0) * 0.8;

        let calmScore = Math.round((positiveSum - negativeSum - nervousSum) * 100);

        // Keep a rolling average for smoothness
        expressionHistoryRef.current.push(calmScore);
        if (expressionHistoryRef.current.length > 8) expressionHistoryRef.current.shift();
        calmScore = Math.round(expressionHistoryRef.current.reduce((a, b) => a + b, 0) / expressionHistoryRef.current.length);
        calmScore = Math.max(0, Math.min(100, calmScore));

        // ═══════════════════════════════════════════════════
        // OVERALL — Weighted composite
        // ═══════════════════════════════════════════════════
        const overall = Math.round(
          eyeContact * 0.30 +
          postureScore * 0.25 +
          focusScore * 0.25 +
          calmScore * 0.20
        );

        setMetrics({
          eyeContact,
          posture: postureScore,
          focus: focusScore,
          calm: calmScore,
          overall: Math.max(0, Math.min(100, overall)),
        });

      }, 400); // 2.5 FPS analysis

    } catch (err) {
      setError('Camera access denied or unavailable.');
      setMetrics({ eyeContact: 0, posture: 0, focus: 0, calm: 0, overall: 0 });
    }
  }, []);

  const stopTracking = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
  }, []);

  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  // Sync the active stream to the video element if it gets swapped/remounted
  useEffect(() => {
    if (videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  });

  return { metrics, isActive, videoRef, startTracking, stopTracking, error };
}
