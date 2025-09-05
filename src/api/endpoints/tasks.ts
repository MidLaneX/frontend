import { projectsApiClient } from '../client';
import type { Task } from '../../types';

export const tasksApi = {
  // Get all tasks for a project
  getTasks: (projectId: number, templateType = 'scrum') => {
    return projectsApiClient.get<Task[]>(`/projects/${projectId}/tasks?templateType=${templateType}`);
  },

  // Get task by ID
  getTask: (projectId: number, taskId: number, templateType = 'scrum') => {
    return projectsApiClient.get<Task>(`/projects/${projectId}/tasks/${taskId}?templateType=${templateType}`);
  },

  // Create new task
  createTask: (projectId: number, data: Omit<Task, 'id'>, templateType = 'scrum') => {
    return projectsApiClient.post<Task>(`/projects/${projectId}/tasks?templateType=${templateType}`, data);
  },

  // Update task
  updateTask: (projectId: number, taskId: number, data: Partial<Task>, templateType = 'scrum') => {
    return projectsApiClient.put<Task>(`/projects/${projectId}/tasks/${taskId}?templateType=${templateType}`, data);
  },

  // Delete task
  deleteTask: (projectId: number, taskId: number, templateType = 'scrum') => {
    return projectsApiClient.delete(`/projects/${projectId}/tasks/${taskId}?templateType=${templateType}`);
  },

  // Update task status
  updateTaskStatus: (projectId: number, taskId: number, status: string, templateType = 'scrum') => {
    // Try different request body formats to match backend expectation
    const requestBody = { status: status };
    console.log('Sending updateTaskStatus request:', requestBody);
    
    return projectsApiClient.patch<Task>(
      `/projects/${projectId}/tasks/${taskId}/status?templateType=${templateType}`,
      requestBody
    );
  },
  //update tasks sprint assignment
   updateTaskSprint: (projectId: number, taskId: number, sprintId: number | null, templateType = 'scrum') => {
    // If sprintId is 0 or null, we're removing from sprint
    const sprintIdParam = sprintId === 0 || sprintId === null ? 0 : sprintId;
    return projectsApiClient.put<Task>(
      `/projects/${projectId}/tasks/${taskId}/${sprintIdParam}?templateType=${templateType}`,
      { sprintId: sprintIdParam }
    );
  },
};
