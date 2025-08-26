import { apiClient } from '../client';
import type { Project } from '../../types';

export const projectsApi = {
  // Get all projects for a user with query parameters (default userId=1)
  getProjects: (userId: number = 1, template: string = 'scrum') => {
    console.log('API: Fetching projects for userId:', userId, 'template:', template);
    return projectsApiClient.get<ProjectDTO[]>(`/projects/projectsOfUser?userId=${userId}&templateType=${template}`);
  },
  //http://localhost:8089/api/projects/projectsOfUser?userId=1&templateType=scrum

  // Get project by ID
  getProject: (id: string) => {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  // Get project features (for dynamic navigation)
  getProjectFeatures: (projectId: number, templateType: string = 'scrum') => {
    console.log('API: Fetching features for project:', projectId, 'template:', templateType);
    return projectsApiClient.get(`/projects/${projectId}/features?templateType=${templateType}`);
  },



  // Create new project
  createProject: (data: Omit<Project, 'id'>) => {
    return apiClient.post<Project>('/projects', data);
  },

  // Update project
  updateProject: (id:number, data: Partial<ProjectDTO>) => {
    return projectsApiClient.put<Project>(`/projects/${id}`, data);
  },

  // Delete project
  deleteProject: (id: number) => {
    return projectsApiClient.delete(`/projects/${id}`);
  },
};
