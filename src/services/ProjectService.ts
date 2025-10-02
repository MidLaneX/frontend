import type { Project } from '../types';
import type { ProjectDTO, CreateProjectDTO } from '../types/dto';
import { projectsApi } from '../api/endpoints/projects';

/**
 * Service class for managing projects
 */
export class ProjectService {
  private static projects: Project[] = [];
  /**
   * Get all projects for a user
   */
 static async getAllProjects(userId: number, orgId: number, templateType: string): Promise<Project[]> {
  // Call backend API
  const response = await projectsApi.getProjects(userId, orgId, templateType);

  const data = Array.isArray(response.data) ? response.data : [];

  // Map DTO -> Frontend Project model
  return data.map((dto: ProjectDTO): Project => ({
    id: dto.id,
    name: dto.name,
    templateType: dto.templateType,
    features: dto.features || [],
    key: dto.name?.toUpperCase().replace(/\s+/g, '_') || '',
    timeline: {
      start: dto.createdAt || new Date().toISOString().split('T')[0],
      end: dto.updatedAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    type: dto.type,
    tasks: [],
    orgId: dto.orgId,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    createdBy: dto.createdBy
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
      timeline: {
        start: dto.createdAt || new Date().toISOString().split('T')[0],
        end: dto.updatedAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      type: dto.type,
      tasks: [],
      orgId: dto.orgId,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      createdBy: dto.createdBy
    };
  }

  /**
   * Get all projects
   */
  // static getAllProjects(): Project[] {
  //   return this.projects;
  // }

  /**
   * Get project by ID
   */
  static async getProjectById(id: number , template: string): Promise<Project | null> {
    try {
      const response = await projectsApi.getProject(id, template);
      console.log('ProjectService: getProjectById response:', response.data);
      
      // If response.data is already a Project object, return it
      if (response.data && typeof response.data === 'object' && 'teamMembers' in response.data) {
        console.log('Project already has teamMembers:', response.data.teamMembers);
        return response.data as Project;
      }
      
      // If response.data is a ProjectDTO, transform it to Project
      const dto = response.data as ProjectDTO;
      if (dto) {
        // TODO: Fetch actual team members from backend API
        // For now, adding sample team members for testing
        const sampleTeamMembers = [
          { name: 'John Doe', role: 'Developer', avatar: 'JD' },
          { name: 'Jane Smith', role: 'Designer', avatar: 'JS' },
          { name: 'Mike Johnson', role: 'Product Manager', avatar: 'MJ' },
          { name: 'Sarah Wilson', role: 'QA Engineer', avatar: 'SW' },
          { name: 'Alex Brown', role: 'DevOps', avatar: 'AB' }
        ];
        
        console.log('Creating project with sample team members:', sampleTeamMembers);
        
        return {
          id: String(dto.id),
          name: dto.name,
          key: dto.name?.toUpperCase().replace(/\s+/g, '_') || '',
          description: dto.name || '',
          timeline: {
            start: dto.createdAt || new Date().toISOString().split('T')[0],
            end: dto.updatedAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          type: dto.type as any,
          teamMembers: sampleTeamMembers, // Use sample data for now
          tasks: [] // Initialize empty tasks array
        };
      }
      
      return null;
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
      (project.key && project.key.toLowerCase().includes(lowercaseQuery))
    );
  }
}
