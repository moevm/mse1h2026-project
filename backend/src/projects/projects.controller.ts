import type { Project } from '@/common/interfaces/project.interface';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';

import { ProjectService } from './projects.service';

@Controller('api/projects')
export class ProjectController {
  constructor(private readonly projectsService: ProjectService) {}

  @Get()
  findAll() {
    return this.projectsService.getAllProjects();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.getProjectById(id);
  }

  @Post()
  async create(@Body() projectData: Project) {
    return this.projectsService.createProject(projectData);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() projectData: Project) {
    return this.projectsService.updateProject(id, projectData);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.deleteProject(id);
  }
}
