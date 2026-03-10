<template>
  <div class="courses-container">
    <!-- Заголовок с выбором роли -->
    <div class="courses-list_header">
      <h2 class="courses-list_title">Список курсов</h2>

      <div class="role-selector">
        <div class="radio-group">
          <label class="radio-button">
            <input
              type="radio"
              value="student"
              :checked="currentRole === 'student'"
              @change="currentRole = 'student'"
            />
            <span>Ученик</span>
          </label>
          <label class="radio-button">
            <input type="radio" value="admin" :checked="currentRole === 'admin'" @change="currentRole = 'admin'" />
            <span>Админ</span>
          </label>
        </div>
      </div>
    </div>

    <LoadingSpinner v-if="loading" text="Загрузка курсов..." />
    <div v-else class="courses-list">
      <CourseCard
        v-for="course in visibleCourses"
        :key="course.uid"
        :course="course"
        :role="currentRole"
        @click="handleCourseClick"
        @delete="handleCourseDelete"
        @show="handleCourseShow"
      />
    </div>
  </div>

  <ConfirmDialog
    :show="showDialog"
    :title="dialogTitle"
    :message="dialogMessage"
    :confirm-text="dialogConfirmText"
    @confirm="handleConfirm"
    @cancel="showDialog = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import CourseCard from './CourseCard.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import { coursesApi } from '@/api';
import type { Course } from '../types/index';
import LoadingSpinner from './LoadingSpinner.vue';
import { useNotification } from 'naive-ui';

const courses = ref<Course[]>([]);
const currentRole = ref<'admin' | 'student'>('student');
const courseToAction = ref<Course | null>(null);
const showDialog = ref(false);
const dialogAction = ref<'delete' | 'show'>('delete');
const loading = ref(true);
const notification = useNotification();

// Загрузка курсов
const fetchCourses = async () => {
  loading.value = true;
  try {
    courses.value = await coursesApi.getAll();
  } finally {
    loading.value = false;
  }
};

// Оставляем только активные курсы для учеников, для админа показываем все
const visibleCourses = computed(() => {
  if (currentRole.value === 'admin') {
    return courses.value;
  } else {
    return courses.value.filter((course) => course.isActive);
  }
});

const handleCourseClick = (course: Course) => {
  console.log('Переход на курс:', course.uid);
};

const handleCourseDelete = (course: Course) => {
  courseToAction.value = course;
  dialogAction.value = 'delete';
  showDialog.value = true;
};

const handleCourseShow = (course: Course) => {
  courseToAction.value = course;
  dialogAction.value = 'show';
  showDialog.value = true;
};

// Вычисляемые свойства для диалога
const dialogTitle = 'Подтверждение';
const dialogMessage = computed(() => (dialogAction.value === 'delete' ? 'Скрыть курс?' : 'Показать курс?'));
const dialogConfirmText = computed(() => (dialogAction.value === 'delete' ? 'Скрыть' : 'Показать'));

const closeDialog = () => {
  showDialog.value = false;
  courseToAction.value = null;
};

const handleConfirm = async () => {
  if (!courseToAction.value) return;

  try {
    if (dialogAction.value === 'delete') {
      // Скрыть курс (isActive = false)
      const updatedData = {
        ...courseToAction.value,  // все поля из courseToAction
        isActive: false           // изменённое поле
      };
      await coursesApi.update(courseToAction.value.uid, updatedData);

      // Обновляем локальное состояние
      const course = courses.value.find((c) => c.uid === courseToAction.value?.uid);
      if (course) course.isActive = false;

      // Уведомление об успехе
      notification.success({
        title: 'Курс скрыт',
        content: 'Курс успешно скрыт из публичного доступа',
        duration: 3000,
        keepAliveOnHover: true
      });
    } else {
      // Показать курс (isActive = true)
      const updatedData = {
        ...courseToAction.value,  // все поля из courseToAction
        isActive: true          // изменённое поле
      };
      await coursesApi.update(courseToAction.value.uid, updatedData);

      // Обновляем локальное состояние
      const course = courses.value.find((c) => c.uid === courseToAction.value?.uid);
      if (course) course.isActive = true;

      // Уведомление об успехе
      notification.success({
        title: 'Курс опубликован',
        content: 'Курс теперь виден всем пользователям',
        duration: 3000,
        keepAliveOnHover: true
      });
    }
  } catch (error) {
    // Ловим исключения от API
    console.error('Ошибка:', error);

    // Уведомление об ошибке
    if (error instanceof Error) {
      notification.error({
        title: 'Ошибка сервера',
        content: error.message || 'Пожалуйста, попробуйте позже',
        duration: 5000,
        keepAliveOnHover: true
      });
    } else {
      notification.error({
        title: 'Неизвестная ошибка',
        content: 'Произошла неизвестная ошибка',
        duration: 5000,
        keepAliveOnHover: true
      });
    }
  } finally {
    closeDialog();
  }
};

onMounted(fetchCourses);
</script>

<style scoped>
.courses-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

.courses-list_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.courses-list_title {
  font-size: 1.5rem;
}

.role-selector {
  display: flex;
}

.radio-group {
  display: flex;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
}

.radio-button {
  position: relative;
  display: inline-block;
  padding: 6px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  user-select: none;
}

.radio-button input[type='radio'] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-button:has(input:checked) {
  background-color: white;
  color: #18a058;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.radio-button:has(input:focus-visible) {
  outline: 2px solid #18a058;
  outline-offset: 2px;
}

.radio-button:hover:not(:has(input:checked)) {
  background-color: rgba(0, 0, 0, 0.05);
}

.courses-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>
