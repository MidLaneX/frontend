import { organizationsApi } from '../api/endpoints/organizations';
import type {
  Organization,
  CreateOrganizationRequest,
  OrganizationMember,
  AddMemberRequest,
  Team,
  CreateTeamRequest,
  MemberRole
} from '../types/api/organizations';

export class OrganizationService {
  // Organization CRUD operations
  static async getOrganizations(): Promise<Organization[]> {
    try {
      return await organizationsApi.getOrganizations();
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      throw error;
    }
  }

  static async createOrganization(data: CreateOrganizationRequest, ownerId: number): Promise<Organization> {
    try {
      return await organizationsApi.createOrganization(data, ownerId);
    } catch (error) {
      console.error('Failed to create organization:', error);
      throw error;
    }
  }

  static async getOrganization(orgId: string): Promise<Organization> {
    try {
      return await organizationsApi.getOrganization(orgId);
    } catch (error) {
      console.error('Failed to fetch organization:', error);
      throw error;
    }
  }

  static async updateOrganization(orgId: string, data: Partial<CreateOrganizationRequest>): Promise<Organization> {
    try {
      return await organizationsApi.updateOrganization(orgId, data);
    } catch (error) {
      console.error('Failed to update organization:', error);
      throw error;
    }
  }

  static async deleteOrganization(orgId: string): Promise<void> {
    try {
      await organizationsApi.deleteOrganization(orgId);
    } catch (error) {
      console.error('Failed to delete organization:', error);
      throw error;
    }
  }

  // Member management
  static async getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
    try {
      return await organizationsApi.getOrganizationMembers(orgId);
    } catch (error) {
      console.error('Failed to fetch organization members:', error);
      throw error;
    }
  }

  static async addMember(orgId: string, memberData: AddMemberRequest): Promise<OrganizationMember> {
    try {
      return await organizationsApi.addMember(orgId, memberData);
    } catch (error) {
      console.error('Failed to add member:', error);
      throw error;
    }
  }

  static async removeMember(orgId: string, memberId: string): Promise<void> {
    try {
      await organizationsApi.removeMember(orgId, memberId);
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  }

  static async updateMemberRole(orgId: string, memberId: string, role: MemberRole): Promise<OrganizationMember> {
    try {
      return await organizationsApi.updateMemberRole(orgId, memberId, role);
    } catch (error) {
      console.error('Failed to update member role:', error);
      throw error;
    }
  }

  // Team management
  static async getTeams(orgId: string): Promise<Team[]> {
    try {
      return await organizationsApi.getTeams(orgId);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      throw error;
    }
  }

  static async createTeam(teamData: CreateTeamRequest): Promise<Team> {
    try {
      return await organizationsApi.createTeam(teamData);
    } catch (error) {
      console.error('Failed to create team:', error);
      throw error;
    }
  }

  static async updateTeam(orgId: string, teamId: string, data: Partial<CreateTeamRequest>): Promise<Team> {
    try {
      return await organizationsApi.updateTeam(orgId, teamId, data);
    } catch (error) {
      console.error('Failed to update team:', error);
      throw error;
    }
  }

  static async deleteTeam(orgId: string, teamId: string): Promise<void> {
    try {
      await organizationsApi.deleteTeam(orgId, teamId);
    } catch (error) {
      console.error('Failed to delete team:', error);
      throw error;
    }
  }

  static async addTeamMember(orgId: string, teamId: string, memberId: string): Promise<Team> {
    try {
      return await organizationsApi.addTeamMember(orgId, teamId, { memberId });
    } catch (error) {
      console.error('Failed to add team member:', error);
      throw error;
    }
  }

  static async removeTeamMember(orgId: string, teamId: string, memberId: string): Promise<Team> {
    try {
      return await organizationsApi.removeTeamMember(orgId, teamId, memberId);
    } catch (error) {
      console.error('Failed to remove team member:', error);
      throw error;
    }
  }

  static async promoteToTeamLead(orgId: string, teamId: string, memberId: string): Promise<Team> {
    try {
      return await organizationsApi.promoteToTeamLead(orgId, teamId, memberId);
    } catch (error) {
      console.error('Failed to promote to team lead:', error);
      throw error;
    }
  }

  static async demoteTeamLead(orgId: string, teamId: string, memberId: string): Promise<Team> {
    try {
      return await organizationsApi.demoteTeamLead(orgId, teamId, memberId);
    } catch (error) {
      console.error('Failed to demote team lead:', error);
      throw error;
    }
  }

  // Utility methods
  static getRoleDisplayName(role: MemberRole): string {
    const roleNames = {
      owner: 'Owner',
      admin: 'Administrator',
      member: 'Member',
      viewer: 'Viewer'
    };
    return roleNames[role] || role;
  }

  static getRoleColor(role: MemberRole): string {
    const roleColors = {
      owner: '#FF5630',
      admin: '#FF8B00',
      member: '#36B37E',
      viewer: '#5E6C84'
    };
    return roleColors[role] || '#5E6C84';
  }

  static canManageMembers(userRole: MemberRole): boolean {
    return ['owner', 'admin'].includes(userRole);
  }

  static canManageTeams(userRole: MemberRole): boolean {
    return ['owner', 'admin'].includes(userRole);
  }

  static canDeleteOrganization(userRole: MemberRole): boolean {
    return userRole === 'owner';
  }
}
