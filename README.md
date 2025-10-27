# ChenghaoSpace

基于 Vite/React 的前端（`front/`）与 Fastify 后端（`server/`）的 AI Demo。
最新迭代加入**分层对话记忆系统**：可以看到短期上下文、滚动摘要与语义检索召回是如何工作的。

🚧 项目正在持续开发中
✅ 已完成：聊天对话、文件上传、AI 回答
📌 进行中：图片显示逻辑优化、记忆系统完善

---

## 项目目录结构

```text
.
├── front/                # React + Vite 客户端
│   ├── src/              # 页面、组件、hooks、API 封装
│   └── README.md         # 前端说明
├── server/               # Fastify API 服务端（已包含 dist/ 可运行版）
│   ├── dist/             # 编译后的 JS 入口（node dist/index.js）
│   ├── server/src/       # TypeScript 源码（记忆管理、Provider等）
│   └── .env.example      # 环境变量示例文件
├── PROCESS.md            # 演进记录 / 变更日志
├── git-auto-push.bat     # Windows 提交推送脚本
└── .gitignore            # 忽略 node_modules、.env*、构建产物等
```

---

## 对话记忆系统概览

* **短期历史缓存**：后端保留最近几轮对话（`MEMORY_MAX_HISTORY`）
* **滚动摘要**：每隔数条对话（默认6条）生成一次摘要，减轻上下文长度
* **向量召回**：识别可能的事实陈述，向量化并写入磁盘，需要时检索最相关的信息
* **会话追踪**：前端为每个聊天窗口生成 sessionId 对话上下文独立
* **持久化存储**：默认写入 `server_data/memory`，重启服务可恢复
* **可调参数**（可在 `server/.env` 配置）

```ini
MEMORY_MAX_HISTORY=8
MEMORY_VECTOR_K=3
MEMORY_VECTOR_LIMIT=40
MEMORY_SUMMARY_INTERVAL=6
MEMORY_MIN_FACT_LENGTH=16
MEMORY_STORE_DIR=server_data/memory
```

记忆管理核心逻辑位于：
`server/server/src/memory/conversationMemory.ts`
编译版对应：
`server/dist/memory/`

---

## 环境配置

### 1️⃣ 安装依赖

```bash
pnpm install    # 同时安装前端/后端依赖
```

### 2️⃣ 配置后端环境变量（`server/.env`）

```ini
PROVIDER=doubao                 # 或 openai/mock
DOUBAO_API_KEY=your-secret
PORT=8302
# 可选代理设置
HTTP_PROXY=http://127.0.0.1:33210
HTTPS_PROXY=http://127.0.0.1:33210
ALL_PROXY=socks5://127.0.0.1:33211
# 可选记忆调参
MEMORY_MAX_HISTORY=8
MEMORY_VECTOR_K=3
MEMORY_STORE_DIR=server_data/memory
```

### 3️⃣ 配置前端环境变量（`front/.env.local`）

```ini
VITE_API_BASE=http://localhost:8302
```

---

## 运行方式

### 后端服务

```bash
pnpm --filter ./server install
pnpm --filter ./server dev
# 或直接执行编译产物
node server/dist/index.js
```

控制台输出 `Server running at http://localhost:8302` 即启动成功。

### 前端服务

```bash
cd front
pnpm install
pnpm dev
```

浏览器打开提示 URL，即可体验：
✅ Markdown 流式输出
✅ 复制按钮
✅ 记忆增强回复

---

## 常见问题排查

| 问题表现                  | 排查方向                                |
| --------------------- | ----------------------------------- |
| 返回“示例答案”              | 后端 Provider 调用失败，检查 API Key、代理、网络   |
| 前端 404/500            | 确认 `VITE_API_BASE` 指向正确后端地址         |
| `.env` 出现在 git status | `.gitignore` 已排除，勿强制提交              |
| Windows 构建报错          | `rm` 脚本需在 Unix Shell 执行或改用 `rimraf` |

---

## Git 说明

* 仓库路径：`D:\AI_agent_project1` → push 到 `github.com/applehaoge/ChenghaoSpace`
* `.gitignore` 已保护 `.env*` 等敏感内容
* `git-auto-push.bat` 自动执行 add / commit / push
* 原有 `chenghaoSpace/` 文件夹保留作备份

---

## 后续规划

* 完整 TypeScript 构建流程配置
* 对接真实数据 / 任务型 API 替换 mock 内容
* 扩展记忆后端（Redis/pgvector 等）
* 支持多用户配置、人格设定

欢迎体验并继续扩展对话流程！💬

---

## 工作流程约定

* **每完成一个功能步骤，优先更新 `progress.md`**
  记录实现细节 / 遗留问题 / 下一步计划
  再继续后续开发，


