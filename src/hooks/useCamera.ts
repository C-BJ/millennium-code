import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'idle' | 'requesting' | 'ready' | 'denied' | 'unavailable' | 'error';

export type CameraZoomMode = 'hardware' | 'digital';

export interface CameraZoomState {
  value: number;
  min: number;
  max: number;
  step: number;
  mode: CameraZoomMode;
}

interface ZoomCapability {
  min: number;
  max: number;
  step?: number;
}

const defaultZoom: CameraZoomState = { value: 1, min: 1, max: 4, step: 0.1, mode: 'digital' };

function clampZoom(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function classifyCameraError(error: unknown): CameraStatus {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') return 'denied';
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') return 'unavailable';
  }
  return 'error';
}

export function useCamera(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const streamRef = useRef<MediaStream | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const zoomRef = useRef<CameraZoomState>(defaultZoom);
  const zoomRequestRef = useRef(0);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [zoom, setZoomState] = useState<CameraZoomState>(defaultZoom);

  const updateZoomState = useCallback((nextZoom: CameraZoomState) => {
    zoomRef.current = nextZoom;
    setZoomState(nextZoom);
  }, []);

  const stop = useCallback(() => {
    zoomRequestRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    videoTrackRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    updateZoomState(defaultZoom);
    setStatus('idle');
  }, [updateZoomState, videoRef]);

  const setZoom = useCallback((requestedValue: number) => {
    const current = zoomRef.current;
    const value = clampZoom(requestedValue, current.min, current.max);
    updateZoomState({ ...current, value });

    if (current.mode === 'hardware') {
      const track = videoTrackRef.current;
      if (track) {
        const requestId = ++zoomRequestRef.current;
        // zoom 尚未进入所有浏览器的 TypeScript DOM 类型，但支持它的移动浏览器
        // 会通过 MediaStreamTrack.applyConstraints 将变焦交给真实摄像头完成。
        const zoomConstraint = { zoom: value } as MediaTrackConstraintSet;
        void track.applyConstraints({ advanced: [zoomConstraint] }).catch(() => {
          if (requestId !== zoomRequestRef.current || track !== videoTrackRef.current) return;
          // 某些浏览器会报告 zoom capability，却拒绝动态应用约束。
          // 此时无缝切换到数字缩放，用户仍可继续捏合和拖动滑块。
          updateZoomState({ ...defaultZoom, value: clampZoom(value, defaultZoom.min, defaultZoom.max) });
        });
      }
    }
  }, [updateZoomState]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable');
      setErrorMessage('当前浏览器不支持摄像头 API。');
      return;
    }
    stop();
    setStatus('requesting');
    setErrorMessage(undefined);
    const preferred: MediaStreamConstraints = {
      audio: false,
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
    };
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(preferred);
      } catch (preferredError) {
        if (preferredError instanceof DOMException && preferredError.name === 'NotAllowedError') throw preferredError;
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      }
      streamRef.current = stream;
      const videoTrack = stream.getVideoTracks()[0] ?? null;
      videoTrackRef.current = videoTrack;

      if (videoTrack && typeof videoTrack.getCapabilities === 'function') {
        const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & { zoom?: ZoomCapability };
        const hardwareZoom = capabilities.zoom;
        if (hardwareZoom && Number.isFinite(hardwareZoom.min) && Number.isFinite(hardwareZoom.max) && hardwareZoom.max > hardwareZoom.min) {
          const settings = videoTrack.getSettings() as MediaTrackSettings & { zoom?: number };
          const value = clampZoom(settings.zoom ?? hardwareZoom.min, hardwareZoom.min, hardwareZoom.max);
          updateZoomState({
            value,
            min: hardwareZoom.min,
            max: hardwareZoom.max,
            step: hardwareZoom.step && hardwareZoom.step > 0 ? hardwareZoom.step : 0.1,
            mode: 'hardware',
          });
        } else {
          updateZoomState(defaultZoom);
        }
      } else {
        updateZoomState(defaultZoom);
      }

      const video = videoRef.current;
      if (!video) { stream.getTracks().forEach((track) => track.stop()); return; }
      video.srcObject = stream;
      await video.play();
      setStatus('ready');
    } catch (error) {
      const classified = classifyCameraError(error);
      setStatus(classified);
      setErrorMessage(classified === 'denied' ? '摄像头权限被拒绝，请在浏览器设置中允许后重试。' : '无法启动摄像头，请确认设备和浏览器权限。');
    }
  }, [stop, updateZoomState, videoRef]);

  useEffect(() => stop, [stop]);
  return { status, errorMessage, start, stop, zoom, setZoom };
}
