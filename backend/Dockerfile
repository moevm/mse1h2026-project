# Сборка NestJS приложения в два этапа

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

# Копируем package.json backend для установки зависимостей
COPY backend/package.json ./backend/

# Устанавливаем ВСЕ зависимости backend (вкл. devDependencies для сборки)
RUN pnpm install --frozen-lockfile --filter @mse/backend...

# Копируем исходный код backend
COPY backend ./backend

# Собираем NestJS приложение
RUN pnpm --filter @mse/backend run build

# pnpm deploy: создаёт автономную копию пакета с prod-зависимостями
RUN pnpm --filter @mse/backend deploy --prod /app/deploy

# ----

# Этап 2: Запуск приложения
# Финальный образ для запуска приложения
FROM node:24-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем готовый пакет из builder
COPY --from=builder /app/deploy .

# Устанавливаем порт
EXPOSE 3000

# Команда для запуска сервера
CMD ["node", "dist/main.js"]