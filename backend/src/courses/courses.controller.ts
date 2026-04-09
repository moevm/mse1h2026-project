import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('api/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.getAllCourses();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.getCourseById(id);
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Get(':id/teams')
  findTeams(@Param('id') id: string) {
    return this.coursesService.getCourseById(id).then((course) => course.teams);
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Post()
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.createCourse(createCourseDto);
  }

  @UseGuards(RolesGuard)
  @Roles(['user'])
  @Post(':id/teams')
  async createTeam(@Param('id') id: string, @Body() createTeamDto: CreateTeamDto) {
    return this.coursesService.createTeam(id, createTeamDto);
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Put(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.updateCourse(id, updateCourseDto);
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }
}
