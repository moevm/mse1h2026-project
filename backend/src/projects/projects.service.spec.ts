import { PrismaService } from '@/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ProjectService } from './projects.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let prisma: PrismaService;

  const mockPrismaService = {
    project: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns all projects without course filter', async () => {
    const projects = [{ id: 'project-1' }];
    mockPrismaService.project.findMany.mockResolvedValue(projects);

    const result = await service.getAllProjects();

    expect(result).toEqual(projects);
    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: {},
      include: {
        teacher: true,
        course: true,
      },
    });
  });

  it('returns projects filtered by courseId', async () => {
    const projects = [{ id: 'project-1', courseId: 'course-1' }];
    mockPrismaService.project.findMany.mockResolvedValue(projects);

    const result = await service.getAllProjects('course-1');

    expect(result).toEqual(projects);
    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: { courseId: 'course-1' },
      include: {
        teacher: true,
        course: true,
      },
    });
  });

  it('returns project by id', async () => {
    const project = { id: 'project-1' };
    mockPrismaService.project.findUnique.mockResolvedValue(project);

    const result = await service.getProjectById('project-1');

    expect(result).toEqual(project);
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: { id: 'project-1' },
      include: {
        teacher: true,
        course: true,
      },
    });
  });

  it('throws when project not found', async () => {
    mockPrismaService.project.findUnique.mockResolvedValue(null);

    await expect(service.getProjectById('missing')).rejects.toThrow(NotFoundException);
  });

  it('creates project', async () => {
    const payload = {
      title: 'Project',
      description: 'Desc',
      teacherId: 'teacher-1',
      courseId: 'course-1',
    };
    const project = { id: 'project-1', ...payload };
    mockPrismaService.project.create.mockResolvedValue(project);

    const result = await service.createProject(payload);

    expect(result).toEqual(project);
    expect(prisma.project.create).toHaveBeenCalledWith({
      data: payload,
    });
  });

  it('updates project', async () => {
    const payload = {
      title: 'Updated',
    };
    mockPrismaService.project.findUnique.mockResolvedValue({ id: 'project-1' });
    mockPrismaService.project.update.mockResolvedValue({ id: 'project-1', ...payload });

    const result = await service.updateProject('project-1', payload);

    expect(result).toEqual({ id: 'project-1', ...payload });
    expect(prisma.project.update).toHaveBeenCalledWith({
      where: { id: 'project-1' },
      data: payload,
    });
  });

  it('throws when updating missing project', async () => {
    mockPrismaService.project.findUnique.mockResolvedValue(null);

    await expect(service.updateProject('missing', { title: 'Updated' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deletes project', async () => {
    mockPrismaService.project.findUnique.mockResolvedValue({ id: 'project-1' });
    mockPrismaService.project.delete.mockResolvedValue({ id: 'project-1' });

    const result = await service.deleteProject('project-1');

    expect(result).toEqual({ id: 'project-1' });
    expect(prisma.project.delete).toHaveBeenCalledWith({
      where: { id: 'project-1' },
    });
  });

  it('throws when deleting missing project', async () => {
    mockPrismaService.project.findUnique.mockResolvedValue(null);

    await expect(service.deleteProject('missing')).rejects.toThrow(NotFoundException);
  });
});
