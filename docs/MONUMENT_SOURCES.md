# 碑刻资料与图片来源

本文件记录 `src/data/monuments.ts` 中历史资料的考据来源，以及随项目分发的网络参考图许可。资料文字采用摘要改写，不把网页全文复制进项目。

## 史料来源

- [岳麓书院官网：书院碑刻](https://ylsy.hnu.edu.cn/info/1011/9008.htm)：岳麓书院学规碑、麓山寺碑、忠孝廉节碑的年代、作者、尺寸、位置和内容简介。
- [岳麓书院官网：历史沿革](https://ylsy.hnu.edu.cn/info/1011/8809.htm)：张栻掌教、《岳麓书院记》与“传道济民”办学宗旨的年代背景。

## 新增参考图

### 麓山寺碑拓片

- 项目文件：`public/reference/lushan-temple-stele-rubbing.jpg`
- 来源：[Wikimedia Commons：Lu shan si bei.jpg](https://commons.wikimedia.org/wiki/File:Lu_shan_si_bei.jpg)
- 图像说明：麓山寺碑拓片，李邕撰书；Commons 页面注明原始图源为中国国家图书馆。
- 许可：Public Domain。
- 识别说明：拓片是平整矩形且文字纹理丰富，适合在屏幕或打印件上验证 ORB + Homography；它和现场隔着护栏拍到的碑面并不完全相同。

### 忠孝廉节碑（忠廉二碑）

- 项目文件：`public/reference/loyalty-integrity-steles.jpg`
- 原图：[Wikimedia Commons：岳麓书院忠廉 20181012.jpg](https://commons.wikimedia.org/wiki/File:%E5%B2%B3%E9%BA%93%E4%B9%A6%E9%99%A2%E5%BF%A0%E5%BB%89_20181012.jpg)
- 作者：WFan。
- 许可：[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)。本项目图片是原图的居中裁剪与缩小版本，继续使用相同许可。
- 识别说明：裁剪去掉了大部分屋顶和游客，只保留“忠”“廉”二碑及固定墙面。由于原图仍有少量游客遮挡，现场使用前最好替换为自己拍摄的无遮挡正面图。

## 为什么不能随便保存搜索结果图片

搜索引擎展示图片不等于图片可以重新发布。静态网站会把 `public/` 中的文件直接公开，因此只有许可明确的图片才适合随仓库部署。自己的实拍图最适合作为识别参考：版权清楚，并且能按实际拍摄距离、镜头和光照采集。

更换图片时保留 `Monument` 的文字资料即可，只需替换 `referenceImage` 路径。若新图来自他人，请同步更新 `imageAttribution`。
