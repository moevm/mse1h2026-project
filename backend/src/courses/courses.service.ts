import { Injectable } from '@nestjs/common';
import { mockCourses } from "../../mocks/courses.mock"

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
}
