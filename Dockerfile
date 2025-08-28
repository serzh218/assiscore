# --- deps: устанавливаем зависимости (с кэшем pnpm) ---
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- builder: билдим Next и Prisma client ---
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma: генерим клиент на этапе билда
RUN pnpm prisma generate
# Next: прод-сборка
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# --- runner: минимальный рантайм-образ ---
FROM node:20-alpine AS runner
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# без dev-зависимостей
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/quality.config.ts ./quality.config.ts

# опционально: не требуем root
USER node

# порт
EXPOSE 3000

# старт: миграции + запуск
# В проде используем миграции "deploy", не reset!
CMD [ "sh", "-lc", "pnpm prisma migrate deploy && pnpm start" ]
