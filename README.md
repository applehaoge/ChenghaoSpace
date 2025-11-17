全局工程规范说明（请严格遵守）：

你是一个资深 TypeScript/Node/React 工程师，要按企业级可维护、可扩展的标准来写代码，而不是 demo。

不允许生成“巨无霸文件”：

单个函数体最好控制在 50 行以内，超过请拆分；

不要在一个文件里塞 500 行以上的新增代码，必要时拆分模块。

前后端通信必须先定义清晰的 TypeScript 类型（DTO），所有接口参数、返回值都用这些类型，不要用 any。

对外 API 协议尽量保持向后兼容，如果要调整字段，请显式给出新版本结构和升级路径。

保持现有中文文案不变，不要擅自修改 UI 文案，只调整逻辑和类型。

如果需要新增工具函数，优先放在 core/ 或 services/ 这类目录，不要在 React 组件内部写一大堆业务逻辑。

如无必要，不要大改现有文件结构，尽量“小步修改 + 良好命名”。

所有潜在危险点（例如路径校验、资源限制）要在代码里加简短注释（中文），标明为什么要这么做。

# ChenghaoSpace

ChenghaoSpace 是一个基于 Fastify + TypeScript 后端与 Vite + React 前端的 AI 对话 Demo，已经实现会话管理、记忆回放、文件上传、图像/文档解析以及多 Provider 路由等能力，适合作为企业级 AI 助手的模板工程。

## 目录结构
- ront/：Vite + React 客户端，页面位于 src/pages，组件和 Hooks 分别放在 src/components、src/hooks。
- server/：Fastify + TypeScript 服务端，业务逻辑分布在 providers/、services/、memory/、utils/。
- server_data/：会话记忆和上传附件的默认持久化目录。
- PROCESS.md：人工协作流程说明。
- progress.md：每日进度与验证记录。

## 已完成功能
1. **聊天协作**：支持多会话切换与历史消息拉取。
2. **会话记忆**：ConversationMemoryManager 自动整理摘要与关键事实。
3. **附件上传**：前端批量上传，后端统一落盘并生成下载路径。
4. **图像识别**：接入豆包 doubao-seed-1-6-flash，自动生成图片描述与风险提示。
5. **文档解析**：支持 TXT/PDF/DOCX/XLSX 解析，提取摘要供 AI 回答使用。
6. **连通性脚本**：server/scripts/test-doubao-image.mjs 可独立验证豆包图像接口。

## 快速开始
1. 安装依赖：pnpm install
2. 配置后端：复制 server/.env.example 为 server/.env，填写 OpenAI / 豆包等密钥。
3. 配置前端：在 ront/.env.local 指定后端地址，例如 VITE_API_BASE=http://localhost:8302。
4. 启动服务：
   `ash
   pnpm --dir server dev    # 启动 Fastify
   pnpm --dir front dev     # 启动前端
   `
   或执行仓库根目录的 start-dev.bat 一键启动。

## 常用命令
- pnpm --dir server dev / pnpm --dir front dev：本地开发。
- pnpm --dir server build：编译服务端。
- pnpm --dir server test：运行服务端 Vitest。
- pnpm --dir front build:client：前端生产构建（同 smoke 脚本）。
- pnpm --dir front test：前端单测。
- pnpm --dir server node scripts/test-doubao-image.mjs <path-or-url>：快速验证豆包图像模型连通性。

## 手动验证清单
1. **基本对话**：新建会话并发送文本消息，确认 AI 正常回复。
2. **会话切换**：在左侧面板切换不同会话，检视历史消息与记忆。
3. **附件上传**：上传图片或文档，刷新页面后仍可访问附件卡片。
4. **图像描述**：上传图片后，检查 AI 回复是否引用豆包生成的描述，注意是否出现 warnings。
5. **文档解析**：上传 TXT/PDF/DOCX/XLSX，并向 AI 提问，确认回复能引用文档内容摘要。
6. **记忆回放**：在同一会话多轮提问，确认摘要和长期记忆被引用。
7. **后端自检**：运行 pnpm --dir server test 与 pnpm --dir server build，确认管线通过。

## AI 协作提示
- **准备阶段**：先确认可修改的目录与文件，梳理需求并输出计划。
- **实施阶段**：遵循以下模板记录变更影响：
  `	ext
  目标：<需要实现的功能>
  涉及：<修改的文件或目录>
  注意：<需要保留的接口 / 关键约束>
  验证：pnpm --dir server test && pnpm --dir front build:client
  `
- **收尾阶段**：完成后运行脚本、执行手动验证清单，并在 progress.md 记录“做了什么 + 如何验证”。

## 约束说明
- 不要改动 Git 历史或强制覆盖人工改动。
- 修改前确保已有脚本/测试仍可运行。
- .env 等敏感文件仅保存在本地，禁止提交。
- server_data/ 可能包含敏感对话，打包或上传前需手动清理。

## 后续规划
- 扩展多 Provider Pipeline，支持更多图像/文本模型切换。
- 打通 RAG 检索与结构化引用展示。
- 优化前端附件卡片与移动端适配。
## Linux / Docker 部署
1. 将 server/.env.example 复制为 server/.env，填写 OpenAI/豆包密钥及 RUNNER_ACCESS_TOKEN。
2. 运行 docker compose build 编译 server 与 python-runner 镜像；如需推送到镜像仓库，可通过 docker compose build --push。
3. 运行 docker compose up -d 后，Fastify 服务默认暴露在 8000 端口，python-runner 会自动通过 http://server:8000 与后端通信。
4. docker volume server_data 会保存记忆/上传文件，如需挂载到宿主机目录，可在 compose.yaml 中调整 volumes。
5. 通过环境变量 RUNNER_MAX_CONCURRENCY、RUNNER_POLL_INTERVAL_MS 等可在 Linux 上方便地扩展 runner 数量；多节点时保持同一 RUNNER_ACCESS_TOKEN 即可。
## 开发 / 部署流程
- 本地开发仍然使用 pnpm --dir server dev、pnpm --dir front dev、pnpm --dir python-runner dev 等命令，任何日常调试都不需要进入 Docker。
- 只有在部署到测试/生产环境时才执行 docker compose build + docker compose up -d（或 docker-compose up -d），此时 server 与 python-runner 将运行在容器网络中，并通过 RUNNER_ACCESS_TOKEN、RUNNER_SERVER_URL 等环境变量互信。
