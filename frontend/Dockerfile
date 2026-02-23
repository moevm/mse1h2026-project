# ── Stage 1: build ──────────────────────────────────────────────
FROM node:24-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable

# Копируем конфигурацию workspace и lockfile (контекст = корень монорепо)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY frontend/package.json ./frontend/

# Устанавливаем зависимости frontend (все, вкл. devDependencies для сборки Vite)
RUN pnpm install --frozen-lockfile --filter @mse/frontend...

# Копируем исходный код frontend
COPY frontend ./frontend

# Собираем Vite-приложение
RUN pnpm --filter @mse/frontend run build

# ── Stage 2: nginx (только статика) ────────────────────────────
FROM nginx:alpine

# Копируем собранные файлы из этапа сборки в директорию Nginx
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Конфигурация nginx для SPA (все маршруты → index.html)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
