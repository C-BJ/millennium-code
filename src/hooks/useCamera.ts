import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'idle' | 'requesting' | 'ready' | 'denied' | 'unavailable' | 'error';

function classifyCameraError(error: unknown): CameraStatus {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') return 'denied';
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') return 'unavailable';
  }
  return 'error';
}

export function useCamera(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>();

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus('idle');
  }, [videoRef]);

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
  }, [stop, videoRef]);

  useEffect(() => stop, [stop]);
  return { status, errorMessage, start, stop };
}
