# syntax=docker/dockerfile:1.7

FROM node:20-bullseye AS base
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /runner

COPY pnpm-lock.yaml package.json tsconfig.json ./
RUN pnpm install --frozen-lockfile
COPY src ./src
RUN pnpm build && pnpm prune --prod

FROM node:20-bullseye-slim AS production
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    python3-venv \
    python3-pip \
    python3-pygame \
  && rm -rf /var/lib/apt/lists/*
RUN python3 -m pip install --no-cache-dir pillow numpy matplotlib
ENV NODE_ENV=production
ENV RUNNER_PYTHON_BIN=python3
WORKDIR /runner
COPY --from=base /runner/dist ./dist
COPY --from=base /runner/node_modules ./node_modules
COPY --from=base /runner/package.json ./package.json

CMD [ "node", "dist/index.js" ]
