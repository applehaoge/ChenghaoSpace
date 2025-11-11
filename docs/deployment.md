## 部署概览

> 开发提示：日常在本地调试时继续运行 `pnpm --dir server dev`、`pnpm --dir front dev`、`pnpm --dir python-runner dev`，Docker 仅用于测试 / 生产环境部署。

整套方案分为三层：

1. `server/` Fastify API：负责 `/api/run`、job 队列和 WebSocket 流。
2. `python-runner/` Worker：轮询 `/api/runner/jobs/claim`，在隔离目录执行 Python 并推送 stdout/stderr 与可视化数据。
3. `front/` Vite 客户端：通过 `/api/run` 创建任务，并订阅 `/api/run/:jobId/stream`。

生产环境推荐将 `server` 与 `python-runner` 拆分为不同服务（甚至不同机器），通过 HTTPS + Runner Token 通信。

---

## 环境变量

### Server

| 变量 | 说明 |
| --- | --- |
| `PORT` | Fastify 监听端口，默认 `8000` |
| `RUNNER_ACCESS_TOKEN` | Runner Bearer Token。未设置时任何 runner 都可连入，生产环境务必配置 |
| `MEMORY_STORE_DIR` | 会话记忆/上传文件存储目录，默认 `server_data/memory` |
| 其他模型相关变量 | 详见 `server/.env.example` |

### Python Runner

| 变量 | 说明 |
| --- | --- |
| `RUNNER_SERVER_URL` | 指向 server 服务，例如 `https://api.example.com` 或 Docker 服务名 |
| `RUNNER_ACCESS_TOKEN` | 与 server 配置一致，用于认证 |
| `RUNNER_POLL_INTERVAL_MS` | 轮询间隔，默认 `1500`ms |
| `RUNNER_MAX_CONCURRENCY` | 单实例并发执行任务数 |
| `RUNNER_PYTHON_BIN` | Python 可执行文件名，Linux 默认为 `python3` |

---

## Docker 方案

根目录提供 `compose.yaml`，配合 `server/Dockerfile`、`python-runner/Dockerfile` 即可一键起服务。典型流程：

```bash
cp server/.env.example server/.env
echo "RUNNER_ACCESS_TOKEN=change-me" >> server/.env

docker compose build
docker compose up -d
```

- `server_data` 使用 Docker volume 持久化，如需映射宿主目录，可在 `compose.yaml` 内替换 `server_data:/app/server_data`。
- 若前端部署在同一域名，可通过 Nginx/Traefik 反向代理 `server` 的 8000 端口。
- 多 Runner 扩容：重复 `docker compose run --scale python-runner=3`，或在多台机器部署 runner，只需保证能够访问 server 并配置正确 token。

---

## systemd 示例

对于习惯裸机部署的场景，可以在 Linux 上创建如下 systemd 单元：

**/etc/systemd/system/chenghaospace-server.service**

```ini
[Unit]
Description=Kids Coding Fastify API
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/chenghaospace/server
EnvironmentFile=/opt/chenghaospace/server/.env
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

**/etc/systemd/system/chenghaospace-runner.service**

```ini
[Unit]
Description=Kids Coding Python Runner
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/chenghaospace/python-runner
Environment=RUNNER_SERVER_URL=https://api.example.com
Environment=RUNNER_ACCESS_TOKEN=change-me
Environment=RUNNER_POLL_INTERVAL_MS=1000
Environment=RUNNER_PYTHON_BIN=python3
ExecStart=/usr/bin/node dist/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

通过 `systemctl daemon-reload && systemctl enable --now chenghaospace-server chenghaospace-runner` 即可启动。

---

## 资源与安全

- Python 子进程默认运行在临时目录中，可结合 `firejail`/`bubblewrap`/Docker-in-Docker` 进一步隔离。
- 建议在反向代理层配置 HTTPS，并对 `/api/runner/*` 仅开放给 Runner 网络。
- 监控：可在 server 中添加 `/healthz`，或通过 Docker/系统日志采集 stdout/stderr。

---

## 前端接入

前端不需要额外修改即可连接生产 server：在 `.env.local` 中设置 `VITE_API_BASE=https://api.example.com`。KidsCoding 编辑器会使用 WebSocket 自动订阅 job 流，Runner 与 server 只要保持可用即可将 stdout/stderr/visualization 传递到界面。
