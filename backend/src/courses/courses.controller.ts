import { CoursesService } from './courses.service';
import { Controller, Get, Post, Param, Query, Put, Delete, Body } from '@nestjs/common';

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


  // TODO:
  // @Post()
  // async create(@Body() unknown: unknown) {
  //   return this.coursesService.createCourse();
  // }
  // @Put(':id')
  // @Delete(':id')
  // @Get(':id/distribution')
}
