import { useState, useEffect } from "react";
import type { Project } from "../types";
import { ProjectService } from "../services/ProjectService";

/**
 * Hook for managing projects
 */
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const allProjects = ProjectService.getAllProjects();
      setProjects(allProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = (projectData: Omit<Project, "id" | "tasks">) => {
    try {
      const newProject = ProjectService.createProject(projectData);
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      return null;
    }
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    try {
      const updatedProject = ProjectService.updateProject(id, updates);
      if (updatedProject) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? updatedProject : p)),
        );
      }
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
      return null;
    }
  };

  const deleteProject = (id: string) => {
    try {
      const success = ProjectService.deleteProject(id);
      if (success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
      return false;
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: () => {
      setLoading(true);
      setError(null);
      try {
        const allProjects = ProjectService.getAllProjects();
        setProjects(allProjects);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load projects",
        );
      } finally {
        setLoading(false);
      }
    },
  };
};
