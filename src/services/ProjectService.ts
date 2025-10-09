import type { Project } from '../types';
import type { ProjectDTO, CreateProjectDTO, UserProjectDTO } from '../types/dto';
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
      console.log('ProjectService: response data type:', typeof response.data);
      console.log('ProjectService: response data keys:', response.data ? Object.keys(response.data) : 'null/undefined');
      
      // Always transform the response to ensure proper Project structure
      const dto = response.data as ProjectDTO;
      
      console.log('ProjectService: DTO fields:', {
        id: dto?.id,
        name: dto?.name,
        type: dto?.type,
        templateType: dto?.templateType,
        features: dto?.features,
        featuresLength: dto?.features?.length,
        orgId: dto?.orgId,
        createdAt: dto?.createdAt,
        updatedAt: dto?.updatedAt,
        createdBy: dto?.createdBy
      });
      
      if (dto) {
     
        const transformedProject = {
          id: dto.id,
          name: dto.name,
          key: dto.name?.toUpperCase().replace(/\s+/g, '_') || '',
          templateType: dto.templateType, // Default features based on template
          features: dto.features || [],
          timeline: {
            start: dto.createdAt || new Date().toISOString().split('T')[0],
            end: dto.updatedAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          type: dto.type,
          teamMembers: [], // Use sample data for now
          tasks: [], // Initialize empty tasks array
          orgId: dto.orgId,
          createdAt: dto.createdAt,
          updatedAt: dto.updatedAt,
          createdBy: dto.createdBy
        };
        
        return transformedProject;
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
  static async updateProject(
    id: number, 
    templateType: string, 
    userId: number, 
    updates: Partial<ProjectDTO>
  ): Promise<Project> {
    try {
      console.log('ProjectService: Updating project:', { id, templateType, userId, updates });
      
      const response = await projectsApi.updateProject(id, templateType, userId, updates);
      const dto = response.data;
      
      console.log('ProjectService: Project updated successfully:', dto);
      
      // Map DTO to frontend Project model
      return {
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
      };
    } catch (error: any) {
      console.error('Failed to update project:', error);
      
      // Check if it's an admin permission error
      if (error.response?.status === 403 || error.response?.status === 401) {
        throw new Error('Only administrators can update projects. Please contact your admin.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to update project');
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(
    id: number, 
    templateType: string, 
    userId: number
  ): Promise<void> {
    try {
      console.log('ProjectService: Deleting project:', { id, templateType, userId });
      
      await projectsApi.deleteProject(id, templateType, userId);
      
      console.log('ProjectService: Project deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      
      // Check if it's an admin permission error
      if (error.response?.status === 403 || error.response?.status === 401) {
        throw new Error('Only administrators can delete projects. Please contact your admin.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to delete project');
    }
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

  /**
   * Assign team to project
   */
  static async assignTeamToProject(
    projectId: number, 
    templateType: string, 
    teamId: number
  ): Promise<UserProjectDTO[]> {
    try {
      console.log('ProjectService: Assigning team to project:', { 
        projectId, 
        templateType, 
        teamId: teamId,
        teamIdType: typeof teamId 
      });

      // Ensure teamId is a number
      const numericTeamId = Number(teamId);
      if (isNaN(numericTeamId)) {
        throw new Error(`Invalid team ID: ${teamId}. Must be a number.`);
      }

      const response = await projectsApi.assignTeamToProject(projectId, templateType, numericTeamId);
      console.log('ProjectService: Team assignment successful!', {
        assignedTeamId: numericTeamId,
        projectId: projectId,
        responseData: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to assign team to project:', error);
      throw error;
    }
  }

  /**
   * Get assigned team of project
   */
  static async getAssignedTeam(
    projectId: number, 
    templateType: string
  ): Promise<number | null> {
    try {
      console.log('ProjectService: Getting assigned team for project:', { 
        projectId, 
        templateType 
      });

      const response = await projectsApi.getAssignedTeam(projectId, templateType);
      console.log('ProjectService: Got assigned team:', {
        projectId: projectId,
        assignedTeamId: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get assigned team for project:', error);
      // Return null if no team is assigned or on error
      return null;
    }
  }
}
