import { UserPayload } from '@/common/interfaces/user.interface';
import { AssignmentStatus } from '@/generated/prisma/enums';
import { Test, TestingModule } from '@nestjs/testing';

import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

describe('AssignmentsController', () => {
  let controller: AssignmentsController;
  let assignmentsService: AssignmentsService;

  const mockAssignmentsService = {
    getCourseAssignments: jest.fn().mockResolvedValue([]),
    assignTeamManually: jest.fn(),
    deleteAssignment: jest.fn(),
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

  it('creates assignment manually', async () => {
    const req = {
      user: { sub: 'user-1', email: 'user-1@example.com', role: 'student' },
    } as Request & UserPayload;
    const dto = {
      courseId: 'course-1',
      projectId: 'project-1',
      teamId: 'team-1',
      status: AssignmentStatus.active,
    };
    const assignment = { id: 'project-1', ...dto };

    mockAssignmentsService.assignTeamManually.mockResolvedValue(assignment);

    const result = await controller.assignTeamManually(dto, req);

    expect(result).toEqual(assignment);
    expect(assignmentsService.assignTeamManually).toHaveBeenCalledWith(dto, req['user']);
  });

  it('deletes assignment', async () => {
    const assignment = { id: 'assignment-1' };
    mockAssignmentsService.deleteAssignment.mockResolvedValue(assignment);

    const result = await controller.delete('assignment-1');

    expect(result).toEqual(assignment);
    expect(assignmentsService.deleteAssignment).toHaveBeenCalledWith('assignment-1');
  });
});
