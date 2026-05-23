import { UserPayload } from '@/common/interfaces/user.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { UpdateRequestDto } from './dto/update-request.dto';
import { ExchangesController } from './exchanges.controller';
import { ExchangesService } from './exchanges.service';

describe('ExchangeController', () => {
  let controller: ExchangesController;
  let service: ExchangesService;

  const mockProjectService = {
    getAllExchangeRequests: jest.fn(),
    createRequest: jest.fn(),
    updateRequest: jest.fn(),
    deleteRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExchangesController],
      providers: [
        {
          provide: ExchangesService,
          useValue: mockProjectService,
        },
      ],
    }).compile();

    controller = module.get<ExchangesController>(ExchangesController);
    service = module.get<ExchangesService>(ExchangesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns all exchange requests', async () => {
    const req = {
      user: { sub: 'user-1', email: 'user-1@example.com', role: 'student' },
    } as Request & UserPayload;
    const requests = [{ id: 'request-1', courseId: 'course-1' }];
    mockProjectService.getAllExchangeRequests.mockResolvedValue(requests);

    const result = await controller.findAll('course-1', req);

    expect(result).toEqual(requests);
    expect(service.getAllExchangeRequests).toHaveBeenCalledWith('course-1', req['user']);
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
    mockProjectService.createRequest.mockResolvedValue(request);

    const result = await controller.create(dto, req);

    expect(result).toEqual(request);
    expect(service.createRequest).toHaveBeenCalledWith(dto, req.user.sub);
  });

  it('updates exchange request', async () => {
    const req = {
      user: { sub: 'user-1', email: 'user-1@example.com', role: 'student' },
    } as Request & UserPayload;
    const dto: UpdateRequestDto = {
      action: 'confirm',
    };
    const request = { id: 'request-1' };
    mockProjectService.updateRequest.mockResolvedValue(request);

    const result = await controller.updateRequest('request-1', dto, req);

    expect(result).toEqual(request);
    expect(service.updateRequest).toHaveBeenCalledWith('request-1', 'confirm', req['user']);
  });

  it('deletes exchange request', async () => {
    const req = {
      user: { sub: 'user-1', email: 'user-1@example.com', role: 'student' },
    } as Request & UserPayload;
    const request = { id: 'request-1' };
    mockProjectService.deleteRequest.mockResolvedValue(request);

    const result = await controller.delete('request-1', req);

    expect(result).toEqual(request);
    expect(service.deleteRequest).toHaveBeenCalledWith('request-1', req['user']);
  });
});
