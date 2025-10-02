import { organizationsApi } from '../api/endpoints/organizations';
import { getRoleDisplayInfo } from '../utils/organizationPermissions';
import type { MemberRole, OrganizationRole } from '../types/api/organizations';

export class OrganizationService {
  // Direct API calls for backward compatibility
  static async getOrganizationMembers(orgId: string) {
    return organizationsApi.getOrganizationMembers(orgId);
  }

  static async getOrganizations() {
    return organizationsApi.getAllUserOrganizations();
  }

  // Utility methods
  static getRoleDisplayName(role: MemberRole | OrganizationRole): string {
    return getRoleDisplayInfo(role).displayName;
  }

  static getRoleColor(role: MemberRole | OrganizationRole): string {
    return getRoleDisplayInfo(role).color;
  }

  static canManageMembers(userRole: MemberRole | OrganizationRole): boolean {
    return userRole === 'owner' || userRole === 'admin';
  }

  static canManageTeams(userRole: MemberRole | OrganizationRole): boolean {
    return userRole === 'owner' || userRole === 'admin';
  }

  static canDeleteOrganization(userRole: MemberRole | OrganizationRole): boolean {
    return userRole === 'owner';
  }
}
