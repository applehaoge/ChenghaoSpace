# ChenghaoSpace

ChenghaoSpace 是一个结合 Fastify 后端与 Vite + React 前端的 AI 对话 Demo，当前实现了多会话管理、会话记忆、文件上传与附件上下文分析等能力，适合演示企业级 AI 辅助工作流的基本形态。项目自 2025 年 10 月17日启动后持续迭代，目前已经完成聊天核心链路、附件上下文、会话记忆及基础测试流程。

## 目录结构
- front/：Vite + React 前端代码（页面、组件、hooks、API 封装）
- server/：Fastify 后端服务（TypeScript，包含 provider、memory、services、utils 等模块）
- server_data/：会话与上传文件的默认持久化目录
- PROCESS.md：前后端协作过程记录
- progress.md：每日进度与手动验证清单

## 核心能力
1. **多会话隔离**：前端维护任务列表与 sessionId，实现历史对话归档与切换。
2. **会话记忆体系**：后端支持短期上下文、向量检索与自动摘要，方便模型保留长期事实。
3. **附件解析**：文件上传后生成上下文片段，当前支持图片基础分析并可扩展到更多类型。
4. **流式响应体验**：前端气泡以流式方式渲染回答，同时处理超时、失败等兜底逻辑。
5. **本地持久化**：会话、记忆、上传记录默认写入 server_data/，便于离线演示与调试。

## 快速开始
1. 安装依赖：在仓库根目录执行 pnpm install，必要时再执行 pnpm --dir server build。
2. 配置后端：在 server/.env 中设置 provider 与密钥，可参考 server/.env.example。
3. 配置前端：在 front/.env.local 指定后端地址，例如 VITE_API_BASE=http://localhost:8302。
4. 启动服务：
   ```bash
   pnpm --dir server dev   # 启动后端
   cd front && pnpm dev    # 启动前端
   ```
   如需同时启动前后端，可直接执行仓库根目录下的 start-dev.bat（内部调用 start-dev.ps1，会自动设置 MEMORY_STORE_DIR）。

## 脚本说明
- pnpm --dir server build：构建后端 TypeScript 项目。
- pnpm --dir server test：运行后端单元测试（Vitest）。
- pnpm --dir server dev：监视构建并启动 Fastify 服务。
- pnpm --dir front dev：启动前端开发服务器。
- pnpm --dir front test：运行前端 Vitest 单元测试。
- pnpm --dir front smoke：执行最小化构建检查（等同 pnpm --dir front build:client）。
- ./smoke.ps1：在仓库根目录运行，依次执行后端单测与前端 smoke 构建。

## 手动验证清单
每次完成较大改动后，至少执行以下检查，避免回归：
1. **基础聊天**：进入首页，发送普通文本消息，确认 AI 可以流式回复。
2. **多会话切换**：创建第二个会话来回切换，确保历史记录正确、不会串台。
3. **附件上传**：上传图片后发送消息，刷新页面检查附件是否仍能访问；触发失败流程验证错误提示。
4. **会话记忆**：在同一会话内多轮提及事实，再次询问时确认摘要/记忆被召回。
5. **后端健康检查**：运行 pnpm --dir server test，确保单元测试通过；如需进一步确认可执行 pnpm --dir server build。

## AI 协作提示
1. **准备阶段**
   - 由开发者手动创建/切换分支并记录需求，明确“允许修改的文件/目录”和“禁止改动的区域”。
   - 在请求 AI 之前，先把现有行为与预期改动写进提示词。
2. **生成阶段**
   - 参考模版粘贴到对话窗口：
     ```text
     需求：<描述要实现的功能或修复>
     允许修改文件：<列出确切路径>
     禁止：不要调整其它文件；保持 existing tests 通过；不要改变接口签名
     验证步骤：pnpm --dir server test && pnpm --dir front smoke
     ```
   - 收到 AI 代码后，逐行核对关键逻辑，再按模版里的命令运行自动化验证。
3. **验收阶段**
   - 必跑命令：pnpm --dir server test、pnpm --dir front smoke。
   - 人工 checklist：附件上传→刷新后仍可访问；多会话切换无串台；聊天流式回复正常；README/进度日志有记录。
   - 验证无误后，由开发者手动更新 progress.md、执行提交/合并操作，AI 不进行任何 git 操作。

## 开发约定
- 新能力默认通过 progress.md 记录验证步骤，便于回溯。
- 优化现有功能时保持接口与交互兼容，不破坏既有体验。
- 代码新增默认使用 TypeScript，并遵循 ESLint + Prettier 约定。

## 后续规划
- 拓展更多测试用例，覆盖多会话、附件上下文与记忆链路。
- 接入更多模型提供商，并抽象 provider 能力以便扩展。
- 优化当前缩放式布局，逐步替换为真正的响应式适配方案。
