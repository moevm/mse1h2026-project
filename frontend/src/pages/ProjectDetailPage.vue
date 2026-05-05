<template>
  <div class="project-detail-page">
    <!-- Хлебные крошки -->
    <n-breadcrumb>
      <n-breadcrumb-item @click="router.push('/courses')"> Курсы </n-breadcrumb-item>
      <n-breadcrumb-item @click="router.push(`/courses/${project?.courseId}`)">
        {{ project?.course.name || 'Загрузка...' }}
      </n-breadcrumb-item>
      <n-breadcrumb-item>
        {{ project?.title || 'Загрузка...' }}
      </n-breadcrumb-item>
    </n-breadcrumb>

    <LoadingSpinner v-if="loading" text="Загрузка проекта..." />

    <n-card v-else-if="project" class="project-card" :bordered="true">
      <template #header>
        <div class="card-header">
          <h1 class="project-title">{{ project.title }}</h1>
          <n-tag v-if="userStore.isAdmin" type="info" :bordered="false"> #{{ project.id }} </n-tag>
        </div>
      </template>

      <n-descriptions label-placement="left" bordered :column="1" class="project-info">
        <n-descriptions-item label="Преподаватель">
          <div class="info-item">
            <span>{{ project.teacher.firstName }} {{ project.teacher.secondName }}</span>
          </div>
        </n-descriptions-item>

        <n-descriptions-item label="Курс">
          <div class="info-item">
            <n-button text type="primary" @click="router.push(`/courses/${project.courseId}`)">
              {{ project.course.name }}
            </n-button>
          </div>
        </n-descriptions-item>

        <n-descriptions-item label="Описание">
          <div class="description-content">
            <p v-if="project.description" class="description-text">
              {{ project.description }}
            </p>
            <span v-else class="text-muted">Описание отсутствует</span>
          </div>
        </n-descriptions-item>

        <n-descriptions-item v-if="userStore.isAdmin && project.createdAt" label="Создан">
          <div class="info-item">
            <span>{{ formatDate(project.createdAt) }}</span>
          </div>
        </n-descriptions-item>

        <n-descriptions-item v-if="userStore.isAdmin && project.updatedAt" label="Обновлен">
          <div class="info-item">
            <span>{{ formatDate(project.updatedAt) }}</span>
          </div>
        </n-descriptions-item>
      </n-descriptions>

      <!-- Кнопки действий -->
      <template v-if="userStore.isAdmin" #footer>
        <n-space justify="end" :size="16">
          <n-button type="error" @click="showDeleteDialog = true"> Удалить </n-button>
          <n-button type="primary" @click="handleEditProject"> Редактировать </n-button>
        </n-space>
      </template>
    </n-card>

    <!-- Ошибка загрузки -->
    <n-result
      v-else
      status="404"
      title="Проект не найден"
      description="Возможно, проект был удален или ссылка неверна"
    >
      <template #footer>
        <n-button @click="router.push('/courses')"> Вернуться к списку курсов </n-button>
      </template>
    </n-result>

    <!-- Диалог подтверждения удаления -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Подтверждение действия"
      message="Вы уверены, что хотите удалить этот проект?"
      confirm-text="Удалить"
      confirm-button-type="error"
      @confirm="handleConfirmDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { projectsApi } from '@/api';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useUserStore } from '@/stores/userStore';
import type { Project } from '@/types';
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

const project = ref<Project | null>(null);
const loading = ref(true);
const showDeleteDialog = ref(false);

// Форматирование даты
const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Загрузка данных проекта
const loadProject = async () => {
  const projectId = Array.isArray(route.params.projectId)
    ? route.params.projectId[0]
    : route.params.projectId;

  if (!projectId || projectId === 'undefined' || projectId === 'null') {
    router.push('/404');
    return;
  }

  try {
    loading.value = true;
    project.value = await projectsApi.getById(projectId);
  } catch (error) {
    console.error('Ошибка загрузки проекта:', error);
    notification.error({
      title: 'Ошибка',
      content: 'Не удалось загрузить информацию о проекте',
      duration: 5000,
    });
    router.push('/courses');
  } finally {
    loading.value = false;
  }
};

const handleEditProject = () => {
  if (!project.value) return;
  router.push(`/projects/${project.value.id}/edit`);
};

const handleConfirmDelete = async () => {
  if (!project.value) return;

  try {
    await projectsApi.delete(project.value.id);

    notification.success({
      title: 'Проект удален',
      content: 'Проект успешно удален',
      duration: 3000,
      keepAliveOnHover: true,
    });

    router.push(`/courses/${project.value.courseId}`);
  } catch (error) {
    console.error('Ошибка удаления проекта:', error);
    notification.error({
      title: 'Ошибка',
      content: error instanceof Error ? error.message : 'Не удалось удалить проект',
      duration: 5000,
    });
  } finally {
    showDeleteDialog.value = false;
  }
};

onMounted(() => {
  loadProject();
});
</script>

<style scoped>
.project-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-size: 1.5rem;
}

.project-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.project-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.project-info {
  margin-bottom: 0;
  word-break: keep-all;
  white-space: nowrap;
  overflow-x: auto;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.description-content {
  width: 100%;
}

.description-text {
  margin: 0;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.text-muted {
  color: #999;
  font-style: italic;
}
</style>
