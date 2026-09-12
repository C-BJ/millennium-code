import { useEffect, useRef } from 'react';
import type { RecognitionResult } from '../types/monument';

interface ScannerOverlayProps { result: RecognitionResult | null; scanning: boolean }

export function ScannerOverlay({ result, scanning }: ScannerOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const context = canvas.getContext('2d');
      if (!context) return;
      context.scale(dpr, dpr);
      context.clearRect(0, 0, rect.width, rect.height);
      if (!result) return;

      // video 使用 object-fit: cover；这里复现相同的缩放与裁切，使识别坐标和屏幕画面对齐。
      const scale = Math.max(rect.width / result.frameSize.width, rect.height / result.frameSize.height);
      const offsetX = (rect.width - result.frameSize.width * scale) / 2;
      const offsetY = (rect.height - result.frameSize.height * scale) / 2;
      const points = result.corners.map((point) => ({ x: point.x * scale + offsetX, y: point.y * scale + offsetY }));
      context.beginPath();
      context.moveTo(points[0]!.x, points[0]!.y);
      points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
      context.closePath();
      context.fillStyle = 'rgba(184, 64, 50, .09)';
      context.fill();
      context.strokeStyle = '#dfc487';
      context.lineWidth = 2;
      context.shadowColor = 'rgba(223, 196, 135, .7)';
      context.shadowBlur = 12;
      context.stroke();

      context.shadowBlur = 0;
      context.strokeStyle = '#f2e4b7';
      context.lineWidth = 4;
      points.forEach((point, index) => {
        const previous = points[(index + 3) % 4]!;
        const next = points[(index + 1) % 4]!;
        const toward = (other: { x: number; y: number }) => ({ x: point.x + (other.x - point.x) * 0.16, y: point.y + (other.y - point.y) * 0.16 });
        const a = toward(previous); const b = toward(next);
        context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(point.x, point.y); context.lineTo(b.x, b.y); context.stroke();
      });
    };
    render();
    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [result]);

  return (
    <div className="scanner-overlay" aria-hidden="true">
      <canvas ref={canvasRef} />
      {!result && <div className="target-reticle"><i/><i/><i/><i/><span>请将碑刻完整置于框内</span></div>}
      {scanning && !result && <div className="scan-line" />}
      {result && <div className="recognition-stamp"><span>识别完成</span><strong>{result.monument.name}</strong></div>}
    </div>
  );
}
