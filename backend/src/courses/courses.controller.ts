import { mockCourses } from "../../mocks/courses.mock"
import { Controller, Get, Post, Param, Query } from '@nestjs/common';

@Controller('courses')
export class CoursesController {
  @Get()
  findAll(@Query() query: unknown) {
    return mockCourses
  }

  @Post()

  @Get(':id')
  findOne(@Param('id') id: string) {

  }
}