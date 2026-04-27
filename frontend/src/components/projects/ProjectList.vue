<template>
  <div class="projects-container">
    <div class="projects-list_header">
      <h2 class="projects-list_title">Список проектов</h2>
      <n-button
        v-if="userStore.isAdmin && currentCourseId"
        class="primary-btn"
        @click="$emit('project-add')"
      >
        <template #icon>
          <n-icon>
            <AddRound />
          </n-icon>
        </template>
        Добавить проект
      </n-button>
    </div>

    <LoadingSpinner v-if="loading" text="Загрузка проектов..." />

    <div v-else-if="!projects.length" class="center-wrapper">
      <n-empty :description="emptyStateMessage" class="empty">
        <template #icon>
          <n-icon>
            <SentimentDissatisfiedRound />
          </n-icon>
        </template>
      </n-empty>
    </div>

    <!-- Список проектов -->
    <div v-else class="projects-list">
      <ProjectCard
        v-for="project in projects"
        :key="project.uid"
        :project="project"
        @delete="$emit('project-delete', project)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useUserStore } from '@/stores/userStore';
import type { Project } from '@/types';
import { AddRound, SentimentDissatisfiedRound } from '@vicons/material';
import { NButton, NEmpty, NIcon } from 'naive-ui';
import { computed } from 'vue';

import ProjectCard from './ProjectCard.vue';

const userStore = useUserStore();

const props = defineProps<{
  projects: Project[];
  loading: boolean;
  currentCourseId?: string | number;
}>();

defineEmits<{
  (e: 'project-delete', project: Project): void;
  (e: 'project-add'): void;
}>();

const emptyStateMessage = computed(() => {
  if (userStore.isAdmin) {
    return props.currentCourseId
      ? 'Нет доступных проектов для управления в этом курсе'
      : 'Выберите курс, чтобы управлять проектами';
  } else {
    return 'Нет доступных активных проектов';
  }
});
</script>

<style scoped>
.projects-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  font-size: 1.5rem;
}

.projects-list_header {
  grid-row: 1;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.projects-list_title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
}

.center-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  width: 100%;
}

.empty {
  --n-font-size: 1.2rem !important;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>
