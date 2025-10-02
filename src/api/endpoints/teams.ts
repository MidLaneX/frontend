import axios from 'axios';
import { tokenManager } from '../../utils/tokenManager';
import type {
  Team,
  CreateTeamRequest,
  UpdateTeamMemberRequest
} from '../../types/api/organizations';

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
  (response) => response,
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
    const response = await teamsApiClient.put(`/organizations/${orgId}/teams/${teamId}`, data);
    return response.data;
  },

  deleteTeam: async (orgId: string, teamId: string): Promise<void> => {
    await teamsApiClient.delete(`/organizations/${orgId}/teams/${teamId}`);
  },

  addTeamMember: async (orgId: string, teamId: string, data: UpdateTeamMemberRequest): Promise<Team> => {
    const response = await teamsApiClient.post(`/organizations/${orgId}/teams/${teamId}/members`, data);
    return response.data;
  },

  removeTeamMember: async (orgId: string, teamId: string, memberId: string): Promise<Team> => {
    const response = await teamsApiClient.delete(`/organizations/${orgId}/teams/${teamId}/members/${memberId}`);
    return response.data;
  },

  promoteToTeamLead: async (orgId: string, teamId: string, memberId: string): Promise<Team> => {
    const response = await teamsApiClient.patch(`/organizations/${orgId}/teams/${teamId}/members/${memberId}/promote`);
    return response.data;
  },

  demoteTeamLead: async (orgId: string, teamId: string, memberId: string): Promise<Team> => {
    const response = await teamsApiClient.patch(`/organizations/${orgId}/teams/${teamId}/members/${memberId}/demote`);
    return response.data;
  }
};