<script setup lang="ts">
import { dateRuRU, NConfigProvider, ruRU, NGlobalStyle } from 'naive-ui';
import CoursesList from './components/CoursesList.vue';
</script>

<template>
  <!-- Все Naive UI компоненты внутри будут на русском -->
  <n-config-provider :locale="ruRU" :date-locale="dateRuRU">
    <CoursesList />
    <router-view />
    <n-global-style />
  </n-config-provider>
</template>

<style scoped lang="scss"></style>
