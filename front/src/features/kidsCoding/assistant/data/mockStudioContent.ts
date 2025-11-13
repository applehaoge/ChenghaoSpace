import type { ProgrammingAssistantContent } from '../types/studio';

export const mockStudioContent: ProgrammingAssistantContent = {
  hero: {
    title: '魔法舞台 · 互动编程任务',
    subtitle: '本节课 · 视觉特效 + 音乐同步',
    description: '按照 3 个步骤完成舞台布置、节奏变色和互动彩带，完成后提交屏幕录制即可。',
    videoUrl: 'https://cdn.coverr.co/videos/coverr-animation-of-colorful-waves-7370/1080p.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    soundtrackUrl: 'https://cdn.pixabay.com/download/audio/2023/02/28/audio_b7cee0b92d.mp3?filename=storybook-140795.mp3',
    tasks: [
      {
        title: '基础任务：舞台背景',
        detail: '加载 background.png，绘制舞台 + 角色 + UI，窗口尺寸保持 960×540。',
        badge: 'Step 01',
      },
      {
        title: '进阶任务：节奏变色',
        detail: '根据 beat 列表让角色依次切换 4 种颜色，并保持刷新频率一致。',
        badge: 'Step 02',
      },
      {
        title: '挑战任务：互动彩带',
        detail: '新增“欢呼”按钮，触发彩带粒子和观众音效，动画持续 3 秒。',
        badge: 'Step 03',
      },
    ],
  },
  gallery: [
    {
      id: 'gallery-1',
      title: '舞台背景示例',
      description: '使用渐变和星轨纹理营造夜晚舞台氛围。',
      thumbnail: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80',
      mediaType: 'image',
      accent: '#C084FC',
    },
    {
      id: 'gallery-2',
      title: '角色动作分镜',
      description: '展示跳跃、旋转两帧动画，便于比对。',
      thumbnail: 'https://images.unsplash.com/photo-1500534314209-40c30c0b9a4c?auto=format&fit=crop&w=800&q=80',
      mediaType: 'image',
      accent: '#38BDF8',
    },
  ],
  practice: [
    {
      id: 'practice-choice',
      type: 'choice',
      title: '选择题：颜色循环',
      concept: 'for loop',
      difficulty: 'easy',
      prompt: '以下哪段代码可以让角色颜色在 ["red","blue","green"] 中循环？',
      options: [
        'for color in ["red","blue","green"]: paint(color)',
        'paint("red","blue","green")',
        'color = random.choice(["red","blue","green"])',
        'if color == "red": paint("blue")',
      ],
      answerIndex: 0,
    },
    {
      id: 'practice-fill',
      type: 'fill',
      title: '填空题：音效同步',
      concept: '函数参数',
      difficulty: 'medium',
      prompt: 'def play_beat(___, tempo):',
      blanks: ['track_name'],
    },
    {
      id: 'practice-match',
      type: 'match',
      title: '连线题：API 对应功能',
      concept: 'API mapping',
      difficulty: 'hard',
      leftColumn: ['set_stage()', 'add_particle()', 'sync_music()'],
      rightColumn: ['渲染背景', '创建彩带', '播放节奏'],
    },
  ],
  highlights: [
    '确认 main.py 已保存到「舞台任务」项目目录',
    '解压 assets/stage-pack.zip，并复制素材到 assets 文件夹',
    '准备耳机或调低音箱音量，方便对照音乐节奏',
  ],
  knowledgePoints: [
    {
      id: 'knowledge-loop',
      title: '循环与灯光变色',
      summary: '通过 for 循环迭代颜色数组，实现角色的节奏变色效果。',
      mediaUrl: 'https://images.unsplash.com/photo-1500534314209-9c3b1d87f6d0?auto=format&fit=crop&w=800&q=80',
      mediaType: 'image',
      tips: ['使用 COLOR_LIST 常量存储色彩方案', '循环中加入延时，让节奏与音乐同步'],
    },
    {
      id: 'knowledge-audio',
      title: '音频与动画同步',
      summary: '监听音乐 beat 事件，并在回调中触发角色动作。',
      mediaUrl: 'https://images.unsplash.com/photo-1500534314209-5b6a1c934b63?auto=format&fit=crop&w=800&q=80',
      mediaType: 'video',
      tips: ['play_sound(track, tempo)', 'beat 回调内不要阻塞，避免掉帧'],
    },
  ],
};
