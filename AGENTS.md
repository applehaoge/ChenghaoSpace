# Repository Guidelines

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

## Project Overview
- **front/** – Vite + React 客户端，业务页面在 `src/pages`，组件/Hook 分别位于 `src/components`、`src/hooks`。
- **server/** – Fastify + TypeScript 后端，源码平铺于 `src/`，编译产物输出至 `dist/`。
- **server_data/** – 会话记忆与附件上传的本地持久化目录，必要时可手动清理。
- **PROCESS.md / progress.md** – 工作流和每日进度日志，保持同步更新。

## 常用命令
- 一次性安装：`pnpm install`
- 后端开发：`pnpm --dir server dev`（自带构建后启动），若需单独编译：`pnpm --dir server build`
- 后端单测：`pnpm --dir server test`（Vitest）
- 前端开发：`pnpm --dir front dev`
- 前端构建：`pnpm --dir front build:client`
- 一键启动脚本：执行仓库根目录的 `start-dev.bat`（内部调用 PowerShell，分别启动前端/后端）

## 开发与协作约定
- 先阅读 README 的 “AI 协作提示”和“手动验证清单”，明确允许修改的文件、禁止项以及自检流程。
- 所有变更都要在本地跑完：
  - `pnpm --dir server test`
  - `pnpm --dir front build:client`
  - README 中列出的手动验证 checklist（聊天、会话切换、附件上传、记忆回放等）。
- 不要直接修改 git 历史；分支/提交/合并全部由人手动完成。
- 变更完成后，更新 `progress.md` 记录“做了什么 + 如何验证”，必要时补充提示词或脚本。

## 代码风格提示
- 前后端统一使用 TypeScript，遵循项目既有的 ESLint/Prettier 配置。
- React 组件文件使用 PascalCase (`ChatInterface.tsx`)，Hooks 采用 camelCase (`useFileUploader.ts`)。
- 后端模块保持单一职责：共用工具放在 `server/src/utils`，业务逻辑拆在 `services/`、`providers/`、`memory/` 等目录。

## 测试建议
- 新增功能时优先考虑写单元测试或轻量脚本，尤其是：
  - `aiService` 请求封装
  - 附件上下文处理 (`attachmentContext.ts`)
  - 会话记忆管理 (`conversationMemory.ts`)
- 测试文件与源码同目录放置，命名 `*.test.ts`。

## 环境安全
- `.env` 文件仅在本地保存，切勿提交远端；示例配置见 `server/.env.example`。
- `server_data/` 可能含敏感对话，上传日志或打包前记得清理。
- `git-auto-push.bat` 仅在紧急情况下使用，正常流程建议手动 commit + push。
