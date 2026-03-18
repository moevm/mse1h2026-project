import type { Course } from '@/common/interfaces/course.interface';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';

import { CoursesService } from './courses.service';

@Controller('api/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.getAllCourses();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.getCourseById(id);
  }

  @Post()
  async create(@Body() courseData: Course) {
    return this.coursesService.createCourse(courseData);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: Course) {
    return this.coursesService.updateCourse(id, data);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.deleteCourse(id);
  }

  // @Get(':id/distribution')
}
