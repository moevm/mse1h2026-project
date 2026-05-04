<template>
  <n-card class="project-card" :bordered="true" @click="handleCardClick">
    <div class="card-content">
      <div class="left-section">
        <div v-if="userStore.isAdmin" class="project-id">#{{ project.id }}</div>
        <div class="project-title">{{ project.title }}</div>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import type { Project } from '@/types';
import { NCard } from 'naive-ui';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const userStore = useUserStore()

const props = defineProps<{
  project: Project;
}>();

const handleCardClick = () => {
  const courseId = props.project.courseId;
  const projectId = props.project.id;
  router.push(`/courses/${courseId}/projects/${projectId}`);
};
</script>

<style scoped>
.project-card {
  width: 100%;
  margin: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: var(--secondary-color);
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 20px;
}

.left-section {
  display: flex;
  align-items: baseline;
  gap: 16px;
  flex: 1;
  flex-wrap: wrap;
}

.project-id {
  font-family: monospace;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.project-title {
  font-size: 16px;
  font-weight: 500;
  word-break: break-word;
}

.right-section {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
}
</style>
