<template>
  <div class="course-detail-page">
    <!-- Хлебные крошки -->
    <n-breadcrumb>
      <n-breadcrumb-item @click="router.push('/courses')">
        Курсы
      </n-breadcrumb-item>
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

        <!-- Семестр -->
        <n-descriptions-item label="Семестр">
          <div class="info-item">
            <span>{{ course.semester }} семестр</span>
          </div>
        </n-descriptions-item>

        <!-- Размер команды -->
        <n-descriptions-item label="Размер команды">
          <div class="info-item">
            <span>
              {{ course.minTeamSize }} - {{ course.maxTeamSize }} человек
            </span>
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
          <n-button
            type="error"
            @click="handleDeleteCourse"
          >
            Удалить
          </n-button>
          <n-button
            type="primary"
            @click="handleEditCourse"
          >
            Редактировать
          </n-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NBreadcrumb, NBreadcrumbItem, NCard, NDescriptions,
  NDescriptionsItem, NTag, NSpace, NButton, NResult,
  useNotification
} from 'naive-ui';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { coursesApi } from '@/api';
import type { Course } from '@/types';

const route = useRoute();
const router = useRouter();
const notification = useNotification();

const course = ref<Course | null>(null);
const loading = ref(true);

// Форматирование даты
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

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

const handleEditCourse = () => {
  if (!course.value) return;
  router.push(`/courses/${course.value.uid}/edit`);
};

const handleDeleteCourse = () => {
  if (!course.value) return;
  console.log('Удаление курса');
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