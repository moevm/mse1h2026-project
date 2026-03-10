/**
 * @file eslint.config.ts
 * @description Конфигурация ESLint для фронтенда и бэкенда проекта.
 * @author @KorzikAlex @katerina2121 @nhitar @sawsurd @DanilOtmakhov @Zoomby2
 */
import { defineConfig, globalIgnores } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

export default defineConfig([
  // базовые правила ESLint
  eslint.configs.recommended,
  // базовые правила для TypeScript (без type-aware)
  ...tseslint.configs.recommended,
  // базовые правила для Vue.js
  ...pluginVue.configs['flat/recommended'],
  globalIgnores(['node_modules/**', 'dist/**', 'build/**', 'coverage/**']),
  // корректный парсинг TypeScript внутри Vue SFC
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },
  },
  // frontend
  {
    basePath: 'frontend',
    files: ['**/*.{ts,tsx,mts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },
  },
  // backend
  {
    basePath: 'backend',
    files: ['**/*.{ts,tsx,mts}'],
    languageOptions: {
      // используем парсер TypeScript ESLint для бэкенда
      parser: tseslint.parser,
      // указываем опции парсера для TypeScript
      parserOptions: {
        sourceType: 'commonjs',
      },
      // определяем глобальные переменные для Node.js и Jest
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    // правила для бэкенда
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
  {
    basePath: 'database',
    files: ['**/*.{ts,mts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'commonjs',
      },
      globals: {
        ...globals.node,
      },
    },
  },
  // отключаем правила, которые конфликтуют с Prettier
  eslintConfigPrettier,
]);
