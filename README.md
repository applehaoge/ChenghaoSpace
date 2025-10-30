﻿# ChenghaoSpace

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
