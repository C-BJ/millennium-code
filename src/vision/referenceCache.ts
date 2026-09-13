import { getTargetVisionConfig, visionConfig } from '../config/visionConfig';
import type { Monument, Point } from '../types/monument';
import { extractFeatures, imageToGrayMat } from './featureExtractor';
import { deleteSafely } from './matUtils';
import type { CvMat, OpenCv } from './opencvTypes';

export interface ReferenceFeatures {
  monument: Monument;
  width: number;
  height: number;
  keypoints: Point[];
  descriptors: CvMat;
}

export interface ReferenceLoadFailure { monument: Monument; reason: string }

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`图片加载失败：${source}`));
    image.src = source;
  });
}

export async function buildReferenceCache(
  cv: OpenCv,
  monuments: Monument[],
): Promise<{ references: ReferenceFeatures[]; failures: ReferenceLoadFailure[] }> {
  const references: ReferenceFeatures[] = [];
  const failures: ReferenceLoadFailure[] = [];

  for (const monument of monuments) {
    let gray: CvMat | null = null;
    try {
      const image = await loadImage(monument.referenceImage);
      const converted = imageToGrayMat(cv, image);
      gray = converted.gray;
      if (converted.width < 2 || converted.height < 2 || gray.empty()) throw new Error('图片内容为空');
      const targetConfig = getTargetVisionConfig(monument.id);
      const features = extractFeatures(cv, gray, targetConfig.referenceOrbFeatures);
      if (features.descriptors.empty() || features.keypoints.length < visionConfig.minReferenceKeypoints) {
        features.descriptors.delete();
        throw new Error(`特征点过少（${features.keypoints.length}）`);
      }
      references.push({ monument, width: converted.width, height: converted.height, ...features });
    } catch (error) {
      failures.push({ monument, reason: error instanceof Error ? error.message : '未知错误' });
    } finally {
      deleteSafely(gray);
    }
  }
  return { references, failures };
}

export function releaseReferenceCache(references: ReferenceFeatures[]): void {
  references.forEach((reference) => deleteSafely(reference.descriptors));
}
