import { projectsApiClient } from '../client';
import type { Project } from '../../types';
import type { ProjectDTO } from '../../types/dto';

export const projectsApi = {
  // Get all projects for a user with query parameters
  getProjects: (userId: number, template: string = 'scrum') => {
    return projectsApiClient.get<ProjectDTO[]>(`/projects/projectsOfUser?userId=${userId}&templateType=${template}`);
  },
  //http://localhost:8089/api/projects/projectsOfUser?userId=2&templateType=scrum

  // Get project by ID with template-specific features
  getProject: (id: number, templateType: string) => {
  return projectsApiClient.get<Project>(`/projects/${id}/${templateType}`);
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
