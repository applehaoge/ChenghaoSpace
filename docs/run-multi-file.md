# 多文件 Python 运行说明

## RunJobDTO 结构

```ts
export interface RunFileDTO {
  path: string;     // 例如 "main.py"，仅允许单层文件名
  content: string;  // Python 源码
}

export interface RunJobDTO {
  protocolVersion: 1;
  files: RunFileDTO[];
  entryPath: string; // 当前激活文件，例如 "main.py"
}
```

## 执行流程

1. 前端统一由 `useProjectFiles` 管理文件列表。点击运行时代码调用 `buildRunJobPayload`，会过滤全部 `.py` 文件、校验路径/大小，并生成 RunJobDTO。
2. `/api/run` 接口只接受 RunJobDTO：Fastify 校验协议版本、文件合法性（数量、路径、大小），然后将 DTO 原样存入 `jobStore` 并入队。
3. Runner 通过 `/api/runner/jobs/claim` 领取任务后，会在临时目录写出 `files` 全部文件，`cwd` 指向该目录，以 `entryPath` 作为入口执行 `python -u entryPath`。
4. 运行过程中的 stdout/stderr/可视化事件与之前一致，最终结果回传 server，前端实时刷新。

## 限制

- 暂不支持子目录、`__init__.py` 与包结构；`path` 中禁止出现 `/`、`\`、`..`。
- 仅处理 `.py` 文件，其他文件会被忽略。
- 文件数量上限 20，每个文件大小 ≤ 100KB（UTF-8 字节数）。
- 文件夹在 UI 中仅作分组展示，对 Runner 不产生任何目录结构。
- 入口文件必须存在于 `files` 列表，否则请求会被拒绝。

## 未来扩展

- 支持嵌套目录与包导入（考虑 zip/tar 传输、路径白名单等安全策略）。
- 允许传递额外的执行选项（如资源限制、stdin、timeout 自定义）。
- 通过 protocolVersion 演进协议，兼容更多语言或构建脚本。
- 在 server 侧增加缓存/审计，避免大规模重复上传。
