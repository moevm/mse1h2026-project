# Сборка Vue.js приложения в два этапа

# Этап 1: Сборка приложения
# Образ Node.js для сборки
FROM node:24-alpine AS builder

# Устанавливаем переменные окружения для pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Устанавливаем рабочую директорию
WORKDIR /app

# Включаем Corepack для управления пакетными менеджерами
RUN corepack enable

# Копируем конфигурацию workspace и lockfile (контекст = корень монорепо)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Копируем package.json frontend для установки зависимостей
COPY frontend/package.json ./frontend/

# Устанавливаем зависимости frontend (все, вкл. devDependencies для сборки Vite)
RUN pnpm install --frozen-lockfile --filter @mse/frontend...

# Копируем исходный код frontend
COPY frontend ./frontend

# Собираем Vite-приложение
RUN pnpm --filter @mse/frontend run build

# ----

# Этап 2: Запуск приложения
# Финальный образ для запуска приложения
FROM nginx:1.28.2-alpine

# Копируем собранные файлы из этапа сборки в директорию Nginx
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Конфигурация nginx для SPA (все маршруты → index.html)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Устанавливаем порт
EXPOSE 80

# Команда для запуска Nginx
CMD ["nginx", "-g", "daemon off;"]
