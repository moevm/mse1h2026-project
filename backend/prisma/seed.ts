import * as dotenv from 'dotenv';
import * as path from 'node:path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

async function main() {
  const adapter = new PrismaMariaDb({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  const prisma = new PrismaClient({ adapter });

  const admin = await prisma.user.upsert({
    where: { ldapUid: 'seed_admin' },
    update: {},
    create: {
      ldapUid: 'seed_admin',
      email: 'admin@example.ru',
      firstName: 'Иван',
      secondName: 'Иванов',
      groupNumber: 0,
      role: 'admin',
      password: 'admin123',
    },
  });

  console.log(`Admin created: ${admin.email}`);

  const course1 = await prisma.course.upsert({
    where: { id: 'seed-course-1' },
    update: {},
    create: {
      id: 'seed-course-1',
      name: 'Основы и Управление Промышленной Разработкой ПО',
      semester: 5,
      maxTeamSize: 5,
      minTeamSize: 3,
      isActive: true,
      teacherId: admin.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: 'seed-course-2' },
    update: {},
    create: {
      id: 'seed-course-2',
      name: 'Введение в нереляционные базы данных',
      semester: 2,
      maxTeamSize: 3,
      minTeamSize: 2,
      isActive: true,
      teacherId: admin.id,
    },
  });

  console.log(`Courses created: ${course1.name}, ${course2.name}`);

  await prisma.project.upsert({
    where: { id: 'seed-project-1' },
    update: {},
    create: {
      id: 'seed-project-1',
      title: 'Помощник преподавателя на лаба',
      description: 'Задача - создать инструмент, который получает на вход pull-request\'ы с кодом на Си/Питоне, а на выходе генерирует отчёт, в котором указаны проблемы в данном коде (использование плохих шаблонов/практик, неопределенное поведение, рандомные константы в коде и тд)\'',
      courseId: course1.id,
      teacherId: admin.id,
    },
  });

  await prisma.project.upsert({
    where: { id: 'seed-project-2' },
    update: {},
    create: {
      id: 'seed-project-2',
      title: 'Новые периферийные устройства в RIPES',
      description: 'Задача - добавить новые устройства в Ripes https://github.com/mortbopet/Ripes/tree/master/src/io',
      courseId: course1.id,
      teacherId: admin.id,
    },
  });

  await prisma.project.upsert({
    where: { id: 'seed-project-3' },
    update: {},
    create: {
      id: 'seed-project-3',
      title: 'БД актеров',
      description: 'Задача - создать каталог профилей актеров со всевозможной дополнительной информацией + поиск + редактирование.',
      courseId: course2.id,
      teacherId: admin.id,
    },
  });

  console.log('Projects created: 3');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
