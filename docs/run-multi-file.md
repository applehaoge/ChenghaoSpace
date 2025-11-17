# 多文件 Python 运行协议

## RunJobDTO 结构

```ts
export type RunFileEncoding = 'utf8' | 'base64';

export interface RunFileDTO {
  path: string;                // 允许 "core/utils.py"、"assets/player.png" 等多级相对路径
  content: string;             // UTF-8 文本或已编码的二进制内容
  encoding: RunFileEncoding;   // 文本用 utf8，二进制资源用 base64
}

export interface RunJobDTO {
  protocolVersion: 2;
  language: 'python';
  files: RunFileDTO[];
  entryPath: string;           // 入口 Python 文件，例如 "main.py" 或 "core/main.py"
}
```

## 执行流程

1. **前端打包**：`useProjectFiles` 持有的全部文件会交给 `buildRunJobPayload`。该函数会校验路径（禁止绝对路径 / `..` / `\`）、限制文件数量（≤30）与大小（≤200KB），并根据具体文件决定 `encoding`（默认 utf8）。入口文件取自当前激活的 `.py` 文件。
2. **服务端排队**：`/api/run` 接口仅接受 protocolVersion = 2、language = 'python' 的 DTO。`sanitizeRunJobDTO` 使用 `path.posix.normalize` 校验路径、防止目录穿越，并把合法任务放入 jobStore/queue。
3. **Runner 执行**：Runner 领取任务后，会在临时工作目录调用 `materializeRunFiles`，为每个文件创建对应的目录结构，按编码写入（base64 → Buffer）。随后以 `entryPath` 为工作目录内的 python 入口执行 `python -u entryPath`。
4. **结果回传**：stdout/stderr/可视化帧通过事件推送回 server，最终状态由前端 WebSocket/轮询更新，整个过程中不再回传任何源代码内容。

## 限制

- 仅支持 protocolVersion 2、language = 'python'。
- 路径必须是相对路径，不允许出现绝对路径、盘符、`\` 或 `..`；server 与 runner 均使用 `path.posix.normalize` 再次校验，防止目录穿越。
- 文件数量上限 30 个，单个文件（解码后）大小不超过 200KB；超限会直接拒绝。
- 入口文件必须是 `.py`，且需要存在于 `files` 列表中。
- 目前未实现 Python 包结构或虚拟环境隔离，所有模块需通过相对路径放在根目录下的子目录内。
- 资源文件（如 `assets/player.png`）需要以 base64 形式传输，运行时可通过 `open('assets/player.png', 'rb')` 等方式读取。

## 未来扩展方向

- **更丰富的目录结构**：支持嵌套包、`__init__.py`、甚至 zip/tar 归档的批量上传，并根据 `protocolVersion` 做向后兼容。
- **多语言 / 构建步骤**：升级 DTO 以声明语言、运行时、构建命令，以及额外执行参数（stdin、超时、自定义资源限制等）。
- **增量/缓存**：为大项目增加文件指纹，支持增量上传或缓存命中，降低每次运行的网络开销。
- **可观察性**：统一 server/runner 的审计与指标（例如拒绝原因、资源耗时），便于对多文件项目做容量规划。
