import { CoursesService } from './courses.service';
import { Controller, Get, Post, Param, Query, Put, Delete, Body } from '@nestjs/common';
import { Course } from '../common/interfaces/course.interface';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(@Query() query: unknown) {
    return this.coursesService.getAllCourses();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.coursesService.getCourseById(id);
  }

  @Post()
  async create(@Body() courseData: Course) {
    return this.coursesService.createCourse(courseData);
  }

  // @Put(':id')
  // @Delete(':id')
  // @Get(':id/distribution')
}
