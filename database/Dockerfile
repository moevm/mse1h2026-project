# Используем официальный образ Node.js для сборки приложения
FROM node:24-alpine AS builder

# Переменные окружения для pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Устанавливаем рабочую директорию
WORKDIR /app
# Включаем Corepack для управления пакетными менеджерами
RUN corepack enable

# Копируем файлы package.json и pnpm-lock.yaml для установки зависимостей
COPY package.json pnpm-lock.yaml ./

# Устанавливаем зависимости с помощью pnpm, используя замороженный lockfile.
RUN pnpm install --frozen-lockfile

# Копируем исходный код
COPY . .

# Собираем приложение с помощью pnpm
RUN pnpm build