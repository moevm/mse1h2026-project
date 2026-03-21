<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { NConfigProvider, NGlobalStyle, NNotificationProvider, dateRuRU, ruRU } from 'naive-ui';
import { onMounted } from 'vue';

const userStore = useUserStore();

onMounted(() => {
  userStore.loadRole();
});
</script>

<template>
  <!-- Все Naive UI компоненты внутри будут на русском -->
  <n-config-provider :locale="ruRU" :date-locale="dateRuRU">
    <!-- Провайдер уведомлений -->
    <n-notification-provider>
      <router-view />
      <n-global-style />
    </n-notification-provider>
  </n-config-provider>
</template>

<style lang="scss"></style>
