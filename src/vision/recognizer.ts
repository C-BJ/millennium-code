import { visionConfig } from '../config/visionConfig';
import type { MatchMetrics, RecognitionDebug, RecognitionResult } from '../types/monument';
import { extractFeatures } from './featureExtractor';
import { estimateHomography, validateQuadrilateral } from './homography';
import { findGoodMatches } from './matcher';
import { deleteSafely } from './matUtils';
import type { OpenCv } from './opencvTypes';
import type { ReferenceFeatures } from './referenceCache';

export interface DetectionOutput { result: RecognitionResult | null; debug: RecognitionDebug }

export function recognizeCanvas(cv: OpenCv, canvas: HTMLCanvasElement, references: ReferenceFeatures[]): DetectionOutput {
  const startedAt = performance.now();
  const rgba = cv.imread(canvas);
  const gray = new cv.Mat();
  let descriptors = new cv.Mat();
  const metrics: MatchMetrics[] = [];
  let best: RecognitionResult | null = null;
  let frameKeypoints = 0;

  try {
    cv.cvtColor(rgba, gray, cv.COLOR_RGBA2GRAY);
    const features = extractFeatures(cv, gray);
    descriptors.delete();
    descriptors = features.descriptors;
    frameKeypoints = features.keypoints.length;
    if (descriptors.empty() || frameKeypoints < visionConfig.minFrameKeypoints) {
      return { result: null, debug: { frameKeypoints, detectionMs: performance.now() - startedAt, targets: [] } };
    }

    for (const reference of references) {
      const good = findGoodMatches(cv, descriptors, reference.descriptors);
      let inliers = 0;
      let inlierRatio = 0;
      let corners: RecognitionResult['corners'] | null = null;
      let rejectionReason: string | undefined;

      if (good.length >= visionConfig.minGoodMatches) {
        const geometry = estimateHomography(cv, good, features.keypoints, reference.keypoints, reference);
        if (geometry) {
          inliers = geometry.inliers;
          inlierRatio = geometry.inlierRatio;
          rejectionReason = validateQuadrilateral(geometry.corners, canvas.width, canvas.height) ?? undefined;
          corners = geometry.corners;
        } else rejectionReason = 'Homography 计算失败';
      } else rejectionReason = '有效匹配不足';

      const accepted = good.length >= visionConfig.minGoodMatches
        && inliers >= visionConfig.minInliers
        && inlierRatio >= visionConfig.minInlierRatio
        && corners !== null
        && !rejectionReason;
      // 几何一致性占主导：inlier 数量与比例权重高于原始匹配数量。
      const score = inliers * 2 + inlierRatio * 30 + Math.min(good.length, 60) * 0.25;
      const metric: MatchMetrics = {
        monumentId: reference.monument.id,
        goodMatches: good.length,
        inliers,
        inlierRatio,
        score,
        accepted,
        rejectionReason,
      };
      metrics.push(metric);
      if (accepted && corners && (!best || score > best.metrics.score)) {
        best = {
          monument: reference.monument,
          corners,
          frameSize: { width: canvas.width, height: canvas.height },
          metrics: metric,
        };
      }
    }
    return {
      result: best,
      debug: {
        frameKeypoints,
        detectionMs: performance.now() - startedAt,
        bestTargetId: best?.monument.id,
        targets: metrics,
      },
    };
  } finally {
    deleteSafely(rgba, gray, descriptors);
  }
}
