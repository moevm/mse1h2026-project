import { Course } from '@/common/interfaces/course.interface';
import { mockCourses } from '@/mocks/courses.mock';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CoursesService {
  getAllCourses() {
    return mockCourses;
  }

  getCourseById(id: number): Course | undefined {
    return mockCourses.find((course) => course.uid === id);
  }

  createCourse(course: Course) {
    const newUid = mockCourses.length === 0 ? 1 : Math.max(...mockCourses.map((c) => c.uid)) + 1;

    const newCourse: Course = {
      uid: newUid,
      name: course.name || 'New course',
      maxTeamSize: course.maxTeamSize || 5,
      minTeamSize: course.minTeamSize || 2,
      isActive: course.isActive !== undefined ? course.isActive : true,
      adminId: 0,
      registrationDeadline: new Date(),
      createdAt: new Date(),
    };

    mockCourses.push(newCourse);
    return newCourse;
  }

  updateCourse(id: number, data: Course) {
    const course = mockCourses.find((c) => c.uid === id);
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    Object.assign(course, data);
    return course;
  }

  deleteCourse(id: number) {
    const index = mockCourses.findIndex((c) => c.uid === id);
    if (index === -1) throw new NotFoundException(`Course ${id} not found`);
    return mockCourses.splice(index, 1)[0];
  }
}
