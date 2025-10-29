# 项目进度记录（PROGRESS.md）

## 🧩 概述
- 项目名称：ChenghaoSpace
- 类型：AI Chat Demo（自研前后端）
- 当前能力：聊天 UI、Doubao Provider 接入、附件上下文、会话记忆
- 目标：一周内完成可投简历 Demo（RAG、双 Provider、容器化部署、图文消息、持久记忆）

## 🚀 重要变更日志（倒序）
- **2025-10-29 平铺后端目录 + 单元测试接入 + AI 协作指引**
  - 将 `server/server/src` 平铺为 `server/src`，清理历史构建产物
  - 更新构建脚本与依赖，`pnpm --filter ./server build` 通过
  - 引入 Vitest，新增 `pnpm --filter ./server test`，补写 `fsHelpers` 单测
  - README 增补 AI 协作提示词模板与自检流程，规范后续开发
- **2025-10-28 附件上下文与上传持久化**
  - Fastify 增加 `/uploads/:fileName` 静态路由，统一生成下载地址
  - 前端上传钩子保存远端 URL，刷新后图片仍能展示
  - 本地存档读取时自动补齐历史附件的访问链接
- **2025-10-27 多会话隔离 + Streaming 升级（进行中）**
  - 新增消息仓库 `messagesRegistryRef`，防止切换对话串台
  - Streaming 与 sessionId 绑定，避免跨会话污染
- **2025-10-27 Loading Toast 生命周期管理**
  - 使用 `try/finally` 确保 toast 正确关闭
  - 修复失败请求导致 Spinner 卡死的问题
- **2025-10-27 页面模块化调整**
  - Home 页面拆分为 `chat/`、`attachments/`、`home/` 模块
  - 职责更聚焦，复用性提升
- **2025-10-23 Markdown 代码块复制按钮**
  - 为所有代码块提供独立复制按钮，兼容无 Clipboard API 场景
  - Toast 提示成功 / 失败
- **2025-10-23 输入交互优化**
  - `Enter` 发送消息，`Shift+Enter` 换行
  - 改动与其他输入场景兼容
- **2025-10-23 会话初始化修复**
  - 引入 `lastConversationIdRef`，解决 StrictMode 双渲染导致的重复对话
- **2025-10-22 会话记忆持久化**
  - ConversationMemoryManager 支持文件持久化，默认目录 `server_data/memory`
  - 计划扩展 Redis / pgvector
- **2025-10-22 自适应临时方案**
  - 宽屏缩放与溢出保护，暂时规避断层问题
- **2025-10-22 Provider 路由修复**
  - `.env` 配置对齐，端口占用清理
  - `/api/chat` 返回 `provider: doubao`
- **2025-10-21 首页 UI 迭代**
  - 聊天区域卡片化、历史区可折叠、推荐提示展示
- **2025-10-21 前端接入豆包模型**
  - `aiService` 调用 `/api/chat`
  - 支持模型输出流式响应
- **2025-10-21 Doubao Provider 适配**
  - 新增 DoubaoProvider，默认模型 `doubao-seed-1-6-flash`
- **2025-10-20 环境与代理配置**
  - `.env.example` 补齐，`.gitignore` 屏蔽敏感文件
  - 成功绕过 OpenAI 网络限制

## 🔍 诊断摘要
- 典型问题：`ETIMEDOUT` → 检查代理与网络连通性
- 常用测试命令：
  ```bash
  curl -v http://localhost:8082/v1/models
  curl -sS -X POST -H "Content-Type: application/json" \
    -d '{"query":"测试OpenAI连接"}' \
    http://localhost:8302/api/chat -w '\nHTTP_STATUS:%{http_code}\n'
  ```

## 🌐 代理配置备忘
- Windows 临时示例：
  ```powershell
  $env:HTTP_PROXY='http://127.0.0.1:33210'
  $env:HTTPS_PROXY='http://127.0.0.1:33210'
  $env:ALL_PROXY='socks5://127.0.0.1:33211'
  pnpm --filter ./server dev
  ```
- 密钥与代理凭据仅保留在本地，部署时改用环境变量托管。
