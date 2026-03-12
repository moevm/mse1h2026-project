/**
 * @file index.ts
 * @author @KorzikAlex @katerina2121
 * @description Конфигурация маршрутизации для фронтенда
 */
import { createWebHistory, createRouter, type RouterOptions } from 'vue-router';
import DefaultLayout from '@/layout/DefaultLayout.vue';
import CoursesListPage from '@/pages/CoursesListPage.vue';
import CourseDetailPage from '@/pages/CourseDetailPage.vue';

// Массив маршрутов для приложения
const routes: RouterOptions['routes'] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { 
        path: 'courses',
        alias: '', 
        name: 'courses',
        component: CoursesListPage
      },
      { 
        path: 'courses/create', 
        component: () => import('@/pages/CreateCoursePage.vue'), // Ленивая загрузка
        name: 'course-create'
      },
      { path: 'courses/:id', component: CourseDetailPage },
    ],
  },
];

// Создание экземпляра маршрутизатора с использованием истории в памяти
export const router = createRouter({
  history: createWebHistory(),
  routes,
});
