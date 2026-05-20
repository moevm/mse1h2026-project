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
      <n-form-item label="Название курса" path="name" required>
        <n-input
          v-model:value="formData.name"
          placeholder="Введите название курса"
          :disabled="disabledFields?.includes('name')"
          :maxlength="100"
          show-count
        />
      </n-form-item>

      <n-form-item label="Преподаватель" path="teacherId">
        <n-select
          v-model:value="formData.teacherId"
          :options="teacherOptions"
          :loading="loadingTeachers"
          placeholder="Выберите преподавателя"
          :disabled="disabledFields?.includes('teacher') || loadingTeachers"
          filterable
          clearable
          @search="handleTeacherSearch"
        />
      </n-form-item>

      <n-space>
        <n-form-item label="Мин. размер команды" path="minTeamSize" required>
          <n-input-number
            v-model:value="formData.minTeamSize"
            :min="1"
            :max="10"
            :disabled="disabledFields?.includes('teamSize')"
            style="width: 120px"
          />
        </n-form-item>

        <n-form-item label="Макс. размер команды" path="maxTeamSize" required>
          <n-input-number
            v-model:value="formData.maxTeamSize"
            :min="1"
            :max="20"
            :disabled="disabledFields?.includes('teamSize')"
            style="width: 120px"
          />
        </n-form-item>
      </n-space>

      <n-form-item label="Дедлайн регистрации" path="registrationDeadline" required>
        <n-date-picker
          v-model:value="formData.registrationDeadline"
          type="datetime"
          placeholder="Выберите дату и время"
          :is-date-disabled="isDateDisabled"
          :is-time-disabled="isTimeDisabled"
          :disabled="disabledFields?.includes('deadline')"
          clearable
          style="width: 100%"
          :actions="['clear', 'confirm']"
          format="dd.MM.yyyy HH:mm:ss"
          date-format="dd.MM.yyyy"
          month-format="MMM"
          time-format="HH:mm:ss"
        />
      </n-form-item>

      <n-form-item label="Статус" path="isActive">
        <n-space align="center">
          <n-switch
            v-model:value="formData.isActive"
            :disabled="disabledFields?.includes('isActive')"
          >
            <template #checked>Активен</template>
            <template #unchecked>Не активен</template>
          </n-switch>
          <n-text depth="3">
            {{ formData.isActive ? 'Курс доступен студентам' : 'Курс скрыт от студентов' }}
          </n-text>
        </n-space>
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
import { usersApi } from '@/api';
import type { Course, User } from '@/types';
import { useNow } from '@vueuse/core';
import {
  NButton,
  NCard,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NSwitch,
  NText,
  useNotification,
} from 'naive-ui';
import type { FormInst, FormRules, SelectOption } from 'naive-ui';
import { computed, onMounted, ref, watch } from 'vue';

function isDateDisabled(ts: number) {
  const today = new Date();
  // Сбросить время для сравнения только по дате
  today.setHours(0, 0, 0, 0);
  return new Date(ts) < today;
}

function isTimeDisabled(current: number) {
  const selectedDate = new Date(current);
  const now = useNow().value;

  const isSameDay =
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate();

  if (!isSameDay) {
    return {
      isHourDisabled: () => false,
      isMinuteDisabled: () => false,
      isSecondDisabled: () => false,
    };
  }

  return {
    isHourDisabled: (hour: number) => hour < now.getHours(),
    isMinuteDisabled: (minute: number, hour: number | null) =>
      hour === now.getHours() && minute < now.getMinutes(),
    isSecondDisabled: (second: number, minute: number | null, hour: number | null) =>
      hour === now.getHours() && minute === now.getMinutes() && second < now.getSeconds(),
  };
}

const props = withDefaults(
  defineProps<{
    initialData?: Partial<Course> | null;
    mode: 'create' | 'edit';
    disabledFields?: string[];
  }>(),
  {
    initialData: () => ({}),
    disabledFields: () => [],
  },
);

const emit = defineEmits<{
  (e: 'submit', data: Course): void;
  (e: 'cancel'): void;
}>();

const notification = useNotification();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);

// Состояние для преподавателей
const teachers = ref<User[]>([]);
const loadingTeachers = ref(false);
const teacherOptions = ref<SelectOption[]>([]);

// Данные формы
const formData = ref({
  name: '',
  teacherId: null as string | null,
  minTeamSize: 2,
  maxTeamSize: 5,
  registrationDeadline: null as number | null,
  isActive: true,
});

// Правила валидации
const rules: FormRules = {
  name: {
    required: true,
    message: 'Введите название курса',
    trigger: ['blur', 'input'],
  },
  teacherId: {
    required: false,
    type: 'string',
    message: 'Выберите преподавателя',
    trigger: ['blur', 'change'],
  },
  minTeamSize: [
    {
      required: true,
      type: 'number',
      message: 'Укажите минимальный размер команды',
      trigger: ['blur', 'change'],
    },
    {
      validator: (_, value) => value >= 1,
      message: 'Минимальный размер не может быть меньше 1',
      trigger: ['blur', 'change'],
    },
  ],
  maxTeamSize: [
    {
      required: true,
      type: 'number',
      message: 'Укажите максимальный размер команды',
      trigger: ['blur', 'change'],
    },
    {
      validator: (_, value) => {
        return value >= formData.value.minTeamSize;
      },
      message: 'Максимальный размер не может быть меньше минимального',
      trigger: ['blur', 'change'],
    },
    {
      validator: (_, value) => value <= 20,
      message: 'Максимальный размер не может быть больше 20',
      trigger: ['blur', 'change'],
    },
  ],
  registrationDeadline: [
    {
      required: true,
      type: 'number',
      message: 'Выберите дату и время дедлайна',
      trigger: ['blur', 'change'],
    },
    {
      validator: (_, value) => {
        if (typeof value !== 'number') {
          return false;
        }

        return value >= Date.now();
      },
      message: 'Дедлайн не может быть в прошлом',
      trigger: ['blur', 'change'],
    },
  ],
};

// Загрузка преподавателей (админов)
const loadTeachers = async () => {
  loadingTeachers.value = true;
  try {
    teachers.value = await usersApi.getUsers('admin');

    // Преобразуем в формат для n-select
    teacherOptions.value = teachers.value.map((teacher) => ({
      label: `${teacher.firstName} ${teacher.secondName}`,
      value: teacher.id,
    }));
  } catch (error) {
    console.error('Ошибка загрузки преподавателей:', error);
    notification.error({
      title: 'Ошибка',
      content: 'Не удалось загрузить список преподавателей',
      duration: 3000,
    });
  } finally {
    loadingTeachers.value = false;
  }
};

// Поиск преподавателей
const handleTeacherSearch = (query: string) => {
  if (!query) {
    // Если поиск пустой, показываем всех
    teacherOptions.value = teachers.value.map((teacher) => ({
      label: `${teacher.firstName} ${teacher.secondName}`,
      value: teacher.id,
    }));
    return;
  }

  // Фильтруем по имени и фамилии
  const searchQuery = query.toLowerCase();
  teacherOptions.value = teachers.value
    .filter((teacher) => {
      const fullName = `${teacher.firstName} ${teacher.secondName}`.toLowerCase();
      const firstName = teacher.firstName.toLowerCase();
      const lastName = teacher.secondName.toLowerCase();

      // Ищем по полному имени, имени или фамилии
      return (
        fullName.includes(searchQuery) ||
        firstName.includes(searchQuery) ||
        lastName.includes(searchQuery)
      );
    })
    .map((teacher) => ({
      label: `${teacher.firstName} ${teacher.secondName}`,
      value: teacher.id,
    }));
};

// Проверка валидности формы
const isFormValid = computed(() => {
  const checks = [];

  if (!props.disabledFields?.includes('name')) checks.push(formData.value.name);
  if (!props.disabledFields?.includes('teacher')) checks.push(formData.value.teacherId);
  if (!props.disabledFields?.includes('teamSize')) {
    checks.push(formData.value.minTeamSize);
    checks.push(formData.value.maxTeamSize);
  }
  if (!props.disabledFields?.includes('deadline')) checks.push(formData.value.registrationDeadline);

  const teamSizeValid =
    props.disabledFields?.includes('teamSize') ||
    (formData.value.maxTeamSize &&
      formData.value.minTeamSize &&
      formData.value.maxTeamSize >= formData.value.minTeamSize);

  const deadlineValid =
    props.disabledFields?.includes('deadline') ||
    (typeof formData.value.registrationDeadline === 'number' &&
      formData.value.registrationDeadline >= Date.now());

  return checks.every(Boolean) && teamSizeValid && deadlineValid;
});

const submitButtonText = computed(() => {
  return props.mode === 'create' ? 'Создать курс' : 'Сохранить изменения';
});

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitting.value = true;

    const courseData: Course = {
      id: props.mode === 'edit' && props.initialData?.id ? props.initialData.id : '',
      name: formData.value.name,
      teacherId: formData.value.teacherId ? formData.value.teacherId : '',
      minTeamSize: formData.value.minTeamSize,
      maxTeamSize: formData.value.maxTeamSize,
      isActive: formData.value.isActive,
      registrationDeadline: formData.value.registrationDeadline
        ? new Date(formData.value.registrationDeadline)
        : undefined,
    };

    emit('submit', courseData);
  } catch (error) {
    console.error('Ошибка валидации:', error);
  } finally {
    submitting.value = false;
  }
};

// Функция для преобразования Course в FormData
const mapCourseToFormData = (course: Partial<Course> | null | undefined) => {
  if (!course || Object.keys(course).length === 0) {
    return {
      name: '',
      teacherId: '',
      minTeamSize: 2,
      maxTeamSize: 5,
      registrationDeadline: null,
      isActive: true,
    };
  }

  return {
    name: course.name || '',
    teacherId: course.teacherId ? course.teacherId : null,
    minTeamSize: course.minTeamSize ?? 2,
    maxTeamSize: course.maxTeamSize ?? 5,
    registrationDeadline: course.registrationDeadline
      ? new Date(course.registrationDeadline).getTime()
      : null,
    isActive: course.isActive ?? true,
  };
};

// Загружаем преподавателей при монтировании
onMounted(() => {
  loadTeachers();
});

// Загружаем данные при изменении initialData
watch(
  () => props.initialData,
  (newData) => {
    formData.value = mapCourseToFormData(newData);
  },
  { deep: true, immediate: true },
);
</script>

<style scoped>
.form-card {
  margin-top: 24px;
}
</style>
