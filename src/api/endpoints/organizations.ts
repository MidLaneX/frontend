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

// Helper function to transform backend response to frontend interface
const transformOrganization = (org: any): Organization => {
  return {
    ...org,
    ownerId: org.owner_id || org.ownerId,
    ownerName: org.owner_name || org.ownerName || '',
    ownerEmail: org.owner_email || org.ownerEmail || '',
    createdAt: org.created_at || org.createdAt,
    updatedAt: org.updated_at || org.updatedAt,
  };
};

// Helper function to transform array of organizations
const transformOrganizations = (orgs: any[]): Organization[] => {
  return orgs.map(transformOrganization);
};

// Helper function to transform member data from backend to frontend interface
const transformMember = (member: any): OrganizationMember => {
  return {
    ...member,
    id: member.user_id || member.id,
    userId: member.user_id || member.userId || member.id,
    username: member.username || member.email || '',
    first_name: member.first_name || member.firstName || '',
    last_name: member.last_name || member.lastName || '',
    email: member.email || '',
    role: member.role || 'member',
    joinedAt: member.joined_at || member.joinedAt || new Date().toISOString(),
    teams: member.teams || [],
  };
};

// Helper function to transform array of members
const transformMembers = (members: any[]): OrganizationMember[] => {
  return members.map(transformMember);
};

organizationsApiClient.interceptors.response.use(
  (response) => {
    // Transform organization data in responses
    if (response.data) {
      if (Array.isArray(response.data)) {
        // Check if it's an array of organizations or members
        if (response.data.length > 0 && response.data[0].name && (response.data[0].ownerId || response.data[0].owner_id)) {
          // Handle array responses (list of organizations)
          response.data = transformOrganizations(response.data);
        } else if (response.data.length > 0 && (response.data[0].user_id || response.data[0].email)) {
          // Handle array of members
          response.data = transformMembers(response.data);
        }
      } else if (response.data.id && response.data.name) {
        // Handle single organization responses
        response.data = transformOrganization(response.data);
      } else if (response.data.user_id || (response.data.id && response.data.email)) {
        // Handle single member responses
        response.data = transformMember(response.data);
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
  // Organization management - get organizations owned by user
  getOwnedOrganizations: async (): Promise<Organization[]> => {
    const userId = tokenManager.getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const response = await organizationsApiClient.get(`/users/organizations/users/${userId}/owned`);
    return response.data;
  },

  // Get organizations where user is a member (but not owner)
  getMemberOrganizations: async (): Promise<Organization[]> => {
    const userId = tokenManager.getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const response = await organizationsApiClient.get(`/users/organizations/users/${userId}/member`);
    return response.data;
  },

  // Get all organizations for user (owned + member)
  getAllUserOrganizations: async (): Promise<Organization[]> => {
    const userId = tokenManager.getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const response = await organizationsApiClient.get(`/users/organizations/users/${userId}/all`);
    return response.data;
  },

  // Legacy method - now calls getAllUserOrganizations for backward compatibility
  getOrganizations: async (): Promise<Organization[]> => {
    return organizationsApi.getAllUserOrganizations();
  },

  createOrganization: async (data: CreateOrganizationRequest, ownerId: number): Promise<Organization> => {
    const response = await organizationsApiClient.post(`/users/organizations?ownerId=${ownerId}`, data);
    return response.data;
  },

  getOrganization: async (orgId: string): Promise<Organization> => {
    const response = await organizationsApiClient.get(`/users/organizations/${orgId}`);
    return response.data;
  },

  updateOrganization: async (orgId: string, data: Partial<CreateOrganizationRequest>): Promise<Organization> => {
    const requesterId = tokenManager.getUserId();
    if (!requesterId) {
      throw new Error('User not authenticated');
    }
    
    const response = await organizationsApiClient.put(`/users/organizations/${orgId}?requesterId=${requesterId}`, data);
    return response.data;
  },

  deleteOrganization: async (orgId: string): Promise<void> => {
    const requesterId = tokenManager.getUserId();
    if (!requesterId) {
      throw new Error('User not authenticated');
    }
    
    await organizationsApiClient.delete(`/users/organizations/${orgId}?requesterId=${requesterId}`);
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
    const requesterId = tokenManager.getUserId();
    if (!requesterId) {
      throw new Error('User not authenticated');
    }
    
    await organizationsApiClient.delete(`/users/organizations/${orgId}/members/${memberId}?requesterId=${requesterId}`);
  },

  updateMemberRole: async (_orgId: string, _memberId: string, _role: string): Promise<OrganizationMember> => {
    // Note: This endpoint is not yet implemented in the backend
    // For now, throw an error to indicate this feature is not available
    throw new Error('Member role updates are not currently supported by the backend');
    
    // Future implementation:
    // const requesterId = tokenManager.getUserId();
    // if (!requesterId) {
    //   throw new Error('User not authenticated');
    // }
    // const response = await organizationsApiClient.patch(`/users/organizations/${orgId}/members/${memberId}?requesterId=${requesterId}`, { role });
    // return response.data;
  }
};
