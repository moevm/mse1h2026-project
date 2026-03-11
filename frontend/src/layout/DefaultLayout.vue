<template>
  <div class="layout">
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
</script>
