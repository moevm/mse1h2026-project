/**
 * @file index.ts
 * @author @KorzikAlex @katerina2121
 * @description Конфигурация маршрутизации для фронтенда
 */
import { createWebHistory, createRouter, type RouterOptions } from 'vue-router';

// TODO: добавить маршруты в соответствии с требованиями проекта

// Массив маршрутов для приложения
const routes: RouterOptions['routes'] = [];

// Создание экземпляра маршрутизатора с использованием истории в памяти
export const router = createRouter({
  history: createWebHistory(),
  routes,
});
