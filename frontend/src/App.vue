<script setup lang="ts">
import {
  type GlobalThemeOverrides,
  NConfigProvider,
  NDialogProvider,
  NGlobalStyle,
  NNotificationProvider,
  dateRuRU,
  ruRU,
} from 'naive-ui';

/**
 * Переопределение цветовой схемы для Naive UI.
 */
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#023370',
    primaryColorHover: '#01428e',
    primaryColorPressed: '#01428e',
    primaryColorSuppl: '#01428e',
  },
};
</script>

<template>
  <!-- Все Naive UI компоненты внутри будут на русском -->
  <n-config-provider :locale="ruRU" :date-locale="dateRuRU" :theme-overrides="themeOverrides">
    <!-- Провайдер уведомлений -->
    <n-notification-provider>
      <n-dialog-provider>
        <router-view />
        <n-global-style />
      </n-dialog-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<style lang="scss"></style>
