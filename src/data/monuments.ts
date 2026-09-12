import type { Monument } from '../types/monument';
import { publicAsset } from '../utils/assets';

export const monuments: Monument[] = [
  {
    id: 'learning-rules',
    name: '岳麓书院18条学规',
    subtitle: '碑刻',
    referenceImage: publicAsset('reference/learning-rules.png'),
    description: '岳麓书院18条学规,清乾隆十三年（1748）刻，岳麓书院山长王文清撰文，受业子弟勒石。',
    originalText: '怀古忧时，传道济民',
    interpretation: '从“育人”和“治学”两个方面入手，对书院学生提出了切实可行的做人与为学的要求。这个学规和讲坛上张拭的《岳麓书院记》一样，阐明了书院在培养人才上的一贯立场。',
  },
  {
    id: 'academy-history-1',
    name: '岳麓书院记',
    subtitle: '书法',
    referenceImage: publicAsset('reference/history-1.png'),
    description: '两宋之际的战乱使岳麓书院遭到严重破坏。到了南宋乾道元年，即1165年，湖南安抚使刘珙主持重修岳麓书院。第二年，张栻开始主持岳麓书院教学，并撰写《岳麓书院记》，一方面记录书院从创建、兴盛、毁坏到重建的过程，另一方面借此系统说明书院究竟应该培养什么样的人。',
    originalText: '盖欲成就人才，以传道而济斯民也。',
    interpretation: '办书院的目的，是培养人才，使其能够传承儒家之“道”，并真正服务社会、造福百姓。',
  },
];
