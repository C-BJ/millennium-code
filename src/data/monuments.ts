import type { Monument } from '../types/monument';
import { publicAsset } from '../utils/assets';

export const monuments: Monument[] = [
  {
    id: 'millennium-echo',
    name: '千年回响',
    subtitle: '示例碑刻一',
    referenceImage: publicAsset('reference/millennium-echo.svg'),
    description: '此图为可直接测试识别流程的占位参考图。将它显示在另一块屏幕上，再用手机摄像头扫描即可。',
    originalText: '惟楚有材，于斯为盛。',
    interpretation: '楚地人才辈出，而岳麓书院正是人才汇聚兴盛之地。正式拍摄前，请替换为正面、清晰、纹理丰富的真实照片。',
  },
  {
    id: 'academy-light',
    name: '书院之光',
    subtitle: '示例楹联二',
    referenceImage: publicAsset('reference/academy-light.svg'),
    description: '第二个特征丰富的占位目标，用来验证多目标匹配与最佳候选选择。',
    originalText: '纳于大麓，藏之名山。',
    interpretation: '学问汇聚于岳麓，典籍与精神长存名山。这里的文字与资料均可在 monuments.ts 中替换。',
  },
];
