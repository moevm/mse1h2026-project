import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserPayload } from '@/common/interfaces/user.interface';
import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';

import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('api/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(RolesGuard)
  @Roles(['student', 'admin'])
  @Get()
  findAll() {
    return this.coursesService.getAllCourses();
  }

  @UseGuards(RolesGuard)
  @Roles(['student', 'admin'])
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
  @Roles(['student'])
  @Get(':id/my-team')
  getMyTeam(@Param('id') courseId: string, @Req() req: Request & UserPayload) {
    return this.coursesService.getStudentTeam(courseId, req.user.sub);
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
