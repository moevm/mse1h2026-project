import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AssignmentsModule } from './assignments/assignments.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { HelloWorldModule } from './hello-world/hello-world.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    HelloWorldModule,
    CoursesModule,
    ProjectsModule,
    AssignmentsModule,
    AuthModule,
    PrismaModule,
    UsersModule,
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
  ],
})
export class AppModule {}
