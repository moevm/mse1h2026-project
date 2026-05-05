import { InvitationStatus } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { InvitationsService } from './invitations.service';

describe('InvitationsService', () => {
  let service: InvitationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    teamInvitation: {
      update: jest.fn(),
    },
    team: {
      findUnique: jest.fn(),
    },
    teamMember: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sets respondedAt to null when status is pending', async () => {
    const invitation = { id: 'inv-1', status: InvitationStatus.pending, respondedAt: null };
    mockPrismaService.teamInvitation.update.mockResolvedValue(invitation);

    const result = await service.updateInvitation('inv-1', {
      status: InvitationStatus.pending,
    });

    expect(result).toEqual(invitation);
    expect(prisma.teamInvitation.update).toHaveBeenCalledWith({
      where: { id: 'inv-1' },
      data: {
        status: InvitationStatus.pending,
        respondedAt: null,
      },
    });
  });

  it('sets respondedAt to current date when status is not pending', async () => {
    const now = new Date('2026-05-05T10:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(now);

    const invitation = { id: 'inv-2', status: InvitationStatus.accepted, respondedAt: now };
    mockPrismaService.teamInvitation.update.mockResolvedValue(invitation);
    mockPrismaService.team.findUnique.mockResolvedValue({ courseId: 'course-1' });
    mockPrismaService.teamMember.findFirst.mockResolvedValue({ id: 'member-1' });

    const result = await service.updateInvitation('inv-2', {
      status: InvitationStatus.accepted,
    });

    expect(result).toEqual(invitation);
    expect(prisma.teamInvitation.update).toHaveBeenCalledWith({
      where: { id: 'inv-2' },
      data: {
        status: InvitationStatus.accepted,
        respondedAt: now,
      },
    });

    jest.useRealTimers();
  });

  it('throws NotFoundException when invitation does not exist', async () => {
    mockPrismaService.teamInvitation.update.mockRejectedValue(new Error('not found'));

    await expect(
      service.updateInvitation('missing-id', { status: InvitationStatus.declined }),
    ).rejects.toThrow(NotFoundException);
  });
});
