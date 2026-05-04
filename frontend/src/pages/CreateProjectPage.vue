<template>
  <div class="create-project-page">
    <n-page-header @back="goBack">
      <template #title>
        <span class="title">Создание проекта</span>
      </template>
    </n-page-header>

    <ProjectForm mode="create" @submit="handleCreate" @cancel="goBack" />
  </div>
</template>

<script setup lang="ts">
import { projectsApi } from '@/api';
import ProjectForm from '@/components/projects/ProjectForm.vue';
import type { Project } from '@/types';
import { NPageHeader, useNotification } from 'naive-ui';
import { useRouter } from 'vue-router';

const router = useRouter();
const notification = useNotification();

const handleCreate = async (formData: Partial<Project>): Promise<void> => {
  try {
    const createdProject = await projectsApi.create(formData);

    console.log('Проект успешно создан:', createdProject);

    notification.success({
      title: 'Успешно',
      content: 'Проект успешно создан',
      duration: 3000,
      keepAliveOnHover: true,
    });

    // Переход на страницу курса, к которому привязан проект
    if (formData.courseId) {
      router.push(`/courses/${formData.courseId}`);
    } else {
      router.push('/courses');
    }
  } catch (error) {
    console.error('Ошибка создания проекта:', error);

    notification.error({
      title: 'Ошибка создания',
      content: error instanceof Error ? error.message : 'Не удалось создать проект',
      duration: 5000,
      keepAliveOnHover: true,
    });
  }
};

const goBack = (): void => {
  router.back();
};
</script>

<style scoped>
.create-project-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.title {
  font-size: 1.8rem;
  font-weight: 600;
}
</style>
