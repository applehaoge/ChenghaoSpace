export interface VocabularyCardContent {
  word: string;
  description: string;
  image: string;
  example?: string;
  pronunciation?: string;
}

const VOCABULARY_CARDS: Record<string, VocabularyCardContent> = {
  折线图: {
    word: '折线图',
    description: '用折线连接数据点的图表，适合展示随时间变化的趋势。',
    image: 'https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=800&q=60',
    example: '用来呈现 24 小时的温度变化。',
  },
  降温提醒: {
    word: '降温提醒',
    description: '在温度短时间下降时，提醒大家增添衣物或调整活动安排的提示。',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60',
    example: '广播提示同学晚上出门记得穿外套。',
  },
  温度: {
    word: '温度',
    description: '描述冷热程度的物理量，可用摄氏度或华氏度表示。',
    image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=60',
    example: '传感器每分钟采集一次温度值。',
  },
  Hello: {
    word: 'Hello',
    description: '最常见的英语问候语，用来友好地和别人打招呼。',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=60',
    pronunciation: '/həˈloʊ/',
    example: '在汇报前先跟老师说 Hello 表示礼貌。',
  },
  塑料瓶: {
    word: '塑料瓶',
    description: '常见的饮料或日用品容器，使用后需要分类回收，避免污染海洋。',
    image: 'https://images.unsplash.com/photo-1447958374760-1ce70cf11ee3?auto=format&fit=crop&w=800&q=60',
    example: '记录各港口一周内清理出的塑料瓶数量。',
  },
  海域: {
    word: '海域',
    description: '海洋中的特定区域，可按港口、渔场或旅游区等不同功能进行划分。',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60',
    example: '分析哪个海域的垃圾增长最明显。',
  },
};

export function getVocabularyCard(word: string): VocabularyCardContent | undefined {
  return VOCABULARY_CARDS[word];
}

