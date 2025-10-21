# 橙浩空间 - AI智能助手平台

## 平台介绍

橙浩空间是一款基于先进AI技术的智能助手平台，旨在帮助用户快速生成、优化各种类型的内容，提高工作效率和创造力。平台采用现代化的前端技术栈，提供直观友好的用户界面和强大的后端服务支持。

## 主要功能

- **多类型内容生成**：支持写作、PPT、设计、Excel、网页、播客等多种类型内容的智能生成
- **一键内容优化**：对现有内容进行智能优化，提供专业建议
- **项目管理**：管理和访问各种AI项目，查看项目详情
- **灵感推荐**：每日提供创意灵感，激发用户创作
- **多AI专家支持**：提供不同领域的AI专家助手，满足各种专业需求
- **任务管理**：创建和管理AI任务，追踪任务进度

## 技术架构

### 前端技术栈
- **React 18+**：构建用户界面的核心框架
- **TypeScript**：提供类型安全的开发体验
- **Tailwind CSS**：实现响应式设计和现代化UI
- **React Router**：处理页面路由
- **Framer Motion**：添加流畅的动画效果
- **Sonner**：提供优雅的通知系统
- **Recharts**：数据可视化组件

### 后端服务
- **模拟AI服务**：通过`aiService.ts`实现的模拟API服务，提供各种AI功能
- **多模型 Provider**：后端 Node 服务现已支持按环境变量切换 OpenAI 或豆包（设置`PROVIDER=doubao`并提供`DOUBAO_API_KEY`，默认使用`doubao-seed-1-6-flash`）
- **本地存储**：使用localStorage保存用户偏好设置

## 页面结构

### 侧边栏（Sidebar）
- 平台标题和Logo
- 创建新任务按钮
- AI专家列表
- 任务列表

### 主内容区（MainContent）
- 标题和灵感推荐
- 内容类型选择标签
- 输入区域和操作按钮
- 最佳实践项目展示

### 浮动帮助按钮
- 提供即时客服支持

## API接口说明

平台的主要API功能集中在`aiService.ts`文件中，提供以下核心服务：

### 1. 创建新任务
```typescript
createNewTask(taskType: string, content: string): Promise<{ success: boolean; taskId?: string; message?: string }>
```
- **功能**：创建一个新的AI任务
- **参数**：
  - `taskType`：任务类型
  - `content`：任务内容
- **返回值**：
  - `success`：操作是否成功
  - `taskId`：任务ID（成功时返回）
  - `message`：操作结果消息

### 2. 发送AI请求
```typescript
sendAIRequest(taskType: string, prompt: string): Promise<{ 
  success: boolean; 
  result?: string; 
  error?: string;
  processingTime?: number;
  tokensUsed?: number;
}>
```
- **功能**：向AI发送请求，生成指定类型的内容
- **参数**：
  - `taskType`：请求类型（如"写作"、"PPT"、"设计"等）
  - `prompt`：请求提示词
- **返回值**：
  - `success`：操作是否成功
  - `result`：生成的内容结果（成功时返回）
  - `error`：错误信息（失败时返回）
  - `processingTime`：处理时间（毫秒）
  - `tokensUsed`：使用的Token数量

### 3. 优化内容
```typescript
optimizeContent(content: string): Promise<{ 
  success: boolean; 
  optimizedContent?: string; 
  suggestions?: string[];
  error?: string;
}>
```
- **功能**：优化现有内容，提供改进建议
- **参数**：
  - `content`：需要优化的内容
- **返回值**：
  - `success`：操作是否成功
  - `optimizedContent`：优化后的内容（成功时返回）
  - `suggestions`：优化建议列表（成功时返回）
  - `error`：错误信息（失败时返回）

### 4. 获取项目详情
```typescript
getProjectDetails(projectId: string): Promise<{
  success: boolean;
  project?: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    bgColor: string;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}>
```
- **功能**：获取指定项目的详细信息
- **参数**：
  - `projectId`：项目ID
- **返回值**：
  - `success`：操作是否成功
  - `project`：项目详细信息（成功时返回）
  - `error`：错误信息（失败时返回）

### 5. 获取灵感推荐
```typescript
getInspiration(): Promise<{
  success: boolean;
  inspiration?: string;
  error?: string;
}>
```
- **功能**：获取随机的创意灵感
- **返回值**：
  - `success`：操作是否成功
  - `inspiration`：灵感文本（成功时返回）
  - `error`：错误信息（失败时返回）

## 使用示例

### 发送AI请求
```typescript
import { aiService } from '@/api/aiService';

// 生成一篇关于"人工智能应用"的文章
const response = await aiService.sendAIRequest('写作', '人工智能应用');
if (response.success) {
  console.log('生成的内容:', response.result);
  console.log('处理时间:', response.processingTime, 'ms');
  console.log('使用Token:', response.tokensUsed);
} else {
  console.error('生成失败:', response.error);
}
```

### 优化内容
```typescript
import { aiService } from '@/api/aiService';

// 优化一段文本内容
const response = await aiService.optimizeContent('这是一段需要优化的文本内容');
if (response.success) {
  console.log('优化后的内容:', response.optimizedContent);
  console.log('优化建议:', response.suggestions);
} else {
  console.error('优化失败:', response.error);
}
```

### 获取项目详情
```typescript
import { aiService } from '@/api/aiService';

// 获取指定项目的详情
const response = await aiService.getProjectDetails('project_ai_writing');
if (response.success) {
  console.log('项目标题:', response.project?.title);
  console.log('项目描述:', response.project?.description);
  console.log('项目创建时间:', response.project?.createdAt);
} else {
  console.error('获取失败:', response.error);
}
```

## 开发指南

### 项目结构
- `src/App.tsx`：应用入口组件，处理路由配置
- `src/pages/`：页面组件
- `src/components/`：通用组件
- `src/api/`：API服务
- `src/contexts/`：React上下文
- `src/hooks/`：自定义React hooks
- `src/lib/`：工具函数

### 运行项目
```bash
# 安装依赖
pnpm install

# 后端（server）运行说明：
# 在 server/ 下创建 .env（可复制 server/.env.example），并设置 OPENAI_API_KEY 或 DOUBAO_API_KEY（豆包默认模型为 doubao-seed-1-6-flash，可按需覆盖 DOUBAO_CHAT_MODEL）
# 可选：设置 OPENAI_API_BASE 指向自建的上游代理（如果直接访问 api.openai.com 被限制）
# 示例：
#   OPENAI_API_KEY=sk-xxxx
#   OPENAI_API_BASE=https://api.openai.com

# 构建并运行 server（TypeScript -> dist）
pnpm --filter ./server build
node ./server/dist/index.js

# 或直接运行（若本地已安装 ts-node-dev 或使用 dev 脚本）
# 若已在 server/.env 中持久化了 PORT 与代理（HTTP_PROXY/HTTPS_PROXY/ALL_PROXY），可以直接运行以下命令而无需每次手动设置环境变量：
pnpm --filter ./server dev

# 手动设置（仅在不使用 server/.env 时需要）
# PowerShell（当前会话）：
#   $env:HTTP_PROXY = 'http://127.0.0.1:33210'
#   $env:HTTPS_PROXY = 'http://127.0.0.1:33210'
#   $env:ALL_PROXY = 'socks5://127.0.0.1:33211'
#   pnpm --filter ./server dev

# CMD（当前窗口）：
#   set HTTP_PROXY=http://127.0.0.1:33210
#   set HTTPS_PROXY=http://127.0.0.1:33210
#   set ALL_PROXY=socks5://127.0.0.1:33211
#   pnpm --filter ./server dev

# Git Bash / WSL：
#   export HTTP_PROXY='http://127.0.0.1:33210' HTTPS_PROXY='http://127.0.0.1:33210' ALL_PROXY='socks5://127.0.0.1:33211'
#   pnpm --filter ./server dev

# 启动前端开发服务器
pnpm dev:client

# 构建前端
pnpm build:client
```

## 平台特色

- **用户友好的界面**：现代化设计，简洁直观的操作流程
- **多类型内容支持**：满足不同场景下的内容生成需求
- **智能优化建议**：提供专业的内容改进建议
- **高效的API服务**：快速响应，低延迟的用户体验
- **丰富的项目模板**：提供多种最佳实践项目参考
