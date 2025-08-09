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
  updateTaskStatus: (projectId: number, taskId: number, status: Task['status'], templateType = 'scrum') => {
    return projectsApiClient.patch<Task>(
      `/projects/${projectId}/tasks/${taskId}/status?templateType=${templateType}`,
      { status }
    );
  },
};
