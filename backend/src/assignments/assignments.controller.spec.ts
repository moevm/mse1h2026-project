import { Test, TestingModule } from '@nestjs/testing';

import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

describe('AssignmentsController', () => {
  let controller: AssignmentsController;
  let assignmentsService: AssignmentsService;

  const mockAssignmentsService = {
    getAllAssignments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentsController],
      providers: [
        {
          provide: AssignmentsService,
          useValue: mockAssignmentsService,
        },
      ],
    }).compile();

    controller = module.get<AssignmentsController>(AssignmentsController);
    assignmentsService = module.get<AssignmentsService>(AssignmentsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns assignments from service', async () => {
    const assignments = [{ id: 'assignment-1' }];
    mockAssignmentsService.getAllAssignments.mockResolvedValue(assignments);

    const result = await controller.findAll();

    expect(result).toEqual(assignments);
    expect(assignmentsService.getAllAssignments).toHaveBeenCalled();
  });
});
