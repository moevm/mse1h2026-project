/**
 * @file index.ts
 * @author @KorzikAlex @katerina2121
 * @description Конфигурация маршрутизации для фронтенда
 */
import { useUserStore } from '@/stores/userStore';
import { type RouterOptions, createRouter, createWebHistory } from 'vue-router';

// Массив маршрутов для приложения
const routes: RouterOptions['routes'] = [
  {
    path: '/',
    component: () => import('@/layout/DefaultLayout.vue'),
    children: [
      {
        path: 'auth/login',
        name: 'login',
        component: () => import('@/pages/LoginPage.vue')
      },
      {
        path: 'courses',
        alias: '',
        name: 'courses',
        component: () => import('@/pages/CoursesListPage.vue'),
      },
      {
        path: 'courses/create',
        component: () => import('@/pages/CreateCoursePage.vue'),
        name: 'course-create',
        meta: { requiresAdmin: true }, //  Только для админов
      },
      {
        path: 'courses/:id',
        component: () => import('@/pages/CourseDetailPage.vue'),
        name: 'course-detail',
      },
      {
        path: 'courses/:id/edit',
        component: () => import('@/pages/EditCoursePage.vue'),
        name: 'course-edit',
        meta: { requiresAdmin: true }, // Только для админов
      },
    ],
  },
];

// Создание экземпляра маршрутизатора
export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// гард для проверки роли
router.beforeEach((to, _, next) => {
  const userStore = useUserStore();

  // Проверяем, требует ли маршрут прав администратора
  if (to.meta.requiresAdmin) {
    if (!userStore.isRoleReady) {
      console.warn('Роль еще не загружена, доступ запрещен');
      // ToDo
      next('/courses');
      return;
    }

    // Проверяем, является ли пользователь админом
    if (!userStore.isAdmin) {
      console.log('Нет прав');
      next('/courses');
      return;
    }
  }

  // Если все проверки пройдены, продолжаем навигацию
  next();
});
