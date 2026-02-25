import { Module } from '@nestjs/common';
import { ProjectController } from './projects.controller';
import { ProjectService } from './projects.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectsModule {}
