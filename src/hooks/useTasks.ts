import { useState, useEffect } from "react";
import type { Task, TaskStatus } from "../types";
import { TaskService } from "../services/TaskService";

/**
 * Hook for managing tasks in a project
 */
export const useTasks = (projectId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    try {
      const projectTasks = TaskService.getTasksByProjectId(projectId);
      setTasks(projectTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createTask = (taskData: Omit<Task, "id" | "comments">) => {
    try {
      const newTask = TaskService.createTask(projectId, taskData);
      if (newTask) {
        setTasks((prev) => [...prev, newTask]);
      }
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
      return null;
    }
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = TaskService.updateTask(projectId, taskId, updates);
      if (updatedTask) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t)),
        );
      }
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      return null;
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    try {
      const updatedTask = TaskService.updateTaskStatus(
        projectId,
        taskId,
        newStatus,
      );
      if (updatedTask) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t)),
        );
      }
      return updatedTask;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update task status",
      );
      return null;
    }
  };

  const deleteTask = (taskId: string) => {
    try {
      const success = TaskService.deleteTask(projectId, taskId);
      if (success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      return false;
    }
  };

  const searchTasks = (query: string) => {
    try {
      return TaskService.searchTasks(projectId, query);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search tasks");
      return [];
    }
  };

  const filterTasks = (filters: {
    assignee?: string[];
    priority?: string[];
    type?: string[];
    status?: string[];
  }) => {
    try {
      return TaskService.filterTasks(projectId, filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter tasks");
      return [];
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    searchTasks,
    filterTasks,
    refetch: () => {
      setLoading(true);
      setError(null);
      try {
        const projectTasks = TaskService.getTasksByProjectId(projectId);
        setTasks(projectTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    },
  };
};
