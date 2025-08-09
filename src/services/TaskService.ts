import type { Task, TaskStatus } from '../types';
import { ProjectService } from './ProjectService';

/**
 * Service class for managing tasks
 */
export class TaskService {
  /**
   * Get all tasks for a project
   */
  static getTasksByProjectId(projectId: string): Task[] {
    const project = ProjectService.getProjectById(projectId);
    return project?.tasks || [];
  }

  /**
   * Get task by ID
   */
  static getTaskById(projectId: string, taskId: string): Task | undefined {
    const tasks = this.getTasksByProjectId(projectId);
    return tasks.find(task => task.id === taskId);
  }

  /**
   * Create a new task
   */
  static createTask(projectId: string, taskData: Omit<Task, 'id' | 'comments'>): Task | null {
    const project = ProjectService.getProjectById(projectId);
    if (!project) return null;

    const newTask: Task = {
      ...taskData,
      id: `${project.key}-${project.tasks.length + 1}`,
      comments: [],
    };

    project.tasks.push(newTask);
    return newTask;
  }

  /**
   * Update an existing task
   */
  static updateTask(projectId: string, taskId: string, updates: Partial<Task>): Task | null {
    const project = ProjectService.getProjectById(projectId);
    if (!project) return null;

    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;

    project.tasks[taskIndex] = { ...project.tasks[taskIndex], ...updates };
    return project.tasks[taskIndex];
  }

  /**
   * Delete a task
   */
  static deleteTask(projectId: string, taskId: string): boolean {
    const project = ProjectService.getProjectById(projectId);
    if (!project) return false;

    const initialLength = project.tasks.length;
    project.tasks = project.tasks.filter(t => t.id !== taskId);
    return project.tasks.length < initialLength;
  }

  /**
   * Update task status
   */
  static updateTaskStatus(projectId: string, taskId: string, newStatus: TaskStatus): Task | null {
    return this.updateTask(projectId, taskId, { status: newStatus });
  }

  /**
   * Get tasks by status
   */
  static getTasksByStatus(projectId: string, status: TaskStatus): Task[] {
    const tasks = this.getTasksByProjectId(projectId);
    return tasks.filter(task => task.status === status);
  }

  /**
   * Search tasks
   */
  static searchTasks(projectId: string, query: string): Task[] {
    const tasks = this.getTasksByProjectId(projectId);
    const lowercaseQuery = query.toLowerCase();
    
    return tasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description?.toLowerCase().includes(lowercaseQuery) ||
      task.assignee.toLowerCase().includes(lowercaseQuery) ||
      task.labels.some(label => label.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Filter tasks
   */
  static filterTasks(projectId: string, filters: {
    assignee?: string[];
    priority?: string[];
    type?: string[];
    status?: string[];
  }): Task[] {
    let tasks = this.getTasksByProjectId(projectId);

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
