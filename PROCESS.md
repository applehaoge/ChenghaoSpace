# 项目对接过程记录

## 目录重组
- **2025-10-21 16:00**：将新版前端目录 `chenghaoSpaceV2` 重命名为 `front`，作为未来的主前端代码仓。
- **2025-10-21 16:05**：从旧仓库 `chenghaoSpace/server` 拷贝后端到根目录 `server`，并保留原有 `server_backup_*` 备份以便回溯。

## 后端环境准备
- **依赖补齐**：在 `server` 目录执行 `pnpm install`，为兼容 Node 运行补充了 `@types/node`、`avvio`、`pino`、`find-my-way`、`fast-json-stringify` 等 Fastify 依赖，确保 TypeScript 构建通过。
- **环境变量**：新增 `.env` 并写入 `PROVIDER=doubao`、`DOUBAO_API_KEY` 等配置，以使用豆包官方接口。
- **启动验证**：通过 `pnpm --filter ./server dev` 启动，日志显示 `Server running at http://localhost:8302`，端口可被前端访问。

## 前端对接步骤
- **API 切换**：将 `front/src/api/aiService.ts` 替换为旧项目使用的真实接口实现，统一通过 `VITE_API_BASE` 向后端发起请求。
- **聊天逻辑改造**：重写 `front/src/pages/Home.tsx` 中的聊天组件，去除 `chatService` 模拟逻辑，直接调用 `aiService`，并在同一会话中展示历史消息。
- **环境配置**：在 `front` 根目录创建 `.env.local` 设置 `VITE_API_BASE=http://localhost:8302`，前端运行 `pnpm dev`（默认为 3001 端口）即可与后端联调。

## 后续工作提醒
- 若后端日志仍出现 `provider.chat failed` 等回退信息，需查看真实错误（如 API 权限、网络代理）并根据提示调整。
- 可视需求继续迁移旧项目中的最佳实践模块、任务数据等 UI 组件，保持新版界面功能完整。
