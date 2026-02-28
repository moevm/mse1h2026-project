export interface Project {
  uid: number;
  title: string;
  description?: string;
  teacherId: number;
  courseId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
