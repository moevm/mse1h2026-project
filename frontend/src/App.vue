<script setup lang="ts">
import { dateRuRU, NConfigProvider, ruRU, NGlobalStyle, NAlert} from 'naive-ui';
</script>

<template>
  <!-- Все Naive UI компоненты внутри будут на русском -->
  <n-config-provider :locale="ruRU" :date-locale="dateRuRU">
    <div class="container">
      <n-alert title="Статус" type="success" :closable="false">
        Приложение успешно запущено!
      </n-alert>
    </div>
    <router-view />
    <n-global-style />
  </n-config-provider>
</template>

<style scoped lang="scss">
.container {
  padding: 40px;
}
</style>
