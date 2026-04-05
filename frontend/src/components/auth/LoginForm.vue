<template>
  <n-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-placement="top"
    size="large"
  >
    
    <n-form-item label="Email" path="email" required>
      <n-input
        v-model:value="formData.email"
        placeholder="example@mail.ru"
        size="large"
        clearable
      />
    </n-form-item>

    
    <n-form-item label="Пароль" path="password" required>
      <n-input
        v-model:value="formData.password"
        type="password"
        placeholder="Введите пароль"
        size="large"
        show-password-on="click"
        clearable
      />
    </n-form-item>


    <n-form-item>
      <n-button
        type="primary"
        size="large"
        block
        :disabled="!isFormValid || loading"
        @click="handleSubmit"
      >
        Войти
      </n-button>
    </n-form-item>
  </n-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  useNotification,
  type FormInst,
  type FormRules
} from 'naive-ui';
import { useUserStore } from '@/stores/userStore';
const userStore = useUserStore();

const router = useRouter();
const notification = useNotification();

const formRef = ref<FormInst | null>(null);
const loading = ref(false);


const formData = reactive({
  email: '',
  password: ''
});

const isFormValid = computed(() => {
  return formData.email.trim() !== '' && formData.password.trim() !== '';
});

// Правила валидации
const rules: FormRules = {
  email: [
    {
      required: true,
      message: 'Введите email',
      trigger: ['blur', 'input']
    },
    {
      type: 'email',
      message: 'Введите корректный email',
      trigger: ['blur']
    }
  ],
  password: [
    {
      required: true,
      message: 'Введите пароль',
      trigger: ['blur', 'input']
    },
    {
      min: 4,
      message: 'Пароль должен содержать минимум 4 символа',
      trigger: ['blur']
    }
  ]
};

// Отправка формы
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    loading.value = true;

    await userStore.login(formData.email, formData.password);

    notification.success({
      title: 'Успешно',
      content: 'Вы успешно вошли в систему',
      duration: 3000
    });

    router.push('/courses');
  } catch (error) {
    console.error('Ошибка входа:', error);
    notification.error({
      title: 'Ошибка',
      content: 'Неверный email или пароль',
      duration: 5000
    });
  } finally {
    loading.value = false;
  }
};
</script>
