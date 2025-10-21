# ChenghaoSpace

AI demo with a Vite/React front-end (`front/`) and a Fastify back-end (`server/`). The latest iteration adds layered conversation memory so interviewers can see short-term context, rolling summaries, and semantic recall in action.

---

## Project Layout

```text
.
├── front/                # React + Vite client
│   ├── src/              # Pages, components, hooks, API helpers
│   └── README.md         # Client-specific notes
├── server/               # Fastify API server (ships with prebuilt dist/)
│   ├── dist/             # Executable JavaScript entry (node dist/index.js)
│   ├── server/src/       # TypeScript sources (memory manager, providers, etc.)
│   └── .env.example      # Sample environment file
├── PROCESS.md            # Migration / change log
├── git-auto-push.bat     # Windows helper script for add/commit/push
└── .gitignore            # Ignores node_modules, .env*, build artefacts, archives…
```

---

## Conversation Memory Overview

- **Short-term buffer**: the back-end keeps the latest turns (configurable via `MEMORY_MAX_HISTORY`).
- **Rolling summary**: every few turns (defaults to 6) the server asks the provider to condense the dialogue, keeping long-running chats concise.
- **Vector recall**: user statements that look factual are embedded and stored; the next request retrieves the most relevant facts before generating a reply.
- **Session tracking**: the front-end now generates a `sessionId` per chat window so the server can tie memory to a single conversation.
- **Config knobs** (all optional, in `server/.env`):
  ```ini
  MEMORY_MAX_HISTORY=8        # most recent messages injected verbatim
  MEMORY_VECTOR_K=3           # similar facts pulled from vector store
  MEMORY_VECTOR_LIMIT=40      # cap for stored facts per session
  MEMORY_SUMMARY_INTERVAL=6   # how often to refresh the summary
  MEMORY_MIN_FACT_LENGTH=16   # heuristic gate before persisting a fact
  ```

The memory manager lives in `server/server/src/memory/conversationMemory.ts` (with compiled JS under `server/dist/memory/`).

---

## Environment Setup

### 1. Install dependencies
```bash
pnpm install            # installs both front/ and server/ packages
```

### 2. Server configuration (`server/.env`)
```ini
PROVIDER=doubao               # or openai/mock, depending on credentials
DOUBAO_API_KEY=your-secret
PORT=8302
# optional proxy settings
HTTP_PROXY=http://127.0.0.1:33210
HTTPS_PROXY=http://127.0.0.1:33210
ALL_PROXY=socks5://127.0.0.1:33211
# optional memory tuning (see table above)
MEMORY_MAX_HISTORY=8
MEMORY_VECTOR_K=3
```

### 3. Front-end configuration (`front/.env.local`)
```ini
VITE_API_BASE=http://localhost:8302
```

---

## Running the demo

### Back-end
```bash
pnpm --filter ./server install   # ensure dependencies are present
pnpm --filter ./server dev       # build + run (node dist/index.js)
# or: node server/dist/index.js  # if you only need the runtime
```
The server logs `Server running at http://localhost:8302` when ready.

### Front-end
```bash
cd front
pnpm install
pnpm dev                         # default port 3000 (Vite will bump if taken)
```
Open the displayed URL to try the new chat experience with streaming Markdown, copy buttons, and memory-aware responses.

---

## Troubleshooting Cheatsheet

| Symptom | What to check |
| --- | --- |
| Replies fall back to “示例答案” | Provider call failed—inspect the Fastify console for Doubao errors, proxy issues, or missing API key. |
| Front-end 404/500 | Confirm `VITE_API_BASE` still points at the correct server origin. |
| Sensitive values in git status | `.gitignore` already excludes `.env*`; avoid forcing them with `git add --force`. |
| Windows build script errors | `pnpm build` uses `rm`; run in a Unix shell or swap for `rimraf`. |

---

## Git Tips

- This repo is already initialised in `D:\AI_agent_project1` and pushes to `https://github.com/applehaoge/ChenghaoSpace`.
- Secrets remain local thanks to `.gitignore` rules.
- `git-auto-push.bat` prompts for a commit message and pushes main for you.
- The old `chenghaoSpace/` folder stays untracked as a backup reference.

---

## Next Steps

- If you want full TypeScript builds, point `server/tsconfig.json` at `server/server/src` and wire an npm script.
- Hook real data/task APIs into `aiService` once the demo graduates from mock content.
- Extend the memory manager with persistence (Redis, Postgres + pgvector, etc.) or add per-user personas.

Enjoy the upgraded conversation flow and feel free to extend it further! 💬
