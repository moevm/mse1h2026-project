import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';

import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  imports: [UsersModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
