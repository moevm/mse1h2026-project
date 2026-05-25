import { UserPayload } from '@/common/interfaces/user.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ExchangesService } from './exchanges.service';

describe('ExchangeService', () => {
  let service: ExchangesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    exchangeRequest: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },

    exchangeConfirmation: {
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },

    teamMember: {
      findFirst: jest.fn(),
    },

    project: {
      findUnique: jest.fn(),
    },

    course: {
      findUnique: jest.fn(),
    },

    $transaction: jest.fn(async (callback) => {
      return callback(mockPrismaService);
    }),
  };

  const mockUsersService = {
    checkTeamLeader: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangesService,
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

    service = module.get<ExchangesService>(ExchangesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns all exchange requests', async () => {
    const req = {
      user: { sub: 'user-1', email: 'user-1@example.com', role: 'student' },
    } as Request & UserPayload;
    const requests = [{ id: 'exchanges-1' }];
    const membership = { teamId: 'team-1' };

    mockPrismaService.exchangeRequest.findMany.mockResolvedValue(requests);
    mockPrismaService.teamMember.findFirst.mockResolvedValue(membership);

    const result = await service.getAllExchangeRequests('course-1', req.user);

    expect(result).toEqual(requests);
    expect(prisma.exchangeRequest.findMany).toHaveBeenCalledWith({
      where: {
        courseId: 'course-1',
        OR: [{ initiatorTeamId: 'team-1' }, { targetTeamId: 'team-1' }],
      },
      include: expect.any(Object),
    });
  });

  it('creates exchange request', async () => {
    const req = {
      user: { sub: 'user-1', email: 'user-1@example.com', role: 'student' },
    } as Request & UserPayload;
    const dto = {
      courseId: 'course-1',
      initiatorTeamId: 'team-1',
      targetTeamId: 'team-2',
      initiatorProjectId: 'project-1',
      targetProjectId: 'project-2',
    };
    const request = { id: 'request-1', ...dto };

    mockPrismaService.course.findUnique.mockResolvedValue({
      id: 'course-1',
      registrationDeadline: null,
    });

    mockPrismaService.project.findUnique
      .mockResolvedValueOnce({
        id: 'project-1',
        assignments: [],
      })
      .mockResolvedValueOnce({
        id: 'project-2',
      });

    mockPrismaService.exchangeRequest.create.mockResolvedValue(request);

    const result = await service.createRequest(dto, req.user.sub);

    expect(result).toEqual(request);
    expect(prisma.exchangeRequest.create).toHaveBeenCalledWith({
      data: {
        ...dto,
        status: 'confirmed_initiator',
      },
    });
  });

  it('updates exchange request', async () => {
    const req = {
      user: { sub: 'user-1', email: 'user-1@example.com', role: 'student' },
    } as Request & UserPayload;
    mockPrismaService.exchangeRequest.findUnique.mockResolvedValue({
      id: 'request-1',
      targetTeamId: 'team-1',
      status: 'confirmed_initiator',
      course: {
        registrationDeadline: null,
      },
    });

    mockPrismaService.exchangeConfirmation.findFirst.mockResolvedValue(null);

    mockPrismaService.exchangeConfirmation.count.mockResolvedValue(2);

    mockPrismaService.exchangeRequest.update.mockResolvedValue({
      id: 'request-1',
      status: 'pending_teacher',
    });

    const result = await service.updateRequest('request-1', 'confirm', req.user);

    expect(result).toEqual({
      id: 'request-1',
      status: 'pending_teacher',
    });

    expect(prisma.exchangeRequest.update).toHaveBeenCalledWith({
      where: { id: 'request-1' },
      data: {
        status: 'pending_teacher',
      },
    });
  });

  it('throws when updating missing exchange request', async () => {
    const req = {
      user: { sub: 'user-1', email: 'user-1@example.com', role: 'student' },
    } as Request & UserPayload;
    mockPrismaService.exchangeRequest.findUnique.mockResolvedValue(null);

    await expect(service.updateRequest('missing', 'confirm', req.user)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deletes exchange request', async () => {
    const req = {
      user: { sub: 'user-1', email: 'user-1@example.com', role: 'student' },
    } as Request & UserPayload;
    mockPrismaService.exchangeRequest.findUnique.mockResolvedValue({
      id: 'request-1',
      initiatorTeamId: 'team-1',
      status: 'confirmed_initiator',
    });

    mockPrismaService.exchangeRequest.update.mockResolvedValue({
      id: 'request-1',
      initiatorTeamId: 'team-1',
      status: 'cancelled',
    });

    const result = await service.deleteRequest('request-1', req.user);

    expect(result).toEqual({
      id: 'request-1',
      initiatorTeamId: 'team-1',
      status: 'cancelled',
    });

    expect(prisma.exchangeRequest.update).toHaveBeenCalledWith({
      where: { id: 'request-1' },
      data: {
        status: 'cancelled',
      },
    });
  });

  it('throws when deleting missing exchange request', async () => {
    const req = {
      user: { sub: 'user-1', email: 'user-1@example.com', role: 'student' },
    } as Request & UserPayload;

    mockPrismaService.exchangeRequest.findUnique.mockResolvedValue(null);

    await expect(service.deleteRequest('missing', req.user)).rejects.toThrow(NotFoundException);
  });
});
