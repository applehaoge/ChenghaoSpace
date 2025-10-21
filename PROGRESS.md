# 项目进度记录（PROGRESS.md）

## 概述
- 项目：chenghaoSpace（前端已实现基础 UI，下一步计划接入 RAG）
- 目标：在一周内完成面试向 demo，包含聊天 UI、检索增强生成、多 Provider 支持（OpenAI 为首选）以及容器化部署

## 重要变更与记录（按时间倒序）

### 2025-10-21 10:40 ✅ 前端接入豆包模型
- 操作：重写 aiService，使 sendAIRequest/optimizeContent 直接调用 `/api/chat` 并衔接豆包后端返回
- 前端：重构 Home 页面，增加生成结果面板、加载状态和来源展示，按钮联动真实接口
- 验证：手动触发写作任务，前端成功展示豆包回答与来源列表

### 2025-10-21 09:55 ✅ 接入火山引擎豆包 Provider
- 操作：新增 `DoubaoProvider` 并在 `providerFactory` 中注册，支持通过 `PROVIDER=doubao` 与 `DOUBAO_API_KEY` 切换至豆包（`server/src/providers/doubaoProvider.ts`、`server/src/providers/providerFactory.ts`）
- 配置：补充 `server/.env.example` 中的豆包相关占位变量，并在 `README.md` 中说明切换方式；默认聊天模型更新为 `doubao-seed-1-6-flash`
- 验证：运行 `pnpm --filter ./server build`，TypeScript 编译通过

### 2025-10-21 10:10 ✅ 本地联调验证（前后端接口与豆包模型）
- 操作：通过 PowerShell 启动 `server/dist/index.js`（设置 `PROVIDER=doubao`、加载 `.env`），调用 `POST http://localhost:8302/api/chat`
- 结果：接口返回豆包模型生成的中文回答（provider 字段为 `doubao`），确认后端链路与模型通信正常；可供前端 `aiService` 直接复用

### 2025-10-20 11:50 ✅ 持久化代理与端口配置
- 操作：为减少重复输入，在本地创建 `server/.env`（仅占位，不含真实 Key），并在 `.gitignore` 中忽略该文件
- 变更文件：
  - 新增 `server/.env`（示例内容：`OPENAI_API_KEY=`、`OPENAI_API_BASE=http://localhost:8082`、`PORT=8302` 以及代理相关占位）
  - 修改 `.gitignore`，增加 `server/.env` 条目，避免误提交
- 结果：在仓库根目录执行 `pnpm --filter ./server dev` 时，会读取 `.env` 并使用其中的 `PORT=8302` 成功启动；通过 `http://localhost:8302/api/chat` 测试响应 200
- 安全提醒：真实 `OPENAI_API_KEY` 请勿提交到仓库；CI/部署环境请改用平台密钥管理

### 2025-10-20 11:30 ✅ 配置代理以解决 OpenAI 连接问题（操作记录）
- 操作：检查 `server/.env.example`、`run_with_env.mjs` 以及 `OpenAIProvider` 的代理实现
- 发现：
  - `server/.env.example` 已给出 `OPENAI_API_KEY` 与可选 `OPENAI_API_BASE`
  - `run_with_env.mjs` 在未显式设置时会将 `OPENAI_API_BASE` 设为 `http://localhost:8082`，并在启动时打印端口与 base
  - `OpenAIProvider` 会读取 `HTTPS_PROXY`/`HTTP_PROXY` 并通过 `HttpsProxyAgent` 转发请求
- 结论：若本机访问 `api.openai.com` 受限，可通过设置 `HTTPS_PROXY/HTTP_PROXY` 或调整 `OPENAI_API_BASE` 指向本地/远程代理，确保请求成功

## 先前诊断要点（摘要）
- 本地 Node 测试脚本及 `curl` 调用 `api.openai.com` 报 `ETIMEDOUT`，推断为网络阻断而非 API Key 缺失

## 代理配置备忘

1. **为什么需要代理**
   - `OpenAIProvider` 会读取 `HTTPS_PROXY`/`HTTP_PROXY` 并传入 `HttpsProxyAgent`，因此只要在同一进程环境设置代理变量，请求即可通过代理发送
   - `run_with_env.mjs` 会根据 `OPENAI_API_BASE` 构建上游地址，可配合自建 HTTP 代理使用

2. **Windows 各终端设置代理示例**（以 HTTP 代理 `127.0.0.1:33210`、SOCKS5 `127.0.0.1:33211` 为例）
   - **PowerShell（当前会话生效）**
     ```
     $env:HTTP_PROXY = 'http://127.0.0.1:33210'
     $env:HTTPS_PROXY = 'http://127.0.0.1:33210'
     $env:ALL_PROXY = 'socks5://127.0.0.1:33211'
     pnpm --filter ./server dev
     ```
   - **CMD（当前窗口生效）**
     ```
     set HTTP_PROXY=http://127.0.0.1:33210
     set HTTPS_PROXY=http://127.0.0.1:33210
     set ALL_PROXY=socks5://127.0.0.1:33211
     pnpm --filter ./server dev
     ```
     或在同一行写入：
     ```
     set HTTP_PROXY=http://127.0.0.1:33210&& set HTTPS_PROXY=http://127.0.0.1:33210&& pnpm --filter ./server dev
     ```
   - **Git Bash / WSL**
     ```
     export HTTP_PROXY='http://127.0.0.1:33210' HTTPS_PROXY='http://127.0.0.1:33210' ALL_PROXY='socks5://127.0.0.1:33211'
     pnpm --filter ./server dev
     ```

3. **单次命令临时生效**
   - PowerShell：
     ```
     powershell -Command "$env:HTTPS_PROXY='http://127.0.0.1:33210'; $env:OPENAI_API_BASE='http://localhost:8082'; pnpm --filter ./server dev"
     ```
   - CMD：
     ```
     cmd /C "set HTTPS_PROXY=http://127.0.0.1:33210 && set OPENAI_API_BASE=http://localhost:8082 && pnpm --filter ./server dev"
     ```

4. **通过 `OPENAI_API_BASE` 定向到自建代理**
   - 在开发环境可设置：
     ```
     $env:OPENAI_API_BASE='http://localhost:8082'
     $env:OPENAI_API_KEY='你的真实密钥或代理所需凭据'
     pnpm --filter ./server dev
     ```

5. **连通性验证命令**
   - 验证代理可访问：
     ```
     curl -v http://localhost:8082/v1/models
     ```
   - 验证服务路由：
     ```
     curl -sS -X POST -H "Content-Type: application/json" -d '{"query":"测试OpenAI连接"}' http://localhost:8000/api/chat -w '\nHTTP_STATUS:%{http_code}\n'
     ```

6. **持久化配置建议**
   - 最安全方式：将 `OPENAI_API_KEY`、`OPENAI_API_BASE` 写入本地 `server/.env`（已在 `.gitignore` 中忽略），避免提交敏感信息
   - 若需在 Windows 系统层面持久化，可使用：
     ```
     setx HTTPS_PROXY "http://127.0.0.1:33210"
     setx OPENAI_API_BASE "http://localhost:8082"
     ```
     重新打开终端/VSCode 后生效
   - 也可在脚本中配合 `cross-env` 或在 `package.json` 命令前加前缀（注意 Windows CMD 语法差异）

7. **安全注意事项**
   - 切勿将真实 `OPENAI_API_KEY` 或代理凭据提交到仓库
   - 若代理需要账号/密码，避免在命令行明文书写，可使用系统/平台的安全凭据管理
   - 使用公司网络或代理时，确认不会执行不安全的 TLS 中间人劫持

8. **相关代码定位**
   - `OpenAIProvider` 中读取代理并使用 `HttpsProxyAgent`：`server/src/providers/openaiProvider.ts:23-25`（embedding）与 `52-53`（chat）
   - `run_with_env.mjs` 默认 `OPENAI_API_BASE` 逻辑：`server/run_with_env.mjs:2-6`
   - 示例配置文件：`server/.env.example`

> 本文自 2025-10-20 起由自动化助手维护，用于记录排障与配置要点。
