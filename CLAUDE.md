# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

说明（中文）：
- 本文档用于指导未来的 Claude Code 实例在本仓库内的常见操作与快速定位关键代码路径。请以阅读项目文件为前提，修改代码前必须先阅读相关实现并理解上下文与依赖关系。

常用命令（在仓库根目录运行）:
- 安装依赖：pnpm install
- 启动开发服务器（本地前端，host 可被允许）：pnpm dev    （对应 package.json 脚本：package.json:6-9）
- 直接启动客户端 dev（指定端口/host）：pnpm dev:client （package.json:6-8）
- 构建客户端产物：pnpm build:client （package.json:9）
- 全量构建（清理 dist 并拷贝 package.json）：pnpm build （package.json:9-11）

注：当前仓库未配置测试/lint 脚本（如需运行单测或 lint，请先查看并添加相应工具配置，如 vitest/jest/ESLint），因此没有可直接运行的单测命令。

高层代码架构（快速导览）:
- 构建/工具链：Vite + TypeScript + Tailwind（配置文件：vite.config.ts、tsconfig.json、tailwind.config.js、postcss.config.js）。
- 入口与路由：src/main.tsx -> src/App.tsx 为应用入口并负责路由（见 src/main.tsx, src/App.tsx）。
- 页面与组件：src/pages/ 下为页面组件（比如 Home.tsx），src/components/ 放通用视图组件（例如 Empty.tsx）。
- 状态与上下文：src/contexts/ 存放 React Context（例如 authContext.ts），供全局鉴权/用户信息等使用。
- Hook 与工具：src/hooks/（例如 useTheme.ts）和 src/lib/（例如 utils.ts）提供可复用逻辑与工具函数。
- 本地“模拟”API：src/api/aiService.ts 提供项目内使用的模拟 AI 服务接口（README 中有示例说明，参见 README.md:50-75）。

构建与部署要点：
- 前端构建输出由 vite 构建到 dist/static（package.json:9）。最终 pnpm build 会清理 dist 并在 dist 下留下 package.json 与 build.flag，供后续部署使用（package.json:9-11）。
- 开发服务器默认使用 3000 端口（由 dev:client 脚本启动），可能被容器化/反向代理时覆盖。

代码定位小技巧（对 Claude Code）:
- 若要快速定位文件或关键词，优先使用代码搜索/Glob/Grep 工具；在需要对代码库做较大范围探索时，使用 Explore 子代理以减少盲查。
- 编辑文件前：先 Read 目标文件并把相关实现读入上下文，再使用 Edit/Write 做改动；遵循仓库已有的文件组织与样式。
- 引用具体实现时请包含文件路径（必要时附行号），以便人工/自动审阅能快速跳转到源代码位置。

安全与限制说明：
- 本项目为前端 React 应用并包含模拟 AI 服务。请勿在仓库内创建或提交敏感凭据（API keys、私钥、.env 等）。
- 如果遇到疑似敏感或恶意代码片段，应停止修改并向项目维护者报告，而不是自动修补。

额外：如果仓库后续添加测试、CI、或后端服务，请在 CLAUDE.md 中补充对应运行/调试命令与关键入口位置。


---
文件创建路径：CLAUDE.md
