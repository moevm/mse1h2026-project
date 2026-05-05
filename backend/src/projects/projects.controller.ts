import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectService } from './projects.service';

@Controller('api/projects')
export class ProjectController {
  constructor(private readonly projectsService: ProjectService) {}

  @UseGuards(RolesGuard)
  @Roles(['student', 'admin'])
  @Get()
  findAll(@Query('courseId') courseId?: string) {
    return this.projectsService.getAllProjects(courseId);
  }

  @UseGuards(RolesGuard)
  @Roles(['student', 'admin'])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.getProjectById(id);
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.createProject(createProjectDto);
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Put(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.updateProject(id, updateProjectDto);
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.projectsService.deleteProject(id);
  }
}
