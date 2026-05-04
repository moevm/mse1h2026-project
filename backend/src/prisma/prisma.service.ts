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
        await this.seedProjects(tx, courses, users.teacherOne, users.teacherTwo);
        await this.seedTeams(tx, users.students, courses);
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
        secondName: 'Student1',
        group: 2410,
      },
      {
        uid: 'seed_student_2',
        email: 'student2@example.ru',
        firstName: 'Student2',
        secondName: 'Student2',
        group: 2410,
      },
      {
        uid: 'seed_student_3',
        email: 'student3@example.ru',
        firstName: 'Student3',
        secondName: 'Student3',
        group: 2410,
      },
      {
        uid: 'seed_student_4',
        email: 'student4@example.ru',
        firstName: 'Student4',
        secondName: 'Student4',
        group: 2410,
      },
      {
        uid: 'seed_student_5',
        email: 'student5@example.ru',
        firstName: 'Student5',
        secondName: 'Student5',
        group: 2410,
      },
      {
        uid: 'seed_student_6',
        email: 'student6@example.ru',
        firstName: 'Student6',
        secondName: 'Student6',
        group: 2411,
      },
      {
        uid: 'seed_student_7',
        email: 'student7@example.ru',
        firstName: 'Student7',
        secondName: 'Student7',
        group: 2411,
      },
      {
        uid: 'seed_student_8',
        email: 'student8@example.ru',
        firstName: 'Student8',
        secondName: 'Student8',
        group: 2411,
      },
      {
        uid: 'seed_student_9',
        email: 'student9@example.ru',
        firstName: 'Student9',
        secondName: 'Student9',
        group: 2411,
      },
      {
        uid: 'seed_student_10',
        email: 'student10@example.ru',
        firstName: 'Student10',
        secondName: 'Student10',
        group: 2411,
      },
      {
        uid: 'seed_student_11',
        email: 'student11@example.ru',
        firstName: 'Student11',
        secondName: 'Student11',
        group: 2412,
      },
      {
        uid: 'seed_student_12',
        email: 'student12@example.ru',
        firstName: 'Student12',
        secondName: 'Student12',
        group: 2412,
      },
      {
        uid: 'seed_student_13',
        email: 'student13@example.ru',
        firstName: 'Student13',
        secondName: 'Student13',
        group: 2412,
      },
      {
        uid: 'seed_student_14',
        email: 'student14@example.ru',
        firstName: 'Student14',
        secondName: 'Student14',
        group: 2412,
      },
      {
        uid: 'seed_student_15',
        email: 'student15@example.ru',
        firstName: 'Student15',
        secondName: 'Student15',
        group: 2412,
      },
    ];

    await tx.user.createMany({
      data: [
        {
          ldapUid: 'seed_admin_main',
          email: 'admin.main@example.ru',
          firstName: 'Admin',
          secondName: 'Admin',
          groupNumber: 0,
          role: 'admin',
          password: 'admin123',
        },
        {
          ldapUid: 'seed_admin_teacher_1',
          email: 'teacher1@example.ru',
          firstName: 'Teacher1',
          secondName: 'Teacher1',
          groupNumber: 0,
          role: 'admin',
          password: 'teacher123',
        },
        {
          ldapUid: 'seed_teacher_2',
          email: 'teacher2@example.ru',
          firstName: 'Teacher2',
          secondName: 'Teacher2',
          groupNumber: 0,
          role: 'admin',
          password: 'teacher123',
        },
        ...studentDefs.map((s) => ({
          ldapUid: s.uid,
          email: s.email,
          firstName: s.firstName,
          secondName: s.secondName,
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
    const [courseOne, courseTwo] = await Promise.all([
      tx.course.upsert({
        where: { id: 'course_1' },
        update: {
          name: 'Основы промышленной разработки ПО',
          maxTeamSize: 5,
          minTeamSize: 3,
          isActive: true,
          teacherId: teacherOne.id,
        },
        create: {
          id: 'course_1',
          name: 'Основы промышленной разработки ПО',
          maxTeamSize: 5,
          minTeamSize: 3,
          isActive: true,
          teacherId: teacherOne.id,
        },
      }),
      tx.course.upsert({
        where: { id: 'course_2' },
        update: {
          name: 'Введение в нереляционные базы данных',
          maxTeamSize: 4,
          minTeamSize: 2,
          isActive: true,
          teacherId: teacherTwo.id,
        },
        create: {
          id: 'course_2',
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
    await Promise.all([
      // Основы промышленной разработки ПО
      tx.project.upsert({
        where: { id: 'project_1' },
        update: {
          title: 'Помощник преподавателя на лабах',
          description:
            "Инструмент для анализа pull-request'ов с кодом на Си/Python и генерации отчeтов о проблемах: плохие практики, неопределeнное поведение, магические константы. Технологии: Python, Docker, OCLint/Pylint.",
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
        create: {
          id: 'project_1',
          title: 'Помощник преподавателя на лабах',
          description:
            "Инструмент для анализа pull-request'ов с кодом на Си/Python и генерации отчeтов о проблемах: плохие практики, неопределeнное поведение, магические константы. Технологии: Python, Docker, OCLint/Pylint.",
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      tx.project.upsert({
        where: { id: 'project_2' },
        update: {
          title: 'Новые периферийные устройства в RIPES',
          description:
            'Добавление новых IO-устройств в симулятор RIPES для учебных курсов по архитектуре ЭВМ.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
        create: {
          id: 'project_2',
          title: 'Новые периферийные устройства в RIPES',
          description:
            'Добавление новых IO-устройств в симулятор RIPES для учебных курсов по архитектуре ЭВМ.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      tx.project.upsert({
        where: { id: 'project_3' },
        update: {
          title: 'Генератор лабораторных по программированию',
          description:
            'Генерация персонализированных заданий для 7 лабораторных работ с воспроизводимыми параметрами на основе ФИО студента. Интеграция в курс на e.moevm.info через CodeRunner и Moodle.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
        create: {
          id: 'project_3',
          title: 'Генератор лабораторных по программированию',
          description:
            'Генерация персонализированных заданий для 7 лабораторных работ с воспроизводимыми параметрами на основе ФИО студента. Интеграция в курс на e.moevm.info через CodeRunner и Moodle.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      tx.project.upsert({
        where: { id: 'project_4' },
        update: {
          title: 'Автоматизация деплоя self-hosted таблиц',
          description:
            'Набор скриптов для развeртывания и управления Grist на кафедре: автоматизация деплоя, управления пользователями, резервных копий и мониторинга. Технологии: Python, Docker Compose.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
        create: {
          id: 'project_4',
          title: 'Автоматизация деплоя self-hosted таблиц',
          description:
            'Набор скриптов для развeртывания и управления Grist на кафедре: автоматизация деплоя, управления пользователями, резервных копий и мониторинга. Технологии: Python, Docker Compose.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      tx.project.upsert({
        where: { id: 'project_5' },
        update: {
          title: 'Замена coderunner на judge0',
          description:
            'Прототип системы для использования judge0 вместо coderunner в Moodle с автоматизированным развeртыванием контейнеров и портированием задач. Технологии: Python, CodeRunner, Moodle.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
        create: {
          id: 'project_5',
          title: 'Замена coderunner на judge0',
          description:
            'Прототип системы для использования judge0 вместо coderunner в Moodle с автоматизированным развeртыванием контейнеров и портированием задач. Технологии: Python, CodeRunner, Moodle.',
          courseId: courses.courseOne.id,
          teacherId: teacherOne.id,
        },
      }),
      // Введение в нереляционные базы данных
      tx.project.upsert({
        where: { id: 'project_6' },
        update: {
          title: 'ИС для театральных декораций',
          description:
            'Веб-приложение для хранения, поиска и редактирования информации о театральных декорациях с учeтом их специфики. MongoDB, синтетические данные.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
        create: {
          id: 'project_6',
          title: 'ИС для театральных декораций',
          description:
            'Веб-приложение для хранения, поиска и редактирования информации о театральных декорациях с учeтом их специфики. MongoDB, синтетические данные.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.upsert({
        where: { id: 'project_7' },
        update: {
          title: 'БД актeров',
          description:
            'Каталог профилей актeров с расширенной информацией, полнотекстовым поиском и редактированием. MongoDB, синтетические данные.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
        create: {
          id: 'project_7',
          title: 'БД актeров',
          description:
            'Каталог профилей актeров с расширенной информацией, полнотекстовым поиском и редактированием. MongoDB, синтетические данные.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.upsert({
        where: { id: 'project_8' },
        update: {
          title: 'ИС для ателье',
          description:
            'Веб-приложение для ателье с ролями заказчиков, работников и руководства: создание заказов, трекинг выполнения, промежуточные данные, статистика и финансы. MongoDB.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
        create: {
          id: 'project_8',
          title: 'ИС для ателье',
          description:
            'Веб-приложение для ателье с ролями заказчиков, работников и руководства: создание заказов, трекинг выполнения, промежуточные данные, статистика и финансы. MongoDB.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.upsert({
        where: { id: 'project_9' },
        update: {
          title: 'Хранилище изображений с CRUD',
          description:
            'REST-приложение для CRUD изображений с поиском по метаданным, датам и содержимому изображения. Хранение всех логов. MongoDB, синтетические данные.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
        create: {
          id: 'project_9',
          title: 'Хранилище изображений с CRUD',
          description:
            'REST-приложение для CRUD изображений с поиском по метаданным, датам и содержимому изображения. Хранение всех логов. MongoDB, синтетические данные.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
      tx.project.upsert({
        where: { id: 'project_10' },
        update: {
          title: 'БД биометрии СКУД для университета',
          description:
            'Веб-приложение для хранения биометрических данных (голос, лица, логи, доступы), контроля доступа и логирования событий СКУД университета. MongoDB, синтетические данные.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
        create: {
          id: 'project_10',
          title: 'БД биометрии СКУД для университета',
          description:
            'Веб-приложение для хранения биометрических данных (голос, лица, логи, доступы), контроля доступа и логирования событий СКУД университета. MongoDB, синтетические данные.',
          courseId: courses.courseTwo.id,
          teacherId: teacherTwo.id,
        },
      }),
    ]);

    this.logger.log(
      'Projects prepared: 5 for course "Основы промышленной разработки ПО" and 5 for course "Введение в нереляционные базы данных".',
    );
  }

  private async seedTeams(
    tx: Prisma.TransactionClient,
    students: { id: string }[],
    courses: { courseOne: { id: string }; courseTwo: { id: string } },
  ) {
    const [teamOne, teamTwo, teamThree, teamFour] = await Promise.all([
      // Основы промышленной разработки ПО
      tx.team.upsert({
        where: { id: 'team_1' },
        update: { courseId: courses.courseOne.id, leaderId: students[0].id, status: 'forming' },
        create: {
          id: 'team_1',
          courseId: courses.courseOne.id,
          leaderId: students[0].id,
          status: 'forming',
        },
      }),
      tx.team.upsert({
        where: { id: 'team_2' },
        update: { courseId: courses.courseOne.id, leaderId: students[5].id, status: 'forming' },
        create: {
          id: 'team_2',
          courseId: courses.courseOne.id,
          leaderId: students[5].id,
          status: 'forming',
        },
      }),
      // Введение в нереляционные базы данных
      tx.team.upsert({
        where: { id: 'team_3' },
        update: { courseId: courses.courseTwo.id, leaderId: students[2].id, status: 'forming' },
        create: {
          id: 'team_3',
          courseId: courses.courseTwo.id,
          leaderId: students[2].id,
          status: 'forming',
        },
      }),
      tx.team.upsert({
        where: { id: 'team_4' },
        update: { courseId: courses.courseTwo.id, leaderId: students[10].id, status: 'forming' },
        create: {
          id: 'team_4',
          courseId: courses.courseTwo.id,
          leaderId: students[10].id,
          status: 'forming',
        },
      }),
    ]);

    const members = [
      // Команда 1
      { id: 'member_1', teamId: teamOne.id, userId: students[0].id },
      { id: 'member_2', teamId: teamOne.id, userId: students[1].id },
      { id: 'member_3', teamId: teamOne.id, userId: students[2].id },
      { id: 'member_4', teamId: teamOne.id, userId: students[3].id },
      { id: 'member_5', teamId: teamOne.id, userId: students[4].id },
      // Команда 2
      { id: 'member_6', teamId: teamTwo.id, userId: students[5].id },
      { id: 'member_7', teamId: teamTwo.id, userId: students[6].id },
      { id: 'member_8', teamId: teamTwo.id, userId: students[7].id },
      { id: 'member_9', teamId: teamTwo.id, userId: students[8].id },
      { id: 'member_10', teamId: teamTwo.id, userId: students[9].id },
      // Команда 3
      { id: 'member_11', teamId: teamThree.id, userId: students[2].id },
      { id: 'member_12', teamId: teamThree.id, userId: students[4].id },
      { id: 'member_13', teamId: teamThree.id, userId: students[6].id },
      { id: 'member_14', teamId: teamThree.id, userId: students[8].id },
      // Клманда 4
      { id: 'member_15', teamId: teamFour.id, userId: students[10].id },
      { id: 'member_16', teamId: teamFour.id, userId: students[11].id },
      { id: 'member_17', teamId: teamFour.id, userId: students[12].id },
    ];

    await Promise.all(
      members.map((m) =>
        tx.teamMember.upsert({
          where: { id: m.id },
          update: { teamId: m.teamId, userId: m.userId },
          create: { id: m.id, teamId: m.teamId, userId: m.userId },
        }),
      ),
    );

    await Promise.all([
      tx.teamInvitation.upsert({
        where: { id: 'team_invitation_1' },
        update: {
          teamId: teamOne.id,
          inviteeId: students[13].id,
          invitedBy: students[0].id,
          status: 'pending',
          respondedAt: null,
        },
        create: {
          id: 'team_invitation_1',
          teamId: teamOne.id,
          inviteeId: students[13].id,
          invitedBy: students[0].id,
          status: 'pending',
        },
      }),
      tx.teamInvitation.upsert({
        where: { id: 'team_invitation_2' },
        update: {
          teamId: teamThree.id,
          inviteeId: students[14].id,
          invitedBy: students[2].id,
          status: 'pending',
          respondedAt: null,
        },
        create: {
          id: 'team_invitation_2',
          teamId: teamThree.id,
          inviteeId: students[14].id,
          invitedBy: students[2].id,
          status: 'pending',
        },
      }),
    ]);

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
