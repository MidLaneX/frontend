// Backend DTO types to match your Java DTOs

export interface ProjectDTO {
  id: number;
  orgId: number;
  name: string;
  type: string;
  templateType: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}


// Create project request DTO - matches your backend requirement
export interface CreateProjectDTO {
  id?: number | null;
  orgId: number;
  name: string;
  type: string;
  templateType: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface UserProjectRequestDTO {
  userId: number;

}

export interface UserProjectDTO {
  id?: number | null;
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
