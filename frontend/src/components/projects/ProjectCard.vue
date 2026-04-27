<template>
  <n-card class="project-card" :bordered="true" @click="handleCardClick">
    <div class="card-content">
      <div class="left-section">
        <div class="project-id">#{{ project.uid }}</div>
        <div class="project-title">{{ project.title }}</div>
      </div>

      <div class="right-section">
        <n-button
          v-if="userStore.isAdmin"
          type="error"
          size="small"
          :loading="deleting"
          @click.stop="handleDelete"
        >
          <template #icon>
            <n-icon>
              <DeleteRound />
            </n-icon>
          </template>
          Удалить
        </n-button>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import type { Project } from '@/types';
import { DeleteRound } from '@vicons/material';
import { NButton, NCard, NIcon } from 'naive-ui';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const props = defineProps<{
  project: Project;
}>();

const deleting = ref(false);

const emit = defineEmits<{
  (e: 'delete', project: Project): void;
}>();

const handleCardClick = () => {
  const courseId = props.project.courseId;
  const projectId = props.project.uid;
  router.push(`/course/${courseId}/projects/${projectId}`);
};

const handleDelete = () => {
  deleting.value = true;
  emit('delete', props.project);
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
