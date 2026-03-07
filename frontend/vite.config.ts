/**
 * @file vite.config.ts
 * @author @KorzikAlex @katerina2121
 * @description Конфигурация Vite для фронтенда
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [vue()],
  envDir: path.resolve(__dirname, '..'),
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
