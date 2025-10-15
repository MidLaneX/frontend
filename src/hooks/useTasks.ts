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
        const projectIdNum = parseInt(projectId, 10);
        const projectTasks = await TaskService.getTasksByProjectId(projectIdNum);
        setTasks(projectTasks);
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
      const projectIdNum = parseInt(projectId, 10);
      const newTask = await TaskService.createTask(projectIdNum, taskData);
      if (newTask) {
        setTasks(prev => [...prev, newTask]);
      }
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const projectIdNum = parseInt(projectId, 10);
      const taskIdNum = parseInt(taskId, 10);
      const updatedTask = await TaskService.updateTask(projectIdNum, taskIdNum, updates);
      if (updatedTask) {
        setTasks(prev => 
          prev.map(t => t.id === taskIdNum ? updatedTask : t)
        );
      }
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      return null;
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const projectIdNum = parseInt(projectId, 10);
      const taskIdNum = parseInt(taskId, 10);
      const updatedTask = await TaskService.updateTaskStatus(projectIdNum, taskIdNum, newStatus);
      if (updatedTask) {
        setTasks(prev => 
          prev.map(t => t.id === taskIdNum ? updatedTask : t)
        );
      }
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status');
      return null;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const projectIdNum = parseInt(projectId, 10);
      const taskIdNum = parseInt(taskId, 10);
      const success = await TaskService.deleteTask(projectIdNum, taskIdNum);
      if (success) {
        setTasks(prev => prev.filter(t => t.id !== taskIdNum));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      return false;
    }
  };

  const searchTasks = async (query: string) => {
    try {
      const projectIdNum = parseInt(projectId, 10);
      return await TaskService.searchTasks(projectIdNum, query);
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
      const projectIdNum = parseInt(projectId, 10);
      return await TaskService.filterTasks(projectIdNum, filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter tasks');
      return [];
    }
  };

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const projectIdNum = parseInt(projectId, 10);
      const projectTasks = await TaskService.getTasksByProjectId(projectIdNum);
      setTasks(projectTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
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
    refetch
  };
};
