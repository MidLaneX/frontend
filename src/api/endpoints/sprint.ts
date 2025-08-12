import { projectsApiClient } from '../client';
import type { SprintDTO } from '../../types/featurevise/sprint';

export const sprintApi = {
  // Create sprint
  createSprint: (projectId: number, sprintDTO: SprintDTO, template = 'scrum') => {
    return projectsApiClient.post<SprintDTO>(
      `/projects/${projectId}/sprints?template=${template}`,
      sprintDTO
    );
  },

  // Get latest sprint
  getLatestSprint: (projectId: number, template = 'scrum') => {
    return projectsApiClient.get<SprintDTO>(
      `/projects/${projectId}/sprints/latest?template=${template}`
    );
  },

  // Get all sprints
  getAllSprints: (projectId: number, template = 'scrum') => {
    return projectsApiClient.get<SprintDTO[]>(
      `/projects/${projectId}/sprints?template=${template}`
    );
  },

  // Update sprint
  updateSprint: (projectId: number, sprintId: number, sprintDTO: Partial<SprintDTO>, template = 'scrum') => {
    return projectsApiClient.put<SprintDTO>(
      `/projects/${projectId}/sprints/${sprintId}?template=${template}`,
      sprintDTO
    );
  },

  // Delete sprint
  deleteSprint: (projectId: number, sprintId: number, template = 'scrum') => {
    return projectsApiClient.delete(
      `/projects/${projectId}/sprints/${sprintId}?template=${template}`
    );
  },
};
