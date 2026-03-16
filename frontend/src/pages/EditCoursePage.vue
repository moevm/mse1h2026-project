<template>
  <div class="edit-course-page">
    <n-page-header @back="goBack">
      <template #title>
        <span class="title">Редактировать курс</span>
      </template>
    </n-page-header>

    <CourseForm
      mode="edit"
      :initial-data="course" 
    :disabled-fields="['teamSize']"
      @submit="handleEdit"
      @cancel="goBack"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useNotification, NPageHeader } from 'naive-ui';
import CourseForm from '@/components/courses/CourseForm.vue';
import type { Course } from '@/types'; 
import { coursesApi } from '@/api'


const router = useRouter();
const route = useRoute();
const notification = useNotification();

const course = ref<Course | null>(null);
const loading = ref(true);

// Загрузка данных курса
const loadCourse = async () => {
  const courseId = Number(route.params.id);
  
  if (isNaN(courseId)) {
    router.push('/404');
    return;
  }
  
  try {
    loading.value = true;
    course.value = await coursesApi.getById(courseId);
  } catch (error) {
    console.error('Ошибка загрузки курса:', error);
    notification.error({
      title: 'Ошибка',
      content: 'Не удалось загрузить информацию о курсе',
      duration: 5000
    });
  } finally {
    loading.value = false;
  }
};

const handleEdit = async (formData: Course): Promise<void> => {
    if (!course.value) return;
    try {
        // Вызов API для редактирования курса
        const editedCourse = await coursesApi.update(course.value.uid, formData);

        console.log('Курс успешно создан:', editedCourse);

        notification.success({
            title: 'Успешно',
            content: 'Курс успешно отредактирован',
            duration: 3000,
            keepAliveOnHover: true
        });

        // Переход на страницу со списком курсов
        router.push(`/courses/${course.value.uid}`);
        } catch (error) {
        console.error('Ошибка редактирования курса:', error);

        notification.error({
            title: 'Ошибка создания',
            content: error instanceof Error ? error.message : 'Не удалось отредактировать курс',
            duration: 5000,
            keepAliveOnHover: true
        });
    }
}

const goBack = (): void => {
  if (!course.value) return;
  router.push(`/courses/${course.value.uid}`);
};

// Загружаем данные при монтировании
onMounted(() => {
  loadCourse();
});
</script>

<style scoped>
.edit-course-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.title {
  font-size: 1.8rem;
  font-weight: 600;
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