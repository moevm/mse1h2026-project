FROM node:24.14.1-alpine3.23 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Отключаем проверку обновлений pnpm внутри контейнера
ENV PNPM_DISABLE_SELF_UPDATE_CHECK=true
# Устанавливаем переменную для кэширования зависимостей pnpm
ENV PNPM_STORE_PATH=/pnpm/store
# Устанавливаем переменную для CI-среды
ENV CI=true
ENV SCARF_ANALYTICS=false

# Устанавливаем рабочую директорию
WORKDIR /app

# Включаем Corepack для управления пакетными менеджерами
RUN corepack enable


FROM base AS deps

# Копируем lockfile, package.json и конфигурацию workspace для установки зависимостей
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./

# Предварительно загружаем все зависимости в кэш
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm fetch

# Копируем package.json backend и database для установки зависимостей
COPY backend/package.json ./backend/

# Устанавливаем зависимости backend из локального кэша
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --offline --frozen-lockfile --filter @mse/backend


FROM deps AS build

# Копируем исходный код backend
COPY backend ./backend

# Собираем NestJS приложение
RUN pnpm --filter @mse/backend run db:generate
RUN pnpm --filter @mse/backend run build

# pnpm deploy: создаёт автономную копию пакета
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter @mse/backend deploy --prod /app/deploy

# FROM node:24.14.1-alpine3.23 AS prod
FROM oven/bun:1.3.12-alpine AS prod

# Устанавливаем переменные окружения для Node.js
ENV NODE_ENV=production
# Отключаем уведомления об обновлениях npm
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV SCARF_ANALYTICS=false

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем готовый пакет из builder
COPY --from=build /app/deploy/node_modules ./node_modules
COPY --from=build /app/deploy/prisma ./prisma
COPY --from=build /app/deploy/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/deploy/dist ./dist

# Устанавливаем порт
EXPOSE 3000

# Команда для запуска сервера
# CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
CMD ["sh", "-c", "bunx prisma migrate deploy && bun dist/main.js"]
