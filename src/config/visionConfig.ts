export const visionConfig = {
  // 使用总像素预算而不是固定“宽 640、高 480”。这样同一画面在手机横竖屏下
  // 都约为 30 万像素，不会出现竖屏只有 270×480、横屏却有 640×360 的清晰度差异。
  framePixelBudget: 640 * 480,
  frameMaxLongEdge: 768,
  detectIntervalMs: 240,
  recognizedIntervalMs: 1_200,
  // 风化石面往往对比度低：增加 ORB 数量并降低 FAST 阈值，以保留更多弱纹理角点。
  orbFeatures: 1_400,
  orbFastThreshold: 12,
  equalizeHistogram: true,
  referenceMaxDimension: 900,
  ratioThreshold: 0.78,
  minReferenceKeypoints: 20,
  minFrameKeypoints: 25,
  minGoodMatches: 14,
  minInliers: 9,
  minInlierRatio: 0.45,
  ransacReprojectionThreshold: 4.0,
  // 长条形楹联或远处碑刻占画面面积较小，基础门槛需要比普通海报识别更宽松。
  minProjectedAreaRatio: 0.006,
  maxProjectedAreaRatio: 0.92,
  minProjectedEdgePx: 12,
  maxProjectedAspectRatio: 14,
  maxCornerOverflowRatio: 0.28,
  demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
  demoDelayMs: 1_600,
  demoTargetId: import.meta.env.VITE_DEMO_TARGET ?? 'millennium-echo',
} as const;

export interface RecognitionThresholds {
  minGoodMatches: number;
  minInliers: number;
  minInlierRatio: number;
}

/** 只降低最终验收门槛，不改变 ORB、KNN、Ratio Test 或 Homography 算法。 */
export function getRecognitionThresholds(monumentId: string): RecognitionThresholds {
  if (monumentId === 'academy-history-1') {
    return { minGoodMatches: 10, minInliers: 6, minInlierRatio: 0.30 };
  }
  return {
    minGoodMatches: visionConfig.minGoodMatches,
    minInliers: visionConfig.minInliers,
    minInlierRatio: visionConfig.minInlierRatio,
  };
}

/**
 * 调参顺序建议：
 * 1. 光线变化大、漏检：先把 ratioThreshold 提到 0.8，或把 minGoodMatches 降到 12。
 * 2. 误识别：先把 minInliers 提到 15～20，再把 minInlierRatio 提到 0.6。
 * 3. 框的位置飘：减小 ransacReprojectionThreshold（例如 3），不要只增加 goodMatches。
 * 4. 小目标识别不到：降低 minProjectedAreaRatio，但会增加远处噪声命中的风险。
 * 5. 超长楹联被拒绝：适当提高 maxProjectedAspectRatio；它只限制退化细线，不要求目标为正方形。
 */
