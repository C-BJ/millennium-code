export interface Monument {
  id: string;
  name: string;
  subtitle?: string;
  referenceImage: string;
  description: string;
  originalText?: string;
  interpretation?: string;
  audio?: string;
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
