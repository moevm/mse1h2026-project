<template>
  <div class="course-detail-page">
    <!-- Хлебные крошки -->
    <n-breadcrumb>
      <n-breadcrumb-item @click="router.push('/courses')"> Курсы </n-breadcrumb-item>
      <n-breadcrumb-item>
        {{ course?.name || 'Загрузка...' }}
      </n-breadcrumb-item>
    </n-breadcrumb>

    <LoadingSpinner v-if="loading" text="Загрузка курсов..." />

    <!-- Карточка курса -->
    <n-card v-else-if="course" class="course-card" :bordered="true">
      <!-- Шапка с названием и статусом -->
      <template #header>
        <div class="card-header">
          <h1 class="course-title">{{ course.name }}</h1>
          <n-tag :type="course.isActive ? 'success' : 'error'" :bordered="false">
            {{ course.isActive ? 'Активен' : 'Не активен' }}
          </n-tag>
        </div>
      </template>

      <!-- Информация о курсе -->
      <n-descriptions label-placement="left" bordered :column="1" class="course-info">
        <!-- Преподаватель -->
        <n-descriptions-item label="Преподаватель">
          <div class="info-item">
            <span>{{ teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Не назначен' }}</span>
          </div>
        </n-descriptions-item>

        <!-- Размер команды -->
        <n-descriptions-item label="Размер команды">
          <div class="info-item">
            <span> {{ course.minTeamSize }} - {{ course.maxTeamSize }} человек </span>
          </div>
        </n-descriptions-item>

        <!-- Дедлайн выбора проекта -->
        <n-descriptions-item label="Дедлайн выбора проекта">
          <div class="info-item">
            <span v-if="course.registrationDeadline">
              {{ formatDate(course.registrationDeadline) }}
            </span>
            <span v-else class="text-muted">Не установлен</span>
          </div>
        </n-descriptions-item>
      </n-descriptions>

      <!-- Кнопки действий -->
      <template #footer>
        <n-space justify="end" :size="16">
          <template v-if="userStore.isAdmin">
            <n-button type="error" @click="handleDeleteCourse"> Удалить </n-button>
            <n-button type="primary" @click="handleEditCourse"> Редактировать </n-button>
          </template>
          <n-button v-if="userStore.isStudent" @click="handleMyTeam"> Моя команда </n-button>
        </n-space>
      </template>
    </n-card>

    <!-- Ошибка загрузки -->
    <n-result
      v-else
      status="404"
      title="Курс не найден"
      description="Возможно, курс был удален или ссылка неверна"
    >
      <template #footer>
        <n-button class="secondary-btn" @click="router.push('/courses')">
          Вернуться к списку курсов
        </n-button>
      </template>
    </n-result>
    <ConfirmDialog
      :show="showDialog"
      title="Подтверждение действия"
      message="Вы уверены, что хотите удалить этот курс?"
      confirm-text="Удалить"
      @confirm="handleConfirmDelete"
      @cancel="closeDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { coursesApi, usersApi } from '@/api';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useUserStore } from '@/stores/userStore';
import type { Course, User } from '@/types';
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NResult,
  NSpace,
  NTag,
  useNotification,
} from 'naive-ui';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const notification = useNotification();

const course = ref<Course | null>(null);
const loading = ref(true);
const showDialog = ref(false);
const teacher = ref<User | null>(null);

// Форматирование даты
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Загрузка данных курса
const loadCourse = async () => {
  const courseId = String(route.params.id);

  if (!courseId || courseId === 'undefined' || courseId === 'null') {
    router.push('/404');
    return;
  }

  try {
    loading.value = true;
    course.value = await coursesApi.getById(courseId);
    if (course.value?.adminId) {
      teacher.value = await usersApi.getById(course.value.adminId);
    }
  } catch (error) {
    console.error('Ошибка загрузки курса:', error);
    notification.error({
      title: 'Ошибка',
      content: 'Не удалось загрузить информацию о курсе',
      duration: 5000,
    });
  } finally {
    loading.value = false;
  }
};

const handleEditCourse = () => {
  if (!course.value) return;
  router.push(`/courses/${course.value.id}/edit`);
};

const handleMyTeam = () => {
  if (!course.value) return;
  router.push(`/courses/${course.value.id}/my-team`);
};

const handleDeleteCourse = () => {
  if (!course.value) return;
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

const handleConfirmDelete = async () => {
  if (!course.value) return;
  try {
    await coursesApi.delete(course.value.id);

    // Уведомление об успехе
    notification.success({
      title: 'Курс удален',
      content: 'Курс успешно удален',
      duration: 3000,
      keepAliveOnHover: true,
    });
    router.push('/courses');
  } catch (error) {
    console.error('Ошибка:', error);

    notification.error({
      title: 'Ошибка сервера',
      content: error instanceof Error ? error.message : 'Пожалуйста, попробуйте позже',
      duration: 5000,
    });
  } finally {
    closeDialog();
  }
};

// Загружаем данные при монтировании
onMounted(() => {
  loadCourse();
});
</script>

<style scoped>
.course-detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.n-breadcrumb {
  margin-bottom: 24px;
}

.course-card {
  margin-top: 24px;
  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.course-title {
  font-size: 1.8rem;
  font-weight: 600;
}

.course-info {
  margin-top: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

/* ToDo: Адаптивность */
</style>
