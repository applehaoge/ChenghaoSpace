
# 橙浩空间 · 前端说明

> 对应后端目录：`../server`，需配合运行才能获得完整的豆包/多模型能力。

---

## 仓库结构

```
front/                 # React + Vite 前端
  src/
    api/aiService.ts   # 与后端交互的 API 封装
    pages/Home.tsx     # 首页 + 聊天页面
    ...
server/                # (单独仓库) Fastify 后端 API
```

### 主要依赖
- React 18、TypeScript、Vite
- TailwindCSS / clsx / tailwind-merge
- react-router-dom、vite-tsconfig-paths
- sonner、framer-motion 等体验组件

---

## 快速启动

1. **启动后端**（先启动）
   ```bash
   cd ../server
   pnpm install
   pnpm --filter ./server dev        # 默认 http://localhost:8302
   ```
   - `server/.env` 需至少包含：
     ```env
     PROVIDER=doubao
     DOUBAO_API_KEY=sk-xxxx
     PORT=8302
     ```

2. **启动前端**
   ```bash
   cd ../front
   pnpm install
   pnpm dev                           # 默认 http://localhost:3000（占用时自动换端口）
   ```
   - 在 `front/.env.local` 中设置：
     ```env
     VITE_API_BASE=http://localhost:8302
     ```

打开浏览器访问前端地址，发送一条消息，若后端日志出现 `/api/chat` 调用并返回豆包回复，则联调成功。

---

## 页面概览
- **首页模式**：展示灵感提示、任务/最佳实践卡片；输入需求后点击“发送”即可切换到聊天模式。
- **聊天模式**：仿主流 AI 助手体验，右侧为对话流，输入框固定在底部，支持一键优化等功能。
- **状态管理**：当前实现仍在前端保存消息，可按需扩展真实会话存档。

---

## 常见问题
- **返回“示例答案”**：说明后端调用真实模型失败，请检查 `server` 控制台的报错（常见为 API Key、网络代理、超时）。
- **端口占用**：`pnpm dev` 会自动换端口；若 8302 被占用可使用 `Get-NetTCPConnection -LocalPort 8302` 定位并结束旧进程。
- **编码乱码**：已统一为 UTF-8，如果依旧出现请确认编辑器保存格式。

---

## 关联文档
- `../PROCESS.md`：目录迁移、依赖补齐与聊天对接的完整记录。
- `../server/README.md`：后端 Provider、环境变量与代理配置说明。

后续若需要接入真实任务/推荐数据，可在 `Home.tsx` 中补充对应的接口调用。
