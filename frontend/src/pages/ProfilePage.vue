<template>
  <div class="profile-page">
    <LoadingSpinner v-if="loading" text="Загрузка профиля..." />

    <n-card v-else-if="profileData" class="profile-card">
      <template #header>
        <div class="card-header">
          <h1 class="profile-title">Профиль</h1>
          <n-tag :type="profileData.role === 'admin' ? 'warning' : 'info'">
            {{ profileData.role === 'admin' ? 'Администратор' : 'Студент' }}
          </n-tag>
        </div>
      </template>

      <n-descriptions label-placement="left" bordered :column="1" class="profile-info">
        <n-descriptions-item label="Фамилия">
          {{ profileData.lastName }}
        </n-descriptions-item>
        <n-descriptions-item label="Имя">
          {{ profileData.firstName }}
        </n-descriptions-item>
        <n-descriptions-item label="Email">
          {{ profileData.email }}
        </n-descriptions-item>
        <n-descriptions-item v-if="profileData.role === 'student'" label="Группа">
          {{ profileData.groupNumber }}
        </n-descriptions-item>
      </n-descriptions>

      <template #footer>
        <n-space justify="end">
          <n-button @click="router.back()">Назад</n-button>
        </n-space>
      </template>
    </n-card>

    <n-result
      v-else
      status="error"
      title="Не удалось загрузить профиль"
      description="Попробуйте обновить страницу"
    />
  </div>
</template>

<script setup lang="ts">
import { usersApi } from '@/api';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useUserStore } from '@/stores/userStore';
import type { User } from '@/types';
import { NButton, NCard, NDescriptions, NDescriptionsItem, NResult, NSpace, NTag } from 'naive-ui';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const loading = ref(true);
const profileData = ref<User | null>(null);

onMounted(async () => {
  try {
    const userId = (userStore.user as unknown as { id: string })?.id;
    if (!userId) return;
    profileData.value = await usersApi.getById(userId);
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
}

.profile-card {
  margin-block: 24px;
  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.profile-title {
  font-size: 1.8rem;
  font-weight: 600;
}

.profile-info {
  margin-top: 24px;
}
</style>
