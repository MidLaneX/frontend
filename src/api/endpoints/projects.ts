import { apiClient, projectsApiClient } from '../client';
import type { Project } from '../../types';
import type { ProjectDTO } from '../../types/dto';

export const projectsApi = {
  // Get all projects for a user with query parameters
  getProjects: (
    userId: number,
    orgId: number,
    templateType: string
  ) => {
    const url = `/projects/user-projects?userId=${userId}&orgId=${orgId}&templateType=${templateType}`;
    console.log('API: Fetching projects with URL:', url);
    return projectsApiClient.get<ProjectDTO[]>(url);
  },

  //  Get project by ID with template-specific features
  getProject: (id: number, templateType: string ) => {
    console.log('API: Fetching project:', id, 'templateType:', templateType);
    return projectsApiClient.get<Project>(`/projects/${id}/${templateType}`);
  },

  //  Get project features (for dynamic navigation)
  getProjectFeatures: (projectId: string, templateType: string ) => {
    console.log('API: Fetching features for project:', projectId, 'template:', templateType);
    return projectsApiClient.get(`/projects/${projectId}/features?templateType=${templateType}`);
  },

  //  Create new project (backend expects ?template= param)
  createProject: (data: ProjectDTO, template: string ) => {
    console.log('API: Creating project with data:', data);
    return projectsApiClient.post<ProjectDTO>(`/projects?template=${template}`, data);
  },

  //  Update project
  updateProject: (id: string, data: Partial<ProjectDTO>) => {
    return projectsApiClient.put<Project>(`/projects/${id}`, data);
  },

  // Delete project
  deleteProject: (id: string) => {
    return apiClient.delete(`/projects/${id}`);
  },
};
