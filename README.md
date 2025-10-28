# ChenghaoSpace

ChenghaoSpace 是一个结合 Fastify 后端与 Vite + React 前端的 AI 对话 Demo，当前提供多会话管理、会话记忆、文件上传与附件上下文分析等能力，适合演示企业级 AI 辅助工作流的基本形态。

## 目录结构

- front/：Vite + React 前端代码（页面、组件、hooks、API 封装）
- server/：Fastify 后端服务（TypeScript，包含 provider、memory、upload 模块）
- server_data/：会话与上传文件的默认持久化目录
- PROCESS.md：前后端对接过程记录
- progress.md：每日进度与手动验证清单

## 核心能力

1. 多会话隔离：前端维护任务列表与 sessionId，实现历史对话归档与切换。
2. 会话记忆体系：后端支持短期上下文、向量检索与自动摘要，方便模型保留长期事实。
3. 附件解析：文件上传后生成上下文片段，当前支持图片基础分析并可扩展到更多类型。
4. 流式响应体验：前端气泡以流式方式渲染回答，同时处理超时、失败等公共效果。
5. 本地持久化：会话、记忆、上传记录默认写入 server_data/，便于离线演示与追踪。

## 快速开始

1. 安装依赖：在仓库根目录执行 pnpm install，必要时再执行 pnpm --filter ./server build。
2. 配置后端：在 server/.env 内设置 provider 与密钥，可参考 server/.env.example。
3. 配置前端：在 front/.env.local 指定后端地址，例如 VITE_API_BASE=http://localhost:8302。
4. 启动服务： pnpm --filter ./server dev 启动后端，进入 front 目录执行 pnpm dev 启动前端。

## 开发约定

- 新能力默认通过 progress.md 记录验证步骤，便于回溯。
- 优化现有功能时保持接口与交互兼容，不破坏既有体验。
- 代码新增默认使用 TypeScript，并遵循 ESLint + Prettier 约定。

## 后续规划

- 引入更加细粒度的测试用例，覆盖多会话、附件与记忆链路。
- 接入更多模型提供商，并抽象 provider 能力以便扩展。
- 优化当前缩放式布局，替换为真正的响应式适配方案。

欢迎提供建议或贡献代码，一起把 Demo 打磨到可投简历的水平。
