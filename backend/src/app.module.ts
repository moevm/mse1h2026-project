import { Module } from '@nestjs/common';
import { HelloWorldModule } from './hello-world/hello-world.module';
import { CoursesModule } from './courses/courses.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [HelloWorldModule, CoursesModule, ProjectsModule, UsersModule],
})
export class AppModule {}
