# Repository Guidelines

## Project Structure & Module Organization
- `front/`: Vite + React client. UI modules live in `src/pages`, shared hooks and contexts in `src/hooks` and `src/contexts`, static assets flow through `index.css` and Tailwind utilities.
- `server/`: Fastify TypeScript API. Compile sources in `server/src`, ship runtime code from `dist/` (`pnpm --filter ./server build` writes here).
- `server_data/`: Local memory store for conversations; safe to wipe when you need a clean slate.
- `PROCESS.md` and `progress.md`: Running journals; update when you change workflows or ship notable features.

## Build, Test, and Development Commands
- Install all workspaces once: `pnpm install` (runs against front-end and server packages).
- Launch the API: `pnpm --filter ./server dev` to transpile then boot `dist/index.js`; alternatively run `node server/dist/index.js` after a build.
- Launch the client: `pnpm --filter ./front dev` (served on http://localhost:3000 with hot reload).
- Production artifacts: `pnpm --filter ./server build` and `pnpm --filter ./front build` (client bundles to `front/dist/static`, server emits to `server/dist`).

## Coding Style & Naming Conventions
- TypeScript everywhere; use 2-space indentation, trailing semicolons, and double quotes to match existing files.
- React components use PascalCase filenames (`Home.tsx`), hooks stay in camelCase (`useChatMemory.ts`), and context providers live under `front/src/contexts`.
- Server modules export pure helpers where possible, and group Fastify route definitions under feature folders inside `server/src`.
- Respect path aliases such as `@/` from `front/tsconfig.json`, and prefer relative imports in the server package.

## Testing Guidelines
- Automated tests are not yet configured; cover changes with manual validation: hit `http://localhost:8302/health` (if added) and exercise UI flows in the running client.
- When you add tests, prefer Fastify's inject utilities for server handlers and React Testing Library for components; keep specs alongside source (`*.test.ts`).
- Document reproducible QA steps in `progress.md` so other agents can replay them.

## Commit & Pull Request Guidelines
- Git history favors short, descriptive summaries in Chinese (e.g., `上传图片2`). Keep messages under 50 characters, optionally append an English gloss.
- Each PR should explain the change, list manual test evidence, note config additions (`.env`, `postcss`, etc.), and attach screenshots or console snippets for UI tweaks.
- Link issues or TODO references inline, and request review when both front-end and server builds pass locally.

## Environment & Security Notes
- Copy `server/.env.example` → `server/.env` and `front/.env.local` before running; never commit actual secrets.
- Memory files under `server_data/memory` may contain sensitive transcripts—clean them when sharing logs.
- Treat `git-auto-push.bat` as a last resort; interactive commits with `git add -p` keep history readable.
