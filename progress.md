项目进度记录（PROGRESS.md）
🧩 概述

项目名称：ChenghaoSpace

类型：AI Chat Demo（前后端自研）

当前能力：聊天 UI + Doubao Provider 接入

目标：一周内完成可投简历 Demo

RAG 检索增强

多 Provider 支持（Doubao + OpenAI）

简单容器化部署（可上云）

图文消息 & 附件卡片

会话记忆（短期 + 向量召回 + 摘要）

🚀 重要变更日志（按时间倒序）
2025-10-27 ✅ 多会话隔离 + Streaming 升级（未完成）

新增消息仓库：messagesRegistryRef，避免线程切换串线

Streaming 更新绑定 session ID，防止跨会话污染 UI

构建验证：pnpm run build:client

2025-10-27 ✅ Loading Toast 生命周期管理

使用 try/finally 确保 toast 可正确隐藏

修复：失败请求导致 Spinner 卡死的体验问题

2025-10-27 ✅ 页面模块化

Home 页面拆分为独立模块（chat/, attachments/, home/）

职责更清晰，可复用程度提升

2025-10-23 ✅ Markdown 代码块复制按钮

所有代码块提供独立复制按钮

降级处理兼容性问题

Toast 提示状态：成功 / 失败

2025-10-23 ✅ 输入交互优化

Enter：发送消息

Shift+Enter：换行

与其它输入场景不冲突

2025-10-23 ✅ 会话初始化去重

引入 lastConversationIdRef

修复 StrictMode 双渲染导致的对话重复创建问题

2025-10-22 ✅ 会话记忆持久化

ConversationMemoryManager 支持文件持久化

默认目录：server_data/memory

下一阶段：Redis / pgvector 扩展

2025-10-22 ⚠️ 自适应临时方案

宽屏缩放 & 溢出保护

UI 断层问题暂时规避

下一阶段：响应式布局替代缩放方案

2025-10-22 ✅ Provider 路由修复

.env 对齐、端口占用清理

/api/chat 返回 provider: doubao ✅

2025-10-21 ✅ 首页 UI 迭代

聊天区域卡片化

历史区可折叠

推荐提示展示

2025-10-21 ✅ 前端接入豆包模型

aiService 调通 /api/chat

支持模型输出流式响应

2025-10-21 ✅ Doubao Provider 适配

新增 DoubaoProvider

默认模型：doubao-seed-1-6-flash

2025-10-20 ✅ 环境与代理配置整理

.env.example 完整补齐

.gitignore 屏蔽敏感密钥

成功绕过 OpenAI 网络限制

🔍 先前诊断摘要

ETIMEDOUT: 原因为网络阻断 → 使用代理成功恢复连通性

测试命令片段：

curl -v http://localhost:8082/v1/models
curl -sS -X POST -H "Content-Type: application/json" \
  -d '{"query":"测试OpenAI连接"}' \
  http://localhost:8302/api/chat -w '\nHTTP_STATUS:%{http_code}\n'

🌐 代理配置备忘

Windows 临时配置示例：

$env:HTTP_PROXY='http://127.0.0.1:33210'
$env:HTTPS_PROXY='http://127.0.0.1:33210'
$env:ALL_PROXY='socks5://127.0.0.1:33211'
pnpm --filter ./server dev


✅ 密钥与代理凭据全部本地存储
✅ 上线后改用环境密钥管理