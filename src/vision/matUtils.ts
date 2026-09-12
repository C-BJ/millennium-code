import type { CvDeletable } from './opencvTypes';

/** OpenCV.js 对象位于 WASM 堆中，不受 JavaScript 垃圾回收管理，必须显式 delete。 */
export function deleteSafely(...items: Array<CvDeletable | null | undefined>): void {
  for (const item of items) {
    try { item?.delete(); } catch { /* 已释放的临时对象无需再次处理。 */ }
  }
}
