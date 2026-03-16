import { defineStore } from 'pinia';

interface UserState {
  role: 'admin' | 'student' | null;
  isLoading: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    role: null, // По умолчанию null, загрузится при инициализации
    isLoading: false,
  }),

  getters: {
    // Проверка на админа
    isAdmin: (state) => state.role === 'admin',

    // Проверка на студента
    isStudent: (state) => state.role === 'student',

    // Роль готова (не null)
    isRoleReady: (state) => state.role !== null,
  },

  actions: {
    // Установить роль
    setRole(role: 'admin' | 'student') {
      this.role = role;
      localStorage.setItem('userRole', role);
    },

    // Загрузить роль
    async loadRole() {
      this.isLoading = true;
      try {
        // 1. Сначала пробуем из localStorage
        const savedRole = localStorage.getItem('userRole') as 'admin' | 'student' | null;

        if (savedRole) {
          this.role = savedRole;
        } else {
          // временно вручную стравлю
          this.role = 'admin';
        }
      } catch (error) {
        console.error('Ошибка загрузки роли:', error);
        this.role = 'student'; // Значение по умолчанию
      } finally {
        this.isLoading = false;
      }
    },

    // Очистить роль (при выходе)
    clearRole() {
      this.role = null;
      localStorage.removeItem('userRole');
    },
  },
});
