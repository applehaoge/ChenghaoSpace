export const FORTUNE_LEVELS = ['大吉', '中吉', '小吉', '平顺'] as const;

export type FortuneActivity = {
  title: string;
  description: string;
};

export const FORTUNE_GOOD_ACTIVITIES: readonly FortuneActivity[] = [
  { title: '玩网游', description: '犹如神助，所向披靡' },
  { title: '出行', description: '一路顺风，畅通无阻' },
  { title: '学算法', description: '触类旁通，效率爆棚' },
  { title: '分享心得', description: '妙语连珠，收获掌声' },
  { title: '调试项目', description: '灵感闪现，Bug 自动消失' },
] as const;

export const FORTUNE_BAD_ACTIVITIES: readonly FortuneActivity[] = [
  { title: '写作文', description: '不知所云，容易跑题' },
  { title: '刷短视频', description: '一刷就停不下来' },
  { title: '拖延作业', description: '灵感流失，效率低下' },
  { title: '熬夜肝项目', description: '第二天精神不济' },
  { title: '临时抱佛脚', description: '记忆混乱，效果不佳' },
] as const;
