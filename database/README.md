# @mse/database

Пакет для работы с Prisma ORM и локальной MySQL (без Docker).

## Требования

- Node.js 20+
- pnpm 10+
- Локальная MySQL (или MariaDB) на `localhost:3306`

## Настройка

1. Установить зависимости из корня репозитория:

```bash
pnpm install
```

2. Создать файл `database/.env`:

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/mse_db"
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mse_db
```

1. Создать локальную базу:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## Команды Prisma

Сгенерировать Prisma Client:

```bash
pnpm d prisma:generate
```

Применить схему без файлов миграций:

```bash
pnpm d prisma:push
```

Создать и применить миграцию:

```bash
pnpm d prisma:migrate -- --name init
```

## Запуск тестового скрипта

```bash
pnpm d dev
```

Скрипт `database/src/index.ts` выполняет простой `create` и `findMany`.

## Проверка кода

```bash
pnpm d typecheck
pnpm d lint
pnpm d format
pnpm d format:check
```

