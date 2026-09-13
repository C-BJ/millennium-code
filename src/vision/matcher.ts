import type { CvMat, OpenCv } from './opencvTypes';

export interface GoodMatch { queryIdx: number; trainIdx: number; distance: number }

/**
 * KNN 为每个场景特征找两个最近邻；Lowe Ratio Test 要求第一名明显优于第二名，
 * 从而排除“两个候选都差不多”的含糊匹配。ORB 是二进制描述子，因此距离使用 Hamming。
 */
export function findGoodMatches(
  cv: OpenCv,
  scene: CvMat,
  reference: CvMat,
  ratioThreshold: number,
  uniqueReferenceMatches = false,
): GoodMatch[] {
  // OpenCV.js 的绑定使用构造器；参数与 BFMatcher::create(NORM_HAMMING, false) 等价。
  const matcher = new cv.BFMatcher(cv.NORM_HAMMING, false);
  const knn = new cv.DMatchVectorVector();
  const good: GoodMatch[] = [];

  try {
    matcher.knnMatch(scene, reference, knn, 2);
    for (let index = 0; index < knn.size(); index += 1) {
      const pair = knn.get(index);
      try {
        if (pair.size() < 2) continue;
        const best = pair.get(0);
        const second = pair.get(1);
        if (best.distance < ratioThreshold * second.distance) {
          good.push({ queryIdx: best.queryIdx, trainIdx: best.trainIdx, distance: best.distance });
        }
      } finally {
        pair.delete();
      }
    }
    if (!uniqueReferenceMatches) return good;

    // 竖排碑文里会反复出现相近的偏旁和笔画。多个场景点若都指向同一个参考点，
    // 它们不会为 Homography 提供新的几何信息，反而会污染内点比例；这里只保留距离最小者。
    const bestByReferenceFeature = new Map<number, GoodMatch>();
    for (const match of good) {
      const previous = bestByReferenceFeature.get(match.trainIdx);
      if (!previous || match.distance < previous.distance) bestByReferenceFeature.set(match.trainIdx, match);
    }
    return [...bestByReferenceFeature.values()];
  } finally {
    knn.delete();
    matcher.delete();
  }
}
