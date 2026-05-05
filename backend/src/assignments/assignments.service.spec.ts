import { PrismaService } from '@/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

import { AssignmentsService } from './assignments.service';

describe('AssignmentsService', () => {
  let service: AssignmentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    assignment: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
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

  it('returns assignments with team and project', async () => {
    const assignments = [{ id: 'assignment-1' }, { id: 'assignment-2' }];
    mockPrismaService.assignment.findMany.mockResolvedValue(assignments);

    const result = await service.getAllAssignments();

    expect(result).toEqual(assignments);
    expect(prisma.assignment.findMany).toHaveBeenCalledWith({
      include: {
        team: true,
        project: true,
      },
    });
  });
});
