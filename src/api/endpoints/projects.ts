import { projectsApiClient } from '../client';
import type { Project } from '../../types';
import type { ProjectDTO } from '../../types/dto';

export const projectsApi = {
  // Get all projects for a user with query parameters
  getProjects: (userId: number, template: string = 'Scrum') => {
    return projectsApiClient.get<ProjectDTO[]>(`/projects?projectId=${userId}&template=${template}`);
  },

  // Get project by ID
  getProject: (id: number) => {
    return projectsApiClient.get<Project>(`/projects/${id}`);
  },

  // Create new project
  createProject: (data: ProjectDTO, template: string = 'scrum') => {
    console.log('API: Creating project with data:', data);
    console.log('API: Using base URL:', projectsApiClient.defaults.baseURL);
    console.log('API: Template parameter:', template);
    return projectsApiClient.post<ProjectDTO>(`/projects?template=${template}`, data);
  },

  // Update project
  updateProject: (id: string, data: Partial<ProjectDTO>) => {
    return projectsApiClient.put<Project>(`/projects/${id}`, data);
  },

  // Delete project
  deleteProject: (id: string) => {
    return projectsApiClient.delete(`/projects/${id}`);
  },
};
