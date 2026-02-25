import { Injectable, NotFoundException } from '@nestjs/common';
import { mockCourses } from '../../mocks/courses.mock';
import { Course } from '../common/interfaces/course.interface';

@Injectable()
export class CoursesService {
  getAllCourses() {
    return mockCourses;
  }

  getCourseById(id: number): Course | undefined {
    return mockCourses.find((course) => course.uid === id);
  }

  createCourse(course: Course) {
    const newUid = Math.max(...mockCourses.map((c) => c.uid)) + 1;

    const newCourse: Course = {
      uid: newUid,
      name: course.name || 'New course',
      semester: course.semester || 6,
      max_team_size: course.max_team_size || 5,
      min_team_size: course.min_team_size || 2,
      is_active: course.is_active !== undefined ? course.is_active : true,
      registration_deadline: new Date(),
    };

    mockCourses.push(newCourse);
    return newCourse;
  }

  updateCourse(id: number, data: unknown) {
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
