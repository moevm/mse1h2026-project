import { Injectable, NotFoundException } from '@nestjs/common';
import { mockProjects } from '../../mocks/projects.mock';
import { Project } from '../common/interfaces/project.interface';

@Injectable()
export class ProjectService {
  getAllProjects() {
    return mockProjects;
  }

  getProjectById(id: number) {
    return mockProjects.find((project) => project.uid === id);
  }

  createProject(projectData: Project) {
    const newUid = Math.max(...mockProjects.map((c) => c.uid)) + 1;

    const newProject: Project = {
      uid: newUid,
      title: projectData.title || 'New project',
      description: projectData.description || '',
    };

    mockProjects.push(newProject);
    return newProject;
  }

  updateProject(id: number, projectData: Project) {
    const project = mockProjects.find((p) => p.uid === id);
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    Object.assign(project, projectData);
    return project;
  }

  deleteProject(id: number) {
    const index = mockProjects.findIndex((p) => p.uid === id);
    if (index === -1) throw new NotFoundException(`Project ${id} not found`);
    return mockProjects.splice(index, 1)[0];
  }
}
