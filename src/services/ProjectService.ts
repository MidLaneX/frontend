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
   * Get all projects
   */
  static getAllProjects(): Project[] {
    return this.projects;
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
