import { useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { TaskService } from '@/services/TaskService';
import type { Task, TaskStatus } from '@/types';

/**
 * Hook that provides TaskService methods pre-configured with current project context
 * This eliminates the need to pass projectId and templateType to every method call
 */
export const useTaskService = (templateType?: string) => {
  const { projectId } = useParams<{ projectId: string }>();
  
  // Get template type from URL params if not provided
  const { templateType: urlTemplateType } = useParams<{ templateType?: string }>();
  const finalTemplateType = templateType || urlTemplateType || 'scrum';

  // Create pre-configured service methods
  const taskService = useMemo(() => {
    if (!projectId) {
      console.warn('useTaskService: No projectId found in URL params');
      return null;
    }

    return {
      // Get all tasks for current project
      getTasks: () => TaskService.getTasksByProjectId(projectId, finalTemplateType),
      
      // Get task by ID
      getTask: (taskId: string) => TaskService.getTaskById(projectId, taskId, finalTemplateType),
      
      // Create a new task
      createTask: (taskData: Omit<Task, 'id'>) => TaskService.createTask(projectId, taskData, finalTemplateType),
      
      // Update existing task
      updateTask: (taskId: string, updates: Partial<Task>) => TaskService.updateTask(projectId, taskId, updates, finalTemplateType),
      
      // Delete task
      deleteTask: (taskId: string) => TaskService.deleteTask(projectId, taskId, finalTemplateType),
      
      // Update task status
      updateTaskStatus: (taskId: string, newStatus: TaskStatus) => TaskService.updateTaskStatus(projectId, taskId, newStatus, finalTemplateType),
      
      // Get tasks by status
      getTasksByStatus: (status: TaskStatus) => TaskService.getTasksByStatus(projectId, status, finalTemplateType),
      
      // Search tasks
      searchTasks: (query: string) => TaskService.searchTasks(projectId, query, finalTemplateType),
      
      // Filter tasks
      filterTasks: (filters: {
        assignee?: string[];
        priority?: string[];
        type?: string[];
        status?: string[];
      }) => TaskService.filterTasks(projectId, finalTemplateType, filters),
    };
  }, [projectId, finalTemplateType]);

  // Callback versions for use in event handlers
  const callbacks = useMemo(() => {
    if (!taskService) return {};

    return {
      onCreateTask: useCallback(async (taskData: Omit<Task, 'id'>) => {
        return await taskService.createTask(taskData);
      }, [taskService]),

      onUpdateTask: useCallback(async (taskId: string, updates: Partial<Task>) => {
        return await taskService.updateTask(taskId, updates);
      }, [taskService]),

      onDeleteTask: useCallback(async (taskId: string) => {
        return await taskService.deleteTask(taskId);
      }, [taskService]),

      onUpdateTaskStatus: useCallback(async (taskId: string, newStatus: TaskStatus) => {
        return await taskService.updateTaskStatus(taskId, newStatus);
      }, [taskService]),
    };
  }, [taskService]);

  return {
    taskService,
    ...callbacks,
    projectId,
    templateType: finalTemplateType,
    isReady: !!projectId,
  };
};
