<template>
  <n-card class="form-card">
    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="left"
      label-width="200px"
      size="medium"
    >
      <n-form-item label="Название проекта" path="title" required>
        <n-input
          v-model:value="formData.title"
          placeholder="Введите название проекта"
          :disabled="disabledFields?.includes('title')"
          :maxlength="200"
          show-count
        />
      </n-form-item>

      <n-form-item label="Описание" path="description">
        <n-input
          v-model:value="formData.description"
          type="textarea"
          placeholder="Введите описание проекта"
          :disabled="disabledFields?.includes('description')"
          :rows="5"
          :maxlength="1000"
          show-count
        />
      </n-form-item>

      <n-form-item label="Курс" path="courseId" required>
        <n-select
          v-model:value="formData.courseId"
          :options="courseOptions"
          :loading="loadingCourses"
          placeholder="Выберите курс"
          :disabled="disabledFields?.includes('course') || loadingCourses"
          filterable
          clearable
          @search="handleCourseSearch"
        />
      </n-form-item>

      <n-form-item label="Имя преподавателя" path="teacherFirstName" required>
        <n-input
          v-model:value="formData.teacherFirstName"
          placeholder="Введите имя преподавателя"
          :disabled="disabledFields?.includes('teacher')"
          :maxlength="50"
        />
      </n-form-item>

      <n-form-item label="Фамилия преподавателя" path="teacherLastName" required>
        <n-input
          v-model:value="formData.teacherLastName"
          placeholder="Введите фамилию преподавателя"
          :disabled="disabledFields?.includes('teacher')"
          :maxlength="50"
        />
      </n-form-item>

      <n-form-item>
        <n-space justify="end" :size="16">
          <n-button @click="$emit('cancel')"> Отмена </n-button>
          <n-button
            type="primary"
            :disabled="!isFormValid"
            :loading="submitting"
            @click="handleSubmit"
          >
            {{ submitButtonText }}
          </n-button>
        </n-space>
      </n-form-item>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { coursesApi } from '@/api';
import type { Course, Project } from '@/types';
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSpace,
  useNotification,
} from 'naive-ui';
import type { FormInst, FormRules, SelectOption } from 'naive-ui';
import { computed, onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    initialData?: Partial<Project> | null;
    mode: 'create' | 'edit';
    disabledFields?: string[];
  }>(),
  {
    initialData: () => ({}),
    disabledFields: () => [],
  },
);

const emit = defineEmits<{
  (e: 'submit', data: Partial<Project>): void;
  (e: 'cancel'): void;
}>();

const notification = useNotification();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);

// Состояние для курсов
const courses = ref<Course[]>([]);
const loadingCourses = ref(false);
const courseOptions = ref<SelectOption[]>([]);

// Данные формы
const formData = ref({
  title: '',
  description: '',
  courseId: null as string | null,
  teacherFirstName: '',
  teacherLastName: '',
});

// Правила валидации
const rules: FormRules = {
  title: {
    required: true,
    message: 'Введите название проекта',
    trigger: ['blur', 'input'],
  },
  description: {
    required: false,
    message: 'Введите описание проекта',
    trigger: ['blur', 'input'],
  },
  courseId: {
    required: true,
    message: 'Выберите курс',
    trigger: ['blur', 'change'],
  },
  teacherFirstName: {
    required: true,
    message: 'Введите имя преподавателя',
    trigger: ['blur', 'input'],
  },
  teacherLastName: {
    required: true,
    message: 'Введите фамилию преподавателя',
    trigger: ['blur', 'input'],
  },
};

// Загрузка курсов
const loadCourses = async () => {
  loadingCourses.value = true;
  try {
    courses.value = await coursesApi.getAll();

    // Преобразуем в формат для n-select
    courseOptions.value = courses.value.map((course) => ({
      label: course.name,
      value: course.id, // id курса как string
    }));
  } catch (error) {
    console.error('Ошибка загрузки курсов:', error);
    notification.error({
      title: 'Ошибка',
      content: 'Не удалось загрузить список курсов',
      duration: 3000,
    });
  } finally {
    loadingCourses.value = false;
  }
};

// Поиск курсов
const handleCourseSearch = (query: string) => {
  if (!query) {
    // Если поиск пустой, показываем все
    courseOptions.value = courses.value.map((course) => ({
      label: course.name,
      value: course.id,
    }));
    return;
  }

  // Фильтруем по названию курса
  const searchQuery = query.toLowerCase();
  courseOptions.value = courses.value
    .filter((course) => {
      const courseName = course.name.toLowerCase();
      return courseName.includes(searchQuery);
    })
    .map((course) => ({
      label: course.name,
      value: course.id,
    }));
};

// Проверка валидности формы
const isFormValid = computed(() => {
  const checks = [];

  if (!props.disabledFields?.includes('title')) checks.push(formData.value.title);
  if (!props.disabledFields?.includes('course')) checks.push(formData.value.courseId);
  if (!props.disabledFields?.includes('teacher')) {
    checks.push(formData.value.teacherFirstName);
    checks.push(formData.value.teacherLastName);
  }

  return checks.every(Boolean);
});

const submitButtonText = computed(() => {
  return props.mode === 'create' ? 'Создать проект' : 'Сохранить изменения';
});

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitting.value = true;

    // Находим выбранный курс для получения courseName
    const selectedCourse = courses.value.find(c => c.id === formData.value.courseId);
    
    const projectData: Partial<Project> = {
      uid: props.mode === 'edit' && props.initialData?.uid ? props.initialData.uid : undefined,
      title: formData.value.title,
      description: formData.value.description || '',
      teacherFirstName: formData.value.teacherFirstName,
      teacherLastName: formData.value.teacherLastName,
      courseName: selectedCourse?.name || '',
      courseId: formData.value.courseId || '',
    };

    emit('submit', projectData);
  } catch (error) {
    console.error('Ошибка валидации:', error);
  } finally {
    submitting.value = false;
  }
};

// Функция для преобразования Project в FormData
const mapProjectToFormData = (project: Partial<Project> | null | undefined) => {
  if (!project || Object.keys(project).length === 0) {
    return {
      title: '',
      description: '',
      courseId: null,
      teacherFirstName: '',
      teacherLastName: '',
    };
  }

  return {
    title: project.title || '',
    description: project.description || '',
    courseId: project.courseId || null,
    teacherFirstName: project.teacherFirstName || '',
    teacherLastName: project.teacherLastName || '',
  };
};

// Загружаем курсы при монтировании
onMounted(() => {
  loadCourses();
});

// Загружаем данные при изменении initialData
watch(
  () => props.initialData,
  (newData) => {
    formData.value = mapProjectToFormData(newData);
  },
  { deep: true, immediate: true },
);
</script>

<style scoped>
.form-card {
  margin-top: 24px;
}
</style>