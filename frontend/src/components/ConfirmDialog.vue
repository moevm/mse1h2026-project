<template>
  <div v-if="show" class="dialog-overlay" @click="$emit('cancel')">
    <div class="dialog" @click.stop>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="dialog-actions">
        <BaseButton text="Отмена" btn-class="cancel-btn" @click="$emit('cancel')" />
        <BaseButton :text="confirmText" btn-class="confirm-btn" @click="$emit('confirm')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue';
defineProps<{
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
}>();

defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<style scoped>
/* Стили для модального окна */
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
  min-width: 300px;
  font-size: 1rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
