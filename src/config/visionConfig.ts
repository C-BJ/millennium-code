export const visionConfig = {
  // 最长边不超过 640、短边不超过 480，避免直接处理手机的 1080p/4K 帧。
  frameWidth: 640,
  frameHeight: 480,
  detectIntervalMs: 320,
  recognizedIntervalMs: 1_200,
  orbFeatures: 1_000,
  referenceMaxDimension: 900,
  ratioThreshold: 0.74,
  minReferenceKeypoints: 28,
  minFrameKeypoints: 35,
  minGoodMatches: 18,
  minInliers: 12,
  minInlierRatio: 0.52,
  ransacReprojectionThreshold: 4.0,
  minProjectedAreaRatio: 0.018,
  maxProjectedAreaRatio: 0.92,
  minProjectedEdgePx: 24,
  maxCornerOverflowRatio: 0.18,
  demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
  demoDelayMs: 1_600,
  demoTargetId: import.meta.env.VITE_DEMO_TARGET ?? 'millennium-echo',
} as const;

/**
 * 调参顺序建议：
 * 1. 光线变化大、漏检：先把 ratioThreshold 提到 0.78，或把 minGoodMatches 降到 14～16。
 * 2. 误识别：先把 minInliers 提到 15～20，再把 minInlierRatio 提到 0.6。
 * 3. 框的位置飘：减小 ransacReprojectionThreshold（例如 3），不要只增加 goodMatches。
 * 4. 小目标识别不到：降低 minProjectedAreaRatio，但会增加远处噪声命中的风险。
 */
