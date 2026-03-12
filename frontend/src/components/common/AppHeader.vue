<template>
  <header class="app-header">
    <nav class="nav-menu">
      <router-link to="/" class="nav-link">Список курсов</router-link>
    </nav>

    <div class="user-menu">
      <router-link to="/notifications" class="icon-link">
        <n-icon size="42" color="white" class="hover-scale">
          <NotificationsFilled />
        </n-icon>
      </router-link>
      <router-link to="/profile" class="icon-link">
        <n-icon size="42" color="white" class="hover-scale">
          <AccountCircleOutlined />
        </n-icon>
      </router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { NotificationsFilled, AccountCircleOutlined } from '@vicons/material';
import { NIcon } from 'naive-ui';
</script>

<style lang="css">
.app-header {
  background-color: #1b1c58;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 60px;
  width: 100%;
}

.nav-link {
  color: #fff;
  font-size: 1rem;
  transition: transform 0.3s ease; /* Добавили плавность для ссылки */
  display: inline-block;
  text-decoration: none;
  border-block-end: 1px solid #fff;
}

.nav-link:hover {
  transform: scale(1.05);
}

/* Убираем нижнее подчеркивание для ссылки текущего раздела*/
.router-link-exact-active {
  border: none;
}

.user-menu {
  display: flex;
  gap: 20px;
}

.hover-scale {
  transition: transform 0.3s ease;
  display: block;
}

.hover-scale:hover {
  transform: scale(1.2); /* Увеличиваем масштаб */
}
</style>
