# 项目进度记录（PROGRESS.md）
## 概述
- 项目：chenghaoSpace（前端已实现基础 UI，下一步计划接入 RAG）
- 目标：在一周内完成面试用 demo，包含聊天 UI、检索增强生成、多 Provider 支持（OpenAI 为首选）以及容器化部署

## 重要变更与记录（按时间倒序）
### 2025-10-22 15:50 ✅ 会话记忆持久化（文件存储）
- 实现：为 `ConversationMemoryManager` 抽象 `MemoryStore`，默认注入 `FileMemoryStore`，将历史消息、向量与摘要写入磁盘（`server_data/memory`）。
- 改动：新增 `server/server/src/memory/storage/fileMemoryStore.ts`，重构 `conversationMemory.ts` 以异步加载/持久化，并在 `index.ts` 里根据 `MEMORY_STORE_DIR` 初始化存储。
- 配置：`server/.env.example` 与 README 新增 `MEMORY_STORE_DIR` 说明；默认目录为 `server_data/memory`。
- 备注：暂未处理会话淘汰与压缩策略，后续可扩展至 Redis/SQLite。

### 2025-10-22 14:20 ✅ 桌面端等比例缩放适配
- 操作：在 `front/src/pages/Home.tsx` 中增加 `scale` 状态和 `useEffect`，根据 `window.innerWidth` 在 1~1.35 之间对页面整体缩放，解决大屏留白严重问题。
- 操作：为根容器新增包裹层并应用 `transform-origin: top center`，确保缩放后内容居中显示。
- 操作：在 `front/src/index.css` 为 `body` 增加浅灰背景，避免缩放后出现突兀白边。
- 备注：该方案为临时方案，后续计划改为断点布局（侧栏折叠、卡片响应式）。

### 2025-10-22 13:35 ✅ 后端恢复豆包对话链路
- 操作：在 `server/.env` 与 `server/server/.env` 中补充 `PROVIDER=doubao`，确保每次启动都指向豆包 Provider。
- 操作：清理占用 8302 端口的旧进程，重新执行 `pnpm run build && pnpm start`，确认 `node dist/index.js` 正常监听。
- 验证：调用 `POST http://localhost:8302/api/chat`，返回结果 `provider: doubao`，聊天恢复正常。
- 备注：当前会话记忆仍为内存存储，重启后需要重新积累历史。

### 2025-10-21 11:30 ✅ 首页 UI 迭代
- 引入可折叠的侧栏布局拆分 ChatGPT/资讯空间，将 Home 页改为卡片式布局；补齐对话选项卡、推荐卡片等。
- 优化对话区信息密度，历史对话支持展开/折叠并预设推荐提示。
- 验证：`pnpm build:client`

### 2025-10-21 10:40 ✅ 前端接入豆包模型
- 操作：重构 `aiService`，使 `sendAIRequest`/`optimizeContent` 直接调用 `/api/chat` 并衔接豆包后端返回。
- 前端：重构 Home 页面，增加生成结果面板、加载状态和来源展示，按钮连通真实接口。
- 验证：手动触发写作任务，前端成功展示豆包回答与来源列表。

### 2025-10-21 10:10 ✅ 本地联调验证（前后端与豆包模型）
- 操作：通过 PowerShell 启动 `server/dist/index.js`（设置 `PROVIDER=doubao`，读取 `.env`）。
- 验证：调用 `POST http://localhost:8302/api/chat`，返回豆包模型生成的中文回答（`provider: doubao`），确认链路可供前端复用。

### 2025-10-21 09:55 ✅ 接入火山引擎豆包 Provider
- 操作：新增 `DoubaoProvider` 并在 `providerFactory` 注册，支持通过 `PROVIDER=doubao` 与 `DOUBAO_API_KEY` 切换。
- 配置：补充 `server/.env.example` 的豆包占位变量，并在 `README.md` 说明切换方式；默认聊天模型更新为 `doubao-seed-1-6-flash`。
- 验证：执行 `pnpm --filter ./server build`，TypeScript 编译通过。

### 2025-10-20 11:50 ✅ 持久化代理与端口配置
- 操作：创建本地 `server/.env`（示例占位），并在 `.gitignore` 忽略该文件。
- 结果：在仓库根目录执行 `pnpm --filter ./server dev` 时读取 `.env`，使用 `PORT=8302` 成功启动；`http://localhost:8302/api/chat` 返回 200。
- 提醒：真实密钥仅在本机配置，避免提交仓库；部署环境使用平台密钥管理。

### 2025-10-20 11:30 ✅ 配置代理以解决 OpenAI 连接问题
- 操作：梳理 `server/.env.example`、`run_with_env.mjs` 以及 `OpenAIProvider` 的代理逻辑。
- 发现：
  - `server/.env.example` 已提供 `OPENAI_API_KEY` 与 `OPENAI_API_BASE` 占位。
  - `run_with_env.mjs` 未显式设置时会将 `OPENAI_API_BASE` 设为 `http://localhost:8082` 并打印端口。
  - `OpenAIProvider` 读取 `HTTPS_PROXY`/`HTTP_PROXY` 并通过 `HttpsProxyAgent` 转发请求。
- 结论：如需访问受限，可配置代理变量或调整 `OPENAI_API_BASE` 指向代理，确保请求成功。

## 先前诊断要点（摘要）
- 本地 Node 测试脚本与 `curl` 调用 `api.openai.com` 出现 `ETIMEDOUT`，推断为网络阻断而非 API Key 缺失。

## 代理配置备忘
1. **为什么需要代理**：`OpenAIProvider` 会读取 `HTTPS_PROXY`/`HTTP_PROXY` 并传入 `HttpsProxyAgent`，同一进程设置即可生效；`run_with_env.mjs` 会根据 `OPENAI_API_BASE` 构建上游地址。
2. **Windows 终端设置示例**（HTTP 代理 `127.0.0.1:33210`、SOCKS5 `127.0.0.1:33211`）：
   ```powershell
   $env:HTTP_PROXY = 'http://127.0.0.1:33210'
   $env:HTTPS_PROXY = 'http://127.0.0.1:33210'
   $env:ALL_PROXY = 'socks5://127.0.0.1:33211'
   pnpm --filter ./server dev
   ```
   ```cmd
   set HTTP_PROXY=http://127.0.0.1:33210
   set HTTPS_PROXY=http://127.0.0.1:33210
   set ALL_PROXY=socks5://127.0.0.1:33211
   pnpm --filter ./server dev
   ```
3. **单次命令临时生效**：
   ```powershell
   powershell -Command "$env:HTTPS_PROXY='http://127.0.0.1:33210'; $env:OPENAI_API_BASE='http://localhost:8082'; pnpm --filter ./server dev"
   ```
   ```cmd
   cmd /C "set HTTPS_PROXY=http://127.0.0.1:33210 && set OPENAI_API_BASE=http://localhost:8082 && pnpm --filter ./server dev"
   ```
4. **通过 `OPENAI_API_BASE` 定向到自建代理**：
   ```powershell
   $env:OPENAI_API_BASE='http://localhost:8082'
   $env:OPENAI_API_KEY='你的真实密钥或代理凭据'
   pnpm --filter ./server dev
   ```
5. **连通性验证命令**：
   ```bash
   curl -v http://localhost:8082/v1/models
   curl -sS -X POST -H "Content-Type: application/json" -d '{"query":"测试OpenAI连接"}' http://localhost:8000/api/chat -w '\nHTTP_STATUS:%{http_code}\n'
   ```
6. **持久化配置建议**：将密钥写入本地 `.env`（已在 `.gitignore` 忽略）；或使用 `setx`/`export` 在系统层面设置。
7. **安全注意事项**：避免将真实密钥或代理凭据提交仓库，使用安全凭据管理；确保代理不会执行不安全的 TLS 中间人。
8. **相关代码定位**：
   - `OpenAIProvider` 读取代理：`server/src/providers/openaiProvider.ts`。
   - `run_with_env.mjs` 默认 `OPENAI_API_BASE` 逻辑：`server/run_with_env.mjs`。
   - 配置示例：`server/.env.example`。

> 本文自 2025-10-20 起由自动化助手维护，用于记录排障与配置要点。
### 2025-10-23 12:50 ? 聊天首句去重优化\n- 更新 ront/src/pages/Home.tsx，为 ChatInterface 增加 onInitialMessageHandled 回调，并在初始消息派发后立即通知父组件清空，规避 React StrictMode 下的重复问候。\n- 新回调在 Home 组件中实现，配合已有会话删除功能，确保首次打招呼只触发一次 AI 回复并保持状态同步。\n
