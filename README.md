# mse-template

## Установка и запуск

### Запуск без **Docker**

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/moevm/mse1h2026-project
   ```
2. Перейдите в директорию проекта:
    ```bash
    cd mse1h2026-project
    ```
3. Установите зависимости:
    ```bash
    pnpm i
    ```
4. Запустите проект
   1. Dev:
        ```bash
        pnpm dev
        ```
    2. Production:
        ```bash
        pnpm build
        pnpm preview
        ```
    3. Для запуска по отдельности фронтенда и бэкенда, используйте команды:

        `b` - бэкенд, `f` - фронтенд
        
        Dev:
        ```bash
        pnpm b dev
        pnpm f dev
        ```

        Production:
        ```bash
        pnpm b build
        pnpm b start
        pnpm f build
        pnpm f preview
        ```

### Запуск с помощью **Docker**

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/moevm/mse1h2026-project
   ```
2. Перейдите в директорию проекта:
    ```bash
    cd mse1h2026-project
    ```

TODO: Дописать инструкции по запуску с помощью Docker.


## Проверка работоспособности
Инструкции по проверке работоспособности проекта (основной функциональности и результатов).

## Дополнительная информация
Любая информация, которую команда посчитает нужной разместить.
