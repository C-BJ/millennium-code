import { visionConfig } from '../config/visionConfig';
import type { Point } from '../types/monument';
import type { CvMat, OpenCv } from './opencvTypes';
import { deleteSafely } from './matUtils';

export interface ExtractedFeatures {
  descriptors: CvMat;
  keypoints: Point[];
}

export function extractFeatures(cv: OpenCv, gray: CvMat): ExtractedFeatures {
  // 当前采用的 OpenCV.js 4.x 构建没有暴露 C++ 的 ORB::create 静态方法，
  // 等价做法是构造 ORB 后通过 setter 配置最大特征数。
  const orb = new cv.ORB();
  orb.setMaxFeatures(visionConfig.orbFeatures);
  const keypointVector = new cv.KeyPointVector();
  const descriptors = new cv.Mat();
  const mask = new cv.Mat();

  try {
    orb.detectAndCompute(gray, mask, keypointVector, descriptors);
    const keypoints: Point[] = [];
    for (let index = 0; index < keypointVector.size(); index += 1) {
      const point = keypointVector.get(index).pt;
      keypoints.push({ x: point.x, y: point.y });
    }
    return { descriptors, keypoints };
  } catch (error) {
    descriptors.delete();
    throw error;
  } finally {
    deleteSafely(mask, keypointVector, orb);
  }
}

export function imageToGrayMat(cv: OpenCv, image: HTMLImageElement): { gray: CvMat; width: number; height: number } {
  const rgba = cv.imread(image);
  const gray = new cv.Mat();
  const longest = Math.max(rgba.cols, rgba.rows);
  const scale = Math.min(1, visionConfig.referenceMaxDimension / longest);
  const width = Math.max(1, Math.round(rgba.cols * scale));
  const height = Math.max(1, Math.round(rgba.rows * scale));
  const resized = new cv.Mat();

  try {
    cv.resize(rgba, resized, new cv.Size(width, height), 0, 0, cv.INTER_AREA);
    cv.cvtColor(resized, gray, cv.COLOR_RGBA2GRAY);
    return { gray, width, height };
  } catch (error) {
    gray.delete();
    throw error;
  } finally {
    deleteSafely(rgba, resized);
  }
}
