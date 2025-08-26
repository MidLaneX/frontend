import type { Project } from '../types';
import type { ProjectDTO, CreateProjectDTO, GetProjectsPayload, UserProjectRequestDTO } from '../types/dto';
import { projectsApi } from '../api/endpoints/projects';

/**
 * Service class for managing projects
 */
export class ProjectService {
  /**
   * Get all projects for a user
   */
  static async getAllProjects(userId: number = 5, orgId: number = 1, role: string = 'ADMIN', templateType: string = 'scrum', teamIds: number[] = []): Promise<Project[]> {
    // Build UserProjectRequestDTO
    const userProjectRequestDTO: UserProjectRequestDTO = { userId, role };
    // Build payload
    const payload: GetProjectsPayload = {
      projectDTO: {
        id: 0,
        orgId,
        name: '',
        type: '',
        templateType,
        features: [],
        createdAt: '',
        updatedAt: '',
        createdBy: String(userId)
      },
      userProjectRequestDTO
    };
    // Call new API route
    const response = await projectsApi.getProjects(userId, orgId, role, templateType, teamIds);
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map((dto: ProjectDTO): Project => ({
      id: dto.id,
      name: dto.name,
      templateType: dto.templateType,
      features: dto.features || [],
      key: dto.name?.toUpperCase().replace(/\s+/g, '_') || '',
      description: dto.name || '',
      timeline: {
        start: dto.createdAt || new Date().toISOString().split('T')[0],
        end: dto.updatedAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      type: dto.type,
      tasks: []
    }));
  }

  static async createProject(createData: CreateProjectDTO, templateType: string): Promise<Project> {
    // Call new API route
    const response = await projectsApi.createProject(createData, templateType);
    const dto = response.data;
    return {
      id: dto.id,
      name: dto.name,
      templateType: dto.templateType,
      features: dto.features || [],
      key: dto.name.toUpperCase().replace(/\s+/g, '_'),
      description: dto.name,
      timeline: {
        start: dto.createdAt || new Date().toISOString().split('T')[0],
        end: dto.updatedAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      type: dto.type,
      tasks: []
    };
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
  static async getProjectById(id: number , template: string): Promise<Project | null> {
    try {
      const response = await projectsApi.getProject(id, template);
      console.log('ProjectService: getProjectById response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to get project:', error);
      return null;
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
