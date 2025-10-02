import axios from 'axios';
import { tokenManager } from '../../utils/tokenManager';
import type {
  Organization,
  CreateOrganizationRequest,
  OrganizationMember,
  AddMemberRequest
} from '../../types/api/organizations';

// Create a dedicated API client for organizations service
const organizationsApiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor for organizations API
organizationsApiClient.interceptors.request.use(
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

organizationsApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshed = await tokenManager.refreshAccessToken();
      if (refreshed && error.config) {
        const newToken = tokenManager.getAccessToken();
        if (newToken) {
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return organizationsApiClient(error.config);
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

export const organizationsApi = {
  // Organization management
  getOrganizations: async (): Promise<Organization[]> => {
    // Get the current user's ID as the owner
    const ownerId = tokenManager.getUserId();
    if (!ownerId) {
      throw new Error('User not authenticated');
    }
    
    const response = await organizationsApiClient.get(`/users/organizations/owner/${ownerId}`);
    return response.data;
  },

  createOrganization: async (data: CreateOrganizationRequest, ownerId: number): Promise<Organization> => {
    const response = await organizationsApiClient.post(`/users/organizations?ownerId=${ownerId}`, data);
    return response.data;
  },

  getOrganization: async (orgId: string): Promise<Organization> => {
    const response = await organizationsApiClient.get(`/organizations/${orgId}`);
    return response.data;
  },

  updateOrganization: async (orgId: string, data: Partial<CreateOrganizationRequest>): Promise<Organization> => {
    const response = await organizationsApiClient.put(`/organizations/${orgId}`, data);
    return response.data;
  },

  deleteOrganization: async (orgId: string): Promise<void> => {
    await organizationsApiClient.delete(`/organizations/${orgId}`);
  },

  // Member management
  getOrganizationMembers: async (orgId: string): Promise<OrganizationMember[]> => {
    const response = await organizationsApiClient.get(`/users/organizations/${orgId}/members`);
    return response.data;
  },

  addMember: async (orgId: string, data: AddMemberRequest): Promise<OrganizationMember> => {
    // Get the current user's ID as the requester
    const requesterId = tokenManager.getUserId();
    if (!requesterId) {
      throw new Error('User not authenticated');
    }
    
    const response = await organizationsApiClient.post(
      `/users/organizations/${orgId}/members/add?requesterId=${requesterId}&userEmail=${encodeURIComponent(data.userEmail)}`,
      { role: data.role } // Send role in the request body if provided
    );
    return response.data;
  },

  removeMember: async (orgId: string, memberId: string): Promise<void> => {
    await organizationsApiClient.delete(`/organizations/${orgId}/members/${memberId}`);
  },

  updateMemberRole: async (orgId: string, memberId: string, role: string): Promise<OrganizationMember> => {
    const response = await organizationsApiClient.patch(`/organizations/${orgId}/members/${memberId}`, { role });
    return response.data;
  }
};
