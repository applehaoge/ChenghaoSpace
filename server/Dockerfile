# syntax=docker/dockerfile:1.7

FROM node:20-bullseye AS base
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

COPY pnpm-lock.yaml package.json tsconfig.json vitest.config.ts ./
RUN pnpm install --frozen-lockfile
COPY src ./src
RUN pnpm build && pnpm prune --prod

FROM node:20-bullseye-slim AS production
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./package.json
RUN mkdir -p /app/server_data

EXPOSE 8000
CMD [ "node", "dist/index.js" ]
