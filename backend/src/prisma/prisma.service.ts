import { PrismaClient } from '@/generated/prisma/client';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaMariaDb({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
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
      this.logger.log('MySQL подключение успешно');
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
          update: {
            email: 'admin.main@example.ru',
            firstName: 'Main',
            secondName: 'Admin',
            groupNumber: 0,
            role: 'admin',
            password: 'admin123',
          },
          create: {
            ldapUid: 'seed_admin_main',
            email: 'admin.main@example.ru',
            firstName: 'Main',
            secondName: 'Admin',
            groupNumber: 0,
            role: 'admin',
            password: 'admin123',
          },
        }),
        this.user.upsert({
          where: { ldapUid: 'seed_admin_teacher' },
          update: {
            email: 'teacher.admin@example.ru',
            firstName: 'Teacher',
            secondName: 'Admin',
            groupNumber: 0,
            role: 'admin',
            password: 'teacher123',
          },
          create: {
            ldapUid: 'seed_admin_teacher',
            email: 'teacher.admin@example.ru',
            firstName: 'Teacher',
            secondName: 'Admin',
            groupNumber: 0,
            role: 'admin',
            password: 'teacher123',
          },
        }),
        this.user.upsert({
          where: { ldapUid: 'seed_student_1' },
          update: {
            email: 'student1@example.ru',
            firstName: 'Student',
            secondName: 'One',
            groupNumber: 2410,
            role: 'student',
            password: 'student123',
          },
          create: {
            ldapUid: 'seed_student_1',
            email: 'student1@example.ru',
            firstName: 'Student',
            secondName: 'One',
            groupNumber: 2410,
            role: 'student',
            password: 'student123',
          },
        }),
        this.user.upsert({
          where: { ldapUid: 'seed_student_2' },
          update: {
            email: 'student2@example.ru',
            firstName: 'Student',
            secondName: 'Two',
            groupNumber: 2410,
            role: 'student',
            password: 'student123',
          },
          create: {
            ldapUid: 'seed_student_2',
            email: 'student2@example.ru',
            firstName: 'Student',
            secondName: 'Two',
            groupNumber: 2410,
            role: 'student',
            password: 'student123',
          },
        }),
        this.user.upsert({
          where: { ldapUid: 'seed_student_3' },
          update: {
            email: 'student3@example.ru',
            firstName: 'Student',
            secondName: 'Three',
            groupNumber: 2411,
            role: 'student',
            password: 'student123',
          },
          create: {
            ldapUid: 'seed_student_3',
            email: 'student3@example.ru',
            firstName: 'Student',
            secondName: 'Three',
            groupNumber: 2411,
            role: 'student',
            password: 'student123',
          },
        }),
        this.user.upsert({
          where: { ldapUid: 'seed_student_4' },
          update: {
            email: 'student4@example.ru',
            firstName: 'Student',
            secondName: 'Four',
            groupNumber: 2411,
            role: 'student',
            password: 'student123',
          },
          create: {
            ldapUid: 'seed_student_4',
            email: 'student4@example.ru',
            firstName: 'Student',
            secondName: 'Four',
            groupNumber: 2411,
            role: 'student',
            password: 'student123',
          },
        }),
      ]);

    this.logger.log(`Users prepared: ${mainAdmin.email}, ${teacherAdmin.email}, 4 students.`);

    return {
      mainAdmin,
      teacherAdmin,
      studentOne,
      studentTwo,
      studentThree,
      studentFour,
    };
  }

  private async seedCourses(teacherAdmin: { id: string }) {
    const [courseOne, courseTwo] = await Promise.all([
      this.course.upsert({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        update: {
          name: 'Software Engineering',
          maxTeamSize: 5,
          minTeamSize: 3,
          isActive: true,
          teacherId: teacherAdmin.id,
        },
        create: {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Software Engineering',
          maxTeamSize: 5,
          minTeamSize: 3,
          isActive: true,
          teacherId: teacherAdmin.id,
        },
      }),
      this.course.upsert({
        where: { id: '00000000-0000-0000-0000-000000000002' },
        update: {
          name: 'NoSQL Databases',
          maxTeamSize: 3,
          minTeamSize: 2,
          isActive: true,
          teacherId: teacherAdmin.id,
        },
        create: {
          id: '00000000-0000-0000-0000-000000000002',
          name: 'NoSQL Databases',
          maxTeamSize: 3,
          minTeamSize: 2,
          isActive: true,
          teacherId: teacherAdmin.id,
        },
      }),
    ]);

    this.logger.log(`Courses prepared: ${courseOne.name}, ${courseTwo.name}.`);

    return {
      courseOne,
      courseTwo,
    };
  }

  private async seedProjects(
    courses: { courseOne: { id: string }; courseTwo: { id: string } },
    teacherAdmin: { id: string },
  ) {
    await Promise.all([
      this.project.upsert({
        where: { id: '00000000-0000-0000-0000-000000000011' },
        update: {
          title: 'PR Review Assistant',
          description: 'Build a helper that validates student pull requests.',
          courseId: courses.courseOne.id,
          teacherId: teacherAdmin.id,
        },
        create: {
          id: '00000000-0000-0000-0000-000000000011',
          title: 'PR Review Assistant',
          description: 'Build a helper that validates student pull requests.',
          courseId: courses.courseOne.id,
          teacherId: teacherAdmin.id,
        },
      }),
      this.project.upsert({
        where: { id: '00000000-0000-0000-0000-000000000012' },
        update: {
          title: 'Ripes Device Extension',
          description: 'Add new IO devices in Ripes.',
          courseId: courses.courseOne.id,
          teacherId: teacherAdmin.id,
        },
        create: {
          id: '00000000-0000-0000-0000-000000000012',
          title: 'Ripes Device Extension',
          description: 'Add new IO devices in Ripes.',
          courseId: courses.courseOne.id,
          teacherId: teacherAdmin.id,
        },
      }),
      this.project.upsert({
        where: { id: '00000000-0000-0000-0000-000000000021' },
        update: {
          title: 'Actors Database',
          description: 'Create a searchable actor profile catalog.',
          courseId: courses.courseTwo.id,
          teacherId: teacherAdmin.id,
        },
        create: {
          id: '00000000-0000-0000-0000-000000000021',
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
    const teamOne = await this.team.upsert({
      where: { id: '00000000-0000-0000-0000-000000000101' },
      update: {
        courseId: courses.courseOne.id,
        leaderId: users.studentOne.id,
        status: 'forming',
      },
      create: {
        id: '00000000-0000-0000-0000-000000000101',
        courseId: courses.courseOne.id,
        leaderId: users.studentOne.id,
        status: 'forming',
      },
    });

    await this.teamMember.upsert({
      where: { id: '00000000-0000-0000-0000-000000000201' },
      update: {
        teamId: teamOne.id,
        userId: users.studentOne.id,
      },
      create: {
        id: '00000000-0000-0000-0000-000000000201',
        teamId: teamOne.id,
        userId: users.studentOne.id,
      },
    });

    await this.teamMember.upsert({
      where: { id: '00000000-0000-0000-0000-000000000202' },
      update: {
        teamId: teamOne.id,
        userId: users.studentTwo.id,
      },
      create: {
        id: '00000000-0000-0000-0000-000000000202',
        teamId: teamOne.id,
        userId: users.studentTwo.id,
      },
    });

    await this.teamInvitation.upsert({
      where: { id: '00000000-0000-0000-0000-000000000301' },
      update: {
        teamId: teamOne.id,
        inviteeId: users.studentThree.id,
        invitedBy: users.studentOne.id,
        status: 'pending',
        respondedAt: null,
      },
      create: {
        id: '00000000-0000-0000-0000-000000000301',
        teamId: teamOne.id,
        inviteeId: users.studentThree.id,
        invitedBy: users.studentOne.id,
        status: 'pending',
      },
    });

    const teamTwo = await this.team.upsert({
      where: { id: '00000000-0000-0000-0000-000000000102' },
      update: {
        courseId: courses.courseTwo.id,
        leaderId: users.studentFour.id,
        status: 'forming',
      },
      create: {
        id: '00000000-0000-0000-0000-000000000102',
        courseId: courses.courseTwo.id,
        leaderId: users.studentFour.id,
        status: 'forming',
      },
    });

    await this.teamMember.upsert({
      where: { id: '00000000-0000-0000-0000-000000000203' },
      update: {
        teamId: teamTwo.id,
        userId: users.studentFour.id,
      },
      create: {
        id: '00000000-0000-0000-0000-000000000203',
        teamId: teamTwo.id,
        userId: users.studentFour.id,
      },
    });

    this.logger.log('Teams prepared: 2 teams.');
  }
}
