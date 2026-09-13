import type { RefObject } from 'react';

interface CameraViewProps { videoRef: RefObject<HTMLVideoElement | null> }

export function CameraView({ videoRef }: CameraViewProps) {
  return (
    <video
      ref={videoRef}
      className="camera-video"
      autoPlay
      muted
      playsInline
      aria-label="实时摄像头画面"
    />
  );
}
