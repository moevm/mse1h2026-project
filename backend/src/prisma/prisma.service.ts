import { randomUUID } from 'node:crypto';

import { PrismaClient } from '@/generated/prisma/client';
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

    const users = await this.seedUsers();
    const courses = await this.seedCourses(users.teacherAdmin);
    await this.seedProjects(courses, users.teacherAdmin);
    await this.seedTeams(users, courses);
  }

  private async seedUsers() {
    const [mainAdmin, teacherAdmin, studentOne, studentTwo, studentThree, studentFour] =
      await Promise.all([
        this.user.upsert({
          where: { ldapUid: 'seed_admin_main' },
          update: {},
          create: {
            id: randomUUID(),
            ldapUid: 'seed_admin_main',
            email: 'admin.main@example.ru',
            firstName: 'Main',
            lastName: 'Admin',
            groupNumber: 0,
            role: 'admin',
            password: 'admin123',
          },
        }),
        this.user.upsert({
          where: { ldapUid: 'seed_admin_teacher' },
          update: {},
          create: {
            id: randomUUID(),
            ldapUid: 'seed_admin_teacher',
            email: 'teacher.admin@example.ru',
            firstName: 'Teacher',
            lastName: 'Admin',
            groupNumber: 0,
            role: 'admin',
            password: 'teacher123',
          },
        }),
        this.user.upsert({
          where: { ldapUid: 'seed_student_1' },
          update: {},
          create: {
            id: randomUUID(),
            ldapUid: 'seed_student_1',
            email: 'student1@example.ru',
            firstName: 'Student',
            lastName: 'One',
            groupNumber: 2410,
            role: 'student',
            password: 'student123',
          },
        }),
        this.user.upsert({
          where: { ldapUid: 'seed_student_2' },
          update: {},
          create: {
            id: randomUUID(),
            ldapUid: 'seed_student_2',
            email: 'student2@example.ru',
            firstName: 'Student',
            lastName: 'Two',
            groupNumber: 2410,
            role: 'student',
            password: 'student123',
          },
        }),
        this.user.upsert({
          where: { ldapUid: 'seed_student_3' },
          update: {},
          create: {
            id: randomUUID(),
            ldapUid: 'seed_student_3',
            email: 'student3@example.ru',
            firstName: 'Student',
            lastName: 'Three',
            groupNumber: 2411,
            role: 'student',
            password: 'student123',
          },
        }),
        this.user.upsert({
          where: { ldapUid: 'seed_student_4' },
          update: {},
          create: {
            id: randomUUID(),
            ldapUid: 'seed_student_4',
            email: 'student4@example.ru',
            firstName: 'Student',
            lastName: 'Four',
            groupNumber: 2411,
            role: 'student',
            password: 'student123',
          },
        }),
      ]);

    this.logger.log(`Users prepared: ${mainAdmin.email}, ${teacherAdmin.email}, 4 students.`);

    return { mainAdmin, teacherAdmin, studentOne, studentTwo, studentThree, studentFour };
  }

  private async seedCourses(teacherAdmin: { id: string }) {
    const [courseOne, courseTwo] = await Promise.all([
      this.course.upsert({
        where: { id: randomUUID() },
        update: {},
        create: {
          id: randomUUID(),
          name: 'Software Engineering',
          maxTeamSize: 5,
          minTeamSize: 3,
          isActive: true,
          teacherId: teacherAdmin.id,
        },
      }),
      this.course.upsert({
        where: { id: randomUUID() },
        update: {},
        create: {
          id: randomUUID(),
          name: 'NoSQL Databases',
          maxTeamSize: 3,
          minTeamSize: 2,
          isActive: true,
          teacherId: teacherAdmin.id,
        },
      }),
    ]);

    this.logger.log(`Courses prepared: ${courseOne.name}, ${courseTwo.name}.`);
    return { courseOne, courseTwo };
  }

  private async seedProjects(
    courses: { courseOne: { id: string }; courseTwo: { id: string } },
    teacherAdmin: { id: string },
  ) {
    await Promise.all([
      this.project.create({
        data: {
          id: randomUUID(),
          title: 'PR Review Assistant',
          description: 'Build a helper that validates student pull requests.',
          courseId: courses.courseOne.id,
          teacherId: teacherAdmin.id,
        },
      }),
      this.project.create({
        data: {
          id: randomUUID(),
          title: 'Ripes Device Extension',
          description: 'Add new IO devices in Ripes.',
          courseId: courses.courseOne.id,
          teacherId: teacherAdmin.id,
        },
      }),
      this.project.create({
        data: {
          id: randomUUID(),
          title: 'Actors Database',
          description: 'Create a searchable actor profile catalog.',
          courseId: courses.courseTwo.id,
          teacherId: teacherAdmin.id,
        },
      }),
    ]);

    this.logger.log('Projects prepared: 3 projects.');
  }

  private async seedTeams(
    users: {
      studentOne: { id: string };
      studentTwo: { id: string };
      studentThree: { id: string };
      studentFour: { id: string };
    },
    courses: { courseOne: { id: string }; courseTwo: { id: string } },
  ) {
    const teamOne = await this.team.create({
      data: {
        id: randomUUID(),
        courseId: courses.courseOne.id,
        leaderId: users.studentOne.id,
        status: 'forming',
      },
    });

    await this.teamMember.create({
      data: {
        id: randomUUID(),
        teamId: teamOne.id,
        userId: users.studentOne.id,
      },
    });

    await this.teamMember.create({
      data: {
        id: randomUUID(),
        teamId: teamOne.id,
        userId: users.studentTwo.id,
      },
    });

    await this.teamInvitation.create({
      data: {
        id: randomUUID(),
        teamId: teamOne.id,
        inviteeId: users.studentThree.id,
        invitedBy: users.studentOne.id,
        status: 'pending',
      },
    });

    const teamTwo = await this.team.create({
      data: {
        id: randomUUID(),
        courseId: courses.courseTwo.id,
        leaderId: users.studentFour.id,
        status: 'forming',
      },
    });

    await this.teamMember.create({
      data: {
        id: randomUUID(),
        teamId: teamTwo.id,
        userId: users.studentFour.id,
      },
    });

    this.logger.log('Teams prepared: 2 teams.');
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
