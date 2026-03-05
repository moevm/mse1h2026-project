import { Module } from '@nestjs/common';
import { HelloWorldModule } from './hello-world/hello-world.module';
import { CoursesModule } from './courses/courses.module';
import { ProjectsModule } from './projects/projects.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [HelloWorldModule, CoursesModule, ProjectsModule, AssignmentsModule, AuthModule, UsersModule],
})
export class AppModule {}
