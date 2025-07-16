import { apiClient } from '../client';
import type { Task } from '../../types';

export const tasksApi = {
  // Get all tasks for a project
  getTasks: (projectId: string) => {
    return apiClient.get<Task[]>(`/projects/${projectId}/tasks`);
  },

  // Get task by ID
  getTask: (id: string) => {
    return apiClient.get<Task>(`/tasks/${id}`);
  },

  // Create new task
  createTask: (projectId: string, data: Omit<Task, 'id'>) => {
    return apiClient.post<Task>(`/projects/${projectId}/tasks`, data);
  },

  // Update task
  updateTask: (id: string, data: Partial<Task>) => {
    return apiClient.put<Task>(`/tasks/${id}`, data);
  },

  // Delete task
  deleteTask: (id: string) => {
    return apiClient.delete(`/tasks/${id}`);
  },

  // Update task status
  updateTaskStatus: (id: string, status: Task['status']) => {
    return apiClient.patch<Task>(`/tasks/${id}/status`, { status });
  },
};
