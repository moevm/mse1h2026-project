import { Test, TestingModule } from '@nestjs/testing';

import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { InvitationStatus } from '@/generated/prisma/enums';

describe('InvitationsController', () => {
  let controller: InvitationsController;
  let service: InvitationsService;

  const mockInvitationsService = {
    updateInvitation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationsController],
      providers: [
        {
          provide: InvitationsService,
          useValue: mockInvitationsService,
        },
      ],
    }).compile();

    controller = module.get<InvitationsController>(InvitationsController);
    service = module.get<InvitationsService>(InvitationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns updated invitation', async () => {
    const dto = { status: InvitationStatus.accepted };
    const invitation = { id: 'inv-1', status: InvitationStatus.accepted };
    mockInvitationsService.updateInvitation.mockResolvedValue(invitation);

    const result = await controller.updateInvitation('inv-1', dto);

    expect(result).toEqual(invitation);
    expect(service.updateInvitation).toHaveBeenCalledWith('inv-1', dto);
  });
});
