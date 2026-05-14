import { Test, TestingModule } from '@nestjs/testing';

import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

describe('AssignmentsController', () => {
  let controller: AssignmentsController;
  let assignmentsService: AssignmentsService;

  const mockAssignmentsService = {
    getCourseAssignments: jest.fn().mockResolvedValue([]),
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns assignments from service', async () => {
    const assignments = [{ id: 'project-1', assignments: [] }];

    mockAssignmentsService.getCourseAssignments.mockResolvedValue(assignments);

    const result = await controller.findAll('course-1');

    expect(result).toEqual(assignments);
    expect(assignmentsService.getCourseAssignments).toHaveBeenCalledWith('course-1');
  });
});
