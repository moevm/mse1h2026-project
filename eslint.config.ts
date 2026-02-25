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
  // frontend
  {
    files: ['frontend/**/*.{ts,tsx,vue,mts}'],
    languageOptions: {
      // используем парсер для Vue.js, который поддерживает TypeScript
      parser: vueParser,
      // указываем опции парсера для Vue.js и TypeScript
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },
  },
  // backend
  {
    files: ['backend/**/*.{ts,tsx,mts}'],
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
    files: ['database/**/*.{ts,mts}'],
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
