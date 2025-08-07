import { apiClient } from '../client';
import type { Project } from '../../types';

export const projectsApi = {
  // Get all projects
 getProjects: (payload: {
  projectDTO: Partial<Project>;
  userProjectRequestDTO: { userId: number; role: string };
}) => {
  return apiClient.post<Project[]>('/projects/projectsOfUser', payload);
},


  // Get project by ID
  getProject: (id: string) => {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  // Create new project
  createProject: (data: Omit<Project, 'id'>) => {
    return apiClient.post<Project>('/projects', data);
  },

  // Update project
  updateProject: (id: string, data: Partial<Project>) => {
    return apiClient.put<Project>(`/projects/${id}`, data);
  },

  // Delete project
  deleteProject: (id: string) => {
    return apiClient.delete(`/projects/${id}`);
  },
};
