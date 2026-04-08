import { PrismaService } from '@/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CoursesService } from './courses.service';

const mockPrismaService = {
  course: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};
describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should return all courses', async () => {
    const courses = [
      {
        id: '1',
        name: 'Test Course',
        maxTeamSize: 5,
        minTeamSize: 1,
        teacherId: 'teacher1',
      },
    ];

    mockPrismaService.course.findMany.mockResolvedValue(courses);

    const result = await service.getAllCourses();

    expect(result).toEqual(courses);
    expect(mockPrismaService.course.findMany).toHaveBeenCalled();
  });

  it('should return course by id', async () => {
    const course = {
      id: '1',
      name: 'Test Course',
      maxTeamSize: 5,
      minTeamSize: 1,
      teacherId: 'teacher1',
    };

    mockPrismaService.course.findUnique.mockResolvedValue(course);

    const result = await service.getCourseById('1');

    expect(result).toEqual(course);
    expect(mockPrismaService.course.findUnique).toHaveBeenCalled();
  });

  it('should throw if course not found', async () => {
    mockPrismaService.course.findUnique.mockResolvedValue(null);

    await expect(service.getCourseById('1')).rejects.toThrow(NotFoundException);
    expect(mockPrismaService.course.findUnique).toHaveBeenCalled();
  });

  it('should create course', async () => {
    const course = {
      name: 'Test Course',
      maxTeamSize: 5,
      minTeamSize: 1,
      teacherId: 'teacher1',
    };
    const createdCourse = { id: '1', ...course };
    mockPrismaService.course.create.mockResolvedValue(createdCourse);

    const result = await service.createCourse(course);
    expect(result).toEqual(createdCourse);
    expect(mockPrismaService.course.create).toHaveBeenCalledWith({
      data: course,
    });
  });

  it('should update course', async () => {
    const course = { name: 'Updated Course', maxTeamSize: 2 };
    mockPrismaService.course.update.mockResolvedValue(course);

    const result = await service.updateCourse('1', course);

    expect(result).toEqual(course);
    expect(mockPrismaService.course.update).toHaveBeenCalledWith({
      data: course,
      where: { id: '1' },
    });
  });

  it('should delete course', async () => {
    const course = { id: '1', name: 'Deleted Course' };
    mockPrismaService.course.delete.mockResolvedValue(course);

    const result = await service.deleteCourse('1');
    expect(result).toEqual(course);
    expect(mockPrismaService.course.delete).toHaveBeenCalledWith({
      where: { id: course.id },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
