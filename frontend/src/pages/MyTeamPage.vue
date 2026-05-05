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
  </div>
</template>

<script setup lang="ts">
import { coursesApi, invitationsApi, teamsApi, usersApi } from '@/api';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useUserStore } from '@/stores/userStore';
import type { Team, TeamInvitation, User } from '@/types';
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
const team = ref<Team | null>(null);
const invitations = ref<TeamInvitation[]>([]);
const loading = ref(true);
const showInviteModal = ref(false);
const showLeaveDialog = ref(false);
const selectedStudentId = ref<string | null>(null);
const allStudents = ref<User[]>([]);

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

const loadData = async () => {
  loading.value = true;
  try {
    const [courseData, teamData, invData] = await Promise.all([
      coursesApi.getById(courseId),
      teamsApi.getMyTeam(courseId),
      invitationsApi.getMyInvitations(),
    ]);
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
    allStudents.value = await usersApi.getUsers({ role: 'student' });
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
    await teamsApi.createTeam(courseId);
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
