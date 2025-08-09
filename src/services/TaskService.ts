import type { Task, TaskStatus } from '../types';
import { tasksApi } from '../api/endpoints/tasks';

/**
 * Service class for managing tasks
 */
export class TaskService {
  /**
   * Get all tasks for a project
   */
  static async getTasksByProjectId(projectId: number, templateType = 'scrum'): Promise<Task[]> {
    try {
      const response = await tasksApi.getTasks(projectId, templateType);
      return response.data;
    } catch (error) {
      console.error('Failed to get tasks:', error);
      return [];
    }
  }

  /**
   * Get task by ID
   */
  static async getTaskById(projectId: number, taskId: number, templateType = 'scrum'): Promise<Task | null> {
    try {
      const response = await tasksApi.getTask(projectId, taskId, templateType);
      return response.data;
    } catch (error) {
      console.error('Failed to get task:', error);
      return null;
    }
  }

  /**
   * Create a new task
   */
  static async createTask(projectId: number, taskData: Omit<Task, 'id'>, templateType = 'scrum'): Promise<Task | null> {
    try {
      const response = await tasksApi.createTask(projectId, taskData, templateType);
      return response.data;
    } catch (error) {
      console.error('Failed to create task:', error);
      return null;
    }
  }

  /**
   * Update an existing task
   */
  static async updateTask(projectId: number, taskId: number, updates: Partial<Task>, templateType = 'scrum'): Promise<Task | null> {
    try {
      const response = await tasksApi.updateTask(projectId, taskId, updates, templateType);
      return response.data;
    } catch (error) {
      console.error('Failed to update task:', error);
      return null;
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(projectId: number, taskId: number, templateType = 'scrum'): Promise<boolean> {
    try {
      await tasksApi.deleteTask(projectId, taskId, templateType);
      return true;
    } catch (error) {
      console.error('Failed to delete task:', error);
      return false;
    }
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(projectId: number, taskId: number, newStatus: TaskStatus, templateType = 'scrum'): Promise<Task | null> {
    try {
      const response = await tasksApi.updateTaskStatus(projectId, taskId, newStatus, templateType);
      return response.data;
    } catch (error) {
      console.error('Failed to update task status:', error);
      return null;
    }
  }

  /**
   * Get tasks by status
   */
  static async getTasksByStatus(projectId: number, status: TaskStatus, templateType = 'scrum'): Promise<Task[]> {
    const tasks = await this.getTasksByProjectId(projectId, templateType);
    return tasks.filter(task => task.status === status);
  }

  /**
   * Search tasks
   */
  static async searchTasks(projectId: number, query: string, templateType = 'scrum'): Promise<Task[]> {
    const tasks = await this.getTasksByProjectId(projectId, templateType);
    const lowercaseQuery = query.toLowerCase();

    return tasks.filter(task =>
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description?.toLowerCase().includes(lowercaseQuery) ||
      task.assignee.toLowerCase().includes(lowercaseQuery) ||
      task.labels.some((label: string) => label.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Filter tasks
   */
  static async filterTasks(projectId: number, filters: {
    assignee?: string[];
    priority?: string[];
    type?: string[];
    status?: string[];
  }, templateType = 'scrum'): Promise<Task[]> {
    let tasks = await this.getTasksByProjectId(projectId, templateType);

    if (filters.assignee?.length) {
      tasks = tasks.filter(task => filters.assignee!.includes(task.assignee));
    }

    if (filters.priority?.length) {
      tasks = tasks.filter(task => filters.priority!.includes(task.priority));
    }

    if (filters.type?.length) {
      tasks = tasks.filter(task => filters.type!.includes(task.type));
    }

    if (filters.status?.length) {
      tasks = tasks.filter(task => filters.status!.includes(task.status));
    }

    return tasks;
  }
}
