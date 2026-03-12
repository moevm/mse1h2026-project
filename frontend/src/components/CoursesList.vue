<template>
  <div class="courses-container">
    <div class="courses-list_header">
      <h2 class="courses-list_title">Список курсов</h2>
    </div>

    <LoadingSpinner v-if="loading" text="Загрузка курсов..." />

    <div v-else-if="!visibleCourses.length" class="center-wrapper">
      <n-empty :description="emptyStateMessage" class="empty">
        <template #icon>
          <n-icon>
            <SentimentDissatisfiedRound />
          </n-icon>
        </template>
      </n-empty>
    </div>

    <!-- Список курсов -->
    <div v-else class="courses-list">
      <CourseCard
        v-for="course in visibleCourses"
        :key="course.uid"
        :course="course"
        :role="currentRole"
        @click="$emit('course-click', course)"
        @delete="$emit('course-delete', course)"
        @show="$emit('course-show', course)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CourseCard from './CourseCard.vue';
import { SentimentDissatisfiedRound } from '@vicons/material';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { NEmpty, NIcon } from 'naive-ui';
import type { Course } from '@/types';

// Пропсы
const props = defineProps<{
  courses: Course[];
  loading: boolean;
  currentRole: 'admin' | 'student';
}>();

// События
defineEmits<{
  (e: 'course-click', course: Course): void;
  (e: 'course-delete', course: Course): void;
  (e: 'course-show', course: Course): void;
}>();

// Сообщение для пустого состояния в зависимости от роли
const emptyStateMessage = computed(() => {
  if (props.currentRole === 'admin') {
    return 'Нет доступных курсов для управления';
  } else {
    return 'Нет доступных активных курсов';
  }
});

// Оставляем только активные курсы для учеников, для админа показываем все
const visibleCourses = computed(() => {
  if (props.currentRole === 'admin') {
    return props.courses;
  } else {
    return props.courses.filter((course) => course.isActive);
  }
});
</script>

<style scoped>
.courses-container {
  width: 100%;
  min-height: 80vh; /* Минимальная высота 80% экрана */
  display: flex;
  flex-direction: column;
  font-size: 1.5rem;
}

.courses-list_header {
  grid-row: 1;
  margin-bottom: 24px;
}

.courses-list_title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
}

.center-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  width: 100%;
}

.empty {
  --n-font-size: 1.2rem !important;
}

.courses-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>
