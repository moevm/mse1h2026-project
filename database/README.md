# @mse/database

Пакет с Prisma Client для работы с MySQL.

## Требования

- Node.js 20+
- pnpm 10+
- Доступная MySQL (локально или в Docker)

## Настройка

1. Установить зависимости из корня репозитория:

```bash
pnpm install
```

2. Создать файл `database/.env`:

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/mse_db"
```

Для Docker можно использовать сервис БД как host в URL, например:

```env
DATABASE_URL="mysql://root:your_password@db:3306/mse_db"
```

3. Если база запускается локально, создать БД:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

При запуске пакет проверяет `DATABASE_URL`:
- переменная обязательна;
- URL должен быть валидным;
- протокол только `mysql://` или `mariadb://`.

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

## Использование клиента в backend

Пакет экспортирует `prisma`-клиент и типы Prisma:

```ts
import { prisma } from '@mse/database';
```

## hello_world-скрипт

```bash
pnpm d hello_world
```

Также доступно:

```bash
pnpm d dev
```

Скрипт `database/src/scripts/hello_world.ts` удаляет тестового пользователя `test@example.com`, создаёт его заново и выводит список пользователей.

## Проверка кода

```bash
pnpm d typecheck
pnpm d lint
pnpm d format
pnpm d format:check
```
