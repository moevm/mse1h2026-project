<script setup lang="ts">
import { dateRuRU, NConfigProvider, NNotificationProvider, ruRU, NGlobalStyle } from 'naive-ui';
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
