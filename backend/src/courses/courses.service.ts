import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

function parseCsv(content: string): string[][] {
  const cleanContent = content.replace(/^\uFEFF/, '');
  return cleanContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const delimiter = line.includes(';') ? ';' : ',';
      return line.split(delimiter).map((cell) => cell.trim());
    });
}

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCourses() {
    return this.prisma.course.findMany({
      include: {
        teacher: true,
        teams: true,
        projects: true,
        exchangeRequests: true,
        imports: true,
      },
    });
  }

  async getCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        teacher: true,
        teams: true,
        projects: true,
        exchangeRequests: true,
        imports: true,
      },
    });
    if (!course) {
      throw new NotFoundException(`Course ${id} not found.`);
    }
    return course;
  }

  async getCourseTeams(courseId: string) {
    return this.prisma.team.findMany({
      where: { courseId },
      include: {
        members: { include: { user: true } },
        project: true,
      },
    });
  }

  async getStudentTeam(courseId: string, userId: string) {
    const membership = await this.prisma.teamMember.findFirst({
      where: { userId, team: { courseId } },
      include: {
        team: {
          include: {
            leader: true,
            members: { include: { user: true } },
            project: true,
            invitations: { where: { status: 'pending' }, select: { id: true, inviteeId: true } },
            assignments: true,
          },
        },
      },
    });
    return membership?.team ?? null;
  }

  async getCourseExchanges(courseId: string) {
    return await this.prisma.exchangeRequest.findMany({
      where: { courseId },
      include: {
        initiatorTeam: { include: { members: { include: { user: true } }, leader: true } },
        targetTeam: { include: { members: { include: { user: true } }, leader: true } },
        initiatorProject: true,
        targetProject: true,
      },
    });
  }

  async createCourse(createCourseDto: CreateCourseDto) {
    return await this.prisma.course.create({
      data: createCourseDto,
    });
  }

  async updateCourse(id: string, updateCourseDto: UpdateCourseDto) {
    try {
      return await this.prisma.course.update({
        where: { id },
        data: updateCourseDto,
      });
    } catch {
      throw new NotFoundException(`Course ${id} not found.`);
    }
  }

  async deleteCourse(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException(`Course ${id} not found.`);

    return this.prisma.$transaction(async (tx) => {
      const teamIds = (
        await tx.team.findMany({ where: { courseId: id }, select: { id: true } })
      ).map((t) => t.id);

      const requestIds = (
        await tx.exchangeRequest.findMany(
          { where: { courseId: id }, select: { id: true } }
        )
      ).map((r) => r.id);

      if (requestIds.length > 0 || teamIds.length > 0) {
        await tx.exchangeConfirmation.deleteMany({
          where: {
            OR: [
              ...(teamIds.length > 0 ? [{ teamId: { in: teamIds } }] : []),
              ...(requestIds.length > 0
                ? [{ exchangeRequestId: { in: requestIds } }]
                : []),
            ],
          },
        });
      }

      if (requestIds.length > 0) {
        await tx.exchangeRequest.deleteMany({ where: { courseId: id } });
      }

      if (teamIds.length > 0) {
        await tx.assignment.deleteMany({ where: { teamId: { in: teamIds } } });
        await tx.teamInvitation.deleteMany({
          where: { teamId: { in: teamIds } },
        });
        await tx.teamMember.deleteMany({ where: { teamId: { in: teamIds } } });
      }
      await tx.team.deleteMany({ where: { courseId: id } });
      await tx.import.deleteMany({ where: { courseId: id } });
      await tx.project.deleteMany({ where: { courseId: id } });
      return tx.course.delete({ where: { id } });
    });
  }

  async importStudents(courseId: string, csvContent: string) {
    const rows = parseCsv(csvContent);
    if (rows.length < 2) throw new BadRequestException('CSV is empty');

    const headers = rows[0].map((h) => h.toLowerCase());
    const dataRows = rows.slice(1);

    const fNameIdx = headers.indexOf('firstname');
    const lNameIdx = headers.indexOf('lastname');
    const emailIdx = headers.indexOf('email');
    const groupIdx = headers.indexOf('groupnumber');
    const ldapIdx = headers.indexOf('ldapuid');

    if (fNameIdx === -1 || emailIdx === -1) {
      throw new BadRequestException('Required headers: firstName, email');
    }

    await this.prisma.$transaction(async (tx) => {
      const teams = await tx.team.findMany({ where: { courseId }, select: { id: true } });
      const teamIds = teams.map((t) => t.id);

      if (teamIds.length > 0) {
        const requests = await tx.exchangeRequest.findMany(
          { where: { courseId }, select: { id: true } }
        );
        const requestIds = requests.map((r) => r.id);

        await tx.exchangeConfirmation.deleteMany({
          where: {
            OR: [
              { teamId: { in: teamIds } },
              ...(requestIds.length > 0
                ? [{ exchangeRequestId: { in: requestIds } }]
                : []),
            ],
          },
        });

        if (requestIds.length > 0) {
          await tx.exchangeRequest.deleteMany({ where: { courseId } });
        }

        await tx.assignment.deleteMany({ where: { teamId: { in: teamIds } } });
        await tx.teamInvitation.deleteMany({
          where: { teamId: { in: teamIds } },
        });
        await tx.teamMember.deleteMany({ where: { teamId: { in: teamIds } } });

        await tx.team.deleteMany({ where: { courseId } });
      }
    });

    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const email = row[emailIdx];
      const ldapUid = ldapIdx !== -1 ? row[ldapIdx] : null;

      if (!email) continue;

      try {
        const existingUser = await this.prisma.user.findFirst({
          where: { OR: [...(ldapUid ? [{ ldapUid }] : []), { email }] },
        });

        const userData = {
          firstName: row[fNameIdx],
          lastName: lNameIdx !== -1 ? row[lNameIdx] : '',
          groupNumber: groupIdx !== -1 ? parseInt(row[groupIdx], 10) : 0,
          ldapUid: ldapUid,
          role: 'student' as const,
        };

        if (existingUser) {
          await this.prisma.user.update({ where: { id: existingUser.id }, data: userData });
        } else {
          await this.prisma.user.create({ data: { ...userData, email, password: null } });
        }
        successCount++;
      } catch (e: any) {
        errors.push(`Row ${i + 2}: ${e.message}`);
      }
    }
    return { success: true, importedRowsCount: successCount, errors };
  }

  async importProjects(courseId: string, csvContent: string) {
    const rows = parseCsv(csvContent);
    if (rows.length < 2) throw new BadRequestException('CSV is empty');

    const headers = rows[0].map((h) => h.toLowerCase());
    const dataRows = rows.slice(1);

    const titleIdx = headers.indexOf('title');
    const descIdx = headers.indexOf('description');
    const teacherEmailIdx = headers.indexOf('teacheremail');

    if (titleIdx === -1 || teacherEmailIdx === -1) {
      throw new BadRequestException('Required headers: title, teacherEmail');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.assignment.deleteMany({
        where: { project: { courseId } },
      });

      await tx.project.deleteMany({
        where: { courseId },
      });
    });

    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const title = row[titleIdx];
      const teacherEmail = row[teacherEmailIdx];

      if (!title || !teacherEmail) continue;

      try {
        const teacher = await this.prisma.user.findFirst({
          where: { email: teacherEmail },
        });

        if (!teacher) {
          errors.push(`Row ${i + 2}: Teacher ${teacherEmail} not found`);
          continue;
        }

        await this.prisma.project.create({
          data: {
            title,
            description: descIdx !== -1 ? row[descIdx] : '',
            courseId,
            teacherId: teacher.id,
          },
        });
        successCount++;
      } catch (e: any) {
        errors.push(`Row ${i + 2}: ${e.message}`);
      }
    }
    return { success: true, importedRowsCount: successCount, errors };
  }

  async exportStudents(courseId: string) {
    const teams = await this.prisma.team.findMany({
      where: { courseId },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    const header = '\uFEFFfirstName;lastName;email;groupNumber;ldapUid\n';

    const usersMap = new Map();
    teams.forEach((team) => {
      team.members.forEach((m) => usersMap.set(m.user.id, m.user));
    });

    const rows = Array.from(usersMap.values())
      .map(
        (user) =>
          `${user.firstName};${user.lastName || ''};${user.email};${user.groupNumber};${user.ldapUid || ''}`,
      )
      .join('\n');

    return header + rows;
  }

  async exportProjects(courseId: string) {
    const projects = await this.prisma.project.findMany({
      where: { courseId },
      include: { teacher: true },
    });

    const header = '\uFEFFtitle;description;teacherEmail\n';
    const rows = projects
      .map((p) => `${p.title};${p.description || ''};${p.teacher.email}`)
      .join('\n');

    return header + rows;
  }
}
