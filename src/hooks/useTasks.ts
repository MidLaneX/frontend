import { useState, useEffect } from 'react';
import type { Task, TaskStatus } from '../types';
import { TaskService } from '../services/TaskService';

/**
 * Hook for managing tasks in a project
 */
export const useTasks = (projectId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    
    const loadTasks = async () => {
      try {
        setLoading(true);
        const projectTasks = await TaskService.getTasksByProjectId(projectId);
        setTasks(projectTasks);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [projectId]);

  const createTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      setLoading(true);
      const newTask = await TaskService.createTask(projectId, taskData);
      if (newTask) {
        setTasks(prev => [...prev, newTask]);
        setError(null);
      }
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      setLoading(true);
      const updatedTask = await TaskService.updateTask(taskId, updates);
      if (updatedTask) {
        setTasks(prev => 
          prev.map(t => t.id === taskId ? updatedTask : t)
        );
        setError(null);
      }
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      setLoading(true);
      const updatedTask = await TaskService.updateTaskStatus(taskId, newStatus);
      if (updatedTask) {
        setTasks(prev => 
          prev.map(t => t.id === taskId ? updatedTask : t)
        );
        setError(null);
      }
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setLoading(true);
      const success = await TaskService.deleteTask(taskId);
      if (success) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setError(null);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const searchTasks = async (query: string) => {
    try {
      return await TaskService.searchTasks(projectId, query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search tasks');
      return [];
    }
  };

  const filterTasks = async (filters: {
    assignee?: string[];
    priority?: string[];
    type?: string[];
    status?: string[];
  }) => {
    try {
      return await TaskService.filterTasks(projectId, filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter tasks');
      return [];
    }
  };

  const refetch = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const projectTasks = await TaskService.getTasksByProjectId(projectId);
      setTasks(projectTasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refetch tasks');
    } finally {
      setLoading(false);
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
    refetch,
  };
};
