import type { OpenCv } from './opencvTypes';
import { publicAsset } from '../utils/assets';

let loadPromise: Promise<OpenCv> | null = null;

function isReady(value: unknown): value is OpenCv {
  return typeof value === 'object' && value !== null && 'Mat' in value && 'ORB' in value;
}

/**
 * OpenCV.js 有两种常见发行形式：旧版把 cv 直接挂到 window，较新的构建可能先暴露 Promise。
 * 这里同时兼容二者，并且只有检测到 Mat / ORB 后才宣布 Ready。
 */
export function loadOpenCv(timeoutMs = 30_000): Promise<OpenCv> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<OpenCv>((resolve, reject) => {
    const startedAt = Date.now();
    const scriptUrl = publicAsset('opencv/opencv.js');

    const fail = (message: string) => {
      loadPromise = null;
      reject(new Error(message));
    };

    const waitForRuntime = async () => {
      if (Date.now() - startedAt > timeoutMs) {
        fail('OpenCV.js 初始化超时，请检查静态资源是否完整。');
        return;
      }

      const candidate = window.cv;
      if (candidate && typeof (candidate as Promise<OpenCv>).then === 'function') {
        try {
          const resolved = await candidate;
          if (isReady(resolved)) resolve(resolved);
          else fail('OpenCV.js 已加载，但运行时接口不完整。');
        } catch {
          fail('OpenCV.js WebAssembly 运行时初始化失败。');
        }
        return;
      }
      if (isReady(candidate)) {
        resolve(candidate);
        return;
      }
      window.setTimeout(waitForRuntime, 40);
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${scriptUrl}"]`);
    if (existing) {
      void waitForRuntime();
      return;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.addEventListener('load', () => void waitForRuntime(), { once: true });
    script.addEventListener('error', () => fail(`无法加载 ${scriptUrl}`), { once: true });
    document.head.appendChild(script);
  });

  return loadPromise;
}
