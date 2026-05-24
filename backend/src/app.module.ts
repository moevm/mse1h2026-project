import { resolve } from 'path';

import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AssignmentsModule } from './assignments/assignments.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { ExchangesModule } from './exchanges/exchanges.module';
import { HealthModule } from './health/health.module';
import { HelloWorldModule } from './hello-world/hello-world.module';
import { InvitationsModule } from './invitations/invitations.module';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { LdapModule } from './ldap/ldap.module';
import { ProjectsModule } from './projects/projects.module';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(__dirname, '../../.env'),
      expandVariables: true,
    }),
    PrismaModule,
    AuthModule,
    HelloWorldModule,
    CoursesModule,
    ProjectsModule,
    AssignmentsModule,
    UsersModule,
    TeamsModule,
    InvitationsModule,
    HealthModule,
    ExchangesModule,
    //LdapModule,
  ],
})
export class AppModule {}
