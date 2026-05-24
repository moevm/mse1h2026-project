<template>
  <div class="exchange-requests-page">
    <n-breadcrumb>
      <n-breadcrumb-item @click="router.push('/courses')">Курсы</n-breadcrumb-item>
      <n-breadcrumb-item @click="router.push(`/courses/${courseId}`)">
        {{ courseName || 'Курс' }}
      </n-breadcrumb-item>
      <n-breadcrumb-item>Запросы на обмен</n-breadcrumb-item>
    </n-breadcrumb>

    <LoadingSpinner v-if="loading" text="Загрузка..." />

    <template v-else>
      <template v-if="userStore.isAdmin">
        <n-card class="section-card">
          <template #header>Все запросы на обмен</template>
          <n-empty v-if="requests.length === 0" description="Запросов на обмен нет" />
          <n-list v-else bordered>
            <n-list-item v-for="req in requests" :key="req.id">
              <ExchangeRequestRow
                :request="req"
                :show-approve="req.status === 'pending_teacher'"
                :show-reject="req.status === 'pending_teacher'"
                @approve="handleApprove(req.id)"
                @reject="handleReject(req.id)"
                @cancel="handleCancel(req.id)"
              />
            </n-list-item>
          </n-list>
        </n-card>
      </template>

      <template v-else>
        <n-card class="section-card">
          <template #header>Исходящие запросы</template>
          <n-empty v-if="outgoing.length === 0" description="Исходящих запросов нет" />
          <n-list v-else bordered>
            <n-list-item v-for="req in outgoing" :key="req.id">
              <ExchangeRequestRow
                :request="req"
                :show-cancel="!isFinal(req.status)"
                @cancel="handleCancel(req.id)"
              />
            </n-list-item>
          </n-list>
        </n-card>

        <n-card class="section-card">
          <template #header>Входящие запросы</template>
          <n-empty v-if="incoming.length === 0" description="Входящих запросов нет" />
          <n-list v-else bordered>
            <n-list-item v-for="req in incoming" :key="req.id">
              <ExchangeRequestRow
                :request="req"
                :show-confirm="req.status === 'confirmed_initiator' && isLeader"
                :show-reject="req.status === 'confirmed_initiator' && isLeader"
                @confirm="handleConfirm(req.id)"
                @reject="handleReject(req.id)"
              />
            </n-list-item>
          </n-list>
        </n-card>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { coursesApi, exchangesApi, teamsApi } from '@/api';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ExchangeRequestRow from '@/components/exchanges/ExchangeRequestRow.vue';
import { useUserStore } from '@/stores/userStore';
import type { ExchangeRequest, ExchangeRequestStatus, Team } from '@/types';
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NCard,
  NEmpty,
  NList,
  NListItem,
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
const loading = ref(true);
const requests = ref<ExchangeRequest[]>([]);
const myTeam = ref<Team | null>(null);

const isLeader = computed(
  () =>
    !!myTeam.value && myTeam.value.leaderId === (userStore.user as unknown as { id: string })?.id,
);

const outgoing = computed(() =>
  requests.value.filter((r) => r.initiatorTeamId === myTeam.value?.id),
);
const incoming = computed(() => requests.value.filter((r) => r.targetTeamId === myTeam.value?.id));

const isFinal = (status: ExchangeRequestStatus) =>
  status === 'approved' || status === 'rejected' || status === 'cancelled';

const loadData = async () => {
  loading.value = true;
  try {
    const tasks: Promise<unknown>[] = [
      coursesApi.getById(courseId).then((c) => {
        courseName.value = c.name;
      }),
      exchangesApi.getRequests(courseId).then((r) => {
        requests.value = r;
      }),
    ];
    if (!userStore.isAdmin) {
      tasks.push(
        teamsApi.getMyTeam(courseId).then((t) => {
          myTeam.value = t;
        }),
      );
    }
    await Promise.all(tasks);
  } catch {
    notification.error({
      title: 'Ошибка загрузки',
      content: 'Не удалось загрузить данные',
      duration: 5000,
    });
  } finally {
    loading.value = false;
  }
};

const handleConfirm = async (id: string) => {
  try {
    await exchangesApi.confirmRequest(id);
    notification.success({ title: 'Подтверждено', duration: 3000 });
    await loadData();
  } catch (error) {
    notification.error({
      title: 'Ошибка',
      content: error instanceof Error ? error.message : 'Не удалось подтвердить запрос',
      duration: 5000,
    });
  }
};

const handleApprove = async (id: string) => {
  try {
    await exchangesApi.confirmRequest(id);
    notification.success({
      title: 'Обмен одобрен',
      content: 'Проекты команд обновлены',
      duration: 3000,
    });
    await loadData();
  } catch (error) {
    notification.error({
      title: 'Ошибка',
      content: error instanceof Error ? error.message : 'Не удалось одобрить запрос',
      duration: 5000,
    });
  }
};

const handleReject = async (id: string) => {
  try {
    await exchangesApi.rejectRequest(id);
    notification.success({ title: 'Запрос отклонён', duration: 3000 });
    await loadData();
  } catch (error) {
    notification.error({
      title: 'Ошибка',
      content: error instanceof Error ? error.message : 'Не удалось отклонить запрос',
      duration: 5000,
    });
  }
};

const handleCancel = async (id: string) => {
  try {
    await exchangesApi.cancelRequest(id);
    notification.success({ title: 'Запрос отменён', duration: 3000 });
    await loadData();
  } catch (error) {
    notification.error({
      title: 'Ошибка',
      content: error instanceof Error ? error.message : 'Не удалось отменить запрос',
      duration: 5000,
    });
  }
};

onMounted(loadData);
</script>

<style scoped>
.exchange-requests-page {
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
}
</style>
