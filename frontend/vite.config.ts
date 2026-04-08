/**
 * @file vite.config.ts
 * @author @KorzikAlex @katerina2121
 * @description Конфигурация Vite для фронтенда
 */
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools()
  ],
  envDir: path.resolve(__dirname, '..'),
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: '127.0.0.1',
    port: 8080,
    open: true,
    watch: {
      usePolling: !!process.env.DEV_DOCKER,
    },
  },
});
