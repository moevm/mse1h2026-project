<template>
  <div class="course-assignments-page">
    <n-breadcrumb>
      <n-breadcrumb-item @click="router.push('/courses')">Курсы</n-breadcrumb-item>
      <n-breadcrumb-item @click="router.push(`/courses/${courseId}`)">
        {{ courseName || 'Курс' }}
      </n-breadcrumb-item>
      <n-breadcrumb-item>Распределение проектов</n-breadcrumb-item>
    </n-breadcrumb>

    <LoadingSpinner v-if="loading" text="Загрузка..." />

    <template v-else>
      <n-card v-if="userStore.isAdmin" class="section-card">
        <template #header>
          <div class="card-header">
            <h2 class="section-title">Нераспределённые ресурсы</h2>
            <n-button type="primary" :loading="autoAssigning" @click="handleAutoAssign">
              <template #icon>
                <n-icon><AutorenewRound /></n-icon>
              </template>
              Запустить автоматическое распределение
            </n-button>
          </div>
        </template>

        <div class="two-columns">
          <div class="column">
            <div class="column-header">
              <span class="column-title">Команды без проекта</span>
              <n-badge
                :value="unassignedTeams.length"
                :type="unassignedTeams.length > 0 ? 'warning' : 'success'"
              />
            </div>

            <n-empty
              v-if="unassignedTeams.length === 0"
              description="Все команды имеют проекты"
              class="small-empty"
            />

            <n-collapse v-else>
              <n-collapse-item v-for="team in unassignedTeams" :key="team.id" :name="team.id">
                <template #header>
                  <div class="team-collapse-header">
                    <span class="team-name">{{ teamLabel(team) }}</span>
                    <n-tag :type="statusType(team.status)" size="small">
                      {{ statusLabel(team.status) }}
                    </n-tag>
                    <span class="team-count">{{ team.members.length }} уч.</span>
                  </div>
                </template>

                <n-list bordered size="small" class="members-list">
                  <n-list-item v-for="member in team.members" :key="member.id">
                    <div class="member-row">
                      <span>{{ member.user.firstName }} {{ member.user.lastName }}</span>
                      <n-tag v-if="member.userId === team.leaderId" size="small" type="info">
                        Лидер
                      </n-tag>
                    </div>
                  </n-list-item>
                </n-list>

                <div class="assign-row">
                  <n-select
                    v-model:value="selectedProjectIds[team.id]"
                    :options="availableProjectOptions"
                    filterable
                    placeholder="Выберите проект..."
                    class="assign-select"
                  />
                  <n-button
                    type="primary"
                    size="small"
                    :disabled="!selectedProjectIds[team.id]"
                    :loading="assigningTeamId === team.id"
                    @click="handleManualAssign(team.id)"
                  >
                    Назначить
                  </n-button>
                </div>
              </n-collapse-item>
            </n-collapse>
          </div>

          <div class="column">
            <div class="column-header">
              <span class="column-title">Студенты без команды</span>
              <n-badge
                :value="studentsWithoutTeam.length"
                :type="studentsWithoutTeam.length > 0 ? 'warning' : 'success'"
              />
            </div>

            <n-empty
              v-if="studentsWithoutTeam.length === 0"
              description="Все студенты состоят в командах"
              class="small-empty"
            />

            <n-list v-else bordered class="students-list">
              <n-list-item v-for="student in studentsWithoutTeam" :key="student.id">
                <div class="student-item">
                  <div class="member-row">
                    <span>{{ student.firstName }} {{ student.lastName }}</span>
                    <span v-if="student.groupNumber" class="member-group">
                      Группа {{ student.groupNumber }}
                    </span>
                  </div>
                  <div class="assign-row">
                    <n-select
                      v-model:value="selectedTeamIds[student.id]"
                      :options="teamOptions"
                      filterable
                      placeholder="Выберите команду..."
                      class="assign-select"
                    />
                    <n-button
                      type="primary"
                      size="small"
                      :disabled="!selectedTeamIds[student.id]"
                      :loading="addingStudentId === student.id"
                      @click="handleAddMember(student.id)"
                    >
                      Добавить
                    </n-button>
                  </div>
                </div>
              </n-list-item>
            </n-list>
          </div>
        </div>
      </n-card>

      <n-card class="section-card">
        <template #header>
          <h2 class="section-title">Текущие назначения</h2>
        </template>

        <n-empty
          v-if="assignedTeams.length === 0"
          description="Назначений пока нет"
          class="small-empty"
        />

        <n-table v-else :bordered="true" :single-line="false" class="assignments-table">
          <thead>
            <tr>
              <th>Команда</th>
              <th>Участники</th>
              <th>Проект</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in assignedTeams" :key="team.id">
              <td>
                <div class="team-cell">
                  <span class="team-name">{{ teamLabel(team) }}</span>
                  <n-tag :type="statusType(team.status)" size="small">
                    {{ statusLabel(team.status) }}
                  </n-tag>
                </div>
              </td>
              <td>
                <div class="members-cell">
                  <div v-for="member in team.members" :key="member.id" class="member-line">
                    <span>{{ member.user.firstName }} {{ member.user.lastName }}</span>
                    <n-tag v-if="member.userId === team.leaderId" size="small" type="info">
                      Лидер
                    </n-tag>
                  </div>
                </div>
              </td>
              <td class="project-cell">{{ team.project?.title || '—' }}</td>
            </tr>
          </tbody>
        </n-table>
      </n-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { assignmentsApi, coursesApi, projectsApi, teamsApi, usersApi } from '@/api';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useUserStore } from '@/stores/userStore';
import type { Project, Team, TeamStatus, User } from '@/types';
import { AutorenewRound } from '@vicons/material';
import {
  NBadge,
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NEmpty,
  NIcon,
  NList,
  NListItem,
  NSelect,
  NTable,
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
const teams = ref<Team[]>([]);
const projects = ref<Project[]>([]);
const allStudents = ref<User[]>([]);
const loading = ref(true);
const autoAssigning = ref(false);
const selectedProjectIds = ref<Record<string, string | null>>({});
const assigningTeamId = ref<string | null>(null);
const selectedTeamIds = ref<Record<string, string | null>>({});
const addingStudentId = ref<string | null>(null);

const unassignedTeams = computed(() => teams.value.filter((t) => !t.projectId));
const assignedTeams = computed(() => teams.value.filter((t) => !!t.projectId));

const studentsWithoutTeam = computed(() => {
  const memberIds = new Set(teams.value.flatMap((t) => t.members.map((m) => m.userId)));
  return allStudents.value.filter((s) => !memberIds.has(s.id));
});

const availableProjectOptions = computed(() =>
  projects.value.map((p) => ({ label: p.title, value: p.id })),
);

const teamOptions = computed(() =>
  teams.value.map((t, index) => ({
    label: t.leader
      ? `Команда ${index + 1} (${t.leader.firstName} ${t.leader.lastName})`
      : `Команда ${index + 1}`,
    value: t.id,
  })),
);

const teamLabel = (team: Team): string => {
  const index = teams.value.findIndex((t) => t.id === team.id) + 1;
  if (team.leader) {
    return `Команда ${index} (${team.leader.firstName} ${team.leader.lastName})`;
  }
  return `Команда ${index}`;
};

const statusLabel = (status: TeamStatus): string => {
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

const getServerError = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: { message?: string } } }).response?.data;
    if (data?.message) return data.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

const translateServerError = (raw: string): string => {
  const map: Record<string, string> = {
    'No available teams or projects for assignment.':
      'Нет доступных команд или проектов для распределения.',
    'Not enough projects for all teams.': 'Недостаточно проектов для всех команд.',
    'Course deadline is overdue.': 'Дедлайн регистрации курса истёк.',
    'Assignment or team already exist for given team.': 'Команда или проект уже назначены.',
    'Team is already assigned to a project.': 'Команда уже назначена на проект.',
    'Project and team courseId does not match.': 'Проект и команда принадлежат разным курсам.',
    'Team is already full.': 'Команда уже укомплектована.',
    'Student is already in a team.': 'Студент уже состоит в команде.',
  };
  return map[raw] ?? raw;
};

const loadData = async () => {
  loading.value = true;
  try {
    const requests: Promise<void>[] = [
      coursesApi.getById(courseId).then((data) => {
        courseName.value = data.name;
      }),
      teamsApi.getCourseTeams(courseId).then((data) => {
        teams.value = data;
      }),
      projectsApi.getByCourseId(courseId).then((data) => {
        projects.value = data;
      }),
    ];

    if (userStore.isAdmin) {
      requests.push(
        usersApi.getStudents().then((data) => {
          allStudents.value = data;
        }),
      );
    }

    await Promise.all(requests);
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    notification.error({
      title: 'Ошибка',
      content: 'Не удалось загрузить данные страницы',
      duration: 5000,
    });
  } finally {
    loading.value = false;
  }
};

const handleAutoAssign = async () => {
  autoAssigning.value = true;
  try {
    await assignmentsApi.assignTeamAutomatically({ courseId });
    notification.success({
      title: 'Распределение выполнено',
      content: 'Проекты успешно распределены между командами',
      duration: 3000,
      keepAliveOnHover: true,
    });
    await loadData();
  } catch (error) {
    console.error('Ошибка автоматического распределения:', error);
    notification.error({
      title: 'Ошибка',
      content: translateServerError(getServerError(error, 'Не удалось выполнить распределение')),
      duration: 5000,
    });
  } finally {
    autoAssigning.value = false;
  }
};

const handleManualAssign = async (teamId: string) => {
  const projectId = selectedProjectIds.value[teamId];
  if (!projectId) return;
  assigningTeamId.value = teamId;
  try {
    await assignmentsApi.assignTeamManually({
      courseId,
      projectId,
      teamId,
      status: 'active',
    });
    notification.success({
      title: 'Проект назначен',
      content: 'Проект успешно назначен команде',
      duration: 3000,
      keepAliveOnHover: true,
    });
    selectedProjectIds.value[teamId] = null;
    await loadData();
  } catch (error) {
    console.error('Ошибка назначения проекта:', error);
    notification.error({
      title: 'Ошибка',
      content: translateServerError(getServerError(error, 'Не удалось назначить проект')),
      duration: 5000,
    });
  } finally {
    assigningTeamId.value = null;
  }
};

const handleAddMember = async (studentId: string) => {
  const teamId = selectedTeamIds.value[studentId];
  if (!teamId) return;
  addingStudentId.value = studentId;
  try {
    await teamsApi.addMember(teamId, studentId);
    notification.success({
      title: 'Студент добавлен',
      content: 'Студент успешно добавлен в команду',
      duration: 3000,
      keepAliveOnHover: true,
    });
    selectedTeamIds.value[studentId] = null;
    await loadData();
  } catch (error) {
    console.error('Ошибка добавления студента в команду:', error);
    notification.error({
      title: 'Ошибка',
      content: translateServerError(
        getServerError(error, 'Не удалось добавить студента в команду'),
      ),
      duration: 5000,
    });
  } finally {
    addingStudentId.value = null;
  }
};

onMounted(loadData);
</script>

<style scoped>
.course-assignments-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
}

.n-breadcrumb {
  margin-bottom: 24px;
}

.section-card {
  margin-top: 24px;
  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.team-collapse-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.team-count {
  color: #888;
  font-size: 0.85rem;
  margin-left: auto;
}

.member-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 2px 0;
}

.member-group {
  color: #888;
  font-size: 0.85rem;
}

.student-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.assign-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.assign-select {
  flex: 1;
}

.small-empty {
  padding: 24px 0;
}

.assignments-table {
  width: 100%;
}

.team-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.team-name {
  font-weight: 600;
}

.members-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.project-cell {
  font-weight: 500;
}
</style>
