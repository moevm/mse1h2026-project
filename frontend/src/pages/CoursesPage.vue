<template>
  <div class="courses-page">
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
          <input
            type="radio"
            value="admin"
            :checked="currentRole === 'admin'"
            @change="currentRole = 'admin'"
          />
          <span>Админ</span>
        </label>
      </div>
    </div>
    <!-- Компонент списка курсов -->
    <CoursesList
      :courses="courses"
      :loading="loading"
      :current-role="currentRole"
      @role-change="currentRole = $event"
      @course-click="handleCourseClick"
      @course-delete="handleCourseDelete"
      @course-show="handleCourseShow"
      @course-add="handleAddCourse"
    />

    <!-- Диалог подтверждения -->
    <ConfirmDialog
      :show="showDialog"
      :title="dialogTitle"
      :message="dialogMessage"
      :confirm-text="dialogConfirmText"
      @confirm="handleConfirm"
      @cancel="closeDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useNotification } from 'naive-ui';
import { useRouter } from 'vue-router';
import CoursesList from '@/components/CoursesList.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import { coursesApi } from '@/api';
import type { Course } from '@/types';

const router = useRouter();
const notification = useNotification();

// Состояния
const courses = ref<Course[]>([]);
const currentRole = ref<'admin' | 'student'>('student');
const loading = ref(true);
const showDialog = ref(false);
const dialogAction = ref<'delete' | 'show'>('delete');
const courseToAction = ref<Course | null>(null);

// Загрузка курсов
const fetchCourses = async () => {
  loading.value = true;
  try {
    courses.value = await coursesApi.getAll();
  } catch (error) {
    console.error('Ошибка загрузки курсов:', error);
    notification.error({
      title: 'Ошибка загрузки',
      content: 'Не удалось загрузить список курсов',
      duration: 5000,
    });
  } finally {
    loading.value = false;
  }
};

// Обработчики событий от списка
const handleCourseClick = (course: Course) => {
  console.log('Переход на курс:', course.uid);
  router.push(`/courses/${course.uid}`);
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

const handleAddCourse = () => {
  console.log('Добавить новый курс');
  router.push('/courses/create');
};

// Вычисляемые свойства для диалога
const dialogTitle = 'Подтверждение';
const dialogMessage = computed(() =>
  dialogAction.value === 'delete' ? 'Скрыть курс?' : 'Показать курс?',
);
const dialogConfirmText = computed(() => (dialogAction.value === 'delete' ? 'Скрыть' : 'Показать'));

const closeDialog = () => {
  showDialog.value = false;
  courseToAction.value = null;
};

// Обновление курса в локальном состоянии
const updateCourseInList = (courseUid: number, isActive: boolean) => {
  const course = courses.value.find((c) => c.uid === courseUid);
  if (course) {
    course.isActive = isActive;
  }
};

const handleConfirm = async () => {
  if (!courseToAction.value) return;

  try {
    const newActiveState = dialogAction.value === 'show';

    // Обновляем на сервере
    const updatedData = {
      ...courseToAction.value,
      isActive: newActiveState,
    };
    await coursesApi.update(courseToAction.value.uid, updatedData);

    updateCourseInList(courseToAction.value.uid, newActiveState);

    // Уведомление об успехе
    notification.success({
      title: newActiveState ? 'Курс опубликован' : 'Курс скрыт',
      content: newActiveState
        ? 'Курс теперь виден всем пользователям'
        : 'Курс успешно скрыт из публичного доступа',
      duration: 3000,
      keepAliveOnHover: true,
    });
  } catch (error) {
    console.error('Ошибка:', error);

    notification.error({
      title: 'Ошибка сервера',
      content: error instanceof Error ? error.message : 'Пожалуйста, попробуйте позже',
      duration: 5000,
    });
  } finally {
    closeDialog();
  }
};

// Загружаем данные при монтировании
onMounted(() => {
  fetchCourses();
});
</script>

<style scoped>
.courses-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
}
</style>
