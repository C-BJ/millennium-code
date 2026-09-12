import { visionConfig } from '../config/visionConfig';
import type { Point } from '../types/monument';
import type { GoodMatch } from './matcher';
import { deleteSafely } from './matUtils';
import type { OpenCv } from './opencvTypes';

export interface HomographyResult {
  corners: [Point, Point, Point, Point];
  inliers: number;
  inlierRatio: number;
}

function distance(a: Point, b: Point): number { return Math.hypot(a.x - b.x, a.y - b.y); }
function cross(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
}
function polygonArea(points: Point[]): number {
  return Math.abs(points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length]!;
    return sum + point.x * next.y - next.x * point.y;
  }, 0) / 2);
}

export function validateQuadrilateral(
  corners: [Point, Point, Point, Point],
  frameWidth: number,
  frameHeight: number,
): string | null {
  if (corners.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))) return '投影坐标无效';
  const marginX = frameWidth * visionConfig.maxCornerOverflowRatio;
  const marginY = frameHeight * visionConfig.maxCornerOverflowRatio;
  if (corners.some((p) => p.x < -marginX || p.x > frameWidth + marginX || p.y < -marginY || p.y > frameHeight + marginY)) {
    return '投影超出画面';
  }
  const signs = corners.map((p, index) => cross(p, corners[(index + 1) % 4]!, corners[(index + 2) % 4]!));
  if (!(signs.every((value) => value > 0) || signs.every((value) => value < 0))) return '投影四边形非凸';
  if (corners.some((p, index) => distance(p, corners[(index + 1) % 4]!) < visionConfig.minProjectedEdgePx)) return '投影边长过短';
  const areaRatio = polygonArea(corners) / (frameWidth * frameHeight);
  if (areaRatio < visionConfig.minProjectedAreaRatio || areaRatio > visionConfig.maxProjectedAreaRatio) return '投影面积不合理';
  return null;
}

export function estimateHomography(
  cv: OpenCv,
  matches: GoodMatch[],
  scenePoints: Point[],
  referencePoints: Point[],
  referenceSize: { width: number; height: number },
): HomographyResult | null {
  const sourceData: number[] = [];
  const destinationData: number[] = [];
  for (const match of matches) {
    const source = referencePoints[match.trainIdx];
    const destination = scenePoints[match.queryIdx];
    if (!source || !destination) continue;
    sourceData.push(source.x, source.y);
    destinationData.push(destination.x, destination.y);
  }
  if (sourceData.length < 8) return null;

  const source = cv.matFromArray(sourceData.length / 2, 1, cv.CV_32FC2, sourceData);
  const destination = cv.matFromArray(destinationData.length / 2, 1, cv.CV_32FC2, destinationData);
  const mask = new cv.Mat();
  let homography = new cv.Mat();
  const sourceCorners = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0, 0, referenceSize.width, 0,
    referenceSize.width, referenceSize.height, 0, referenceSize.height,
  ]);
  const projectedCorners = new cv.Mat();

  try {
    const calculated = cv.findHomography(source, destination, cv.RANSAC, visionConfig.ransacReprojectionThreshold, mask);
    homography.delete();
    homography = calculated;
    if (homography.empty()) return null;
    const values = homography.data64F ?? homography.data32F;
    if (!values || values.length < 9 || Array.from(values).some((value) => !Number.isFinite(value))) return null;

    cv.perspectiveTransform(sourceCorners, projectedCorners, homography);
    const data = projectedCorners.data32F;
    if (!data || data.length < 8) return null;
    const corners: [Point, Point, Point, Point] = [
      { x: data[0]!, y: data[1]! }, { x: data[2]!, y: data[3]! },
      { x: data[4]!, y: data[5]! }, { x: data[6]!, y: data[7]! },
    ];
    const inliers = mask.data ? Array.from(mask.data).filter((value) => value !== 0).length : 0;
    return { corners, inliers, inlierRatio: inliers / matches.length };
  } finally {
    deleteSafely(source, destination, mask, homography, sourceCorners, projectedCorners);
  }
}
