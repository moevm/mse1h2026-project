import { CoursesService } from './courses.service';
import { Controller, Get, Post, Param, Put, Delete, Body, ParseIntPipe } from '@nestjs/common';
import { Course } from '../common/interfaces/course.interface';

@Controller('courses')
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
