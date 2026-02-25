import { Injectable } from '@nestjs/common';
import { mockProjects } from "../../mocks/projects.mock"

@Injectable()
export class ProjectService {
  getAllProjects() {
    return mockProjects;
  }

  getProjectById(id: number) {
    mockProjects.forEach(project => {
      if (project.uid === id) {  
        return project;
      }
    });
  }
}
