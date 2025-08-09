// Backend DTO types to match your Java DTOs

export interface ProjectDTO {
  id?: number;
  userId: number;
  name: string;
  templateType: string;
  features: string[];
}

// Create project request DTO - matches your backend requirement
export interface CreateProjectDTO {
  name: string;
  templateType: string;
}

export interface UserProjectRequestDTO {
  userId: number;
  role: string;
}

export interface UserProjectDTO {
  id: number;
  projectId: number;
  userId: number;
  role: string; // ADMIN, MEMBER, etc.
}

// Request payload for getting projects
export interface GetProjectsPayload {
  projectDTO: ProjectDTO;
  userProjectRequestDTO: UserProjectRequestDTO;
}

// Response from backend for projects
export interface ProjectResponse {
  projectDTO: ProjectDTO;
  userProjectDTO: UserProjectDTO;
}
