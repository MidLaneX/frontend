import type { Project } from '../types';
import { projects } from '../data/projects';

/**
 * Service class for managing projects
 */
export class ProjectService {
  private static projects: Project[] = [...projects];

  /**
   * Get all projects
   */
  static getAllProjects(): Project[] {
    return this.projects;
  }

  /**
   * Get project by ID
   */
  static getProjectById(id: string): Project | undefined {
    return this.projects.find(project => project.id === id);
  }

  /**
   * Create a new project
   */
  static createProject(projectData: Omit<Project, 'id' | 'tasks'>): Project {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      tasks: [],
    };
    
    this.projects.push(newProject);
    return newProject;
  }

  /**
   * Update an existing project
   */
  static updateProject(id: string, updates: Partial<Project>): Project | null {
    const projectIndex = this.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) return null;

    this.projects[projectIndex] = { ...this.projects[projectIndex], ...updates };
    return this.projects[projectIndex];
  }

  /**
   * Delete a project
   */
  static deleteProject(id: string): boolean {
    const initialLength = this.projects.length;
    this.projects = this.projects.filter(p => p.id !== id);
    return this.projects.length < initialLength;
  }

  /**
   * Get projects by type
   */
  static getProjectsByType(type: Project['type']): Project[] {
    return this.projects.filter(project => project.type === type);
  }

  /**
   * Search projects by name or key
   */
  static searchProjects(query: string): Project[] {
    const lowercaseQuery = query.toLowerCase();
    return this.projects.filter(project => 
      project.name.toLowerCase().includes(lowercaseQuery) ||
      project.key.toLowerCase().includes(lowercaseQuery) ||
      project.description.toLowerCase().includes(lowercaseQuery)
    );
  }
}
