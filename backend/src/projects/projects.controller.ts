import { ProjectService } from './projects.service';
import { Controller, Get, Post, Param, Query, Put, Delete, Body } from '@nestjs/common';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectsService: ProjectService) {}

  @Get()
  findAll(@Query() query: unknown) {
    return this.projectsService.getAllProjects();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.projectsService.getProjectById(id);
  }
}
