export const visionConfig = {
  // 最长边不超过 640、短边不超过 480，避免直接处理手机的 1080p/4K 帧。
  frameWidth: 640,
  frameHeight: 480,
  detectIntervalMs: 320,
  recognizedIntervalMs: 1_200,
  // 风化石面往往对比度低：增加 ORB 数量并降低 FAST 阈值，以保留更多弱纹理角点。
  orbFeatures: 1_700,
  orbFastThreshold: 10,
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

/**
 * 不同参考图的纹理差异很大，不能只靠一套全局阈值。
 * 这里仅覆盖确实需要特殊处理的目标；其余目标继续使用上面的稳定默认值。
 */
export interface TargetVisionConfig {
  ratioThreshold: number;
  minGoodMatches: number;
  minInliers: number;
  minInlierRatio: number;
  ransacReprojectionThreshold: number;
  referenceOrbFeatures: number;
  uniqueReferenceMatches: boolean;
}

const defaultTargetVisionConfig: TargetVisionConfig = {
  ratioThreshold: visionConfig.ratioThreshold,
  minGoodMatches: visionConfig.minGoodMatches,
  minInliers: visionConfig.minInliers,
  minInlierRatio: visionConfig.minInlierRatio,
  ransacReprojectionThreshold: visionConfig.ransacReprojectionThreshold,
  referenceOrbFeatures: visionConfig.orbFeatures,
  uniqueReferenceMatches: false,
};

const targetVisionOverrides: Record<string, Partial<TargetVisionConfig>> = {
  // 《岳麓书院记》由大量相似的竖排汉字组成，同一字形很容易产生多个含糊候选。
  // 略微放宽 Ratio Test 来提高召回率，同时要求每个参考特征只被使用一次，
  // 再由 RANSAC、内点比例和四边形检查兜底，避免仅靠“匹配数量”误报。
  'academy-history-1': {
    ratioThreshold: 0.84,
    minGoodMatches: 10,
    minInliers: 7,
    minInlierRatio: 0.38,
    ransacReprojectionThreshold: 5,
    referenceOrbFeatures: 2_200,
    uniqueReferenceMatches: true,
  },
};

export function getTargetVisionConfig(monumentId: string): TargetVisionConfig {
  return { ...defaultTargetVisionConfig, ...targetVisionOverrides[monumentId] };
}

/**
 * 调参顺序建议：
 * 1. 光线变化大、漏检：先把目标专用 ratioThreshold 提高 0.02，或把 minGoodMatches 降低 2。
 * 2. 误识别：先把 minInliers 提到 15～20，再把 minInlierRatio 提到 0.6。
 * 3. 框的位置飘：减小 ransacReprojectionThreshold（例如 3），不要只增加 goodMatches。
 * 4. 小目标识别不到：降低 minProjectedAreaRatio，但会增加远处噪声命中的风险。
 * 5. 超长楹联被拒绝：适当提高 maxProjectedAspectRatio；它只限制退化细线，不要求目标为正方形。
 */
