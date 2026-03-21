import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

interface UserState {
  role: 'admin' | 'student' | null;
  isLoading: boolean;
}

export const useUserStore = defineStore('user', () => {
  const role = useStorage<UserState['role']>('userRole', null, localStorage, {
    serializer: {
      read: (value: string): UserState['role'] =>
        value === 'admin' || value === 'student' ? value : null,
      write: (value: UserState['role']): string => value ?? '',
    },
  });
  const isLoading = ref<UserState['isLoading']>(false);

  const isAdmin = computed(() => role.value === 'admin');
  const isStudent = computed(() => role.value === 'student');
  const isRoleReady = computed(() => role.value !== null);

  function setRole(newRole: Exclude<UserState['role'], null>): void {
    role.value = newRole;
  }

  async function loadRole(): Promise<void> {
    isLoading.value = true;
    try {
      if (role.value !== 'admin' && role.value !== 'student') {
        // временно вручную стравлю
        role.value = 'admin';
      }
    } catch (error: unknown) {
      console.error('Ошибка загрузки роли:', error);
      role.value = 'student'; // Значение по умолчанию
    } finally {
      isLoading.value = false;
    }
  }

  function clearRole() {
    role.value = null;
  }

  return {
    role,
    isLoading,
    isAdmin,
    isStudent,
    isRoleReady,
    setRole,
    loadRole,
    clearRole,
  };
});
