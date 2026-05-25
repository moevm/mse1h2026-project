import { PrismaService } from '@/prisma/prisma.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class CourseTeacherGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const courseId = request.params.courseId || request.params.id;

    if (!user || !courseId) {
      return false;
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    const isOwner = course.teacherId === user.sub;
    const isSuperAdmin = user.email === 'admin.main@example.ru';

    if (!isOwner && !isSuperAdmin) {
      throw new ForbiddenException(
        'You are not the teacher of this course and do not have super-admin rights',
      );
    }

    return true;
  }
}
