import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AssignmentsModule } from './assignments/assignments.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { HealthModule } from './health/health.module';
import { HelloWorldModule } from './hello-world/hello-world.module';
import { InvitationsModule } from './invitations/invitations.module';
import { ProjectsModule } from './projects/projects.module';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';

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
      envFilePath: '../../.env',
    }),
    TeamsModule,
    InvitationsModule,
  ],
})
export class AppModule {}
