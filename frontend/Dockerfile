# Сборка Vue.js приложения в два этапа

# Этап 1: Сборка приложения
# Образ Node.js для сборки
FROM node:24.14.1-alpine3.23@sha256:01743339035a5c3c11a373cd7c83aeab6ed1457b55da6a69e014a95ac4e4700b AS build

# Аргумент для передачи базового URL API в Vite
ARG VITE_API_BASE_URL

# Устанавливаем переменные окружения для pnpm
ENV PNPM_HOME="/pnpm"
# Добавляем pnpm в PATH
ENV PATH="$PNPM_HOME:$PATH"
# Отключаем проверку обновлений pnpm внутри контейнера
ENV PNPM_DISABLE_SELF_UPDATE_CHECK=true
# Устанавливаем переменную для кэширования зависимостей pnpm
ENV PNPM_STORE_PATH=/pnpm/store
# Устанавливаем переменную для CI-среды
ENV CI=true

# Устанавливаем переменную окружения для Vite, чтобы она была доступна во время сборки
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Устанавливаем рабочую директорию
WORKDIR /app

# Включаем Corepack для управления пакетными менеджерами
RUN corepack enable

# Копируем lockfile, package.json и конфигурацию workspace для установки зависимостей
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./

# Предварительно загружаем все зависимости в кэш
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm fetch

# Копируем package.json frontend для установки зависимостей
COPY frontend/package.json ./frontend/

# Устанавливаем зависимости frontend из локального кэша
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --offline --frozen-lockfile --filter @mse/frontend

# Копируем исходный код frontend
COPY frontend ./frontend

# Собираем Vite-приложение
RUN pnpm --filter @mse/frontend run build

# ----

# Этап 2: Запуск приложения
# Финальный образ для запуска приложения
FROM nginx:1.28.3-alpine3.23-slim@sha256:b33eedfdf089be1f83759ced27b4deec5b6f1b6fc2a6819ebce0ae351a4406e5 AS production

# Копируем собранные файлы из этапа сборки в директорию Nginx
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Конфигурация nginx для SPA (все маршруты → index.html)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Устанавливаем порт
EXPOSE 80

# Команда для запуска Nginx
CMD ["nginx", "-g", "daemon off;"]
