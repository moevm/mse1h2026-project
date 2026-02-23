<script setup lang="ts">
import { dateRuRU, NConfigProvider, ruRU, NGlobalStyle } from 'naive-ui';
</script>

<template>
  <n-config-provider :locale="ruRU" :date-locale="dateRuRU">
    <router-view />
    <n-global-style />
  </n-config-provider>
</template>

<style scoped lang="scss"></style>
