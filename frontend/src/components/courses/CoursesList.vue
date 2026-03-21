<template>
  <div class="courses-container">
    <div class="courses-list_header">
      <h2 class="courses-list_title">Список курсов</h2>
      <n-button v-if="userStore.isAdmin" class="primary-btn" @click="$emit('course-add')">
        <template #icon>
          <n-icon>
            <AddRound />
          </n-icon>
        </template>
        Добавить курс
      </n-button>
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
        @click="$emit('course-click', course)"
        @delete="$emit('course-delete', course)"
        @show="$emit('course-show', course)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useUserStore } from '@/stores/userStore';
import type { Course } from '@/types';
import { AddRound, SentimentDissatisfiedRound } from '@vicons/material';
import { NButton, NEmpty, NIcon } from 'naive-ui';
import { computed } from 'vue';

import CourseCard from './CourseCard.vue';

const userStore = useUserStore();

// Пропсы
const props = defineProps<{
  courses: Course[];
  loading: boolean;
}>();

// События
defineEmits<{
  (e: 'course-click', course: Course): void;
  (e: 'course-delete', course: Course): void;
  (e: 'course-show', course: Course): void;
  (e: 'course-add'): void;
}>();

// Сообщение для пустого состояния в зависимости от роли
const emptyStateMessage = computed(() => {
  if (userStore.isAdmin) {
    return 'Нет доступных курсов для управления';
  } else {
    return 'Нет доступных активных курсов';
  }
});

// Оставляем только активные курсы для учеников, для админа показываем все
const visibleCourses = computed(() => {
  if (userStore.isAdmin) {
    return props.courses;
  } else {
    return props.courses.filter((course) => course.isActive);
  }
});
</script>

<style scoped>
.courses-container {
  width: 100%;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  font-size: 1.5rem;
}

.courses-list_header {
  grid-row: 1;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
