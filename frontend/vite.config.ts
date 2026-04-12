/**
 * @file vite.config.ts
 * @author @KorzikAlex @katerina2121
 * @description Конфигурация Vite для фронтенда
 */
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

const isDocker = !!process.env.DEV_DOCKER;

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
    host: isDocker ? '0.0.0.0' : '127.0.0.1',
    port: 8080,
    open: false,
    watch: {
      usePolling: isDocker,
    },
  },
  preview: {
    host: isDocker ? '0.0.0.0' : '127.0.0.1',
    port: 8080,
    open: false,
  },
});
