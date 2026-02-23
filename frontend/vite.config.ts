/**
 * @file vite.config.ts
 * @author @KorzikAlex @katerina2121
 * @description Конфигурация Vite для фронтенда
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
