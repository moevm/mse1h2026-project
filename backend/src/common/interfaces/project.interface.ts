export interface Project {
  uid: number;
  title: string;
  description?: string;
  teacherId: number;
  teacherFirstName: string,
  teacherLastName: string,
  courseName: string,
  courseId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
