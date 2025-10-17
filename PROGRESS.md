项目进度记录（PROGRESS.md）

概述
- 项目：chenghaoSpace（前端已实现基础 UI，后续接入 RAG）
- 目标：在一周内实现面试用 demo，包含聊天 UI、RAG（检索+生成）、多 provider 支持（OpenAI 为首选）以及容器化部署

变更历史（最新在上）

2025-10-17 17:30 — 完成 /api/embed 切换为 provider.embed（内存保存）
- 文件：server/src/index.ts:27-46
- 描述：原先 /api/embed 返回随机向量，已改为通过 providerFactory 获取 provider 并调用 provider.embed(texts)。成功时把 embeddings 写入内存 documents；失败时回退到随机向量。

2025-10-17 17:45 — 完成 /api/chat 切换为 provider.chat（并实现回退）
- 文件：server/src/index.ts:60-83
- 描述：/api/chat 现在先做内存检索（关键字匹配，topK 可配置），拼接上下文后调用 provider.chat({ prompt })。若 provider.chat 抛错或异常，回退到模拟回答以保证可用性。

2025-10-17 18:05 — 新增前端后端代理：src/api/backendService.ts（已创建）
- 文件：src/api/backendService.ts
- 描述：前端可通过此模块调用后端 /api/chat、/api/search、/api/embed。保留原有 src/api/aiService.ts 作为模拟回退实现，前端在配置中可切换使用 backendService 或 aiService。

当前状态（2025-10-17）

已完成：
- provider 抽象设计与实现：server/src/providers/{baseProvider,mockProvider,openaiProvider,providerFactory}.ts
- 后端骨架（Fastify）与主要路由：server/src/index.ts（/health、/api/seed、/api/embed、/api/search、/api/chat）
- 前端代理文件（src/api/backendService.ts）已添加
- PROGRESS.md 持续记录变更

正在进行：
- 前端集成 backendService 并实现 UI 切换（把发送逻辑从模拟切换到后端）

待办（按优先级）
1. 将内存检索替换为向量相似度检索（pgvector 或 Qdrant 集成 + seed 脚本）
2. 优化 prompt 拼接（去重、摘要、按 token 限制截断）
3. 会话持久化（前端 localStorage 或后端 DB）与会话列表 UI
4. 准备 docker-compose（backend + postgres+pgvector）并编写 DB 初始化脚本
5. 演示脚本与 README 更新（包含 .env.example）

备注
- OpenAI API key 请保存在环境变量 OPENAI_API_KEY。前端不应直接暴露 key。
- 若需我把每次变更写成更细粒度的 CHANGELOG（包含 diff 片段），我可以继续维护。