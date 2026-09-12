import type { RecognitionDebug } from '../types/monument';

export function DebugPanel({ debug }: { debug: RecognitionDebug }) {
  if (!import.meta.env.DEV) return null;
  return <details className="debug-panel"><summary>DEV · Vision telemetry</summary><div className="debug-grid">
    <span>检测耗时</span><b>{debug.detectionMs.toFixed(1)} ms</b><span>约合周期</span><b>{(debug.detectionMs + 320).toFixed(0)} ms</b>
    <span>当前特征点</span><b>{debug.frameKeypoints}</b><span>最佳目标</span><b>{debug.bestTargetId ?? '—'}</b>
  </div>{debug.targets.map((target) => <div className="debug-target" key={target.monumentId}>
    <strong>{target.monumentId}</strong><span>good {target.goodMatches}</span><span>inliers {target.inliers}</span><span>ratio {(target.inlierRatio * 100).toFixed(0)}%</span><span>score {target.score.toFixed(1)}</span><em>{target.accepted ? 'PASS' : target.rejectionReason}</em>
  </div>)}</details>;
}
