<template>
  <div class="request-row">
    <div class="request-info">
      <n-descriptions bordered :column="2" size="small">
        <n-descriptions-item label="Команда-инициатор">{{ initiatorName }}</n-descriptions-item>
        <n-descriptions-item label="Команда-получатель">{{ targetName }}</n-descriptions-item>
        <n-descriptions-item label="Проект инициатора">{{ initiatorProject }}</n-descriptions-item>
        <n-descriptions-item label="Проект получателя">{{ targetProject }}</n-descriptions-item>
      </n-descriptions>
      <n-tag :type="STATUS_TYPES[request.status]" class="status-tag">
        {{ STATUS_LABELS[request.status] }}
      </n-tag>
    </div>
    <n-space class="request-actions">
      <n-button v-if="showConfirm" type="primary" size="small" @click="$emit('confirm')">
        Подтвердить
      </n-button>
      <n-button v-if="showApprove" type="success" size="small" @click="$emit('approve')">
        Одобрить
      </n-button>
      <n-button v-if="showReject" type="error" size="small" @click="$emit('reject')">
        Отклонить
      </n-button>
      <n-button v-if="showCancel" type="error" size="small" @click="$emit('cancel')">
        Отменить
      </n-button>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import type { ExchangeRequest, ExchangeRequestStatus, Team } from '@/types';
import { NButton, NDescriptions, NDescriptionsItem, NSpace, NTag } from 'naive-ui';
import { computed } from 'vue';

const props = defineProps<{
  request: ExchangeRequest;
  showConfirm?: boolean;
  showReject?: boolean;
  showCancel?: boolean;
  showApprove?: boolean;
}>();

defineEmits<{
  (e: 'confirm'): void;
  (e: 'reject'): void;
  (e: 'cancel'): void;
  (e: 'approve'): void;
}>();

const STATUS_LABELS: Record<ExchangeRequestStatus, string> = {
  confirmed_initiator: 'Ожидает подтверждения',
  confirmed_target: 'Подтверждено частично',
  pending_teacher: 'Ожидает одобрения преподавателя',
  approved: 'Одобрено',
  rejected: 'Отклонено',
  cancelled: 'Отменено',
};

const STATUS_TYPES: Record<
  ExchangeRequestStatus,
  'default' | 'info' | 'success' | 'warning' | 'error'
> = {
  confirmed_initiator: 'info',
  confirmed_target: 'info',
  pending_teacher: 'warning',
  approved: 'success',
  rejected: 'error',
  cancelled: 'default',
};

function getTeamLabel(team: Team): string {
  const leader = team.members?.find((m) => m.userId === team.leaderId);
  if (leader) return `${leader.user.firstName} ${leader.user.lastName}`;
  return 'Команда';
}

const initiatorName = computed(() =>
  props.request.initiatorTeam
    ? getTeamLabel(props.request.initiatorTeam)
    : props.request.initiatorTeamId,
);
const targetName = computed(() =>
  props.request.targetTeam ? getTeamLabel(props.request.targetTeam) : props.request.targetTeamId,
);
const initiatorProject = computed(() => props.request.initiatorProject?.title ?? '—');
const targetProject = computed(() => props.request.targetProject?.title ?? '—');
</script>

<style scoped>
.request-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding: 4px 0;
}

.request-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-tag {
  align-self: flex-start;
  margin-top: 8px;
}

.request-actions {
  align-self: flex-end;
}
</style>
