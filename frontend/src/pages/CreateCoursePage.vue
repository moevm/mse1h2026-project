<template>
  <div class="create-course-page">
    <n-page-header @back="goBack">
      <template #title>
        <span class="title">Создание курса</span>
      </template>
    </n-page-header>

    <CourseForm
      mode="create"
      @submit="handleCreate"
      @cancel="goBack"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useNotification, NPageHeader } from 'naive-ui';
import CourseForm from '@/components/courses/CourseForm.vue';
import type { FormData, Course } from '@/types'; 
import { coursesApi } from '@/api'


const router = useRouter();
const notification = useNotification();

const convertFormDataToCourse = (formData: FormData, uid: number): Course => {
  return {
    uid,
    name: formData.name,
    semester: formData.semester,
    minTeamSize: formData.minTeamSize,
    maxTeamSize: formData.maxTeamSize,
    isActive: formData.isActive,
    registrationDeadline: formData.registrationDeadline 
      ? new Date(formData.registrationDeadline) 
      : undefined
  };
};

const handleCreate = async (formData: FormData): Promise<void> => {

    try {
        const convertedFormData = convertFormDataToCourse(formData, 1);
        console.log('Создание курса:', formData);

        // Вызов API для создания курса
        const createdCourse = await coursesApi.create(convertedFormData);

        console.log('Курс успешно создан:', createdCourse);

        notification.success({
            title: 'Успешно',
            content: 'Курс успешно создан',
            duration: 3000,
            keepAliveOnHover: true
        });

        // Переход на страницу со списком курсов
        router.push('/courses');
        } catch (error) {
        console.error('Ошибка создания курса:', error);

        notification.error({
            title: 'Ошибка создания',
            content: error instanceof Error ? error.message : 'Не удалось создать курс',
            duration: 5000,
            keepAliveOnHover: true
        });
    }
}

const goBack = (): void => {
  router.push('/courses');
};
</script>

<style scoped>
.create-course-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .create-course-page {
    padding: 16px;
  }
  
  .title {
    font-size: 1.5rem;
  }
}
</style>