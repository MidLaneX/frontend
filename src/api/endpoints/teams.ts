import axios from 'axios';
import { tokenManager } from '../../utils/tokenManager';
import type {
  Team,
  CreateTeamRequest,
  UpdateTeamMemberRequest,
  TeamMemberDetail,
  TeamMemberDetailRaw
} from '../../types/api/organizations';

// Helper function to transform team data from backend to frontend interface
const transformTeam = (team: any): Team => {
  return {
    ...team,
    // Handle both TeamResponse (id) and OrganizationTeamResponse (teamId)
    id: team.id || team.teamId || team.team_id || '',
    // Handle both formats: teamName from OrganizationTeamResponse, name from TeamResponse
    team_name: team.teamName || team.team_name || team.name || '',
    description: team.description || '',
    // Map organizationId properly
    organizationId: team.organizationId || team.organization_id || '',
    // Map team lead information
    leadId: team.teamLeadId || team.lead_id || team.leadId || '',
    leadName: team.teamLeadName || team.lead_name || team.leadName || '',
    // Map timestamps
    createdAt: team.created_at || team.createdAt || '',
    updatedAt: team.updated_at || team.updatedAt || '',
    // Handle members array or member count
    members: team.members || [],
    // Map project count
    projectCount: team.project_count || team.projectCount || 0,
    // Handle member count from OrganizationTeamResponse
    memberCount: team.memberCount || team.member_count || team.currentMemberCount || (team.members ? team.members.length : 0),
    // Handle team type
    teamType: team.teamType || team.team_type || team.type || '',
    // Handle other properties that might be present
    maxMembers: team.maxMembers || team.max_members || 0,
    status: team.status || 'ACTIVE',
    hasAvailableSlots: team.hasAvailableSlots || false,
  };
};

// Helper function to transform array of teams
const transformTeams = (teams: any[]): Team[] => {
  return teams.map(transformTeam);
};

// Helper function to transform team member data from backend to frontend interface
const transformTeamMember = (rawMember: TeamMemberDetailRaw): TeamMemberDetail => {
  return {
    memberId: rawMember.member_id,
    name: rawMember.name,
    email: rawMember.email,
    role: rawMember.role,
    isTeamLead: rawMember.team_lead,
  };
};

// Helper function to transform array of team members
const transformTeamMembers = (rawMembers: TeamMemberDetailRaw[]): TeamMemberDetail[] => {
  return rawMembers.map(transformTeamMember);
};

// Create a dedicated API client for teams service
const teamsApiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor for teams API
teamsApiClient.interceptors.request.use(
  async (config) => {
    const token = await tokenManager.getValidAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

teamsApiClient.interceptors.response.use(
  (response) => {
    // Transform team data in responses
    if (response.data) {
      if (Array.isArray(response.data)) {
        // Handle array responses (list of teams)
        response.data = transformTeams(response.data);
      } else if (response.data.id || response.data.team_id) {
        // Handle single team responses
        response.data = transformTeam(response.data);
      }
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      const refreshed = await tokenManager.refreshAccessToken();
      if (refreshed && error.config) {
        const newToken = tokenManager.getAccessToken();
        if (newToken) {
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return teamsApiClient(error.config);
        }
      }
      tokenManager.clearTokens();
      if (window.location.pathname !== '/landing') {
        window.location.href = '/landing';
      }
    }
    return Promise.reject(error);
  }
);

export const teamsApi = {
  // Team management
  getTeams: async (orgId: string): Promise<Team[]> => {
    const response = await teamsApiClient.get(`/users/organizations/${orgId}/teams`);
    return response.data;
  },

  createTeam: async (data: CreateTeamRequest): Promise<Team> => {
    // Get the current user's ID as the creator
    const creatorId = tokenManager.getUserId();
    if (!creatorId) {
      throw new Error('User not authenticated');
    }
    
    const response = await teamsApiClient.post(`/users/teams?creatorId=${creatorId}`, data);
    return response.data;
  },

  updateTeam: async (orgId: string, teamId: string, data: Partial<CreateTeamRequest>): Promise<Team> => {
    // Get the current user's ID as the requester
    const requesterId = tokenManager.getUserId();
    if (!requesterId) {
      throw new Error('User not authenticated');
    }
    
    const response = await teamsApiClient.put(`/organizations/${orgId}/teams/${teamId}?requesterId=${requesterId}`, data);
    return response.data;
  },

  deleteTeam: async (orgId: string, teamId: string): Promise<void> => {
    // Get the current user's ID as the requester
    const requesterId = tokenManager.getUserId();
    if (!requesterId) {
      throw new Error('User not authenticated');
    }
    
    await teamsApiClient.delete(`/organizations/${orgId}/teams/${teamId}?requesterId=${requesterId}`);
  },

  addTeamMember: async (orgId: string, teamId: string, data: UpdateTeamMemberRequest): Promise<Team> => {
    // Get the current user's ID as the requester
    const requesterId = tokenManager.getUserId();
    if (!requesterId) {
      throw new Error('User not authenticated');
    }
    
    const response = await teamsApiClient.post(`/organizations/${orgId}/teams/${teamId}/members?requesterId=${requesterId}`, data);
    return response.data;
  },

  addTeamMemberById: async (teamId: string, userId: string): Promise<Team> => {
    // Get the current user's ID as the requester
    const requesterId = tokenManager.getUserId();
    if (!requesterId) {
      throw new Error('User not authenticated');
    }
    
    const response = await teamsApiClient.post(`/users/teams/${teamId}/members/${userId}?requesterId=${requesterId}`);
    return response.data;
  },

  removeTeamMember: async (orgId: string, teamId: string, memberId: string): Promise<Team> => {
    // Get the current user's ID as the requester
    const requesterId = tokenManager.getUserId();
    if (!requesterId) {
      throw new Error('User not authenticated');
    }
    
    const response = await teamsApiClient.delete(`/organizations/${orgId}/teams/${teamId}/members/${memberId}?requesterId=${requesterId}`);
    return response.data;
  },

  promoteToTeamLead: async (orgId: string, teamId: string, memberId: string): Promise<Team> => {
    // Get the current user's ID as the requester
    const requesterId = tokenManager.getUserId();
    if (!requesterId) {
      throw new Error('User not authenticated');
    }
    
    const response = await teamsApiClient.patch(`/organizations/${orgId}/teams/${teamId}/members/${memberId}/promote?requesterId=${requesterId}`);
    return response.data;
  },

  demoteTeamLead: async (orgId: string, teamId: string, memberId: string): Promise<Team> => {
    // Get the current user's ID as the requester
    const requesterId = tokenManager.getUserId();
    if (!requesterId) {
      throw new Error('User not authenticated');
    }
    
    const response = await teamsApiClient.patch(`/organizations/${orgId}/teams/${teamId}/members/${memberId}/demote?requesterId=${requesterId}`);
    return response.data;
  },

  // New API methods for team settings functionality
  removeTeamMemberById: async (teamId: string, userId: string): Promise<void> => {
    // Get the current user's ID as the requester
    const requesterId = tokenManager.getUserId();
    if (!requesterId) {
      throw new Error('User not authenticated');
    }
    
    await teamsApiClient.delete(`/users/teams/${teamId}/members/${userId}?requesterId=${requesterId}`);
  },

  updateTeamById: async (teamId: string, data: Partial<CreateTeamRequest>): Promise<Team> => {
    // Get the current user's ID as the requester
    const requesterId = tokenManager.getUserId();
    if (!requesterId) {
      throw new Error('User not authenticated');
    }
    
    const response = await teamsApiClient.put(`/users/teams/${teamId}?requesterId=${requesterId}`, data);
    return response.data;
  },

  updateTeamLead: async (teamId: string, userId: string): Promise<Team> => {
    // Get the current user's ID as the requester
    const requesterId = tokenManager.getUserId();
    if (!requesterId) {
      throw new Error('User not authenticated');
    }
    
    const response = await teamsApiClient.put(`/users/teams/${teamId}/lead/${userId}?requesterId=${requesterId}`);
    return response.data;
  },

  // Get detailed team members
  getTeamMembers: async (teamId: string): Promise<TeamMemberDetail[]> => {
    const response = await teamsApiClient.get(`/users/teams/${teamId}/members`);
    // Transform the raw backend response to frontend format
    return transformTeamMembers(response.data);
  },

  // Get teams that a user belongs to in a specific organization
  getUserTeamsInOrganization: async (organizationId: string, userId: string): Promise<Team[]> => {
    const response = await teamsApiClient.get(`/users/teams/organization/${organizationId}/user/${userId}`);
    return response.data;
  }
};