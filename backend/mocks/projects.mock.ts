import { Project } from '../src/common/interfaces/project.interface';

export const mockProjects: Project[] = [
  {
    uid: 201,
    title: 'Платформа для распределения проектов',
    description:
      'Реализовать веб-приложение, которое позволит студентам объединятся в группы и удобно распределяться по проектам.',
    teacherId: 1,
    teacherFirstName: "Анна",
    teacherLastName: "Иванова",
    courseName: "MSE",
    courseId: 1,
    createdAt: new Date(),
  },
  {
    uid: 202,
    title: 'Проектирование базы данных для интернет-магазина ателье',
    description:
      'Задача - создать веб-приложение для ателье, где будут роли заказчиков, работников, руководства. В приложение должна быть возможность создать заказ, трекать его выполнение, хранить всю промежуточную информацию, подводить статистику, считать финансы.',
    teacherId: 14,
    teacherFirstName: "Олег",
    teacherLastName: "Синичкин",
    courseName: "noSQL",
    courseId: 1,
    createdAt: new Date(),
  },
];
