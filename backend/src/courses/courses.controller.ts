import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';

import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
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
    return this.coursesService.getCourseTeams(id);
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Get(':id/exchanges')
  findExchanges(@Param('id') id: string) {
    return this.coursesService.getCourseExchanges(id);
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.createCourse(createCourseDto);
  }

  @UseGuards(RolesGuard)
  @Roles(['student'])
  @Post(':id/teams')
  createTeam(@Param('id') courseId: string, @Req() req, @Body() body: { projectId?: string }) {
    return this.coursesService.createTeam(courseId, req.user.sub, body.projectId);
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
