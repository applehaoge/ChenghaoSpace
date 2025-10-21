# 橙浩空间（ChenghaoSpace）

> AI 对话与多场景创作助手。当前仓库已拆分为 `front/`（React + Vite 前端）与 `server/`（Fastify 后端）两个子项目，默认通过豆包模型提供真实对话能力。

---

## 项目结构

```text
.
├── front/                # React + Vite 前端
│   ├── src/              # 页面、组件、hooks、API
│   ├── README.md         # 前端单独使用说明
│   └── .env.local        # 前端本地环境变量（已被 .gitignore 忽略）
├── server/               # Fastify 后端（当前通过 dist/ 直接运行）
│   ├── dist/             # 已编译 JS，可直接 `node dist/index.js`
│   ├── server/src/       # TypeScript 源码（保留以便后续维护）
│   ├── .env.example      # 后端环境变量示例
│   └── package.json      # 后端依赖定义
├── PROCESS.md            # 迁移与对接操作记录
├── git-auto-push.bat     # Windows 一键提交脚本（需先 git init / 配远端）
└── .gitignore            # 全局忽略规则（排除 node_modules、.env、构建产物等）
```

---

## 环境准备

### 1. 安装依赖
```bash
# 仓库根目录
pnpm install              # 同步安装 front/ 与 server/ 的依赖
```

### 2. 配置环境变量
- 后端：复制 `server/.env.example` 为 `server/.env`，并根据需要填写：
  ```ini
  PROVIDER=doubao
  DOUBAO_API_KEY=你的豆包密钥
  # 可选：自定义端口 & 代理
  PORT=8302
  HTTP_PROXY=http://127.0.0.1:33210
  HTTPS_PROXY=http://127.0.0.1:33210
  ALL_PROXY=socks5://127.0.0.1:33211
  ```
- 前端：在 `front/.env.local` 中指定后端地址（默认 8302）：
  ```ini
  VITE_API_BASE=http://localhost:8302
  ```

---

## 启动方式

### 后端
```bash
pnpm --filter ./server install       # 确保依赖已安装
pnpm --filter ./server dev           # 编译并运行 dist/index.js
# 或者：
node server/dist/index.js
```
启动成功后终端会输出 `Server running at http://localhost:8302`。

### 前端
```bash
cd front
pnpm install                         # 首次安装依赖
pnpm dev                             # 默认端口 3000，若被占用会顺延
```
浏览器访问 Vite 输出的地址即可体验新版聊天界面（含流式 Markdown 渲染）。

---

## 常见问题速查

| 现象 | 排查建议 |
| ---- | -------- |
| 聊天返回“示例答案” | 说明真实 LLM 调用失败，请查看 `server` 终端日志（常见为豆包密钥或代理配置问题） |
| 前端请求 404/500 | 检查 `front/.env.local` 中的 `VITE_API_BASE` 是否指向后端实际地址 |
| Git 推送带出 `.env` | 根目录 `.gitignore` 已忽略 `.env*`，避免 `git add --force` |
| `pnpm build` 在 Windows 报错 | 旧脚本使用 `rm`，可改成 `rimraf` 或在类 Unix 环境执行 |

---

## Git 操作提示

- 仓库已在 `D:\AI_agent_project1` 初始化，并关联 `https://github.com/applehaoge/ChenghaoSpace`。
- `server/.env` 等敏感文件已被 `.gitignore` 排除，不会提交到仓库。
- 可使用根目录的 `git-auto-push.bat` 一键提交（脚本会提示输入提交信息）。
- 旧目录 `chenghaoSpace/` 仅作为备份保留，未纳入 git 提交。

---

## 后续规划建议

- 若需维护 TypeScript 源码，可将 `server/server/src` 调整为 `server/src` 并修复构建脚本。
- 扩展真实业务功能时，可在后端新增任务/推荐等 API，并在前端 `aiService` 中统一调用。
- 根据需求增加会话存档、本地缓存等增强能力。

欢迎继续补充 `PROCESS.md`、更新文档或提交 Issue / PR！??
