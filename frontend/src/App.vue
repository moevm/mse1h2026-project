<script setup lang="ts">
import { dateRuRU, NConfigProvider, ruRU, NGlobalStyle, NCard, NSpace, NText, NAlert, NThing} from 'naive-ui';
</script>

<template>
  <div class="container">
    <n-alert title="Статус" type="success" :closable="false">
      Приложение успешно запущено!
    </n-alert>
  </div>
</template>

<style scoped lang="css">
.container {
  padding: 40px;
}
</style>
