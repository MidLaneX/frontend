import type { Project } from '../types';
import { projectsApi } from '../api/endpoints/projects';

/**
 * Service class for managing projects
 */
export class ProjectService {
  /**
   * Get all projects
   */
 static async getAllProjects(payload: {
  projectDTO: Partial<Project>;
  userProjectRequestDTO: { userId: number; role: string };
}): Promise<Project[]> {
  const response = await projectsApi.getProjects(payload);
  return response.data;
}

  /**
   * Get project by ID
   */
  static async getProjectById(id: string): Promise<Project | null> {
    try {
      const response = await projectsApi.getProject(id);
      return response.data;
    } catch (error) {
      console.error('Failed to get project:', error);
      return null;
    }
  }

  /**
   * Create a new project
   */
  static async createProject(projectData: Omit<Project, 'id'>): Promise<Project> {
    const response = await projectsApi.createProject(projectData);
    return response.data;
  }

  /**
   * Update an existing project
   */
  static async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const response = await projectsApi.updateProject(id, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to update project:', error);
      return null;
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(id: string): Promise<boolean> {
    try {
      await projectsApi.deleteProject(id);
      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  }

  /**
   * Get projects by type
   */
  static async getProjectsByType(type: Project['type']): Promise<Project[]> {
    const projects = await this.getAllProjects();
    return projects.filter(project => project.type === type);
  }

  /**
   * Search projects by name or key
   */
  static async searchProjects(query: string): Promise<Project[]> {
    const projects = await this.getAllProjects();
    const lowercaseQuery = query.toLowerCase();
    return projects.filter(project => 
      project.name.toLowerCase().includes(lowercaseQuery) ||
      project.key.toLowerCase().includes(lowercaseQuery) ||
      project.description.toLowerCase().includes(lowercaseQuery)
    );
  }
}
