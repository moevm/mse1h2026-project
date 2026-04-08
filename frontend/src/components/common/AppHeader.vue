<template>
  <header class="app-header">
    <nav v-if="userStore.isAuthenticated" class="nav-menu">
      <router-link to="/" class="nav-link">Список курсов</router-link>
    </nav>

    <div v-if="userStore.isAuthenticated" class="user-menu">
      <router-link to="/notifications" class="icon-link">
        <n-icon size="42" color="white" class="hover-scale">
          <NotificationsFilled />
        </n-icon>
      </router-link>
      <n-dropdown
        trigger="click"
        :options="menuOptions"
        @select="handleMenuSelect"
        placement="bottom-end"
      >
        <n-icon size="42" color="white" class="hover-scale">
          <AccountCircleOutlined />
        </n-icon>
      </n-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { AccountCircleOutlined, NotificationsFilled } from '@vicons/material';
import { NDropdown, NIcon } from 'naive-ui';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const menuOptions = [
  {
    label: 'Профиль',
    key: 'profile',
  },
  // ToDo: исправить пуль к командам и проектам когда они будут
  {
    label: 'Мои команды и проекты',
    key: 'path',
  },
  {
    label: 'Выйти',
    key: 'logout',
  },
];

const handleMenuSelect = (key: string) => {
  if (key === 'logout') {
    userStore.logout();
  } else {
    router.push(`/${key}`);
  }
};
</script>

<style lang="css">
.app-header {
  background-color: #1b1c58;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 60px;
  width: 100%;
  min-height: 102px;
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
