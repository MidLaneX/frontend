import type { Project } from '../types';
import { projects } from '../data/projects';

/**
 * Service class for managing projects
 */
export class ProjectService {
<<<<<<< HEAD
  /**
   * Get all projects for a user
   */
  static async getAllProjects(userId: number = 1, templateType: string = 'scrum'): Promise<Project[]> {
    const response = await projectsApi.getProjects(userId, templateType);
    console.log('ProjectService: getAllProjects response:', response.data);
    // Convert ProjectDTO response to Project format for frontend compatibility
    return response.data.map((projectDto: ProjectDTO) => ({
      id: projectDto.id || Math.floor(Math.random() * 10000),
      name: projectDto.name,
      templateType: projectDto.templateType,
      features: projectDto.features,
      key: this.generateProjectKey(projectDto.name),
      description: projectDto.name, // Use name as description for now
      timeline: { 
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days from now
      },
      teamMembers: [], // Default empty array
      type: 'Software' as const, // Default type
      tasks: [] // Default empty tasks
    }));
  }
=======
  private static projects: Project[] = [...projects];
>>>>>>> d6ec73920076e0ad902599266742a453515c27b9

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

<<<<<<< HEAD
  static async createProject(projectData: Omit<Project, 'id'>): Promise<Project> {
    console.log('Creating project with data:', projectData);
    
    // Get userId from localStorage or use default
    const userId = parseInt(localStorage.getItem('userId') || '1');
    
    const dto: ProjectDTO = {
      userId: userId,
      name: projectData.name,
      templateType: 'Scrum', // Default template type
      features: [] // Default empty features
=======
  /**
   * Create a new project
   */
  static createProject(projectData: Omit<Project, 'id' | 'tasks'>): Project {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      tasks: [],
>>>>>>> d6ec73920076e0ad902599266742a453515c27b9
    };
    
    this.projects.push(newProject);
    return newProject;
  }

  /**
   * Update an existing project
   */
<<<<<<< HEAD
  static async updateProject(id: number, updates: Partial<Project>): Promise<Project | null> {
    try {
      // Convert Project updates to ProjectDTO format
      const dto: Partial<ProjectDTO> = {
        id: id,
        name: updates.name,
        // Only include fields that exist in ProjectDTO
      };
      
      const response = await projectsApi.updateProject(id, dto);
      return response.data;
    } catch (error) {
      console.error('Failed to update project:', error);
      return null;
    }
=======
  static updateProject(id: string, updates: Partial<Project>): Project | null {
    const projectIndex = this.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) return null;

    this.projects[projectIndex] = { ...this.projects[projectIndex], ...updates };
    return this.projects[projectIndex];
>>>>>>> d6ec73920076e0ad902599266742a453515c27b9
  }

  /**
   * Delete a project
   */
<<<<<<< HEAD
  static async deleteProject(id: number): Promise<boolean> {
    try {
      await projectsApi.deleteProject(id);
      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
=======
  static deleteProject(id: string): boolean {
    const initialLength = this.projects.length;
    this.projects = this.projects.filter(p => p.id !== id);
    return this.projects.length < initialLength;
>>>>>>> d6ec73920076e0ad902599266742a453515c27b9
  }

  /**
   * Get projects by type
   */
<<<<<<< HEAD
  static async getProjectsByType(type: Project['type'], userId: number = 1, role: string = 'MEMBER'): Promise<Project[]> {
    const projects = await this.getAllProjects(userId, role);
    return projects.filter(project => project.type === type);
=======
  static getProjectsByType(type: Project['type']): Project[] {
    return this.projects.filter(project => project.type === type);
>>>>>>> d6ec73920076e0ad902599266742a453515c27b9
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
