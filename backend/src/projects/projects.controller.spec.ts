import { Test, TestingModule } from '@nestjs/testing';

import { ProjectController } from './projects.controller';
import { ProjectService } from './projects.service';

describe('ProjectController', () => {
  let controller: ProjectController;
  let service: ProjectService;

  const mockProjectService = {
    getAllProjects: jest.fn(),
    getProjectById: jest.fn(),
    createProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: mockProjectService,
        },
      ],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    service = module.get<ProjectService>(ProjectService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns all projects', async () => {
    const projects = [{ id: 'project-1' }];
    mockProjectService.getAllProjects.mockResolvedValue(projects);

    const result = await controller.findAll();

    expect(result).toEqual(projects);
    expect(service.getAllProjects).toHaveBeenCalledWith(undefined);
  });

  it('returns all projects for a course', async () => {
    const projects = [{ id: 'project-1', courseId: 'course-1' }];
    mockProjectService.getAllProjects.mockResolvedValue(projects);

    const result = await controller.findAll('course-1');

    expect(result).toEqual(projects);
    expect(service.getAllProjects).toHaveBeenCalledWith('course-1');
  });

  it('returns project by id', async () => {
    const project = { id: 'project-1' };
    mockProjectService.getProjectById.mockResolvedValue(project);

    const result = await controller.findOne('project-1');

    expect(result).toEqual(project);
    expect(service.getProjectById).toHaveBeenCalledWith('project-1');
  });

  it('creates project', async () => {
    const dto = {
      title: 'Project',
      description: 'Desc',
      teacherId: 'teacher-1',
      courseId: 'course-1',
    };
    const project = { id: 'project-1', ...dto };
    mockProjectService.createProject.mockResolvedValue(project);

    const result = await controller.create(dto);

    expect(result).toEqual(project);
    expect(service.createProject).toHaveBeenCalledWith(dto);
  });

  it('updates project', async () => {
    const dto = { title: 'Updated' };
    const project = { id: 'project-1', ...dto };
    mockProjectService.updateProject.mockResolvedValue(project);

    const result = await controller.update('project-1', dto);

    expect(result).toEqual(project);
    expect(service.updateProject).toHaveBeenCalledWith('project-1', dto);
  });

  it('deletes project', async () => {
    const project = { id: 'project-1' };
    mockProjectService.deleteProject.mockResolvedValue(project);

    const result = await controller.delete('project-1');

    expect(result).toEqual(project);
    expect(service.deleteProject).toHaveBeenCalledWith('project-1');
  });
});
