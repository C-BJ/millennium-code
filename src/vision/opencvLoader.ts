import type { OpenCv, OpenCvThenable } from './opencvTypes';
import { publicAsset } from '../utils/assets';

let loadPromise: Promise<OpenCv> | null = null;

function isReady(value: unknown): value is OpenCv {
  return typeof value === 'object' && value !== null && 'Mat' in value && 'ORB' in value;
}

function isThenable(value: unknown): value is OpenCvThenable {
  return typeof value === 'object'
    && value !== null
    && 'then' in value
    && typeof value.then === 'function';
}

/**
 * OpenCV.js 有两种常见发行形式：旧版把 cv 直接挂到 window，较新的构建可能先暴露
 * Emscripten thenable。thenable 看起来像 Promise，但它会用自身作为完成值；若直接 await，
 * 原生 Promise 会不断解析同一个 thenable，页面便会永久停在“载入 OpenCV 引擎”。
 * 因此这里直接注册回调，并在 runtime ready 后移除 then，再交给真正的 Promise。
 */
export function loadOpenCv(timeoutMs = 30_000): Promise<OpenCv> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<OpenCv>((resolve, reject) => {
    const scriptUrl = publicAsset('opencv/opencv.js');
    let settled = false;
    let timeoutId: number | undefined;

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      loadPromise = null;
      reject(new Error(message));
    };

    const succeed = (runtime: unknown) => {
      if (settled) return;
      if (!isReady(runtime)) {
        fail('OpenCV.js 已加载，但运行时接口不完整。');
        return;
      }

      // Promise 的 resolve 也会自动吸收 thenable，所以必须先去掉 Emscripten 的 then。
      const runtimeWithoutThen = runtime as OpenCv & { then?: unknown };
      try {
        delete runtimeWithoutThen.then;
      } catch {
        Object.defineProperty(runtimeWithoutThen, 'then', { value: undefined, configurable: true });
      }
      if (typeof runtimeWithoutThen.then === 'function') {
        fail('OpenCV.js thenable 无法转换为已初始化运行时。');
        return;
      }

      settled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      resolve(runtimeWithoutThen);
    };

    const waitForRuntime = () => {
      if (settled) return;
      const candidate = window.cv;
      if (isThenable(candidate)) {
        try {
          candidate.then(succeed);
        } catch {
          fail('OpenCV.js WebAssembly 运行时初始化失败。');
        }
        return;
      }
      if (isReady(candidate)) {
        succeed(candidate);
        return;
      }
      window.setTimeout(waitForRuntime, 40);
    };

    // 独立计时器保证即使 thenable 自身不回调，也能正确进入失败状态。
    timeoutId = window.setTimeout(
      () => fail('OpenCV.js 初始化超时，请检查静态资源是否完整。'),
      timeoutMs,
    );

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${scriptUrl}"]`);
    if (existing) {
      waitForRuntime();
      return;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.addEventListener('load', waitForRuntime, { once: true });
    script.addEventListener('error', () => fail(`无法加载 ${scriptUrl}`), { once: true });
    document.head.appendChild(script);
  });

  return loadPromise;
}
