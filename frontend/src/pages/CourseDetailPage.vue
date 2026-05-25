<template>
  <div class="course-detail-page">
    <!-- Хлебные крошки -->
    <n-breadcrumb>
      <n-breadcrumb-item @click="router.push('/courses')"> Курсы </n-breadcrumb-item>
      <n-breadcrumb-item>
        {{ course?.name || 'Загрузка...' }}
      </n-breadcrumb-item>
    </n-breadcrumb>

    <LoadingSpinner v-if="loading" text="Загрузка курсов..." />

    <!-- Карточка курса -->
    <n-card v-else-if="course" class="course-card" :bordered="true">
      <!-- Шапка с названием и статусом -->
      <template #header>
        <div class="card-header">
          <h1 class="course-title">{{ course.name }}</h1>
          <n-tag :type="course.isActive ? 'success' : 'error'" :bordered="false">
            {{ course.isActive ? 'Активен' : 'Не активен' }}
          </n-tag>
        </div>
      </template>

      <!-- Информация о курсе -->
      <n-descriptions label-placement="left" bordered :column="1" class="course-info">
        <!-- Преподаватель -->
        <n-descriptions-item label="Преподаватель">
          <div class="info-item">
            <span>{{ teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Не назначен' }}</span>
          </div>
        </n-descriptions-item>

        <!-- Размер команды -->
        <n-descriptions-item label="Размер команды">
          <div class="info-item">
            <span> {{ course.minTeamSize }} - {{ course.maxTeamSize }} человек </span>
          </div>
        </n-descriptions-item>

        <!-- Дедлайн выбора проекта -->
        <n-descriptions-item label="Дедлайн выбора проекта">
          <div class="info-item">
            <span v-if="course.registrationDeadline">
              {{ formatDate(course.registrationDeadline) }}
            </span>
            <span v-else class="text-muted">Не установлен</span>
          </div>
        </n-descriptions-item>
      </n-descriptions>

      <!-- Кнопки действий -->
      <template #footer>
        <n-space justify="end" :size="16">
          <template v-if="userStore.isAdmin">
            <n-button @click="handleCourseTeams"> Команды курса </n-button>
            <n-button @click="handleExchanges"> Запросы на обмен </n-button>
            
            <!-- Выпадающий список действий -->
            <n-dropdown
              trigger="click"
              :options="adminActionOptions"
              @select="handleAdminAction"
            >
              <n-button type="primary">
                Действия
                <template #icon>
                  <n-icon>
                    <ArrowDropDownOutlined />
                  </n-icon>
                </template>
              </n-button>
            </n-dropdown>
          </template>
          <template v-else>
            <n-button v-if="userStore.isStudent" @click="handleMyTeam"> Моя команда </n-button>
            <n-button @click="handleExchanges"> Запросы на обмен </n-button>
          </template>
        </n-space>
      </template>

    </n-card>

    <!-- Карточка со списком проектов -->
    <n-card v-if="course" class="projects-card" :bordered="true">
      <div class="projects-container">
        <div class="projects-list_header">
          <h2 class="projects-list_title">Список проектов</h2>
          <n-button v-if="userStore.isAdmin && course?.id" type="primary" @click="handleAddProject">
            <template #icon>
              <n-icon>
                <AddRound />
              </n-icon>
            </template>
            Добавить проект
          </n-button>
        </div>

        <LoadingSpinner v-if="projectsLoading" text="Загрузка проектов..." />

        <div v-else-if="!projects.length" class="center-wrapper">
          <n-empty :description="emptyStateMessage" class="empty">
            <template #icon>
              <n-icon>
                <SentimentDissatisfiedRound />
              </n-icon>
            </template>
          </n-empty>
        </div>

        <!-- Список проектов -->
        <div v-else class="projects-list">
          <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
        </div>
      </div>
    </n-card>

    <!-- Ошибка загрузки -->
    <n-result
      v-else
      status="404"
      title="Курс не найден"
      description="Возможно, курс был удален или ссылка неверна"
    >
      <template #footer>
        <n-button class="secondary-btn" @click="router.push('/courses')">
          Вернуться к списку курсов
        </n-button>
      </template>
    </n-result>

    <ConfirmDialog
      :show="showDialog"
      title="Подтверждение действия"
      message="Вы уверены, что хотите удалить этот курс?"
      confirm-text="Удалить"
      @confirm="handleConfirmDelete"
      @cancel="closeDialog"
    />
  </div>
  <n-modal v-model:show="showImportStudentsModal" preset="card" title="Импорт студентов">
    <n-upload
      :custom-request="handleImportStudents"
      accept=".csv"
      :max="1"
    >
      <n-button>Загрузить CSV файл</n-button>
    </n-upload>
    <template #action>
      <n-button @click="showImportStudentsModal = false">Закрыть</n-button>
    </template>
  </n-modal>

  <n-modal v-model:show="showImportProjectsModal" preset="card" title="Импорт проектов">
    <n-upload
      :custom-request="handleImportProjects"
      accept=".csv"
      :max="1"
    >
      <n-button>Загрузить CSV файл</n-button>
    </n-upload>
    <template #action>
      <n-button @click="showImportProjectsModal = false">Закрыть</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { coursesApi, projectsApi, usersApi } from '@/api';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ProjectCard from '@/components/projects/ProjectCard.vue';
import { useUserStore } from '@/stores/userStore';
import type { Course, Project, User } from '@/types';
import { AddRound, SentimentDissatisfiedRound, ArrowDropDownOutlined } from '@vicons/material';
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NEmpty,
  NIcon,
  NResult,
  NSpace,
  NTag,
  useNotification,
  NDropdown,
  NUpload,
} from 'naive-ui';
import type { UploadCustomRequestOptions } from 'naive-ui';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const notification = useNotification();

const course = ref<Course | null>(null);
const loading = ref(true);
const showDialog = ref(false);
const teacher = ref<User | null>(null);

const projects = ref<Project[]>([]);
const projectsLoading = ref(false);

const showImportStudentsModal = ref(false);
const showImportProjectsModal = ref(false);

const adminActionOptions = [
  {
    label: 'Редактировать курс',
    key: 'edit',
  },
  {
    label: 'Импорт студентов',
    key: 'import-students',
  },
  {
    label: 'Импорт проектов',
    key: 'import-projects',
  },
  {
    label: 'Экспорт студентов',
    key: 'export-students',
  },
  {
    label: 'Экспорт проектов',
    key: 'export-projects',
  },
  {
    label: 'Удалить курс',
    key: 'delete',
    props: {
      style: { color: 'red' },
    },
  },
];

// Обработчик выбора действия
const handleAdminAction = async (key: string) => {
  switch (key) {
    case 'edit':
      handleEditCourse();
      break;
    case 'import-students':
      showImportStudentsModal.value = true;
      break;
    case 'import-projects':
      showImportProjectsModal.value = true;
      break;
    case 'export-students':
      await handleExportStudents();
      break;
    case 'export-projects':
      await handleExportProjects();
      break;
    case 'delete':
      handleDeleteCourse();
      break;
  }
};

// Форматирование даты
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Сообщение для пустого состояния
const emptyStateMessage = computed(() => {
  if (userStore.isAdmin) {
    return course.value?.id
      ? 'Нет доступных проектов для управления в этом курсе'
      : 'Выберите курс, чтобы управлять проектами';
  } else {
    return 'Нет доступных активных проектов';
  }
});

// Загрузка проектов курса
const loadProjects = async () => {
  if (!course.value) return;

  try {
    projectsLoading.value = true;
    projects.value = await projectsApi.getByCourseId(course.value.id);
  } catch (error) {
    console.error('Ошибка загрузки проектов:', error);
    notification.error({
      title: 'Ошибка',
      content: 'Не удалось загрузить проекты курса',
      duration: 3000,
    });
  } finally {
    projectsLoading.value = false;
  }
};

// Загрузка данных курса
const loadCourse = async () => {
  const courseId = String(route.params.id);

  if (!courseId || courseId === 'undefined' || courseId === 'null') {
    router.push('/404');
    return;
  }

  try {
    loading.value = true;
    course.value = await coursesApi.getById(courseId);
    if (course.value?.teacherId) {
      teacher.value = await usersApi.getById(course.value.teacherId);
    }

    // Загружаем проекты после загрузки курса
    await loadProjects();
  } catch (error) {
    console.error('Ошибка загрузки курса:', error);
    notification.error({
      title: 'Ошибка',
      content: 'Не удалось загрузить информацию о курсе',
      duration: 5000,
    });
  } finally {
    loading.value = false;
  }
};

const handleEditCourse = () => {
  if (!course.value) return;
  router.push(`/courses/${course.value.id}/edit`);
};

const handleMyTeam = () => {
  if (!course.value) return;
  router.push(`/courses/${course.value.id}/my-team`);
};

const handleCourseTeams = () => {
  if (!course.value) return;
  router.push(`/courses/${course.value.id}/teams`);
};

const handleExchanges = () => {
  if (!course.value) return;
  router.push(`/courses/${course.value.id}/exchanges`);
};

const handleDeleteCourse = () => {
  if (!course.value) return;
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

const handleConfirmDelete = async () => {
  if (!course.value) return;
  try {
    await coursesApi.delete(course.value.id);

    notification.success({
      title: 'Курс удален',
      content: 'Курс успешно удален',
      duration: 3000,
      keepAliveOnHover: true,
    });
    router.push('/courses');
  } catch (error) {
    console.error('Ошибка:', error);

    notification.error({
      title: 'Ошибка сервера',
      content: error instanceof Error ? error.message : 'Пожалуйста, попробуйте позже',
      duration: 5000,
    });
  } finally {
    closeDialog();
  }
};

const handleExportStudents = async () => {
  if (!course.value) return;
  
  try {
    const blob = await coursesApi.exportStudents(course.value.id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students_course_${course.value.id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    notification.success({
      title: 'Успешно',
      content: 'Экспорт студентов начат',
      duration: 3000,
    });
  } catch (error) {
    console.error('Ошибка экспорта студентов:', error);
    notification.error({
      title: 'Ошибка',
      content: 'Не удалось экспортировать студентов',
      duration: 5000,
    });
  }
};

// Экспорт проектов
const handleExportProjects = async () => {
  if (!course.value) return;
  
  try {
    const blob = await coursesApi.exportProjects(course.value.id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projects_course_${course.value.id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    notification.success({
      title: 'Успешно',
      content: 'Экспорт проектов начат',
      duration: 3000,
    });
  } catch (error) {
    console.error('Ошибка экспорта проектов:', error);
    notification.error({
      title: 'Ошибка',
      content: 'Не удалось экспортировать проекты',
      duration: 5000,
    });
  }
};

// Импорт студентов
const handleImportStudents = async (options: UploadCustomRequestOptions) => {
  const uploadFile = options.file;
  let file: File;
  
  if (uploadFile.file instanceof File) {
    file = uploadFile.file;
  } else {
    file = uploadFile as unknown as File;
  }
  if (!course.value) return;
  
  try {
    await coursesApi.importStudents(course.value.id, file);
    notification.success({
      title: 'Успешно',
      content: 'Студенты успешно импортированы',
      duration: 3000,
    });
    showImportStudentsModal.value = false;
  } catch (error) {
    console.error('Ошибка импорта студентов:', error);
    notification.error({
      title: 'Ошибка',
      content: 'Не удалось импортировать студентов',
      duration: 5000,
    });
  }
};

// Импорт проектов
const handleImportProjects = async (options: UploadCustomRequestOptions) => {
  const uploadFile = options.file;
  let file: File;
  
  if (uploadFile.file instanceof File) {
    file = uploadFile.file;
  } else {
    file = uploadFile as unknown as File;
  }
  if (!course.value) return;
  
  try {
    await coursesApi.importProjects(course.value.id, file);
    notification.success({
      title: 'Успешно',
      content: 'Проекты успешно импортированы',
      duration: 3000,
    });
    showImportProjectsModal.value = false;
    await loadProjects();
  } catch (error) {
    console.error('Ошибка импорта проектов:', error);
    notification.error({
      title: 'Ошибка',
      content: 'Не удалось импортировать проекты',
      duration: 5000,
    });
  }
};


const handleAddProject = () => {
  if (!course.value) return;
  router.push(`/courses/${course.value.id}/projects/create`);
};

// Загружаем данные при монтировании
onMounted(() => {
  loadCourse();
});
</script>

<style scoped>
.course-detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.n-breadcrumb {
  margin-bottom: 24px;
}

.course-card {
  margin-block: 24px;
  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.course-title {
  font-size: 1.8rem;
  font-weight: 600;
}

.course-info {
  margin-top: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.projects-card {
  box-shadow: var(--shadow);
}

.projects-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  font-size: 1.5rem;
}

.projects-list_header {
  grid-row: 1;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.projects-list_title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.center-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  width: 100%;
}

.empty {
  --n-font-size: 1.2rem !important;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.import-modal-content {
  padding: 16px 0;
}

.selected-file {
  margin-top: 12px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

</style>
