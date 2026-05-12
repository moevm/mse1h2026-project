import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserPayload } from '@/common/interfaces/user.interface';
import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';

import { CoursesService } from './courses.service';
import { AssignTeamDto } from './dto/assign-team.dto';
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
  @Roles(['student', 'admin'])
  @Get(':id/assignments')
  findAssignments(@Param('id') id: string) {
    return this.coursesService.getCourseAssignments(id);
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
  @Roles(['student'])
  @Post(':id/teams')
  createTeam(
    @Param('id') courseId: string,
    @Req() req: Request & UserPayload,
    @Body() body: { projectId?: string },
  ) {
    return this.coursesService.createTeam(courseId, req.user.sub, body.projectId);
  }

  @UseGuards(RolesGuard)
  @Roles(['student', 'admin'])
  @Post(':id/assignments/manual')
  assignTeamManually(@Body() assignTeamDto: AssignTeamDto, @Req() req: Request & UserPayload) {
    return this.coursesService.assignTeamManually(assignTeamDto, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Post(':id/assignments/auto')
  assignTeamAutomatically(@Param('id') courseId: string) {
    return this.coursesService.assignTeamAutomatically(courseId);
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
