/**
 * @file index.ts
 * @author @KorzikAlex @katerina2121
 * @description Конфигурация маршрутизации для фронтенда
 */
import { createWebHistory, createRouter, type RouterOptions } from 'vue-router';
import DefaultLayout from '@/layout/DefaultLayout.vue';
import CoursesPage from '@/pages/CoursesPage.vue';

// Массив маршрутов для приложения
const routes: RouterOptions['routes'] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [{ path: '', component: CoursesPage }],
  },
];

// Создание экземпляра маршрутизатора с использованием истории в памяти
export const router = createRouter({
  history: createWebHistory(),
  routes,
});
