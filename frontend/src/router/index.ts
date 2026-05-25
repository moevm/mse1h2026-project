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
        path: 'login',
        name: 'login',
        component: () => import('@/pages/LoginPage.vue'),
      },
      {
        path: 'courses',
        alias: '',
        name: 'courses',
        component: () => import('@/pages/CoursesListPage.vue'),
        meta: { requiresAuthentication: true },
      },
      {
        path: 'courses/create',
        component: () => import('@/pages/CreateCoursePage.vue'),
        name: 'course-create',
        meta: { requiresAuthentication: true, requiresAdmin: true },
      },
      {
        path: 'courses/:id',
        component: () => import('@/pages/CourseDetailPage.vue'),
        name: 'course-detail',
        meta: { requiresAuthentication: true },
      },
      {
        path: 'courses/:id/edit',
        component: () => import('@/pages/EditCoursePage.vue'),
        name: 'course-edit',
        meta: { requiresAuthentication: true, requiresAdmin: true },
      },
      {
        path: 'courses/:courseId/my-team',
        component: () => import('@/pages/MyTeamPage.vue'),
        name: 'my-team',
        meta: { requiresAuthentication: true },
      },
      {
        path: 'courses/:courseId/teams',
        component: () => import('@/pages/CourseTeamsPage.vue'),
        name: 'course-teams',
        meta: { requiresAuthentication: true },
      },
      {
        path: 'courses/:courseId/exchanges',
        component: () => import('@/pages/ExchangeRequestsPage.vue'),
        name: 'course-exchanges',
        meta: { requiresAuthentication: true },
      },
      {
        path: '/courses/:id/projects/create',
        component: () => import('@/pages/CreateProjectPage.vue'),
        name: 'project-create',
        meta: { requiresAuthentication: true, requiresAdmin: true },
      },
      {
        path: 'courses/:id/projects/:projectId',
        component: () => import('@/pages/ProjectDetailPage.vue'),
        name: 'project-detail',
        meta: { requiresAuthentication: true },
      },
      {
        path: '/projects/:projectId/edit',
        component: () => import('@/pages/EditProjectPage.vue'),
        name: 'project-edit',
        meta: { requiresAuthentication: true, requiresAdmin: true },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/pages/ProfilePage.vue'),
        meta: { requiresAuthentication: true },
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
  if (to.meta.requiresAuthentication) {
    if (!userStore.isAuthenticated) {
      console.log('Не авторизован((');
      next('/login');
      return;
    }
  }

  if (to.meta.requiresAdmin) {
    if (!userStore.isRoleReady) {
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

  next();
});
