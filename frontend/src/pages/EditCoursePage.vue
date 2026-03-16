<template>
  <div class="edit-course-page">
    <n-page-header @back="goBack">
      <template #title>
        <span class="title">Редактировать курс</span>
      </template>
    </n-page-header>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-container">
      <LoadingSpinner text="Загрузка данных курса..." />
    </div>

    <!-- Курс не найден -->
    <n-result
      v-else-if="!course"
      status="404"
      title="Курс не найден"
      description="Возможно, курс был удален или ссылка неверна"
      size="large"
      class="result-container"
    >
      <template #footer>
        <n-button type="primary" @click="goToCoursesList"> Вернуться к списку курсов </n-button>
      </template>
    </n-result>

    <!-- Форма редактирования (когда данные загружены) -->
    <CourseForm
      v-else
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
import { useNotification, NPageHeader, NResult, NButton } from 'naive-ui';
import CourseForm from '@/components/courses/CourseForm.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { Course } from '@/types';
import { coursesApi } from '@/api';

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
      duration: 5000,
    });
    // При ошибке курс остается null, покажется n-result
    course.value = null;
  } finally {
    loading.value = false;
  }
};

const handleEdit = async (formData: Course): Promise<void> => {
  if (!course.value) return;

  try {
    // Вызов API для редактирования курса
    const editedCourse = await coursesApi.update(course.value.uid, formData);

    console.log('Курс успешно обновлен:', editedCourse);

    notification.success({
      title: 'Успешно',
      content: 'Курс успешно отредактирован',
      duration: 3000,
      keepAliveOnHover: true,
    });

    // Переход на страницу курса
    router.push(`/courses/${course.value.uid}`);
  } catch (error) {
    console.error('Ошибка редактирования курса:', error);

    notification.error({
      title: 'Ошибка редактирования',
      content: error instanceof Error ? error.message : 'Не удалось отредактировать курс',
      duration: 5000,
      keepAliveOnHover: true,
    });
  }
};

const goBack = (): void => {
  if (course.value) {
    router.push(`/courses/${course.value.uid}`);
  } else {
    router.push('/courses');
  }
};

const goToCoursesList = (): void => {
  router.push('/courses');
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

.result-container {
  margin-block-start: 100px;
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
