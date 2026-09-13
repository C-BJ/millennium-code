import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  digitalZoom: number;
  zoomValue: number;
  zoomMin: number;
  zoomMax: number;
  onZoomChange: (value: number) => void;
}

interface TouchPoint { x: number; y: number }

function distance(points: TouchPoint[]): number {
  const [first, second] = points;
  return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : 0;
}

export function CameraView({ videoRef, digitalZoom, zoomValue, zoomMin, zoomMax, onZoomChange }: CameraViewProps) {
  const pointersRef = useRef(new Map<number, TouchPoint>());
  const pinchStartRef = useRef<{ distance: number; zoom: number } | null>(null);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size === 2) {
      pinchStartRef.current = { distance: distance([...pointersRef.current.values()]), zoom: zoomValue };
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pinchStart = pinchStartRef.current;
    if (pointersRef.current.size !== 2 || !pinchStart || pinchStart.distance <= 0) return;
    event.preventDefault();
    const nextZoom = pinchStart.zoom * distance([...pointersRef.current.values()]) / pinchStart.distance;
    onZoomChange(Math.min(zoomMax, Math.max(zoomMin, nextZoom)));
  };

  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) pinchStartRef.current = null;
  };

  return (
    <div
      className="camera-stage"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
    >
      <video
        ref={videoRef}
        className="camera-video"
        style={{ transform: `scale(${digitalZoom})` }}
        autoPlay
        muted
        playsInline
        aria-label="实时摄像头画面，可双指缩放"
      />
    </div>
  );
}
