export const visionConfig = {
  // 最长边不超过 640、短边不超过 480，避免直接处理手机的 1080p/4K 帧。
  frameWidth: 640,
  frameHeight: 480,
  detectIntervalMs: 320,
  recognizedIntervalMs: 1_200,
  // 风化石面往往对比度低：增加 ORB 数量并降低 FAST 阈值，以保留更多弱纹理角点。
  orbFeatures: 1_800,
  orbFastThreshold: 8,
  equalizeHistogram: true,
  referenceMaxDimension: 900,
  ratioThreshold: 0.95,
  minReferenceKeypoints: 20,
  minFrameKeypoints: 10,
  // 4 对点是计算 Homography 的数学下限；此档位主要用于确认实拍画面能否形成几何匹配。
  minGoodMatches: 4,
  minInliers: 4,
  minInlierRatio: 0.15,
  ransacReprojectionThreshold: 10.0,
  // 长条形楹联或远处碑刻占画面面积较小，基础门槛需要比普通海报识别更宽松。
  minProjectedAreaRatio: 0.0005,
  maxProjectedAreaRatio: 2.5,
  minProjectedEdgePx: 3,
  maxProjectedAspectRatio: 30,
  maxCornerOverflowRatio: 1.2,
  demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
  demoDelayMs: 1_600,
  demoTargetId: import.meta.env.VITE_DEMO_TARGET ?? 'millennium-echo',
} as const;

/**
 * 调参顺序建议：
 * 当前参数是用于排查漏检的“极宽松拍摄档”，误识别概率会高于正式参数。
 * 若开始出现误识别，应优先降低
 * ratioThreshold，再提高 minInliers 和 minInlierRatio，而不是修改匹配流程。
 * 1. 误识别：先把 minInliers 提到 15～20，再把 minInlierRatio 提到 0.6。
 * 2. 框的位置飘：减小 ransacReprojectionThreshold（例如 3），不要只增加 goodMatches。
 * 3. 小目标识别不到：降低 minProjectedAreaRatio，但会增加远处噪声命中的风险。
 * 4. 超长楹联被拒绝：适当提高 maxProjectedAspectRatio；它只限制退化细线，不要求目标为正方形。
 */
