import { randomUUID } from 'crypto';

import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    const adapter = new PrismaMariaDb({
      host: configService.get<string>('MYSQL_HOST') || 'localhost',
      port: parseInt(configService.get<string>('MYSQL_PORT') || '3306'),
      user: configService.get<string>('MYSQL_USER'),
      password: configService.get<string>('MYSQL_PASSWORD'),
      database: configService.get<string>('MYSQL_DATABASE'),
      allowPublicKeyRetrieval: true,
      connectionLimit: 10,
      acquireTimeout: 60000, // максимальное время ожидания свободного соединения из пула 60 сек
      idleTimeout: 600000, // время простоя соединения перед его закрытием 10 минут
      minimumIdle: 2, // минимальное количество "теплых" соединений в пуле (2 всегда готовых)
    });

    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('MySQL подключение успешно.');
    } catch (error) {
      this.logger.error('Ошибка БД:', error);
      throw error;
    }

    await this.seedDatabase();
  }

  private async seedDatabase() {
    const isNotEmpty =
      (await this.user.count()) > 0 ||
      (await this.course.count()) > 0 ||
      (await this.project.count()) > 0 ||
      (await this.team.count()) > 0;

    if (isNotEmpty) {
      this.logger.log('Seed skipped: database already contains data.');
      return;
    }

    await this.$transaction(
      async (tx) => {
        const users = await this.seedUsers(tx);
        const courses = await this.seedCourses(tx, users.teacherOne, users.teacherTwo);
        const projects = await this.seedProjects(tx, courses, users.teacherOne, users.teacherTwo);
        await this.seedTeams(tx, users.students, courses, projects);
      },
      { timeout: 30000 },
    );
  }

  private async seedUsers(tx: Prisma.TransactionClient) {
    const studentDefs = [
      {
        uid: 'seed_student_1',
        email: 'student1@example.ru',
        firstName: 'Student1',
        lastName: 'Student1',
        group: 2410,
      },
      {
        uid: 'seed_student_2',
        email: 'student2@example.ru',
        firstName: 'Student2',
        lastName: 'Student2',
        group: 2410,
      },
      {
        uid: 'seed_student_3',
        email: 'student3@example.ru',
        firstName: 'Student3',
        lastName: 'Student3',
        group: 2410,
      },
      {
        uid: 'seed_student_4',
        email: 'student4@example.ru',
        firstName: 'Student4',
        lastName: 'Student4',
        group: 2410,
      },
      {
        uid: 'seed_student_5',
        email: 'student5@example.ru',
        firstName: 'Student5',
        lastName: 'Student5',
        group: 2410,
      },
      {
        uid: 'seed_student_6',
        email: 'student6@example.ru',
        firstName: 'Student6',
        lastName: 'Student6',
        group: 2411,
      },
      {
        uid: 'seed_student_7',
        email: 'student7@example.ru',
        firstName: 'Student7',
        lastName: 'Student7',
        group: 2411,
      },
      {
        uid: 'seed_student_8',
        email: 'student8@example.ru',
        firstName: 'Student8',
        lastName: 'Student8',
        group: 2411,
      },
      {
        uid: 'seed_student_9',
        email: 'student9@example.ru',
        firstName: 'Student9',
        lastName: 'Student9',
        group: 2411,
      },
      {
        uid: 'seed_student_10',
        email: 'student10@example.ru',
        firstName: 'Student10',
        lastName: 'Student10',
        group: 2411,
      },
      {
        uid: 'seed_student_11',
        email: 'student11@example.ru',
        firstName: 'Student11',
        lastName: 'Student11',
        group: 2412,
      },
      {
        uid: 'seed_student_12',
        email: 'student12@example.ru',
        firstName: 'Student12',
        lastName: 'Student12',
        group: 2412,
      },
      {
        uid: 'seed_student_13',
        email: 'student13@example.ru',
        firstName: 'Student13',
        lastName: 'Student13',
        group: 2412,
      },
      {
        uid: 'seed_student_14',
        email: 'student14@example.ru',
        firstName: 'Student14',
        lastName: 'Student14',
        group: 2412,
      },
      {
        uid: 'seed_student_15',
        email: 'student15@example.ru',
        firstName: 'Student15',
        lastName: 'Student15',
        group: 2412,
      },
    ];

    await tx.user.createMany({
      data: [
        {
          ldapUid: 'seed_admin_main',
          email: 'admin.main@example.ru',
          firstName: 'Admin',
          lastName: 'Admin',
          groupNumber: 0,
          role: 'admin',
          password: 'admin123',
        },
        {
          ldapUid: 'seed_admin_teacher_1',
          email: 'teacher1@example.ru',
          firstName: 'Teacher1',
          lastName: 'Teacher1',
          groupNumber: 0,
          role: 'admin',
          password: 'teacher123',
        },
        {
          ldapUid: 'seed_teacher_2',
          email: 'teacher2@example.ru',
          firstName: 'Teacher2',
          lastName: 'Teacher2',
          groupNumber: 0,
          role: 'admin',
          password: 'teacher123',
        },
        ...studentDefs.map((s) => ({
          ldapUid: s.uid,
          email: s.email,
          firstName: s.firstName,
          lastName: s.lastName,
          groupNumber: s.group,
          role: 'student' as const,
          password: 'student123',
        })),
      ],
      skipDuplicates: true,
    });

    const allUsers = await tx.user.findMany({
      where: {
        ldapUid: {
          in: [
            'seed_admin_main',
            'seed_admin_teacher_1',
            'seed_teacher_2',
            ...studentDefs.map((s) => s.uid),
          ],
        },
      },
    });

    const byUid = new Map(allUsers.map((u) => [u.ldapUid, u]));
    const mainAdmin = byUid.get('seed_admin_main')!;
    const teacherOne = byUid.get('seed_admin_teacher_1')!;
    const teacherTwo = byUid.get('seed_teacher_2')!;
    const students = studentDefs.map((s) => byUid.get(s.uid)!);

    this.logger.log(`Users prepared: 1 admin, 2 teachers, ${students.length} students.`);

    return { mainAdmin, teacherOne, teacherTwo, students };
  }

  private async seedCourses(
    tx: Prisma.TransactionClient,
    teacherOne: { id: string },
    teacherTwo: { id: string },
  ) {
    const courseOneId = randomUUID();
    const courseTwoId = randomUUID();

    const [courseOne, courseTwo] = await Promise.all([
      tx.course.create({
        data: {
          id: courseOneId,
          name: 'Основы промышленной разработки ПО',
          maxTeamSize: 5,
          minTeamSize: 3,
          isActive: true,
          teacherId: teacherOne.id,
        },
      }),
      tx.course.create({
        data: {
          id: courseTwoId,
          name: 'Введение в нереляционные базы данных',
          maxTeamSize: 4,
          minTeamSize: 2,
          isActive: true,
          teacherId: teacherTwo.id,
        },
      }),
    ]);

    this.logger.log(`Courses prepared: ${courseOne.name}, ${courseTwo.name}.`);

    return { courseOne, courseTwo };
  }

  private async seedProjects(
    tx: Prisma.TransactionClient,
    courses: { courseOne: { id: string }; courseTwo: { id: string } },
    teacherOne: { id: string },
    teacherTwo: { id: string },
  ) {
    const courseOneProjects = await Promise.all([
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Помощник преподавателя на лабах',
          description:
            "Инструмент для анализа pull-request'ов с кодом на Си/Python и генерации отчeтов о проблемах: плохие практики, неопределeнное поведение, магические константы. Технологии: Python, Docker, OCLint/Pylint.",
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Новые периферийные устройства в RIPES',
          description:
            'Добавление новых IO-устройств в симулятор RIPES для учебных курсов по архитектуре ЭВМ.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Генератор лабораторных по программированию',
          description:
            'Генерация персонализированных заданий для 7 лабораторных работ с воспроизводимыми параметрами на основе ФИО студента. Интеграция в курс на e.moevm.info через CodeRunner и Moodle.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Автоматизация деплоя self-hosted таблиц',
          description:
            'Набор скриптов для развeртывания и управления self-hosted электронными таблицами на кафедре: автоматизация деплоя, управления пользователями, связи таблиц и форм, резервных копий и мониторинга расхода ресурсов. Технологии: Python, Docker Compose.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Интерфейсы для замены coderunner на judge0',
          description:
            'Прототип системы для развeртывания и использования judge0 вместо coderunner в Moodle: внедрение judge0 как ядра проверки, портирование задач из coderunner, автоматизация развeртывания контейнеров. Технологии: Python, CodeRunner, Moodle.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Интерфейсы LTI для judge0',
          description:
            'LTI-интеграция для IDE judge0: автоматизация деплоя, модуль взаимодействия с Moodle по LTI, модуль задач с параметрами (язык, время на попытку), замеры ресурсов на пользователя и запуск программы. Технологии: JS, LTI, Python, Docker.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Бот для Rocket.Chat — новые фичи',
          description:
            'Разработка и внедрение новой функциональности в бот для Rocket.Chat. Репозиторий: github.com/moevm/rocket-bot.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Прокторинг — инфраструктурные фиксы',
          description:
            'Инфраструктурные улучшения кодовой базы системы прокторинга: CI с линтерами для кода и Docker, поиск мертвого кода, лёгкий рефакторинг, гибкие фильтры событий (вебкамера, скринкаст, логи Moodle), внедрение модуля кластеризации. Технологии: JS, Docker Compose.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Система управления пространствами Rocket.Chat',
          description:
            'Расширение функциональности rocket-administration-app: редактирование сущностей (команды, комнаты, пользователи), улучшение массовых операций, архивация каналов, улучшение UI и фильтров. Технологии: TypeScript, Python, Docker, Rocket API.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Система кафедральных опросов — новые фичи',
          description:
            'Улучшение системы survey.moevm.info: сохранение и редактирование конфигурации опросов в runtime через UI, модуль анализа и визуализации данных, улучшение UI страниц, фиксы. Технологии: Python, JS, HTML, Docker.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Веб-приложение для записи на проекты',
          description:
            'Веб-приложение для объединения студентов в группы и распределения по проектам: курсы как отдельные сущности, авторизация, импорт студентов и проектов, настройка параметров, визуализация результатов, автоматическое распределение, обмен проектами между командами. Технологии: JS, Docker Compose, MySQL.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Тесты для GitHub-бота',
          description:
            'Покрытие кодовой базы GitHub-бота тестами: юзкейсы с mock-объектами для внешних зависимостей, рефакторинг для снижения связности компонентов, добавление юнит-тестов. Целевое покрытие ≥ 70%, время выполнения ≤ 5 мин. Технологии: Python, pytest, pytest-cov, unittest.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
    ]);

    const courseTwoProjects = await Promise.all([
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'ИС для театральных декораций',
          description:
            'Веб-приложение для хранения, поиска и редактирования информации о театральных декорациях с учeтом их специфики. MongoDB, синтетические данные.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'БД актeров',
          description:
            'Каталог профилей актeров с расширенной информацией, полнотекстовым поиском и редактированием. MongoDB, синтетические данные.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'ИС для ателье',
          description:
            'Веб-приложение для ателье с ролями заказчиков, работников и руководства: создание заказов, трекинг выполнения, промежуточные данные, статистика и финансы. MongoDB.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Хранилище изображений с CRUD',
          description:
            'REST-приложение для CRUD изображений с поиском по метаданным, датам и содержимому изображения. Хранение всех логов. MongoDB, синтетические данные.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'БД биометрии СКУД для университета',
          description:
            'Веб-приложение для хранения биометрических данных (голос, лица, логи, доступы), контроля доступа и логирования событий СКУД университета. MongoDB, синтетические данные.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Система записи на самостоятельную работу в комп. классе',
          description:
            'Приложение для записи студентов на самостоятельную работу в один из N компьютерных классов. ArangoDB, синтетические данные.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'БД для наблюдений за животными',
          description:
            'Веб-приложение для публикации наблюдений за животными: фото, видео, отметки на карте, лайки, комментарии. Neo4j, синтетические данные.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'ИС анализа диссертаций в открытом доступе',
          description:
            'Приложение для приёма текстов диссертаций и авторефератов с метаданными (vak.gisnauka.ru): парсинг структуры (введение, список литературы, главы), поиск и статистический анализ. ArangoDB.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Система для распределения студентов по практикам',
          description:
            'ЛК-партнёра 2.0 с умными рекомендациями: навыки студентов с подтверждением, структурированные вакансии/практики, аналитика и поиск. Neo4j, данные из ЛК партнёра.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Бэкенд для GPS MMORPG',
          description:
            'Бэкенд и база данных для GPS MMORPG в стиле Mystery Hike: геолокация, игровые объекты, маршруты, статистика. Neo4j, данные MH.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'ИС для бесконечных крестиков-ноликов',
          description:
            'Платформа для запуска пользовательских программ-ботов на бесконечном поле крестиков-ноликов: хранение решений, логов запусков, состояния поля и статистики. MongoDB, синтетические данные.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Веб-приложение для дыхательных упражнений',
          description:
            'Каталог дыхательных упражнений с визуализацией фаз, режим выполнения упражнения, профили пользователей, комментарии, отзывы и статистика. ArangoDB.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Каталог персонажей вселенной Властелина колец',
          description:
            'Граф-база данных по всем персонажам, предметам, эпохам и локациям вселенной ВК: поиск, аналитика, агрегация данных. Neo4j.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'Построитель маршрутов для раскраски карты города',
          description:
            'Веб-приложение на базе данных OSM и растровой карты закраски: построение оптимальных маршрутов для закраски максимальной площади минимальным числом шагов (в стиле GPS MMORPG). Neo4j.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.create({
        data: {
          id: randomUUID(),
          title: 'ИС для симуляции уборки снега',
          description:
            'Приложение с картой OSM Санкт-Петербурга: задание стоянок техники, снегоплавильных полигонов и СТО, расчёт оптимальных маршрутов с учётом пробок и ресурса техники, хранение результатов моделирования. Neo4j.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
    ]);

    this.logger.log(
      'Projects prepared: 12 for course "Основы промышленной разработки ПО" and 15 for course "Введение в нереляционные базы данных".',
    );

    return { courseOneProjects, courseTwoProjects };
  }

  private async seedTeams(
    tx: Prisma.TransactionClient,
    students: { id: string }[],
    courses: { courseOne: { id: string }; courseTwo: { id: string } },
    projects: {
      courseOneProjects: { id: string }[];
      courseTwoProjects: { id: string }[];
    },
  ) {
    const [teamOne, teamTwo, teamThree, teamFour, teamFive, teamSix, teamSeven] = await Promise.all(
      [
        tx.team.create({
          data: {
            id: randomUUID(),
            courseId: courses.courseOne.id,
            leaderId: students[0].id,
            projectId: projects.courseOneProjects[0].id,
            status: 'assigned',
          },
        }),
        tx.team.create({
          data: {
            id: randomUUID(),
            courseId: courses.courseOne.id,
            leaderId: students[5].id,
            projectId: projects.courseOneProjects[1].id,
            status: 'assigned',
          },
        }),
        tx.team.create({
          data: {
            id: randomUUID(),
            courseId: courses.courseTwo.id,
            leaderId: students[2].id,
            projectId: projects.courseTwoProjects[0].id,
            status: 'assigned',
          },
        }),
        tx.team.create({
          data: {
            id: randomUUID(),
            courseId: courses.courseTwo.id,
            leaderId: students[10].id,
            projectId: projects.courseTwoProjects[1].id,
            status: 'assigned',
          },
        }),
        tx.team.create({
          data: {
            id: randomUUID(),
            courseId: courses.courseOne.id,
            leaderId: students[10].id,
            status: 'forming',
          },
        }),
        tx.team.create({
          data: {
            id: randomUUID(),
            courseId: courses.courseTwo.id,
            leaderId: students[1].id,
            status: 'forming',
          },
        }),
        tx.team.create({
          data: {
            id: randomUUID(),
            courseId: courses.courseTwo.id,
            leaderId: students[7].id,
            status: 'forming',
          },
        }),
      ],
    );

    await tx.teamMember.createMany({
      data: [
        // Команда 1
        { id: randomUUID(), teamId: teamOne.id, userId: students[0].id },
        { id: randomUUID(), teamId: teamOne.id, userId: students[1].id },
        { id: randomUUID(), teamId: teamOne.id, userId: students[2].id },
        { id: randomUUID(), teamId: teamOne.id, userId: students[3].id },
        { id: randomUUID(), teamId: teamOne.id, userId: students[4].id },
        // Команда 2
        { id: randomUUID(), teamId: teamTwo.id, userId: students[5].id },
        { id: randomUUID(), teamId: teamTwo.id, userId: students[6].id },
        { id: randomUUID(), teamId: teamTwo.id, userId: students[7].id },
        { id: randomUUID(), teamId: teamTwo.id, userId: students[8].id },
        { id: randomUUID(), teamId: teamTwo.id, userId: students[9].id },
        // Команда 3
        { id: randomUUID(), teamId: teamThree.id, userId: students[2].id },
        { id: randomUUID(), teamId: teamThree.id, userId: students[4].id },
        { id: randomUUID(), teamId: teamThree.id, userId: students[6].id },
        { id: randomUUID(), teamId: teamThree.id, userId: students[8].id },
        // Команда 4
        { id: randomUUID(), teamId: teamFour.id, userId: students[10].id },
        { id: randomUUID(), teamId: teamFour.id, userId: students[11].id },
        { id: randomUUID(), teamId: teamFour.id, userId: students[12].id },
        // Команда 5
        { id: randomUUID(), teamId: teamFive.id, userId: students[10].id },
        { id: randomUUID(), teamId: teamFive.id, userId: students[11].id },
        { id: randomUUID(), teamId: teamFive.id, userId: students[12].id },
        { id: randomUUID(), teamId: teamFive.id, userId: students[13].id },
        // Команда 6
        { id: randomUUID(), teamId: teamSix.id, userId: students[1].id },
        { id: randomUUID(), teamId: teamSix.id, userId: students[3].id },
        { id: randomUUID(), teamId: teamSix.id, userId: students[5].id },
        // Команда 7
        { id: randomUUID(), teamId: teamSeven.id, userId: students[7].id },
      ],
    });

    await tx.teamInvitation.createMany({
      data: [
        {
          id: randomUUID(),
          teamId: teamThree.id,
          inviteeId: students[14].id,
          invitedBy: students[2].id,
          status: 'pending',
        },
      ],
    });

    await tx.assignment.createMany({
      data: [
        {
          id: randomUUID(),
          teamId: teamOne.id,
          projectId: projects.courseOneProjects[0].id,
          status: 'active',
        },
        {
          id: randomUUID(),
          teamId: teamTwo.id,
          projectId: projects.courseOneProjects[1].id,
          status: 'active',
        },
        {
          id: randomUUID(),
          teamId: teamThree.id,
          projectId: projects.courseTwoProjects[0].id,
          status: 'active',
        },
        {
          id: randomUUID(),
          teamId: teamFour.id,
          projectId: projects.courseTwoProjects[1].id,
          status: 'active',
        },
      ],
    });

    this.logger.log('Teams prepared.');
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('MySQL соединение закрыто.');
    } catch (error) {
      this.logger.error('Ошибка при закрытии соединения БД:', error);
      throw error;
    }
  }
}
