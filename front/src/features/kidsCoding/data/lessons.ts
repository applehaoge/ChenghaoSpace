export type MissionObjective = string;
export type MissionTip = string;

export interface MissionContent {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  story: string;
  objectives: MissionObjective[];
  tips: MissionTip[];
  videoUrl: string;
  poster: string;
  timeEstimate: string;
}

export interface QuizOption {
  id: string;
  label: string;
  text: string;
}

export interface QuizContent {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  reward: number;
}

export interface LessonContent {
  id: string;
  label: string;
  summary: string;
  mission: MissionContent;
  quiz: QuizContent;
}

export interface LessonSummary {
  id: string;
  label: string;
  summary: string;
}

const LESSON_CONTENTS: Record<string, LessonContent> = {
  'mission-astro-weather': {
    id: 'mission-astro-weather',
    label: '第 1 课 · AI 气象站',
    summary: '用折线图展示温度变化，并生成安全提醒。',
    mission: {
      id: 'mission-astro-weather-mission',
      title: '任务 05 · 建造 AI 气象站',
      subtitle: '把温度传感器数据绘制成趋势图，让同学们随时掌握天气变化。',
      coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60',
      story:
        '你的队伍需要在 20 分钟内完成气象站的可视化面板。孩子需要整理数据、绘制折线图，并给出 AI 提示，帮助老师快速判断是否需要发布降温提醒。',
      objectives: ['读取 csv 数据', '使用循环整理温度', '绘制折线图', '输出 AI 建议'],
      tips: ['图表要有标题和轴标签', '温度单位统一成 ℃', 'AI 建议需要提到安全提醒'],
      videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      poster: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=60',
      timeEstimate: '约 18 分钟',
    },
    quiz: {
      id: 'mission-astro-weather-quiz',
      question: '在绘制折线图时，哪段代码负责设置折线颜色？',
      options: [
        { id: 'a', label: 'A', text: 'plt.title("AI 气象站")' },
        { id: 'b', label: 'B', text: 'plt.plot(x, y, color="#3B82F6")' },
        { id: 'c', label: 'C', text: 'plt.xlabel("时间")' },
      ],
      correctOptionId: 'b',
      reward: 5,
    },
  },
  'mission-ocean-clean': {
    id: 'mission-ocean-clean',
    label: '第 2 课 · 海洋清洁队',
    summary: '统计港口塑料瓶数据，给出增援策略。',
    mission: {
      id: 'mission-ocean-clean-mission',
      title: '任务 12 · 建立海洋清洁数据面板',
      subtitle: '读取港口垃圾回收数据，分析最需要增派人手的区域。',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60',
      story:
        '海洋守护队需要你在 25 分钟内提交一份「塑料瓶清理报告」。请读取最近 7 天各海域数据，找出垃圾激增的海域，并给出 AI 建议。',
      objectives: ['解析 JSON 数据', '统计各海域塑料瓶数量', '绘制对比柱状图', '输出调度建议'],
      tips: ['注意 y 轴单位统一', '标注最高峰的日期', '建议里要有环保提醒'],
      videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=60',
      timeEstimate: '约 22 分钟',
    },
    quiz: {
      id: 'mission-ocean-clean-quiz',
      question: '想突出「海域 A」的柱状条，你应该调整哪项参数？',
      options: [
        { id: 'a', label: 'A', text: 'plt.xlabel("海域")' },
        { id: 'b', label: 'B', text: 'plt.bar(areas, counts, color="#10B981")' },
        { id: 'c', label: 'C', text: 'plt.ylabel("吨数")' },
      ],
      correctOptionId: 'b',
      reward: 8,
    },
  },
};

const DEFAULT_LESSON_ID = 'mission-astro-weather';

export function getLessonContent(lessonId: string = DEFAULT_LESSON_ID): LessonContent {
  return LESSON_CONTENTS[lessonId] ?? LESSON_CONTENTS[DEFAULT_LESSON_ID];
}

export function listLessons(): LessonSummary[] {
  return Object.values(LESSON_CONTENTS).map(lesson => ({
    id: lesson.id,
    label: lesson.label,
    summary: lesson.summary,
  }));
}
