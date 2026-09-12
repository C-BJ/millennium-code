export interface ContentSource {
  label: string;
  url: string;
}

export interface ImageAttribution {
  author: string;
  sourceUrl: string;
  license: string;
  licenseUrl?: string;
}

export interface Monument {
  id: string;
  name: string;
  subtitle?: string;
  referenceImage: string;
  description: string;
  originalText?: string;
  interpretation?: string;
  audio?: string;
  /** 展示内容的考据来源。资料卡会把它显示为可点击链接。 */
  sources?: ContentSource[];
  /** 网络参考图的作者与许可信息；自拍参考图不需要填写。 */
  imageAttribution?: ImageAttribution;
}

export interface Point {
  x: number;
  y: number;
}

export interface MatchMetrics {
  monumentId: string;
  goodMatches: number;
  inliers: number;
  inlierRatio: number;
  score: number;
  accepted: boolean;
  rejectionReason?: string;
}

export interface RecognitionResult {
  monument: Monument;
  corners: [Point, Point, Point, Point];
  frameSize: { width: number; height: number };
  metrics: MatchMetrics;
}

export interface RecognitionDebug {
  frameKeypoints: number;
  detectionMs: number;
  bestTargetId?: string;
  targets: MatchMetrics[];
}
