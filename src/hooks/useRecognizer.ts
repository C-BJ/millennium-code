import { useCallback, useEffect, useRef, useState } from 'react';
import { visionConfig } from '../config/visionConfig';
import { monuments } from '../data/monuments';
import type { RecognitionDebug, RecognitionResult } from '../types/monument';
import type { OpenCv } from '../vision/opencvTypes';
import { recognizeCanvas } from '../vision/recognizer';
import type { ReferenceFeatures } from '../vision/referenceCache';

interface Options {
  active: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cv?: OpenCv;
  references: ReferenceFeatures[];
  digitalZoom: number;
}

function processingSize(video: HTMLVideoElement, digitalZoom: number): { width: number; height: number } {
  const sourceWidth = video.videoWidth / digitalZoom;
  const sourceHeight = video.videoHeight / digitalZoom;
  const scale = Math.min(visionConfig.frameWidth / sourceWidth, visionConfig.frameHeight / sourceHeight, 1);
  return { width: Math.max(1, Math.round(sourceWidth * scale)), height: Math.max(1, Math.round(sourceHeight * scale)) };
}

export function useRecognizer({ active, videoRef, cv, references, digitalZoom }: Options) {
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const busyRef = useRef(false);
  const resultRef = useRef<RecognitionResult | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [debug, setDebug] = useState<RecognitionDebug>({ frameKeypoints: 0, detectionMs: 0, targets: [] });
  const [hasScanned, setHasScanned] = useState(false);

  const reset = useCallback(() => {
    resultRef.current = null;
    setResult(null);
    setHasScanned(false);
  }, []);

  useEffect(() => {
    if (!active || !cv || references.length === 0 || visionConfig.demoMode) return;
    let cancelled = false;
    let timeoutId: number | undefined;

    const detect = () => {
      const interval = resultRef.current ? visionConfig.recognizedIntervalMs : visionConfig.detectIntervalMs;
      timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        const video = videoRef.current;
        if (busyRef.current || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) {
          detect();
          return;
        }
        busyRef.current = true;
        try {
          const canvas = captureCanvasRef.current ?? document.createElement('canvas');
          captureCanvasRef.current = canvas;
          const size = processingSize(video, digitalZoom);
          canvas.width = size.width;
          canvas.height = size.height;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          if (!context) throw new Error('Canvas 2D context 不可用');
          // 数字缩放时，Canvas 必须裁取和 CSS 放大后屏幕上完全相同的中心区域。
          // 否则 OpenCV 看到的是整张原始画面，Homography 四边形会与用户看到的碑刻错位。
          const sourceWidth = video.videoWidth / digitalZoom;
          const sourceHeight = video.videoHeight / digitalZoom;
          const sourceX = (video.videoWidth - sourceWidth) / 2;
          const sourceY = (video.videoHeight - sourceHeight) / 2;
          context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, size.width, size.height);
          const output = recognizeCanvas(cv, canvas, references);
          if (!cancelled) {
            setDebug(output.debug);
            setHasScanned(true);
            if (output.result && !resultRef.current) {
              resultRef.current = output.result;
              setResult(output.result);
            }
          }
        } catch (error) {
          if (import.meta.env.DEV) console.error('Recognition pass failed:', error);
        } finally {
          busyRef.current = false;
          if (!cancelled) detect();
        }
      }, interval);
    };
    detect();
    return () => { cancelled = true; if (timeoutId) window.clearTimeout(timeoutId); busyRef.current = false; };
  }, [active, cv, references, videoRef, digitalZoom]);

  // 拍摄用保险模式完全绕过 OpenCV 分支，避免改变真实算法及其调参数据。
  useEffect(() => {
    if (!active || !visionConfig.demoMode || resultRef.current) return;
    const timer = window.setTimeout(() => {
      const video = videoRef.current;
      const monument = monuments.find((item) => item.id === visionConfig.demoTargetId) ?? monuments[0];
      if (!video || !monument) return;
      const frameSize = { width: 640, height: 480 };
      const simulated: RecognitionResult = {
        monument,
        frameSize,
        corners: [{ x: 110, y: 60 }, { x: 530, y: 75 }, { x: 510, y: 420 }, { x: 125, y: 405 }],
        metrics: { monumentId: monument.id, goodMatches: 42, inliers: 34, inlierRatio: 0.81, score: 102.8, accepted: true },
      };
      resultRef.current = simulated;
      setResult(simulated);
      setHasScanned(true);
      setDebug({ frameKeypoints: 684, detectionMs: 28, bestTargetId: monument.id, targets: [simulated.metrics] });
    }, visionConfig.demoDelayMs);
    return () => window.clearTimeout(timer);
  }, [active, videoRef]);

  return { result, debug, hasScanned, reset };
}
