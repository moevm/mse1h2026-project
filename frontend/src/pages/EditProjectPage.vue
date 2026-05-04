<template>
  <div class="edit-project-page">
    <n-page-header @back="goBack">
      <template #title>
        <span class="title">Редактировать проект</span>
      </template>
    </n-page-header>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-container">
      <LoadingSpinner text="Загрузка данных проекта..." />
    </div>

    <!-- Проект не найден -->
    <n-result
      v-else-if="!project"
      status="404"
      title="Проект не найден"
      description="Возможно, проект был удален или ссылка неверна"
      size="large"
      class="result-container"
    >
      <template #footer>
        <n-button type="primary" @click="goToCoursesList"> Вернуться к списку курсов </n-button>
      </template>
    </n-result>

    <ProjectForm v-else mode="edit" :initial-data="project" @submit="handleEdit" @cancel="goBack" />
  </div>
</template>

<script setup lang="ts">
import { projectsApi } from '@/api';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ProjectForm from '@/components/projects/ProjectForm.vue';
import type { Project } from '@/types';
import { NButton, NPageHeader, NResult, useNotification } from 'naive-ui';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const notification = useNotification();

const project = ref<Project | null>(null);
const loading = ref(true);

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
    // При ошибке проект остается null, покажется n-result
    project.value = null;
  } finally {
    loading.value = false;
  }
};

const handleEdit = async (formData: Partial<Project>): Promise<void> => {
  if (!project.value) return;

  try {
    const editedProject = await projectsApi.update(project.value.id, formData);

    console.log('Проект успешно обновлен:', editedProject);

    notification.success({
      title: 'Успешно',
      content: 'Проект успешно отредактирован',
      duration: 3000,
      keepAliveOnHover: true,
    });

    router.push(`/courses/${project.value.courseId}/projects/${project.value.id}`);
  } catch (error) {
    console.error('Ошибка редактирования проекта:', error);

    notification.error({
      title: 'Ошибка редактирования',
      content: error instanceof Error ? error.message : 'Не удалось отредактировать проект',
      duration: 5000,
      keepAliveOnHover: true,
    });
  }
};

const goBack = (): void => {
  if (project.value) {
    router.push(`/courses/${project.value.courseId}/projects/${project.value.id}`);
  } else {
    router.push('/courses');
  }
};

const goToCoursesList = (): void => {
  router.push('/courses');
};

onMounted(() => {
  loadProject();
});
</script>

<style scoped>
.edit-project-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.result-container {
  margin-block-start: 100px;
}

.title {
  font-size: 1.8rem;
  font-weight: 600;
}
</style>
