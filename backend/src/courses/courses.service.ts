import { Injectable } from '@nestjs/common';
import { mockCourses } from "../../mocks/courses.mock"
import { Course } from '../common/interfaces/course.interface';

@Injectable()
export class CoursesService {
  getAllCourses() {
    return mockCourses;
  }

  getCourseById(id: number) {
    mockCourses.forEach(course => {
      if (course.uid === id) {  
        return course;
      }
    });
  }

  createCourse(course: Course) {
    const newUid = Math.max(...mockCourses.map(c => c.uid)) + 1;

    const newCourse: Course = {
      uid: newUid,
      name: course.name || 'Новый курс',
      semester: course.semester || 6,
      max_team_size: course.max_team_size || 5,
      min_team_size: course.min_team_size || 2,
      is_active: course.is_active !== undefined ? course.is_active : true,
      registration_deadline: new Date()
    };

    mockCourses.push(newCourse);
    return newCourse;
  }
}
