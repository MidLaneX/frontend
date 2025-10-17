import type { Task, TaskStatus } from "../types";
import { tasksApi } from "../api/endpoints/tasks";

/**
 * Service class for managing tasks
 */
export class TaskService {
  /**
   * Get all tasks for a project
   */
  static async getTasksByProjectId(
    projectId: number,
    templateType = "scrum",
  ): Promise<Task[]> {
    try {
      const response = await tasksApi.getTasks(projectId, templateType);
      return response.data;
    } catch (error) {
      console.error("Failed to get tasks:", error);
      return [];
    }
  }

  /**
   * Get task by ID
   */
  static async getTaskById(
    projectId: number,
    taskId: number,
    templateType = "scrum",
  ): Promise<Task | null> {
    try {
      const response = await tasksApi.getTask(projectId, taskId, templateType);
      return response.data;
    } catch (error) {
      console.error("Failed to get task:", error);
      return null;
    }
  }

  /**
   * Create a new task
   */
  static async createTask(
    projectId: number,
    taskData: Omit<Task, "id">,
    templateType = "scrum",
  ): Promise<Task | null> {
    try {
      const response = await tasksApi.createTask(
        projectId,
        taskData,
        templateType,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create task:", error);
      return null;
    }
  }

  /**
   * Update an existing task
   */
  static async updateTask(
    projectId: number,
    taskId: number,
    updates: Partial<Task>,
    templateType = "scrum",
  ): Promise<Task | null> {
    try {
      const response = await tasksApi.updateTask(
        projectId,
        taskId,
        updates,
        templateType,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update task:", error);
      return null;
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(
    projectId: number,
    taskId: number,
    templateType = "scrum",
  ): Promise<boolean> {
    try {
      await tasksApi.deleteTask(projectId, taskId, templateType);
      return true;
    } catch (error) {
      console.error("Failed to delete task:", error);
      return false;
    }
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(
    projectId: number,
    taskId: number,
    newStatus: TaskStatus,
    templateType = "scrum",
  ): Promise<Task | null> {
    try {
      console.log(
        `TaskService: Updating task ${taskId} status to "${newStatus}" for project ${projectId}`,
      );
      console.log(
        `API endpoint: /projects/${projectId}/tasks/${taskId}/status?templateType=${templateType}`,
      );
      console.log(`Request body:`, { status: newStatus });

      const response = await tasksApi.updateTaskStatus(
        projectId,
        taskId,
        newStatus,
        templateType,
      );
      console.log("TaskService: Task status update response:", response);

      if (response && response.data) {
        console.log(
          "TaskService: Task status updated successfully:",
          response.data,
        );
        return response.data;
      } else {
        console.error("TaskService: No data in response");
        return null;
      }
    } catch (error: any) {
      console.error("TaskService: Failed to update task status:", error);

      // Log more detailed error information
      if (error.response) {
        console.error("TaskService: Error response data:", error.response.data);
        console.error(
          "TaskService: Error response status:",
          error.response.status,
        );
        console.error(
          "TaskService: Error response headers:",
          error.response.headers,
        );
        console.error("TaskService: Full error response:", error.response);
      } else if (error.request) {
        console.error("TaskService: Error request:", error.request);
        console.error("TaskService: No response received from server");
      } else {
        console.error("TaskService: Error message:", error.message);
      }

      // Re-throw the error so the component can handle it properly
      throw error;
    }
  }

  /**
   * Get tasks by status
   */
  static async getTasksByStatus(
    projectId: number,
    status: TaskStatus,
    templateType = "scrum",
  ): Promise<Task[]> {
    const tasks = await this.getTasksByProjectId(projectId, templateType);
    return tasks.filter((task) => task.status === status);
  }

  /**
   * Search tasks
   */
  static async searchTasks(
    projectId: number,
    query: string,
    templateType = "scrum",
  ): Promise<Task[]> {
    const tasks = await this.getTasksByProjectId(projectId, templateType);
    const lowercaseQuery = query.toLowerCase();

    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowercaseQuery) ||
        task.description?.toLowerCase().includes(lowercaseQuery) ||
        task.assignee.toLowerCase().includes(lowercaseQuery) ||
        task.labels.some((label) =>
          label.toLowerCase().includes(lowercaseQuery),
        ),
    );
  }

  /**
   * Update task sprint
   */
  static async updateTaskSprint(
    projectId: number,
    taskId: number,
    sprintId: number | null,
    templateType = "scrum",
  ): Promise<Task | null> {
    try {
      const response = await tasksApi.updateTaskSprint(
        projectId,
        taskId,
        sprintId,
        templateType,
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update sprint for task ${taskId}:`, error);
      return null;
    }
  }

  /**
   * Filter tasks
   */
  static async filterTasks(
    projectId: number,
    filters: {
      assignee?: string[];
      priority?: string[];
      type?: string[];
      status?: string[];
    },
  ): Promise<Task[]> {
    const tasks = await this.getTasksByProjectId(projectId);

    let filteredTasks = tasks;

    if (filters.assignee?.length) {
      filteredTasks = filteredTasks.filter((task) =>
        filters.assignee!.includes(task.assignee),
      );
    }

    if (filters.priority?.length) {
      filteredTasks = filteredTasks.filter((task) =>
        filters.priority!.includes(task.priority),
      );
    }

    if (filters.type?.length) {
      filteredTasks = filteredTasks.filter((task) =>
        filters.type!.includes(task.type),
      );
    }

    if (filters.status?.length) {
      filteredTasks = filteredTasks.filter((task) =>
        filters.status!.includes(task.status),
      );
    }

    return filteredTasks;
  }

  /**
   * Create a task (notifications handled in component layer)
   */
  static async createTaskWithNotification(
    projectId: number,
    taskData: Omit<Task, "id">,
    templateType: string,
    _projectName: string,
    _currentUserName: string,
    _taskUrl: string
  ): Promise<Task | null> {
    try {
      // Create the task first
      const createdTask = await this.createTask(projectId, taskData, templateType);
      
      if (!createdTask) {
        return null;
      }

      // Notifications are now handled in the component layer
      return createdTask;
    } catch (error) {
      console.error("Failed to create task with notification:", error);
      return null;
    }
  }

  /**
   * Update task status (notifications handled in component layer)
   */
  static async updateTaskStatusWithNotification(
    projectId: number,
    taskId: number,
    _oldStatus: TaskStatus,
    newStatus: TaskStatus,
    templateType: string,
    _projectName: string,
    _currentUserName: string,
    _taskUrl: string
  ): Promise<Task | null> {
    try {
      // Update the task status first
      const updatedTask = await this.updateTaskStatus(
        projectId,
        taskId,
        newStatus,
        templateType
      );

      if (!updatedTask) {
        return null;
      }

      // Notifications are now handled in the component layer
      return updatedTask;
    } catch (error) {
      console.error("Failed to update task status with notification:", error);
      throw error;
    }
  }
}
