<template>
  <div class="my-team-page">
    <n-breadcrumb>
      <n-breadcrumb-item @click="router.push('/courses')">Курсы</n-breadcrumb-item>
      <n-breadcrumb-item @click="router.push(`/courses/${courseId}`)">
        {{ courseName || 'Курс' }}
      </n-breadcrumb-item>
      <n-breadcrumb-item>Моя команда</n-breadcrumb-item>
    </n-breadcrumb>

    <LoadingSpinner v-if="loading" text="Загрузка..." />

    <template v-else>
      <div v-if="team">
        <n-card class="team-card">
          <template #header>
            <div class="card-header">
              <h2 class="team-title">Моя команда</h2>
              <n-tag :type="statusType">{{ statusLabel }}</n-tag>
            </div>
          </template>

          <div v-if="team.project" class="section">
            <h3 class="section-title">Выбранный проект</h3>
            <n-descriptions bordered :column="1">
              <n-descriptions-item label="Название">{{ team.project.title }}</n-descriptions-item>
              <n-descriptions-item v-if="team.project.description" label="Описание">
                {{ team.project.description }}
              </n-descriptions-item>
            </n-descriptions>
          </div>

          <n-empty v-else description="Проект не назначен" class="empty-project" />

          <div class="section">
            <h3 class="section-title">Участники команды ({{ team.members.length }})</h3>
            <n-list bordered>
              <n-list-item v-for="member in team.members" :key="member.id">
                <div class="member-row">
                  <div class="member-info">
                    <span class="member-name">
                      {{ member.user.firstName }} {{ member.user.lastName }}
                    </span>
                    <n-tag v-if="member.userId === team.leaderId" size="small" type="info">
                      Лидер
                    </n-tag>
                  </div>
                  <span class="member-group">Группа {{ member.user.groupNumber }}</span>
                </div>
              </n-list-item>
            </n-list>
          </div>

          <div v-if="isLeader && pendingInvitations.length > 0" class="section">
            <h3 class="section-title">Активные приглашения ({{ pendingInvitations.length }})</h3>
            <n-list bordered>
              <n-list-item v-for="inv in pendingInvitations" :key="inv.id">
                <div class="member-row">
                  <span class="member-name">{{ inv.inviteeName }}</span>
                  <n-button size="small" type="error" @click="handleCancelInvitation(inv.id)">
                    Отменить
                  </n-button>
                </div>
              </n-list-item>
            </n-list>
          </div>

          <template #footer>
            <n-space justify="end">
              <n-button
                v-if="isLeader && canSelectProject"
                type="success"
                @click="openProjectModal"
              >
                Выбрать проект
              </n-button>
              <n-button 
                v-if="isLeader && team?.projectId" 
                type="warning" 
                @click="handleUnselectProject"
              >
                Отменить выбор проекта
              </n-button>
              <n-button v-if="isLeader" type="primary" @click="openInviteModal">
                Пригласить студента
              </n-button>
              <n-button v-if="!isLeader" type="error" @click="showLeaveDialog = true">
                Покинуть команду
              </n-button>
            </n-space>
          </template>
        </n-card>
      </div>

      <div v-else>
        <n-card class="no-team-card">
          <n-empty description="Вы ещё не состоите в команде">
            <template #extra>
              <n-button type="primary" @click="handleCreateTeam">Создать команду</n-button>
            </template>
          </n-empty>
        </n-card>

        <n-card v-if="invitations.length > 0" class="invitations-card">
          <template #header>Входящие приглашения</template>
          <n-list bordered>
            <n-list-item v-for="inv in invitations" :key="inv.id">
              <div class="invitation-row">
                <div class="invitation-info">
                  <span class="invitation-course">{{ inv.team.course.name }}</span>
                  <span class="invitation-from">
                    Приглашение от: {{ inv.team.leader?.firstName }}
                    {{ inv.team.leader?.lastName }}
                  </span>
                </div>
                <n-space>
                  <n-button size="small" type="success" @click="handleAcceptInvitation(inv.id)">
                    Принять
                  </n-button>
                  <n-button size="small" type="error" @click="handleDeclineInvitation(inv.id)">
                    Отклонить
                  </n-button>
                </n-space>
              </div>
            </n-list-item>
          </n-list>
        </n-card>
      </div>
    </template>

    <div v-if="showInviteModal" class="dialog-overlay" @click="closeInviteModal">
      <div class="dialog" @click.stop>
        <h3>Пригласить студента</h3>
        <n-select
          v-model:value="selectedStudentId"
          :options="studentOptions"
          filterable
          placeholder="Начните вводить имя..."
          class="invite-select"
        />
        <div class="dialog-actions">
          <n-button @click="closeInviteModal">Отмена</n-button>
          <n-button type="primary" :disabled="!selectedStudentId" @click="handleInvite">
            Пригласить
          </n-button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :show="showLeaveDialog"
      title="Покинуть команду"
      message="Вы уверены, что хотите покинуть команду?"
      confirm-text="Покинуть"
      @confirm="handleLeaveTeam"
      @cancel="showLeaveDialog = false"
    />
    <div v-if="showProjectModal" class="dialog-overlay" @click="closeProjectModal">
      <div class="dialog dialog-project" @click.stop>
        <h3>Выбрать проект</h3>
        <n-select
          v-model:value="selectedProjectId"
          :options="projectOptions"
          filterable
          placeholder="Выберите проект..."
          class="invite-select"
          :loading="loadingProjects"
        />
        <div class="dialog-actions">
          <n-button @click="closeProjectModal">Отмена</n-button>
          <n-button type="primary" :disabled="!selectedProjectId" @click="handleSelectProject">
            Выбрать
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { assignmentsApi, coursesApi, invitationsApi, projectsApi, teamsApi, usersApi } from '@/api';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useUserStore } from '@/stores/userStore';
import type { Project, Team, TeamInvitation, User } from '@/types';
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NEmpty,
  NList,
  NListItem,
  NSelect,
  NSpace,
  NTag,
  useNotification,
} from 'naive-ui';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const notification = useNotification();

const courseId = String(route.params.courseId);
const courseName = ref('');
const courseMinTeamSize = ref<number | null>(null);
const team = ref<Team | null>(null);
const invitations = ref<TeamInvitation[]>([]);
const loading = ref(true);
const showInviteModal = ref(false);
const showLeaveDialog = ref(false);
const selectedStudentId = ref<string | null>(null);
const allStudents = ref<User[]>([]);
const showProjectModal = ref(false);
const selectedProjectId = ref<string | null>(null);
const availableProjects = ref<Project[]>([]);
const loadingProjects = ref(false);

const myUserId = computed(() => (userStore.user as unknown as { id: string })?.id ?? '');
const isLeader = computed(() => !!team.value && team.value.leaderId === myUserId.value);

const statusLabel = computed(() => {
  const labels: Record<string, string> = {
    forming: 'Формируется',
    selected: 'Проект выбран',
    assigned: 'Назначена',
    locked: 'Заблокирована',
  };
  return labels[team.value?.status ?? ''] ?? team.value?.status ?? '';
});

const statusType = computed(() => {
  const types: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
    forming: 'default',
    selected: 'info',
    assigned: 'success',
    locked: 'warning',
  };
  return types[team.value?.status ?? ''] ?? 'default';
});

const studentOptions = computed(() => {
  const memberIds = new Set(team.value?.members.map((m) => m.userId) ?? []);
  const pendingInviteeIds = new Set(team.value?.invitations?.map((inv) => inv.inviteeId) ?? []);
  return allStudents.value
    .filter((s) => !memberIds.has(s.id) && !pendingInviteeIds.has(s.id))
    .map((s) => ({
      label: `${s.firstName} ${(s as unknown as { lastName: string }).lastName ?? ''}`,
      value: s.id,
    }));
});

const studentMap = computed(() => {
  const map = new Map<string, string>();
  for (const s of allStudents.value) {
    map.set(s.id, `${s.firstName} ${(s as unknown as { lastName: string }).lastName ?? ''}`);
  }
  return map;
});

const pendingInvitations = computed(() =>
  (team.value?.invitations ?? []).map((inv) => ({
    id: inv.id,
    inviteeName: studentMap.value.get(inv.inviteeId) ?? inv.inviteeId,
  })),
);

const canSelectProject = computed(() => {
  if (!team.value || courseMinTeamSize.value === null) return false;
  if (team.value.projectId || team.value.project) return false;
  return team.value.members.length >= courseMinTeamSize.value;
});

const projectOptions = computed(() => {
  return availableProjects.value.map((p) => ({
    label: p.title,
    value: p.id,
  }));
});

const loadData = async () => {
  loading.value = true;
  try {
    const [courseData, teamData, invData] = await Promise.all([
      coursesApi.getById(courseId),
      teamsApi.getMyTeam(courseId),
      invitationsApi.getMyInvitations(),
    ]);
    courseMinTeamSize.value = courseData.minTeamSize;
    courseName.value = courseData.name;
    team.value = teamData;
    invitations.value = invData.filter((inv) => inv.team.courseId === courseId);
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    notification.error({
      title: 'Ошибка загрузки',
      content: 'Не удалось загрузить данные команды',
      duration: 5000,
    });
  } finally {
    loading.value = false;
  }
};

const loadStudents = async () => {
  try {
    allStudents.value = await usersApi.getUsers('student');
  } catch (error) {
    console.error('Ошибка загрузки студентов:', error);
  }
};

const openInviteModal = () => {
  selectedStudentId.value = null;
  showInviteModal.value = true;
};

const closeInviteModal = () => {
  showInviteModal.value = false;
  selectedStudentId.value = null;
};

const handleCreateTeam = async () => {
  try {
    await teamsApi.createTeam({ courseId });
    notification.success({
      title: 'Команда создана',
      content: 'Вы успешно создали команду',
      duration: 3000,
    });
    await loadData();
  } catch (error) {
    console.error('Ошибка создания команды:', error);
    notification.error({
      title: 'Ошибка',
      content: error instanceof Error ? error.message : 'Не удалось создать команду',
      duration: 5000,
    });
  }
};

const handleInvite = async () => {
  if (!team.value || !selectedStudentId.value) return;
  try {
    await teamsApi.createInvitation(team.value.id, selectedStudentId.value);
    notification.success({
      title: 'Приглашение отправлено',
      content: 'Студент получит приглашение в команду',
      duration: 3000,
    });
    closeInviteModal();
    await loadData();
  } catch (error) {
    console.error('Ошибка отправки приглашения:', error);
    notification.error({
      title: 'Ошибка',
      content: error instanceof Error ? error.message : 'Не удалось отправить приглашение',
      duration: 5000,
    });
  }
};

const handleAcceptInvitation = async (invitationId: string) => {
  try {
    await invitationsApi.updateInvitation(invitationId, 'accepted');
    notification.success({
      title: 'Приглашение принято',
      content: 'Вы вступили в команду',
      duration: 3000,
    });
    await loadData();
  } catch (error) {
    console.error('Ошибка принятия приглашения:', error);
    notification.error({
      title: 'Ошибка',
      content: error instanceof Error ? error.message : 'Не удалось принять приглашение',
      duration: 5000,
    });
  }
};

const handleDeclineInvitation = async (invitationId: string) => {
  try {
    await invitationsApi.updateInvitation(invitationId, 'declined');
    invitations.value = invitations.value.filter((inv) => inv.id !== invitationId);
    notification.success({ title: 'Приглашение отклонено', duration: 3000 });
  } catch (error) {
    console.error('Ошибка отклонения приглашения:', error);
    notification.error({
      title: 'Ошибка',
      content: error instanceof Error ? error.message : 'Не удалось отклонить приглашение',
      duration: 5000,
    });
  }
};

const handleCancelInvitation = async (invitationId: string) => {
  try {
    await invitationsApi.updateInvitation(invitationId, 'cancelled');
    if (team.value?.invitations) {
      team.value.invitations = team.value.invitations.filter((inv) => inv.id !== invitationId);
    }
    notification.success({ title: 'Приглашение отменено', duration: 3000 });
  } catch (error) {
    console.error('Ошибка отмены приглашения:', error);
    notification.error({
      title: 'Ошибка',
      content: error instanceof Error ? error.message : 'Не удалось отменить приглашение',
      duration: 5000,
    });
  }
};

const handleLeaveTeam = async () => {
  if (!team.value || !myUserId.value) return;
  try {
    await teamsApi.leaveTeam(team.value.id, myUserId.value);
    team.value = null;
    notification.success({ title: 'Вы покинули команду', duration: 3000 });
    await loadData();
  } catch (error) {
    console.error('Ошибка выхода из команды:', error);
    notification.error({
      title: 'Ошибка',
      content: error instanceof Error ? error.message : 'Не удалось покинуть команду',
      duration: 5000,
    });
  } finally {
    showLeaveDialog.value = false;
  }
};

const openProjectModal = async () => {
  selectedProjectId.value = null;
  loadingProjects.value = true;
  showProjectModal.value = true;

  try {
    availableProjects.value = await projectsApi.getFreeByCourseId(courseId);
  } catch (error) {
    console.error('Ошибка загрузки проектов:', error);
    notification.error({
      title: 'Ошибка',
      content: 'Не удалось загрузить список проектов',
      duration: 5000,
    });
    showProjectModal.value = false;
  } finally {
    loadingProjects.value = false;
  }
};

const closeProjectModal = () => {
  showProjectModal.value = false;
  selectedProjectId.value = null;
  availableProjects.value = [];
};

const handleSelectProject = async () => {
  if (!team.value || !selectedProjectId.value) return;

  try {
    await assignmentsApi.assignTeamManually({
      courseId: courseId,
      projectId: selectedProjectId.value,
      teamId: team.value.id,
      status: 'active',
    });
    notification.success({
      title: 'Проект выбран',
      content: 'Проект успешно назначен команде',
      duration: 3000,
    });
    closeProjectModal();
    await loadData();
  } catch (error) {
    console.error('Ошибка выбора проекта:', error);
    notification.error({
      title: 'Ошибка',
      content: error instanceof Error ? error.message : 'Не удалось выбрать проект',
      duration: 5000,
    });
  }
};

const handleUnselectProject = async () => {
  const activeAssignment = team.value?.assignments?.find(a => a.status === 'active');
  
  if (!activeAssignment?.id) {
    notification.error({ title: 'Ошибка', content: 'Активный проект не выбран' });
    return;
  }
  
  try {
    await assignmentsApi.delete(activeAssignment.id);
    notification.success({
      title: 'Проект отменён',
      content: 'Выбранный проект успешно отвязан от команды',
      duration: 3000,
    });
    await loadData();
  } catch (error) {
    console.error('Ошибка отмены проекта:', error);
    notification.error({
      title: 'Ошибка',
      content: error instanceof Error ? error.message : 'Не удалось отменить проект',
      duration: 5000,
    });
  }
};

onMounted(async () => {
  await Promise.all([loadData(), loadStudents()]);
});
</script>

<style scoped>
.my-team-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
}

.n-breadcrumb {
  margin-bottom: 24px;
}

.team-card,
.no-team-card,
.invitations-card {
  margin-top: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.team-title {
  font-size: 1.5rem;
  font-weight: 600;
}

.section {
  margin-top: 24px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.empty-project {
  margin-top: 24px;
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

.invitation-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 4px 0;
}

.invitation-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.invitation-course {
  font-weight: 500;
}

.invitation-from {
  font-size: 0.85rem;
  color: #888;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  padding: 24px;
  border-radius: 15px;
  min-width: 400px;
  font-size: 1rem;
}

.invite-select {
  margin-top: 16px;
  width: 100%;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
