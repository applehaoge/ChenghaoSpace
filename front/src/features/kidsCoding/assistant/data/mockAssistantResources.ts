import type { AssistantResourceBundle } from '../types/assistant';

export const mockAssistantResources: AssistantResourceBundle = {
  tasks: [
    {
      id: 'task-story',
      title: '任务说明 · 创作互动故事',
      summary: '通过条件和循环绘制一个神奇舞台，同时播放背景音乐。',
      highlights: ['理解输入输出顺序', '实践循环 + 条件', '保持代码整洁'],
      assets: [
        {
          id: 'task-img-stage',
          type: 'image',
          title: '舞台示意图',
          url: '/assets/assistant/stage-preview.png',
          thumbnail: '/assets/assistant/stage-preview.png',
          description: '示意最终画面结构，方便学生对照实现。',
        },
        {
          id: 'task-audio-bgm',
          type: 'audio',
          title: '背景音乐示例',
          url: '/assets/assistant/bgm-demo.mp3',
          duration: 36,
        },
      ],
    },
    {
      id: 'task-challenge',
      title: '挑战目标 · 扩展剧情',
      summary: '让角色在舞台上自动跳舞，切换三种动作，或在终端打印剧情对白。',
      highlights: ['封装函数', '倒计时 + 动画', '加分项：角色随音乐节奏变色'],
      assets: [],
    },
  ],
  resources: [
    {
      id: 'res-video-1',
      type: 'video',
      title: '课堂回放 · 舞台控制',
      description: '讲解如何使用 pygame 在屏幕上绘制背景与角色。',
      url: 'https://cdn.example.com/videos/stage-control.mp4',
      thumbnail: '/assets/assistant/stage-video-cover.jpg',
      duration: 420,
      tags: ['pygame', '绘图'],
    },
    {
      id: 'res-doc-lesson',
      type: 'document',
      title: '教案 PDF',
      description: '教师讲义，包含讲解顺序、提问点与答案。',
      url: 'https://cdn.example.com/docs/lesson-plan.pdf',
      tags: ['教案', '讲义'],
    },
    {
      id: 'res-audio-theme',
      type: 'audio',
      title: '节奏示例音频',
      description: '可直接引用或者作为作业素材。',
      url: '/assets/assistant/theme-track.mp3',
      duration: 28,
    },
  ],
  practice: [
    {
      id: 'practice-loop',
      title: '循环与颜色练习',
      description: '完成 5 个 for 循环填空题，让角色颜色按顺序变换。',
      difficulty: 'easy',
      link: 'https://practice.example.com/loops-color',
      tags: ['for', 'color'],
    },
    {
      id: 'practice-audio',
      title: '为角色添加音效',
      description: '在运行时根据按键播放不同音效，巩固事件处理。',
      difficulty: 'medium',
      link: 'https://practice.example.com/audio-trigger',
      tags: ['pygame', 'event'],
    },
  ],
  knowledge: [
    {
      id: 'note-loop',
      title: '上一节课：循环与事件',
      summary: '复习 while 与 for 循环的区别，并回顾 event.get 的写法。',
      keywords: ['loop', 'event', 'pygame'],
      content: '在 pygame 中，我们需要在主循环里处理 event.get() 以保持窗口响应。',
      previousLesson: true,
    },
    {
      id: 'note-audio',
      title: '函数：play_sound',
      summary: '封装播放音效的函数，接受音效名称并自动加载。',
      keywords: ['function', 'audio'],
      content: 'def play_sound(name: str) -> None: pass',
    },
  ],
};
