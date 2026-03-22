# Сборка Vue.js приложения в два этапа

# Этап 1: Сборка приложения
# Образ Node.js для сборки
FROM node:lts-alpine AS build

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
FROM nginx:stable-alpine AS production

# Копируем собранные файлы из этапа сборки в директорию Nginx
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Конфигурация nginx для SPA (все маршруты → index.html)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Устанавливаем порт
EXPOSE 80

# Команда для запуска Nginx
CMD ["nginx", "-g", "daemon off;"]
