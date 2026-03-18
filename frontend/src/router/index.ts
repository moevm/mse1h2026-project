/**
 * @file index.ts
 * @author @KorzikAlex @katerina2121
 * @description Конфигурация маршрутизации для фронтенда
 */
import DefaultLayout from '@/layout/DefaultLayout.vue';
import CourseDetailPage from '@/pages/CourseDetailPage.vue';
import CoursesListPage from '@/pages/CoursesListPage.vue';
import { useUserStore } from '@/stores/userStore';
import { type RouterOptions, createRouter, createWebHistory } from 'vue-router';

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
        component: CoursesListPage,
      },
      {
        path: 'courses/create',
        component: () => import('@/pages/CreateCoursePage.vue'),
        name: 'course-create',
        meta: { requiresAdmin: true }, //  Только для админов
      },
      {
        path: 'courses/:id',
        component: CourseDetailPage,
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
