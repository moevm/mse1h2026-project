<!-- BaseButton.vue -->
<template>
  <button :class="['base-btn', btnClass]" v-bind="$attrs" @click="$emit('click', $event)">
    {{ text }}
  </button>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
  btnClass?: string;
}>();

defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();
</script>

<style scoped>
.base-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.base-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.confirm-btn {
  background-color: red;
  color: white;
}
</style>
