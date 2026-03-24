// import { Roles } from '@/common/decorators/roles.decorator';
// import { RolesGuard } from '@/common/guards/roles.guard';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

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

  // @UseGuards(RolesGuard)
  // @Roles(['admin'])
  @Post()
  async create(@Body() courseData: CreateCourseDto) {
    return this.coursesService.createCourse(courseData);
  }

  // @UseGuards(RolesGuard)
  // @Roles(['admin'])
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateCourseDto) {
    return this.coursesService.updateCourse(id, data);
  }

  // @UseGuards(RolesGuard)
  // @Roles(['admin'])
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }
}
