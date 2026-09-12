export interface CvDeletable { delete(): void }
export interface CvSize { width: number; height: number }
export interface CvPoint { x: number; y: number }
export interface CvKeyPoint { pt: CvPoint }
export interface CvDMatch { queryIdx: number; trainIdx: number; distance: number }

export interface CvMat extends CvDeletable {
  rows: number;
  cols: number;
  empty(): boolean;
  clone(): CvMat;
  data?: Uint8Array;
  data32F?: Float32Array;
  data64F?: Float64Array;
}

export interface CvKeyPointVector extends CvDeletable {
  size(): number;
  get(index: number): CvKeyPoint;
}

export interface CvDMatchVector extends CvDeletable {
  size(): number;
  get(index: number): CvDMatch;
}

export interface CvDMatchVectorVector extends CvDeletable {
  size(): number;
  get(index: number): CvDMatchVector;
}

export interface CvOrb extends CvDeletable {
  setMaxFeatures(count: number): void;
  detectAndCompute(image: CvMat, mask: CvMat, keypoints: CvKeyPointVector, descriptors: CvMat): void;
}

export interface CvMatcher extends CvDeletable {
  knnMatch(queryDescriptors: CvMat, trainDescriptors: CvMat, matches: CvDMatchVectorVector, k: number): void;
}

export interface OpenCv {
  Mat: new () => CvMat;
  Size: new (width: number, height: number) => CvSize;
  KeyPointVector: new () => CvKeyPointVector;
  DMatchVectorVector: new () => CvDMatchVectorVector;
  ORB: new () => CvOrb;
  BFMatcher: new (normType?: number, crossCheck?: boolean) => CvMatcher;
  imread(element: HTMLImageElement | HTMLCanvasElement): CvMat;
  cvtColor(source: CvMat, destination: CvMat, code: number): void;
  resize(source: CvMat, destination: CvMat, size: CvSize, fx?: number, fy?: number, interpolation?: number): void;
  matFromArray(rows: number, columns: number, type: number, data: number[]): CvMat;
  findHomography(sourcePoints: CvMat, destinationPoints: CvMat, method: number, threshold: number, mask: CvMat): CvMat;
  perspectiveTransform(source: CvMat, destination: CvMat, homography: CvMat): void;
  COLOR_RGBA2GRAY: number;
  NORM_HAMMING: number;
  RANSAC: number;
  CV_32FC2: number;
  INTER_AREA: number;
}

/**
 * 部分 Emscripten/OpenCV.js 构建暴露的是“类 Promise”对象，而非标准 Promise。
 * 它只保证 runtime 初始化后调用回调，不保证 Promise/A+ 的完整行为。
 */
export interface OpenCvThenable {
  then(onReady: (runtime: OpenCv) => void): unknown;
}

declare global {
  interface Window { cv?: OpenCv | OpenCvThenable }
}
