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

      <!-- Семестр - числовое значение -->
      <n-form-item label="Семестр" path="semester" required>
        <n-input-number
          v-model:value="formData.semester"
          :min="1"
          :max="10"
          placeholder="Введите номер семестра"
          :disabled="disabledFields?.includes('semester')"
          style="width: 120px"
        />
      </n-form-item>

      <!-- Размер команды -->
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

      <!-- Дедлайн регистрации -->
      <n-form-item label="Дедлайн регистрации" path="registrationDeadline" required>
        <n-date-picker
          v-model:value="formData.registrationDeadline"
          type="datetime"
          placeholder="Выберите дату и время"
          :disabled="disabledFields?.includes('deadline')"
          clearable
          style="width: 100%"
          value-format="timestamp"
        />
      </n-form-item>

      <!-- Статус -->
      <n-form-item label="Статус" path="isActive">
        <n-space align="center">
          <n-switch v-model:value="formData.isActive" :disabled="disabledFields?.includes('isActive')">
            <template #checked>Активен</template>
            <template #unchecked>Не активен</template>
          </n-switch>
          <n-text depth="3">
            {{ formData.isActive ? 'Курс доступен студентам' : 'Курс скрыт от студентов' }}
          </n-text>
        </n-space>
      </n-form-item>

      <!-- Кнопки -->
      <n-form-item>
        <n-space justify="end" :size="16">
          <n-button @click="$emit('cancel')">
            Отмена
          </n-button>
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
import { ref, computed, watch } from 'vue';
import { 
  NCard, NForm, NFormItem, NInput, NInputNumber, 
  NDatePicker, NSwitch, NSpace, NText, NButton
} from 'naive-ui';

import type { FormInst, FormRules } from 'naive-ui';
import type { Course, FormData } from '@/types';

const props = withDefaults(defineProps<{
  initialData?: Partial<Course> | null;
  mode: 'create' | 'edit';
  disabledFields?: string[]; 
}>(), {
  initialData: () => ({}),
  disabledFields: () => []
});

const emit = defineEmits<{
  (e: 'submit', data: Course): void;
  (e: 'cancel'): void;
}>();

const formRef = ref<FormInst | null>(null);
const submitting = ref(false);

// Данные формы с правильными начальными значениями
const formData = ref<FormData>({
  name: '',
  semester: 5,
  minTeamSize: 2,
  maxTeamSize: 5,
  registrationDeadline: null,
  isActive: true
});

// Правила валидации
const rules: FormRules = {
  name: {
    required: true,
    message: 'Введите название курса',
    trigger: ['blur', 'input']
  },
  semester: [
    {
      required: true,
      type: 'number',
      message: 'Введите номер семестра',
      trigger: ['blur', 'change']
    }
  ],
  minTeamSize: [
    {
      required: true,
      type: 'number',
      message: 'Укажите минимальный размер команды',
      trigger: ['blur', 'change']
    },
    {
      validator: (_, value) => value >= 1,
      message: 'Минимальный размер не может быть меньше 1',
      trigger: ['blur', 'change']
    }
  ],
  maxTeamSize: [
    {
      required: true,
      type: 'number',
      message: 'Укажите максимальный размер команды',
      trigger: ['blur', 'change']
    },
    {
      validator: (_, value) => {
        return value >= formData.value.minTeamSize;
      },
      message: 'Максимальный размер не может быть меньше минимального',
      trigger: ['blur', 'change']
    },
    {
      validator: (_, value) => value <= 20,
      message: 'Максимальный размер не может быть больше 20',
      trigger: ['blur', 'change']
    }
  ],
  registrationDeadline: {
    required: true,
    type: 'number',
    message: 'Выберите дату и время дедлайна',
    trigger: ['blur', 'change']
  }
};

// Проверка валидности формы
const isFormValid = computed(() => {
  // Для заблокированных полей не проверяем заполненность
  const checks = [];
  
  if (!props.disabledFields?.includes('name')) checks.push(formData.value.name);
  if (!props.disabledFields?.includes('semester')) checks.push(formData.value.semester);
  if (!props.disabledFields?.includes('teamSize')) {
    checks.push(formData.value.minTeamSize);
    checks.push(formData.value.maxTeamSize);
  }
  if (!props.disabledFields?.includes('deadline')) checks.push(formData.value.registrationDeadline);
  
  // Дополнительная проверка на соотношение размеров
  const teamSizeValid = props.disabledFields?.includes('teamSize') || 
    (formData.value.maxTeamSize && formData.value.minTeamSize && 
     formData.value.maxTeamSize >= formData.value.minTeamSize);
  
  return checks.every(Boolean) && teamSizeValid;
});

// Текст кнопки в зависимости от режима
const submitButtonText = computed(() => {
  return props.mode === 'create' ? 'Создать курс' : 'Сохранить изменения';
});

// Отправка формы
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitting.value = true;
    emit('submit', convertFormDataToCourse(formData.value, 1));
  } catch (error) {
    console.error('Ошибка валидации:', error);
  } finally {
    submitting.value = false;
  }
};

// Функция для преобразования Course в FormData
const mapCourseToFormData = (course: Partial<Course> | null | undefined): FormData => {
  if (!course || Object.keys(course).length === 0) {
    return {
      name: '',
      semester: 6,
      minTeamSize: 2,
      maxTeamSize: 5,
      registrationDeadline: null,
      isActive: true
    };
  }

  return {
    name: course.name || '',
    semester: course.semester || 6,
    minTeamSize: course.minTeamSize ?? 2,
    maxTeamSize: course.maxTeamSize ?? 5,
    registrationDeadline: course.registrationDeadline ? new Date(course.registrationDeadline).getTime() : null,
    isActive: course.isActive ?? true
  };
};

const convertFormDataToCourse = (formData: FormData, uid: number): Course => {
  return {
    uid,
    name: formData.name,
    semester: formData.semester,
    minTeamSize: formData.minTeamSize,
    maxTeamSize: formData.maxTeamSize,
    isActive: formData.isActive,
    registrationDeadline: formData.registrationDeadline 
      ? new Date(formData.registrationDeadline) 
      : undefined
  };
};

// Загружаем данные при изменении initialData
watch(() => props.initialData, (newData) => {
  formData.value = mapCourseToFormData(newData);
}, { deep: true, immediate: true });
</script>

<style scoped>
.form-card {
  margin-top: 24px;
}
</style>