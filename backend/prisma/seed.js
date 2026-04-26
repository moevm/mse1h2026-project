const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

function loadPrismaClient() {
  const candidates = [
    '../src/generated/prisma/client',
    '../dist/generated/prisma/client',
    '@prisma/client',
  ];

  for (const candidate of candidates) {
    try {
      const mod = require(candidate);
      if (mod && mod.PrismaClient) {
        return mod.PrismaClient;
      }
    } catch {}
  }

  throw new Error('PrismaClient module not found in src/dist/@prisma paths');
}

const PrismaClient = loadPrismaClient();

async function main() {
  const adapter = new PrismaMariaDb({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const prisma = new PrismaClient({ adapter });

  const [mainAdmin, teacherAdmin, studentOne, studentTwo, studentThree, studentFour] =
    await Promise.all([
      prisma.user.upsert({
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
      prisma.user.upsert({
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
      prisma.user.upsert({
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
      prisma.user.upsert({
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
      prisma.user.upsert({
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
      prisma.user.upsert({
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

  console.log(`Users prepared: ${mainAdmin.email}, ${teacherAdmin.email}, 4 students`);

  const [courseOne, courseTwo] = await Promise.all([
    prisma.course.upsert({
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
    prisma.course.upsert({
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

  await Promise.all([
    prisma.project.upsert({
      where: { id: '00000000-0000-0000-0000-000000000011' },
      update: {
        title: 'PR Review Assistant',
        description: 'Build a helper that validates student pull requests.',
        courseId: courseOne.id,
        teacherId: teacherAdmin.id,
      },
      create: {
        id: '00000000-0000-0000-0000-000000000011',
        title: 'PR Review Assistant',
        description: 'Build a helper that validates student pull requests.',
        courseId: courseOne.id,
        teacherId: teacherAdmin.id,
      },
    }),
    prisma.project.upsert({
      where: { id: '00000000-0000-0000-0000-000000000012' },
      update: {
        title: 'Ripes Device Extension',
        description: 'Add new IO devices in Ripes.',
        courseId: courseOne.id,
        teacherId: teacherAdmin.id,
      },
      create: {
        id: '00000000-0000-0000-0000-000000000012',
        title: 'Ripes Device Extension',
        description: 'Add new IO devices in Ripes.',
        courseId: courseOne.id,
        teacherId: teacherAdmin.id,
      },
    }),
    prisma.project.upsert({
      where: { id: '00000000-0000-0000-0000-000000000021' },
      update: {
        title: 'Actors Database',
        description: 'Create a searchable actor profile catalog.',
        courseId: courseTwo.id,
        teacherId: teacherAdmin.id,
      },
      create: {
        id: '00000000-0000-0000-0000-000000000021',
        title: 'Actors Database',
        description: 'Create a searchable actor profile catalog.',
        courseId: courseTwo.id,
        teacherId: teacherAdmin.id,
      },
    }),
  ]);

  const teamOne = await prisma.team.upsert({
    where: { id: '00000000-0000-0000-0000-000000000101' },
    update: {
      courseId: courseOne.id,
      leaderId: studentOne.id,
      status: 'forming',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000101',
      courseId: courseOne.id,
      leaderId: studentOne.id,
      status: 'forming',
    },
  });

  await prisma.teamMember.upsert({
    where: { id: '00000000-0000-0000-0000-000000000201' },
    update: {
      teamId: teamOne.id,
      userId: studentOne.id,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000201',
      teamId: teamOne.id,
      userId: studentOne.id,
    },
  });

  await prisma.teamMember.upsert({
    where: { id: '00000000-0000-0000-0000-000000000202' },
    update: {
      teamId: teamOne.id,
      userId: studentTwo.id,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000202',
      teamId: teamOne.id,
      userId: studentTwo.id,
    },
  });

  await prisma.teamInvitation.upsert({
    where: { id: '00000000-0000-0000-0000-000000000301' },
    update: {
      teamId: teamOne.id,
      inviteeId: studentThree.id,
      invitedBy: studentOne.id,
      status: 'pending',
      respondedAt: null,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000301',
      teamId: teamOne.id,
      inviteeId: studentThree.id,
      invitedBy: studentOne.id,
      status: 'pending',
    },
  });

  const teamTwo = await prisma.team.upsert({
    where: { id: '00000000-0000-0000-0000-000000000102' },
    update: {
      courseId: courseTwo.id,
      leaderId: studentFour.id,
      status: 'forming',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000102',
      courseId: courseTwo.id,
      leaderId: studentFour.id,
      status: 'forming',
    },
  });

  await prisma.teamMember.upsert({
    where: { id: '00000000-0000-0000-0000-000000000203' },
    update: {
      teamId: teamTwo.id,
      userId: studentFour.id,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000203',
      teamId: teamTwo.id,
      userId: studentFour.id,
    },
  });

  console.log('Seed prepared: users, courses, projects, teams, invitations');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
