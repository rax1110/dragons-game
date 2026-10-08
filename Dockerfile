# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
RUN npm install -g pnpm@12.9.1
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
RUN pnpm fetch

FROM deps AS build
COPY . .
RUN pnpm install --offline --frozen-lockfile
RUN pnpm -r build
RUN pnpm --filter @dragons/api deploy --prod /out/app

FROM node:24-alpine AS app
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /out/app ./
COPY --from=build --chown=node:node /app/apps/web/dist ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=3s --retries=12 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "dist/main.js"]
