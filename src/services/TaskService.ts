import type { Task, TaskStatus } from '../types';
import { tasksApi } from '../api/endpoints/tasks';

/**
 * Service class for managing tasks
 */
export class TaskService {
  /**
   * Get all tasks for a project
   */
  static async getTasksByProjectId(projectId: string): Promise<Task[]> {
    try {
      const response = await tasksApi.getTasks(projectId);
      return response.data;
    } catch (error) {
      console.error('Failed to get tasks:', error);
      return [];
    }
  }

  /**
   * Get task by ID
   */
  static async getTaskById(taskId: string): Promise<Task | null> {
    try {
      const response = await tasksApi.getTask(taskId);
      return response.data;
    } catch (error) {
      console.error('Failed to get task:', error);
      return null;
    }
  }

  /**
   * Create a new task
   */
  static async createTask(projectId: string, taskData: Omit<Task, 'id'>): Promise<Task | null> {
    try {
      const response = await tasksApi.createTask(projectId, taskData);
      return response.data;
    } catch (error) {
      console.error('Failed to create task:', error);
      return null;
    }
  }

  /**
   * Update an existing task
   */
  static async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const response = await tasksApi.updateTask(taskId, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to update task:', error);
      return null;
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId: string): Promise<boolean> {
    try {
      await tasksApi.deleteTask(taskId);
      return true;
    } catch (error) {
      console.error('Failed to delete task:', error);
      return false;
    }
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<Task | null> {
    try {
      const response = await tasksApi.updateTaskStatus(taskId, newStatus);
      return response.data;
    } catch (error) {
      console.error('Failed to update task status:', error);
      return null;
    }
  }

  /**
   * Get tasks by status
   */
  static async getTasksByStatus(projectId: string, status: TaskStatus): Promise<Task[]> {
    const tasks = await this.getTasksByProjectId(projectId);
    return tasks.filter(task => task.status === status);
  }

  /**
   * Search tasks
   */
  static async searchTasks(projectId: string, query: string): Promise<Task[]> {
    const tasks = await this.getTasksByProjectId(projectId);
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
  static async filterTasks(projectId: string, filters: {
    assignee?: string[];
    priority?: string[];
    type?: string[];
    status?: string[];
  }): Promise<Task[]> {
    let tasks = await this.getTasksByProjectId(projectId);

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
