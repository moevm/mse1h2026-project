import { Module } from '@nestjs/common';
import { HelloWorldModule } from './hello-world/hello-world.module';
import { CoursesModule } from './courses/courses.module';
import { ProjectsModule } from './projects/projects.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [HelloWorldModule, CoursesModule, ProjectsModule, AssignmentsModule, PrismaModule],
})
export class AppModule {}
