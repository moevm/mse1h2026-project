import { Test, TestingModule } from '@nestjs/testing';

import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

describe('TeamsController', () => {
  let controller: TeamsController;
  let service: TeamsService;

  const mockTeamsService = {
    getTeamById: jest.fn(),
    createInvitation: jest.fn(),
    updateTeamLeader: jest.fn(),
    deleteTeam: jest.fn(),
    deleteMember: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        {
          provide: TeamsService,
          useValue: mockTeamsService,
        },
      ],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get<TeamsService>(TeamsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns team by id', async () => {
    const team = { id: 'team-1' };
    mockTeamsService.getTeamById.mockResolvedValue(team);

    const result = await controller.findOne('team-1');

    expect(result).toEqual(team);
    expect(service.getTeamById).toHaveBeenCalledWith('team-1');
  });

  it('creates invitation', async () => {
    const req = { user: { sub: 'user-1' } };
    const dto = { inviteeId: 'user-2' };
    const invitation = { id: 'inv-1' };
    mockTeamsService.createInvitation.mockResolvedValue(invitation);

    const result = await controller.createInvitation('team-1', dto, req);

    expect(result).toEqual(invitation);
    expect(service.createInvitation).toHaveBeenCalledWith('team-1', dto, 'user-1');
  });

  it('updates team leader', async () => {
    const req = { user: { sub: 'user-1', role: 'student' } };
    const dto = { leaderId: 'user-2' };
    const updatedTeam = { id: 'team-1', leaderId: 'user-2' };
    mockTeamsService.updateTeamLeader.mockResolvedValue(updatedTeam);

    const result = await controller.updateLeader('team-1', dto, req);

    expect(result).toEqual(updatedTeam);
    expect(service.updateTeamLeader).toHaveBeenCalledWith('team-1', dto, req.user);
  });

  it('deletes team', async () => {
    const req = { user: { sub: 'user-1', role: 'student' } };
    const deletedTeam = { id: 'team-1' };
    mockTeamsService.deleteTeam.mockResolvedValue(deletedTeam);

    const result = await controller.delete('team-1', req);

    expect(result).toEqual(deletedTeam);
    expect(service.deleteTeam).toHaveBeenCalledWith('team-1', req.user);
  });

  it('deletes team member', async () => {
    const req = { user: { sub: 'user-1', role: 'student' } };
    const deletedMember = { id: 'member-1' };
    mockTeamsService.deleteMember.mockResolvedValue(deletedMember);

    const result = await controller.deleteMember('team-1', 'user-2', req);

    expect(result).toEqual(deletedMember);
    expect(service.deleteMember).toHaveBeenCalledWith('team-1', 'user-2', req.user);
  });
});
