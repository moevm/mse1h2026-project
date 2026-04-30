import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectService } from './projects.service';

@Controller('api/projects')
export class ProjectController {
  constructor(private readonly projectsService: ProjectService) {}

  @Get()
  findAll() {
    return this.projectsService.getAllProjects();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.getProjectById(id);
  }

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.createProject(createProjectDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.updateProject(id, updateProjectDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.projectsService.deleteProject(id);
  }
}
