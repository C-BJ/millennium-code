# 从这个项目学习 TypeScript、React 与浏览器 API

本文按一次真实运行的时间顺序解释代码。你不需要先会前端；建议一边运行 `npm run dev`，一边从 `src/main.tsx` 开始点进文件。

## 1. Vite 在做什么

Vite 是开发服务器和打包器。开发时它读取 `index.html`，遇到 `/src/main.tsx` 后编译 TypeScript 和 JSX，并在修改文件时局部刷新。构建时它把模块压缩到 `dist/assets/`，同时把 `public/` 原样复制到 `dist/`。

`vite.config.ts` 的 `base` 非常重要。GitHub Pages 项目站点不在域名根目录，而在 `/millennium-code/`。Vite 会据此改写自己生成的 JS/CSS 路径；`publicAsset()` 则负责我们手写的图片、音频和 OpenCV 路径。

## 2. TypeScript 的核心概念

TypeScript 是“带静态类型检查的 JavaScript”。浏览器最终运行的仍是 JavaScript，类型只在开发与构建阶段存在。

```ts
interface Monument {
  id: string;
  subtitle?: string;
}
```

`interface` 描述对象形状。`subtitle?` 表示字段可缺省。`RecognitionResult` 把识别结果约束为“资料 + 四个角 + 帧尺寸 + 指标”，所以绘图组件不可能误把三个点当成完整四边形。

项目开启了 `strict` 和 `noUncheckedIndexedAccess`。数组按下标读取时，TypeScript 会提醒元素可能不存在；代码中的 `points[0]!` 表示这里经过逻辑保证，开发者明确告诉编译器它存在。不要滥用 `!`，优先先检查数据。

`import type` 只导入类型，构建后不会生成运行时代码。`as const` 让配置中的值保持只读且类型更精确。

## 3. React 是怎样组织界面的

React 组件是返回 JSX 的函数。JSX 看起来像 HTML，但可以嵌入 JavaScript 表达式：

```tsx
{result && <RecognitionResult result={result} />}
```

这表示仅当 `result` 存在时渲染结果卡。Props 是父组件传给子组件的数据；子组件不应直接修改 props。

本项目常见的 Hook：

- `useState`：保存会影响界面的状态，修改后 React 重新渲染。
- `useRef`：保存 DOM 元素、MediaStream 或“是否忙碌”等可变值；修改它不会触发渲染。
- `useEffect`：与 React 外部系统同步，例如定时器、摄像头和 OpenCV 内存。effect 返回的函数是清理逻辑。
- `useCallback`：在依赖不变时保留函数引用，避免 effect 因函数身份变化而反复重启。

React 开发模式的 `StrictMode` 会故意执行一次“挂载 → 清理 → 再挂载”，帮助发现忘记释放资源的问题。因此相机 track、定时器和 `cv.Mat` 的清理必须可重复执行。

## 4. 状态如何流动

`App.tsx` 只负责组合：

1. `useOpenCv()` 加载 OpenCV 并准备参考特征。
2. `useCamera()` 管理摄像头权限和 MediaStream。
3. `useRecognizer()` 在相机 ready 后开始抽帧。
4. `ScannerOverlay` 根据 result 绘框。
5. `RecognitionResult` 显示资料并调用 `AudioGuide`。

算法没有塞进组件。这样 UI 改版时不必动视觉代码，算法调参时也不必动 React 页面。

## 5. 摄像头与 Canvas

`getUserMedia()` 返回 `MediaStream`。它不是普通视频 URL，而是一组实时 track：

```ts
video.srcObject = stream;
```

离开页面时必须遍历 `stream.getTracks()` 并调用 `track.stop()`，否则手机的摄像头指示灯可能继续亮。

识别时，隐藏 Canvas 用 `drawImage(video, ...)` 把当前视频帧变成像素。显示视频仍保持较高分辨率；只有进入 OpenCV 的副本会缩小。因此“画面好看”和“计算量可控”可以同时成立。

识别帧按约 52 万像素的总预算缩放，而不是分别限制宽 640、高 480。固定宽高上限会让 9:16 竖屏帧被压成约 270×480，却让横屏保留约 640×360，导致旋转手机后识别率突然提高。像素预算算法会让两个方向分别得到约 540×960 和 960×540，计算量接近，细节量也接近。支持相关能力的浏览器还会请求连续自动对焦，以提高缓慢移动手机时捕捉到清晰帧的概率。

### 为什么双指缩放不改变识别帧

`CameraView` 使用 Pointer Events 计算两个触点的距离变化，并通过 CSS `transform: scale()` 放大预览。放大后，`useRecognizer` 在完整帧和中央高分辨率区域之间交替检测：完整帧避免碑刻边缘被永久裁掉，中央帧帮助远处目标保留更多像素。中央帧识别出的角点会先换算回完整帧坐标，再由 `ScannerOverlay` 应用相同的中心缩放，因此边框仍与画面位置一致。

## 6. 为什么识别循环不用 setInterval

如果一次识别耗时超过 interval，`setInterval` 会继续排队，最终造成卡顿。`useRecognizer` 用递归 `setTimeout`：本轮完成后才安排下一轮，并用 `busyRef` 再加一道不可重入保护。识别成功前周期为 300ms，成功后降到 1200ms。提高分辨率后稍微延长周期，可以减少手机持续发热。

## 7. OpenCV.js 的特殊内存规则

`cv.Mat` 的像素数据位于 WebAssembly 的内存中。JavaScript 垃圾回收器不知道它应何时释放，因此必须手动 `.delete()`。

项目采用三个规则：

1. 临时 Mat 创建后立刻进入 `try/finally`。
2. 所有退出路径都由 `deleteSafely()` 回收。
3. 参考 descriptor 是有意长期缓存的，只在 Hook 卸载时释放。

JS 数组、普通对象、React state 不需要 `.delete()`；只有 OpenCV 创建的对象需要。

## 8. CSS 中值得学习的部分

页面优先使用 `100svh`，它比传统 `100vh` 更适合会显示/隐藏地址栏的手机浏览器。`env(safe-area-inset-top)` 和 `bottom` 避开 iPhone 刘海与 Home Indicator。

视频使用 `object-fit: cover`，可能裁掉两侧或上下。Overlay 绘图时复现同样的 scale 与 offset，才能让 Homography 点和肉眼看到的目标重合。Canvas 内部像素又乘以 DPR，保证高密度屏幕上线条清晰。

## 9. 推荐的学习修改顺序

1. 在 `monuments.ts` 改文字，理解数据驱动 UI。
2. 在 `styles.css` 改颜色与间距，使用浏览器 DevTools 实时观察。
3. 给 `RecognitionResult` 增加一个折叠详情，练习 state 和事件。
4. 在 Debug Panel 增加投影面积比例，练习跨模块类型。
5. 最后再调整视觉阈值，每次只改一个值并记录效果。

遇到错误时先运行 `npm run typecheck`。类型错误通常会同时告诉你文件、行号、期望类型和实际类型；从第一条开始修，因为后面的错误可能只是连锁反应。
