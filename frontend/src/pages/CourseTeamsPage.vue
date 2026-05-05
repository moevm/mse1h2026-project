<template>
  <div class="course-teams-page">
    <n-breadcrumb>
      <n-breadcrumb-item @click="router.push('/courses')">Курсы</n-breadcrumb-item>
      <n-breadcrumb-item @click="router.push(`/courses/${courseId}`)">
        {{ courseName || 'Курс' }}
      </n-breadcrumb-item>
      <n-breadcrumb-item>Команды курса</n-breadcrumb-item>
    </n-breadcrumb>

    <LoadingSpinner v-if="loading" text="Загрузка..." />

    <template v-else>
      <n-empty v-if="teams.length === 0" description="Команд пока нет" class="empty-state" />

      <n-collapse v-else class="teams-list">
        <n-collapse-item v-for="(team, index) in teams" :key="team.id" :name="team.id">
          <template #header>
            <div class="team-header">
              <span class="team-name">Команда {{ index + 1 }}</span>
              <div class="team-meta">
                <span class="team-project">{{ team.project?.title ?? 'Проект не выбран' }}</span>
                <n-tag :type="statusType(team.status)" size="small">{{
                  statusLabel(team.status)
                }}</n-tag>
                <span class="team-count">{{ team.members.length }} уч.</span>
              </div>
            </div>
          </template>

          <n-list bordered class="members-list">
            <n-list-item v-for="member in team.members" :key="member.id">
              <div class="member-row">
                <div class="member-info">
                  <span class="member-name">
                    {{ member.user.firstName }} {{ member.user.secondName }}
                  </span>
                  <n-tag v-if="member.userId === team.leaderId" size="small" type="info">
                    Лидер
                  </n-tag>
                </div>
                <span class="member-group">
                  {{ member.user.groupNumber ? `Группа ${member.user.groupNumber}` : '' }}
                </span>
              </div>
            </n-list-item>
          </n-list>
        </n-collapse-item>
      </n-collapse>
    </template>
  </div>
</template>

<script setup lang="ts">
import { coursesApi, teamsApi } from '@/api';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { Team, TeamStatus } from '@/types';
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NCollapse,
  NCollapseItem,
  NEmpty,
  NList,
  NListItem,
  NTag,
  useNotification,
} from 'naive-ui';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const notification = useNotification();

const courseId = String(route.params.courseId);
const courseName = ref('');
const teams = ref<Team[]>([]);
const loading = ref(true);

const statusLabel = (status: TeamStatus) => {
  const labels: Record<TeamStatus, string> = {
    forming: 'Формируется',
    selected: 'Проект выбран',
    assigned: 'Назначена',
    locked: 'Заблокирована',
  };
  return labels[status] ?? status;
};

const statusType = (status: TeamStatus): 'default' | 'info' | 'success' | 'warning' => {
  const types: Record<TeamStatus, 'default' | 'info' | 'success' | 'warning'> = {
    forming: 'default',
    selected: 'info',
    assigned: 'success',
    locked: 'warning',
  };
  return types[status] ?? 'default';
};

const loadData = async () => {
  loading.value = true;
  try {
    const [courseData, teamsData] = await Promise.all([
      coursesApi.getById(courseId),
      teamsApi.getCourseTeams(courseId),
    ]);
    courseName.value = courseData.name;
    teams.value = teamsData;
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    notification.error({
      title: 'Ошибка загрузки',
      content: 'Не удалось загрузить список команд',
      duration: 5000,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped>
.course-teams-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
}

.n-breadcrumb {
  margin-bottom: 24px;
}

.empty-state {
  margin-top: 48px;
}

.teams-list {
  margin-top: 24px;
}

.team-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 12px;
}

.team-name {
  font-weight: 600;
  font-size: 1rem;
}

.team-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.team-project {
  color: #555;
  font-size: 0.9rem;
}

.team-count {
  color: #888;
  font-size: 0.85rem;
}

.members-list {
  margin-top: 8px;
}

.member-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 4px 0;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-name {
  font-weight: 500;
}

.member-group {
  color: #888;
  font-size: 0.9rem;
}
</style>
