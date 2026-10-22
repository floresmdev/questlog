# syntax=docker/dockerfile:1

# ── dev ──────────────────────────────────────────────────────────────────────
# Dependencies only. docker-compose.dev.yml bind-mounts the source over
# /app/backend, so code changes reload without rebuilding the image.
# Phase 4 adds `build` and `runtime` stages for production.
FROM node:24-alpine AS dev
WORKDIR /app/backend

# Copy the manifests first: this layer (and `npm ci`) is cached until
# package*.json change, so editing code never reinstalls dependencies.
COPY package.json package-lock.json ./
RUN npm ci

ENV NODE_ENV=development
# The official image ships an unprivileged `node` user (uid 1000); don't run as root.
USER node
EXPOSE 3000
# tsx directly, not `npm run dev`: npm as the main process doesn't forward
# SIGTERM reliably, so `docker compose stop` would wait 10 s and then SIGKILL.
CMD ["node_modules/.bin/tsx", "watch", "src/server.ts"]
