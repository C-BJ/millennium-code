# 千年一码

一个可直接运行、纯前端、移动端优先的“数字国学”识别 Demo。浏览器从摄像头抽帧，在本机使用 OpenCV.js 的 ORB 特征、KNN 匹配、Lowe Ratio Test、RANSAC 和 Homography 识别多个平面目标，并把目标四边形画回实时画面。

> 项目不上传摄像头画面，不依赖后端或云端 AI。`public/opencv/opencv.js` 已随项目保存，运行时不依赖 CDN。

## 立即运行

需要 Node.js 20 或更高版本（GitHub Actions 使用 Node 22）。

```bash
npm install
npm run dev
```

打开终端显示的地址。桌面浏览器可将 `public/reference/` 下任一参考图显示在另一块屏幕上，然后用摄像头扫描测试。类型检查和生产构建：

```bash
npm run typecheck
npm run build
npm run preview
```

摄像头 API 只允许在安全上下文运行：桌面 `localhost` 可用；手机通过局域网 IP 打开的普通 HTTP 页面通常不可用。手机测试最省事的方式是先部署到 GitHub Pages（自动 HTTPS），也可以自行给本地 Vite 配置可信 HTTPS 证书。

## 功能清单

- 后置摄像头优先，失败时回退到普通视频约束
- 支持双指捏合预览；放大时 OpenCV 交替识别完整帧和中央高分辨率区域
- OpenCV.js 脚本、WASM 运行时和参考图库分阶段加载
- 多参考目标预提取特征，扫描过程中不重复计算
- 约 52 万像素且横竖屏一致的识别帧、300ms 默认检测周期、不可重入检测
- ORB + Hamming BFMatcher + KNN + Lowe Ratio Test
- RANSAC Homography、内点数/比例和投影四边形联合验收
- 与 `object-fit: cover` 摄像头准确对齐的 Canvas AR 框
- 识别资料卡、音频播放及浏览器中文语音后备
- 独立 Demo Mode，拍摄时可保证约 1.6 秒命中
- 仅开发环境可见的匹配调试面板
- GitHub Pages 子路径和自动部署工作流

## 如何换成真实碑刻

1. 拍摄目标正面照片。裁掉大面积天空、墙面和边框外区域，避免严重反光与运动模糊。
2. 将 JPG/PNG/WebP 放入 `public/reference/`。建议长边约 1200～2000px；程序载入时还会缩小到配置上限。
3. 在 `src/data/monuments.ts` 修改或增加资料。路径必须使用 `publicAsset('reference/文件名.jpg')`。
4. 若有音频，把文件放到 `public/audio/`，增加 `audio: publicAsset('audio/讲解.mp3')`。
5. 用开发模式扫描真实目标，同时观察 Debug Panel，再按 `src/config/visionConfig.ts` 的注释调阈值。

参考图应包含稳定的局部纹理。纯色石面、重复回纹、过细且完全相同的竖排字都不利于 ORB；包含文字、裂纹、印章、边缘交点的照片通常更可靠。

项目已内置有来源记录的麓山寺碑拓片。史料与图片许可详情见 [docs/MONUMENT_SOURCES.md](docs/MONUMENT_SOURCES.md)。网络素材适合验证流程，但到岳麓书院实景拍摄前，仍建议用自己的正面照片替换参考图，以减少视角和光照差异。

## Demo Mode

复制环境配置：

```bash
cp .env.example .env.local
```

拍摄保险模式：

```env
VITE_DEMO_MODE=true
VITE_DEMO_TARGET=millennium-echo
```

修改后重启开发服务器。Demo Mode 在 `useRecognizer.ts` 的独立 effect 中运行，不会调用、修改或伪造真实识别分支的数据。生产部署默认仍为真实识别；如需线上拍摄模式，可在仓库 Actions Variable 中设置同名 Vite 环境变量。

## 浏览器限制

- iOS Safari 必须由用户点击触发权限请求；视频已设置 `autoPlay + muted + playsInline`。
- iOS 可能在切后台、锁屏或系统资源紧张时中断视频轨；返回页面后可点“再次尝试”。
- Speech Synthesis 的中文音色依赖设备。正式拍摄建议提供 MP3，以保证语速与音色一致。
- 平面 Homography 适合碑面、匾额、楹联等近似平面目标；大幅弯曲、强遮挡或极端侧视会失败。
- OpenCV.js 首次解析约 10MB，旧手机可能需要数秒；初始化期间 UI 不会提前调用 `cv`。

更系统的代码导读见 [docs/LEARNING_GUIDE.md](docs/LEARNING_GUIDE.md)，算法与调参见 [docs/VISION_GUIDE.md](docs/VISION_GUIDE.md)。
