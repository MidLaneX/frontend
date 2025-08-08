import { useState, useEffect } from 'react';
import type { Project } from '../types';
import { ProjectService } from '../services/ProjectService';

/**
 * Hook for managing projects
 */
export const useProjects = ({ userId = 5, templateType = 'Scrum' }: { userId?: number; templateType?: string } = {}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const allProjects = await ProjectService.getAllProjects(userId, templateType);
        setProjects(allProjects);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [userId, templateType]);

  const createProject = async (projectData: Omit<Project, 'id'>) => {
    console.log('useProjects: createProject called with:', projectData);
    try {
      setLoading(true);
      const newProject = await ProjectService.createProject(projectData);
      console.log('useProjects: Project created successfully:', newProject);
      setProjects(prev => [...prev, newProject]);
      setError(null);
      return newProject;
    } catch (err) {
      console.error('useProjects: Project creation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: number, updates: Partial<Project>) => {
    try {
      setLoading(true);
      const updatedProject = await ProjectService.updateProject(id.toString(), updates);
      if (updatedProject) {
        setProjects(prev => 
          prev.map(p => p.id === id ? updatedProject : p)
        );
        setError(null);
      }
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: number) => {
    try {
      setLoading(true);
      const success = await ProjectService.deleteProject(id.toString());
      if (success) {
        setProjects(prev => prev.filter(p => p.id !== id));
        setError(null);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    try {
      setLoading(true);
      const allProjects = await ProjectService.getAllProjects(userId, templateType);
      setProjects(allProjects);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refetch projects');
    } finally {
      setLoading(false);
    }
  };

 

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch,
  };
};
