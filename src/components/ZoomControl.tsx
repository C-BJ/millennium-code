import type { CameraZoomState } from '../hooks/useCamera';

interface ZoomControlProps {
  zoom: CameraZoomState;
  onChange: (value: number) => void;
}

export function ZoomControl({ zoom, onChange }: ZoomControlProps) {
  const buttonStep = Math.max(zoom.step, (zoom.max - zoom.min) / 20);
  const update = (value: number) => onChange(Math.min(zoom.max, Math.max(zoom.min, value)));

  return (
    <div className="zoom-control" aria-label="摄像头缩放控制">
      <div className="zoom-control-row">
        <button type="button" onClick={() => update(zoom.value - buttonStep)} aria-label="缩小画面">−</button>
        <input
          type="range"
          min={zoom.min}
          max={zoom.max}
          step={zoom.step}
          value={zoom.value}
          onChange={(event) => update(event.currentTarget.valueAsNumber)}
          aria-label="调整摄像头缩放倍率"
        />
        <button type="button" onClick={() => update(zoom.value + buttonStep)} aria-label="放大画面">＋</button>
        <output>{zoom.value.toFixed(1)}×</output>
      </div>
      <small>{zoom.mode === 'hardware' ? '镜头变焦' : '数字变焦'} · 支持双指缩放</small>
    </div>
  );
}
