<template>
  <div
    class="course-card"
    :class="{ inactive: !course.isActive, clickable: true }"
    @click="handleCardClick"
  >
    <div class="card-header">
      <h3 class="card-title">{{ course.name }}</h3>
      <div class="header-extra">
        <n-button
          v-if="role === 'admin' && course.isActive"
          class="delete-btn secondary-btn"
          @click.stop="handleDelete"
        >
          Скрыть курс
        </n-button>
        <n-button
          v-if="role === 'admin' && !course.isActive"
          class="show-btn secondary-btn"
          @click.stop="handleShow"
        >
          Показать курс
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Course } from '../../types/index';
import { NButton } from 'naive-ui';

const props = defineProps<{
  course: Course;
  role: 'admin' | 'student';
}>();

const emit = defineEmits<{
  (e: 'click', course: Course): void;
  (e: 'delete', course: Course): void;
  (e: 'show', course: Course): void;
}>();

const handleCardClick = () => {
  emit('click', props.course);
};

const handleDelete = (e: MouseEvent) => {
  e.stopPropagation();
  emit('delete', props.course);
};

const handleShow = (e: MouseEvent) => {
  e.stopPropagation();
  emit('show', props.course);
};
</script>

<style scoped>
.course-card {
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  border-radius: 15px;
  overflow: hidden;
  background: #d9d9d9;
  padding: 1.5rem 0;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}

.card-title {
  position: relative;
  font-size: 1.5rem;
  font-weight: 500;
  padding-left: 18px; /* место под индикатор */
}

/* индикатор активности курса */
.card-title::before {
  width: 10px;
  left: 0; /* Размещаем слева */
  top: 50%; /* Центрируем по вертикали */
  transform: translateY(-50%); /* Точное вертикальное центрирование */
  height: 10px;
  border-radius: 100%;
  background-color: #18a058;
  content: '';
  position: absolute;
}

.course-card.inactive .card-title::before {
  background-color: #f44336;
}

.header-extra {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
</style>
