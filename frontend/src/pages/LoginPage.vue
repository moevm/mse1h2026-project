<template>
  <div class="login-page">
    <n-card class="login-card">
      <template #header>
        <div class="login-header">
          <h1 class="login-title">Вход</h1>
        </div>
      </template>

      <LoginForm />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { NCard } from 'naive-ui';
import LoginForm from '@/components/auth/LoginForm.vue';
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-block-start: 20vh;
}

.login-card {
  max-width: 450px;
  width: 100%;
  border-radius: 15px;
  box-shadow: var(--shadow);
}

.login-header {
  text-align: center;
}

.login-title {
  font-size: 2rem;
  color: #000;
}
</style>