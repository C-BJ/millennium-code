import type { Monument } from '../types/monument';
import { publicAsset } from '../utils/assets';

export const monuments: Monument[] = [
  {
    id: 'learning-rules',
    name: '岳麓书院18条学规',
    subtitle: '碑刻',
    referenceImage: publicAsset('reference/learning-rules.png'),
    description: '岳麓书院18条学规，清乾隆十三年（1748）刻，岳麓书院山长王文清撰文，受业子弟勒石。',
    originalText: '时常省问父母，朔望恭谒圣贤；气习各矫偏处，举止整齐严肃；服食宜从俭素，外事毫不可干；行坐必依齿序，痛戒讦短毁长；损友必须拒绝，不可闲谈废时；日讲经书三起，日看纲目数页；通晓时务物理，参读古文诗赋；读书必须过笔，会课按刻蚤完；夜读仍戒晏起，疑误定要力争。',
    interpretation: '十八条学规从“育人”和“治学”两方面，对学生的日常修养、交友、读书方法和学习纪律提出了具体要求。',
    sources: [
      { label: '岳麓书院官网·书院碑刻', url: 'https://ylsy.hnu.edu.cn/info/1011/9008.htm' },
    ],
  },
  {
    id: 'academy-history-1',
    name: '岳麓书院记',
    subtitle: '书法',
    referenceImage: publicAsset('reference/history-1.png'),
    description: '两宋之际的战乱使岳麓书院遭到严重破坏。到了南宋乾道元年，即1165年，湖南安抚使刘珙主持重修岳麓书院。第二年，张栻开始主持岳麓书院教学，并撰写《岳麓书院记》，一方面记录书院从创建、兴盛、毁坏到重建的过程，另一方面借此系统说明书院究竟应该培养什么样的人。',
    originalText: '盖欲成就人才，以传道而济斯民也。',
    interpretation: '办书院的目的，是培养人才，使其能够传承儒家之“道”，并真正服务社会、造福百姓。',
    sources: [
      { label: '岳麓书院官网·历史沿革', url: 'https://ylsy.hnu.edu.cn/info/1011/8809.htm' },
    ],
  },
  {
    id: 'lushan-temple-stele',
    name: '麓山寺碑',
    subtitle: '唐刻 · 拓片',
    referenceImage: publicAsset('reference/lushan-temple-stele-rubbing.jpg'),
    description: '唐开元十八年（730）立，李邕撰书、黄仙鹤镌刻，现位于岳麓书院园林麓山寺碑亭。碑通高410厘米，正文部分纵271厘米、横143厘米，因文辞、书法与刻工俱佳，被誉为“北海三绝碑”。',
    originalText: '麓山寺碑',
    interpretation: '碑文记述麓山寺自西晋创建至唐代立碑时的兴废沿革、历代禅师弘法经过，以及主持立碑者窦彦澄的生平与赞辞。当前参考图是拓片，适合用另一块屏幕或打印件测试识别。',
    sources: [
      { label: '岳麓书院官网·书院碑刻', url: 'https://ylsy.hnu.edu.cn/info/1011/9008.htm' },
    ],
    imageAttribution: {
      author: '李邕撰书；图源中国国家图书馆 / Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lu_shan_si_bei.jpg',
      license: 'Public Domain',
    },
  },
  {
    id: 'loyalty-integrity-steles',
    name: '忠孝廉节碑',
    subtitle: '清刻 · 忠廉二碑',
    referenceImage: publicAsset('reference/loyalty-integrity-steles.jpg'),
    description: '“忠孝廉节”四字为南宋乾道三年（1167）朱熹手书。现存四通青石碑由山长欧阳厚均于清道光七年（1827）刊立，分嵌于岳麓书院讲堂南北两壁。',
    originalText: '忠　孝　廉　节',
    interpretation: '当前参考图裁取讲堂北壁的“忠”“廉”二碑。实景扫描时请让两块碑尽量同时入镜；若以后分别拍摄四块碑，可拆成四个独立识别目标。',
    sources: [
      { label: '岳麓书院官网·书院碑刻', url: 'https://ylsy.hnu.edu.cn/info/1011/9008.htm' },
    ],
    imageAttribution: {
      author: 'WFan（本项目使用裁剪版本）',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:%E5%B2%B3%E9%BA%93%E4%B9%A6%E9%99%A2%E5%BF%A0%E5%BB%89_20181012.jpg',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
  },
];
