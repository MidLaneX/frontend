import { projectsApiClient } from "../client";
import type { Project } from "../../types";
import type {
  ProjectDTO,
  CreateProjectDTO,
  UserProjectDTO,
} from "../../types/dto";

export const projectsApi = {
  // Get all projects for a user with query parameters
  getProjects: (userId: number, orgId: number, templateType: string) => {
    const url = `/projects/user-projects?userId=${userId}&orgId=${orgId}&templateType=${templateType}`;
    console.log("API: Fetching projects with URL:", url);
    return projectsApiClient.get<ProjectDTO[]>(url);
  },

  //  Get project by ID with template-specific features
  getProject: (id: number, templateType: string) => {
    console.log("API: Fetching project:", id, "templateType:", templateType);
    return projectsApiClient.get<Project>(`/projects/${id}/${templateType}`);
  },

  //  Get project features (for dynamic navigation)
  getProjectFeatures: (projectId: string, templateType: string) => {
    console.log(
      "API: Fetching features for project:",
      projectId,
      "template:",
      templateType,
    );
    return projectsApiClient.get(
      `/projects/${projectId}/features?templateType=${templateType}`,
    );
  },

  //  Create new project (backend expects ?template= param)
  createProject: (data: CreateProjectDTO, template: string) => {
    console.log("API: Creating project with data:", data);
    console.log("API: Template parameter:", template);
    return projectsApiClient.post<ProjectDTO>(
      `/projects?template=${template}`,
      data,
    );
  },

  //  Update project with template and userId parameters
  updateProject: (
    id: number,
    templateType: string,
    userId: number,
    data: Partial<ProjectDTO>,
  ) => {
    console.log("API: Updating project:", { id, templateType, userId, data });
    return projectsApiClient.put<ProjectDTO>(
      `/projects/${id}/${templateType}?userId=${userId}`,
      data,
    );
  },

  // Delete project with admin permission check
  deleteProject: (id: number, templateType: string, userId: number) => {
    console.log("API: Deleting project:", { id, templateType, userId });
    return projectsApiClient.delete(
      `/projects/${id}/${templateType}?userId=${userId}`,
    );
  },

  // Assign team to project
  assignTeamToProject: (
    projectId: number,
    templateType: string,
    teamId: number,
  ) => {
    console.log("API: Assigning team to project:", {
      projectId,
      templateType,
      teamId,
    });
    return projectsApiClient.post<UserProjectDTO[]>(
      `/projects/${projectId}/assignTeamToProject?templateType=${templateType}&teamId=${teamId}`,
    );
  },

  // Get assigned team of project
  getAssignedTeam: (projectId: number, templateType: string) => {
    console.log("API: Getting assigned team for project:", {
      projectId,
      templateType,
    });
    return projectsApiClient.get<number | null>(
      `/projects/${projectId}/assigned-team?templateType=${templateType}`,
    );
  },
};
