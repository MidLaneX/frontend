import type { Project} from '../types';
import type { ProjectDTO } from '../types/dto';
import { projectsApi } from '../api/endpoints/projects';

/**
 * Service class for managing projects
 */
export class ProjectService {
  /**
   * Get all projects for a user
   */
  static async getAllProjects(userId: number = 5, template: string = 'Scrum'): Promise<Project[]> {
    const response = await projectsApi.getProjects(userId, template);
    
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

  /**
   * Generate project key from project name
   */
  private static generateProjectKey(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 3);
  }

  /**
   * Get project by ID
   */
  static async getProjectById(id: number): Promise<Project | null> {
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
    console.log('Creating project with data:', projectData);
    
    // Get userId from localStorage or use default
    const userId = parseInt(localStorage.getItem('userId') || '5');
    
    const dto: ProjectDTO = {
      userId: userId,
      name: projectData.name,
      templateType: 'Scrum', // Default template type
      features: [] // Default empty features
    };
    
    console.log('Sending DTO to API:', dto);
    console.log('API URL:', 'POST /projects?template=scrum');
    
    try {
      const response = await projectsApi.createProject(dto, 'scrum');
      console.log('API Response:', response.data);
      
      // Convert ProjectDTO response back to Project format
      return {
        id: response.data.id || Math.floor(Math.random() * 10000),
        name: response.data.name,
        templateType: response.data.templateType,
        features: response.data.features,
        key: this.generateProjectKey(response.data.name),
        description: projectData.description || response.data.name,
        timeline: projectData.timeline,
        teamMembers: projectData.teamMembers,
        type: projectData.type,
        tasks: projectData.tasks
      };
    } catch (error) {
      console.error('Project creation failed:', error);
      throw error;
    }
  }

  /**
   * Update an existing project
   */
  static async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      // Convert Project updates to ProjectDTO format
      const dto: Partial<ProjectDTO> = {
        id: parseInt(id),
        name: updates.name,
        // Only include fields that exist in ProjectDTO
      };
      
      const response = await projectsApi.updateProject(id, dto);
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
   * Get projects by type (using frontend filtering since backend doesn't support this)
   */
  static async getProjectsByType(type: Project['type'], userId: number = 3, role: string = 'MEMBER'): Promise<Project[]> {
    const projects = await this.getAllProjects(userId, role);
    return projects.filter(project => project.type === type);
  }

  /**
   * Search projects by name or key
   */
  static async searchProjects(query: string, userId: number = 3, role: string = 'MEMBER'): Promise<Project[]> {
    const projects = await this.getAllProjects(userId, role);
    const lowercaseQuery = query.toLowerCase();
    return projects.filter(project => 
      project.name.toLowerCase().includes(lowercaseQuery) ||
      project.key?.toLowerCase().includes(lowercaseQuery) ||
      project.description?.toLowerCase().includes(lowercaseQuery)
    );
  }
}
