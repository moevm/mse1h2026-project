import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';
import { Test, TestingModule } from '@nestjs/testing';

import { AssignmentsService } from './assignments.service';

describe('AssignmentsService', () => {
  let service: AssignmentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    project: {
      findMany: jest.fn(),
    },
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns projects with their assignments', async () => {
    const projectsWithAssignments = [
      {
        id: 'project-1',
        name: 'Project 1',
        courseId: 'course-1',
        assignments: [
          { id: 'assignment-1', title: 'Assignment 1' },
          { id: 'assignment-2', title: 'Assignment 2' },
        ],
      },
      {
        id: 'project-2',
        name: 'Project 2',
        courseId: 'course-1',
        assignments: [{ id: 'assignment-3', title: 'Assignment 3' }],
      },
    ];

    mockPrismaService.project.findMany.mockResolvedValue(projectsWithAssignments);

    const result = await service.getCourseAssignments('course-1');

    expect(result).toEqual(projectsWithAssignments);
    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: { courseId: 'course-1' },
      include: {
        assignments: true,
      },
    });
  });
});
