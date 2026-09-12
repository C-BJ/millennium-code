# 识别算法、稳定性与调参

## 完整数据流

```text
参考图（启动时一次）             摄像头（扫描期间循环）
       ↓                                  ↓
缩放、灰度化                         Canvas 抽帧与缩放
       ↓                                  ↓
ORB keypoints + descriptors      ORB keypoints + descriptors
       └─────────── 每个目标 KNN 匹配 ───────┘
                              ↓
                       Lowe Ratio Test
                              ↓
                 对应点 + RANSAC findHomography
                              ↓
           inliers / ratio / 凸性 / 面积 / 边长 / 越界检查
                              ↓
                  按几何一致性 score 选择最佳目标
                              ↓
                    perspectiveTransform 四角
                              ↓
                         Canvas AR Overlay
```

## ORB、描述子与 Hamming 距离

ORB 会找角点等局部结构，并为每个点生成二进制 descriptor。即使图片有一定旋转、缩放和亮度变化，相同局部结构的 descriptor 仍较接近。二进制描述子应使用 Hamming 距离；它统计两个 bit 串有多少位不同。

场景中的每个 descriptor 会在参考图中找最近与第二近的两个候选。若最近距离 `d1 < ratio × d2`，最近候选才足够突出。ratio 越大越宽松，匹配更多，也更容易混入错误。

## 为什么 goodMatches 不足以判定成功

重复文字或砖纹可能产生很多局部相似匹配，但它们未必服从同一个平面透视变换。RANSAC 会反复抽样估计 Homography，把符合该模型的点记为 inlier。真实目标通常同时具有：

- 足够多的 good matches；
- 足够多的 inliers；
- 较高的 inlier ratio；
- 有限、非退化的 3×3 Homography；
- 合理、凸、不过度越界的投影四边形。

项目只有全部通过才接受候选。多个候选都通过时，score 为：

```text
inliers × 2 + inlierRatio × 30 + min(goodMatches, 60) × 0.25
```

这让几何一致性主导结果，同时用匹配数做轻微加分。

## 初始阈值

所有值集中在 `src/config/visionConfig.ts`。当前初值偏向拍摄稳定性：18 个 good matches、12 个 inliers、52% inlier ratio、4px RANSAC 重投影阈值。

建议建立固定测试集：每个目标拍 10～20 段不同距离、角度和光照的视频，再准备容易混淆的墙面、其他碑刻作为负样本。每次只改一个阈值。

| 现象 | 优先观察 | 建议 |
| --- | --- | --- |
| 完全没有 good matches | frame/reference keypoints | 换纹理更丰富的参考图，检查清晰度 |
| good matches 只有 10～17 | ratio | ratio 从 0.74 慢慢提高到 0.78 |
| inliers 很少 | 匹配质量、反光、重复图案 | 不要先降 minInliers，先改善参考图 |
| ratio 在 0.4～0.5 徘徊 | 几何一致性 | 可小幅降到 0.48，但必须保留四边形检查 |
| 错误目标偶尔通过 | inliers、ratio | 分别提高到 15 与 0.6 |
| 框抖动或飞出画面 | RANSAC threshold、面积 | 阈值降到 3；提高最小投影面积 |
| 远处小目标不通过 | projected area | 小幅降低 `minProjectedAreaRatio` |

## 更换 OpenCV.js 构建时的注意点

本项目使用 OpenCV.js 4.12 兼容构建。该构建通过 `new cv.ORB()` 和 `new cv.BFMatcher(...)` 创建对象；部分其他版本会暴露 `ORB.create()`。这只是 JavaScript 绑定形式不同，算法等价。若更换文件，应先确认 ORB、BFMatcher、findHomography、perspectiveTransform 和 `CV_32FC2` 均被编译进构建。

## 仍可继续增强的方向

基础版有意不加入跟踪器和多线程。真实素材稳定后，可以考虑：连续 2 次命中再展示、用最近几帧角点做低通滤波、把识别放入 Web Worker，或通过 `warpPerspective` 贴一张修复图。它们应建立在当前真实识别稳定的基础上，避免让拍摄 Demo 因复杂度增加而变脆弱。
