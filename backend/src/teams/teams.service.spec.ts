import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { TeamsService } from './teams.service';

describe('TeamsService', () => {
  let service: TeamsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    team: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
    teamMember: { findFirst: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
    teamInvitation: { findFirst: jest.fn(), create: jest.fn(), deleteMany: jest.fn() },
    user: { findUnique: jest.fn() },
    assignment: { deleteMany: jest.fn() },
    exchangeRequest: { findMany: jest.fn(), deleteMany: jest.fn() },
    exchangeConfirmation: { deleteMany: jest.fn() },
    $transaction: jest.fn(async (callback) => callback(mockPrismaService)),
  };
  const mockUsersService = {
    checkTeamLeader: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
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

    service = module.get<TeamsService>(TeamsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Очищаем моки перед каждым тестом, чтобы вызовы не наслаивались
    jest.clearAllMocks();
    mockUsersService.checkTeamLeader.mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTeamById', () => {
    it('should return a team by id', async () => {
      const mockTeam = { id: 'team-1', leaderId: 'user-1' };
      mockPrismaService.team.findUnique.mockResolvedValue(mockTeam);

      const result = await service.getTeamById('team-1');

      expect(result).toEqual(mockTeam);
      expect(prisma.team.findUnique).toHaveBeenCalledWith({
        where: { id: 'team-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if team not found', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue(null);

      await expect(service.getTeamById('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createInvitation', () => {
    const mockUser = { sub: 'leader-1', role: 'student' };
    const mockDto = { inviteeId: 'student-2' };

    it('should create an invitation successfully', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue({
        id: 'team-1',
        leaderId: 'leader-1',
        course: { maxTeamSize: 5 },
        members: [{ id: 'm1' }],
      });
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'student-2', role: 'student' });
      mockPrismaService.teamMember.findFirst.mockResolvedValue(null);
      mockPrismaService.teamInvitation.findFirst.mockResolvedValue(null);
      mockPrismaService.teamInvitation.create.mockResolvedValue({ id: 'inv-1' });

      const result = await service.createInvitation('team-1', mockDto, mockUser.sub);

      expect(result).toEqual({ id: 'inv-1' });
      expect(prisma.teamInvitation.create).toHaveBeenCalledWith({
        data: { teamId: 'team-1', inviteeId: 'student-2', invitedBy: 'leader-1' },
      });
    });

    it('should throw ForbiddenException if user is not a leader', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue({
        id: 'team-1',
        leaderId: 'another-user',
      });
      mockUsersService.checkTeamLeader.mockRejectedValue(
        new ForbiddenException('You have no rights for this team.'),
      );

      await expect(service.createInvitation('team-1', mockDto, mockUser.sub)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw if invitee not found', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue({
        id: 'team-1',
        leaderId: 'leader-1',
        course: { maxTeamSize: 5 },
        members: [],
      });

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createInvitation('team-1', { inviteeId: 'x' }, 'leader-1'),
      ).rejects.toThrow('User x not found.');
    });

    it('should throw if team is full', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue({
        id: 'team-1',
        leaderId: 'leader-1',
        course: { maxTeamSize: 1 },
        members: [{ id: 'm1' }],
      });

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'student-2',
        role: 'student',
      });

      await expect(
        service.createInvitation('team-1', { inviteeId: 'student-2' }, 'leader-1'),
      ).rejects.toThrow('Team is already full.');
    });
  });

  describe('updateTeamLeader', () => {
    const user = { sub: 'leader-1', email: 'leader-1@example.com', role: 'student' };

    it('should update the team leader successfully', async () => {
      const mockTeam = {
        id: 'team-1',
        leaderId: 'leader-1',
        members: [{ userId: 'leader-1' }, { userId: 'new-leader' }],
      };
      mockPrismaService.team.findUnique.mockResolvedValue(mockTeam);
      mockPrismaService.team.update.mockResolvedValue({ ...mockTeam, leaderId: 'new-leader' });

      const result = await service.updateTeamLeader('team-1', { leaderId: 'new-leader' }, user);

      expect(result.leaderId).toBe('new-leader');
      expect(prisma.team.update).toHaveBeenCalledWith({
        where: { id: 'team-1' },
        data: { leaderId: 'new-leader' },
      });
    });

    it('should throw ForbiddenException if new leader is not a team member', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue({
        id: 'team-1',
        leaderId: 'leader-1',
        members: [{ userId: 'leader-1' }],
      });

      await expect(
        service.updateTeamLeader('team-1', { leaderId: 'outsider' }, user),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw if user is not leader', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue({
        id: 'team-1',
        leaderId: 'leader-1',
        members: [{ userId: 'leader-1' }],
      });
      mockUsersService.checkTeamLeader.mockRejectedValue(
        new ForbiddenException('You have no rights for this team.'),
      );

      await expect(
        service.updateTeamLeader(
          'team-1',
          { leaderId: 'leader-1' },
          { sub: 'random', email: 'random@example.com', role: 'student' },
        ),
      ).rejects.toThrow('You have no rights for this team.');
    });
  });

  describe('deleteMember', () => {
    const user = { sub: 'leader-1', email: 'leader-1@example.com', role: 'student' };

    it('should delete a member successfully', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue({ id: 'team-1', leaderId: 'leader-1' });
      mockPrismaService.teamMember.findFirst.mockResolvedValue({ id: 'member-record-id' });
      mockPrismaService.teamMember.delete.mockResolvedValue({ id: 'member-record-id' });

      const result = await service.deleteMember('team-1', 'student-2', user);

      expect(result).toEqual({ id: 'member-record-id' });
      expect(prisma.teamMember.delete).toHaveBeenCalledWith({
        where: { id: 'member-record-id' },
      });
    });

    it('should throw BadRequestException if trying to remove the leader', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue({ id: 'team-1', leaderId: 'leader-1' });

      await expect(service.deleteMember('team-1', 'leader-1', user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if user is not leader', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue({
        id: 'team-1',
        leaderId: 'leader-1',
      });

      await expect(
        service.deleteMember('team-1', 'student-2', {
          sub: 'other',
          email: 'other@example.com',
          role: 'student',
        }),
      ).rejects.toThrow('Only team leader can remove other members');
    });
  });

  describe('deleteTeam', () => {
    const user = { sub: 'leader-1', email: 'leader-1@example.com', role: 'student' };

    it('should delete team and all related records inside a transaction', async () => {
      const teamId = 'team-1';
      mockPrismaService.team.findUnique.mockResolvedValue({ id: teamId, leaderId: 'leader-1' });

      // Имитируем, что есть связанные запросы на обмен
      mockPrismaService.exchangeRequest.findMany.mockResolvedValue([
        { id: 'req-1' },
        { id: 'req-2' },
      ]);
      mockPrismaService.team.delete.mockResolvedValue({ id: teamId });

      await service.deleteTeam(teamId, user);

      // Проверяем, что все нужные методы были вызваны с правильными ID
      expect(prisma.exchangeRequest.findMany).toHaveBeenCalledWith({
        where: { OR: [{ initiatorTeamId: teamId }, { targetTeamId: teamId }] },
        select: { id: true },
      });

      expect(prisma.exchangeConfirmation.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [{ teamId: teamId }, { exchangeRequestId: { in: ['req-1', 'req-2'] } }],
        },
      });

      expect(prisma.exchangeRequest.deleteMany).toHaveBeenCalled();
      expect(prisma.assignment.deleteMany).toHaveBeenCalledWith({ where: { teamId } });
      expect(prisma.teamInvitation.deleteMany).toHaveBeenCalledWith({ where: { teamId } });
      expect(prisma.teamMember.deleteMany).toHaveBeenCalledWith({ where: { teamId } });

      expect(prisma.team.delete).toHaveBeenCalledWith({ where: { id: teamId } });
    });

    it('should delete team when no exchange requests exist', async () => {
      const teamId = 'team-1';

      mockPrismaService.team.findUnique.mockResolvedValue({
        id: teamId,
        leaderId: 'leader-1',
      });

      mockPrismaService.exchangeRequest.findMany.mockResolvedValue([]);

      await service.deleteTeam(teamId, {
        sub: 'leader-1',
        email: 'leader-1@example.com',
        role: 'student',
      });

      expect(prisma.exchangeConfirmation.deleteMany).toHaveBeenCalledWith({
        where: { teamId },
      });
    });
  });
});
