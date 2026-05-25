# mse-template

## Оглавление

- [mse-template](#mse-template)
  - [Оглавление](#оглавление)
  - [Установка и запуск](#установка-и-запуск)
    - [Подготовка к запуску](#подготовка-к-запуску)
    - [Запуск Docker Compose (production)](#запуск-docker-compose-production)
    - [Запуск окружения для разработки (development)](#запуск-окружения-для-разработки-development)
    - [Переменные окружения](#переменные-окружения)
  - [Проверка работоспособности](#проверка-работоспособности)
    - [Отладочные роли](#отладочные-роли)
      - [Администратор:](#администратор)
      - [Студенты:](#студенты)
      - [Учителя:](#учителя)
  - [Дополнительная информация](#дополнительная-информация)

## Установка и запуск

### Подготовка к запуску

- Убедитесь, что у вас установлены:
  - [Git](https://git-scm.com/downloads)
  - [Docker Engine/Desktop](https://www.docker.com/get-started)

- Требования к системе:
  - Операционная система: **Windows 10/11**, **macOS**, **Linux**
  - Разрядность системы: **64-битная**
  - Браузер: Современный браузер на базе Chromium (например, Google Chrome) или Gecko (например, Firefox) желательно последней версии.
  - Свободны порты: **3000** (backend), **8080** (frontend) и **3306** (db).

- Клонируйте репозиторий:

  ```bash
  git clone https://github.com/moevm/mse1h2026-project
  ```

- Перейдите в директорию проекта:
  
  ```bash
  cd mse1h2026-project
  ```

- Скопируйте файл `.env.example` в `.env` и отредактируйте переменные окружения. 

  ```bash
  cp .env.example .env
  ```

- [Пока игнорируйте всё, что с ним связано] Параметры для LDAP подключения необходимо попросить у Иванова Дмитрия Владимировича, так как нельзя публиковать эти данные в открытом доступе.

### Запуск Docker Compose (production)

- Введите в `.env` значения для инициализации и запуска `MySQL` контейнера:

  ```env
  MYSQL_ROOT_PASSWORD=<your_root_password>
  MYSQL_DATABASE=<your_database_name>
  MYSQL_USER=<your_mysql_user>
  MYSQL_PASSWORD=<your_mysql_user_password>
  MYSQL_HOST=db
  MYSQL_PORT=3306

  LDAP_URL=ldap://<mse_ldap_url>
  LDAP_BIND_DN=<mse_ldap_bind_dn>
  LDAP_BIND_PASSWORD=<mse_ldap_bind_password>
  LDAP_USER_BASE_DN=<mse_ldap_user_base_dn>

  LDAP_USER_BASE_DN=ou=user-accounts,ou=test-zone,dc=moevm,dc=info
  LDAP_GROUP_BASE_DN=ou=user-groups,ou=test-zone,dc=moevm,dc=info

  JWT_SECRET=<your_jwt_secret>
  ```

- [Для проверяющего] Если вы раньше запускали compose для проверки работоспособности, не забудьте сбросить контейнеры и volumes, чтобы изменения в `.env` и БД вступили в силу:

  ```bash
  docker compose down -v
  ```

- Запустите docker compose:

  ```bash
  docker compose up --build
  ```

- Смотри раздел **[Проверка работоспособности](#проверка-работоспособности)**


### Запуск окружения для разработки (development)

- Для локальной разработки убедитесь, что у вас установлены и корректно настроены:
  - [Node.js 24.14.1](https://nodejs.org/en/download/)
  - [pnpm 10.30.1](https://pnpm.io/installation#using-corepack)
  - [MySQL Community Server 8.4.8](https://dev.mysql.com/downloads/mysql/) ИЛИ [Docker образ](https://hub.docker.com/_/mysql/)
 
- Установите зависимости:

  ```bash
  pnpm i
  ```

- Введите в `.env` значения

  ```env
  MYSQL_ROOT_DATABASE=<you_root_password>
  MYSQL_DATABASE=<your_database_name>
  MYSQL_USER=<your_username>
  MYSQL_PASSWORD=<your_root_password>
  MYSQL_HOST=localhost
  MYSQL_PORT=3306

  LDAP_URL=ldap://<mse_ldap_url>
  LDAP_BIND_DN=<mse_ldap_bind_dn>
  LDAP_BIND_PASSWORD=<mse_ldap_bind_password>
  LDAP_USER_BASE_DN=<mse_ldap_user_base_dn>

  LDAP_USER_BASE_DN=ou=user-accounts,ou=test-zone,dc=moevm,dc=info
  LDAP_GROUP_BASE_DN=ou=user-groups,ou=test-zone,dc=moevm,dc=info

  JWT_SECRET=<your_jwt_secret>
  ```

- Запустите проект вместе с БД (Docker):

  ```bash
  docker compose up --build -d db
  pnpm dev
  ```
  
- Смотри раздел **[Проверка работоспособности](#проверка-работоспособности)**
- Если у вас локальная БД, то необходимо настроить пользователя или использовать данные пользователя root.

### Переменные окружения

- db:

  - `MYSQL_ROOT_PASSWORD` - пароль для пользователя `root` в MySQL.
  - `MYSQL_DATABASE` - имя базы данных, которая будет создана при запуске контейнера.
  - `MYSQL_USER` - имя пользователя для доступа к базе данных (обычно `root` для локальной разработки, и не `root` для docker).
  - `MYSQL_PASSWORD` - пароль для пользователя, указанного в `MYSQL_USER`.
  - `MYSQL_HOST` - хост, на котором работает MySQL (`db` для Docker, `localhost` для локальной разработки)
  - `MYSQL_PORT` - порт, на котором работает MySQL (`3306`)

- backend:

  - `DATABASE_URL` - URL для подключения к базе данных в формате `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`. Нужна исключительно для генерации миграций.
  - `JWT_SECRET` - секрет для генерации JWT токенов (может быть любым строковым значением, но рекомендуется использовать сложную строку для безопасности).

- ldap:

  **На данный момент, ввиду того, что нельзя хранить конкретные параметры для подключения к ldap-серверу в репозитории, данный модуль временно отключён.**

  - `LDAP_URL` - URL для подключения к LDAP серверу
  - `LDAP_BIND_DN` - DN для привязки к LDAP серверу
  - `LDAP_BIND_PASSWORD` - пароль для привязки к LDAP серверу
  - `LDAP_USER_BASE_DN` - базовый DN для поиска пользователей в LDAP
  - `LDAP_GROUP_BASE_DN` - базовый DN для поиска групп в LDAP

- frontend:
  - `VITE_API_BASE_URL` - базовый URL для API запросов с фронтенда (например, `http://127.0.0.1:3000/api`)

## Проверка работоспособности

1. После запуска приложения, откройте браузер и перейдите по адресу http://127.0.0.1:8080.
2. В локальной разработке и в docker compose для разработки, доступен путь к backend API по адресу http://127.0.0.1:3000/api.
3. БД будет доступна по адресу http://127.0.0.1:3306.

Если есть проблемы с доступом/работоспособностью по http://127.0.0.1:8080, попробуйте подключиться по http://localhost:8080.

### Отладочные роли

#### Администратор:

- **email**: admin.main@example.ru
- **password**: admin123

#### Студенты:

Добавлено несколько студентов для демонстрации работоспособности приложения.

Пароли у всех аккаунтов совпадают, а почта отличается номером. В базу данных добавлено 15 студентов с номерами 1-15 соответственно.

- **email**: student1@example.ru
- **password**: student123

#### Учителя:

- **email**: teacher1@example.ru
- **password**: teacher123

## Дополнительная информация
Любая информация, которую команда посчитает нужной разместить.
