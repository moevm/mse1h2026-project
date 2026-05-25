import { Roles } from '@/common/decorators/roles.decorator';
import { CourseTeacherGuard } from '@/common/guards/course-teacher.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserPayload } from '@/common/interfaces/user.interface';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

interface UploadedCsvFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

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
  @Roles(['student', 'admin'])
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

  @Post(':courseId/import/students')
  @UseGuards(CourseTeacherGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importStudents(@Param('courseId') courseId: string, @UploadedFile() file: UploadedCsvFile) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }
    const csvContent = file.buffer.toString('utf-8');
    return this.coursesService.importStudents(courseId, csvContent);
  }

  @Post(':courseId/import/projects')
  @UseGuards(CourseTeacherGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importProjects(@Param('courseId') courseId: string, @UploadedFile() file: UploadedCsvFile) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }
    const csvContent = file.buffer.toString('utf-8');
    return this.coursesService.importProjects(courseId, csvContent);
  }

  @Get(':courseId/export/students')
  @UseGuards(CourseTeacherGuard)
  async exportStudents(@Param('courseId') courseId: string, @Res() res) {
    const csv = await this.coursesService.exportStudents(courseId);

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="students_course_${courseId}.csv"`,
    });

    return res.send(csv);
  }

  @Get(':courseId/export/projects')
  @UseGuards(CourseTeacherGuard)
  async exportProjects(@Param('courseId') courseId: string, @Res() res) {
    const csv = await this.coursesService.exportProjects(courseId);

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="projects_course_${courseId}.csv"`,
    });

    return res.send(csv);
  }
}
