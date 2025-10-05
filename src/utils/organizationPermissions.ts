import type {
  Organization,
  OrganizationRole,
  OrganizationPermissions,
  MemberRole
} from '../types/api/organizations';

/**
 * Organization Permission Utilities
 * 
 * This module provides utility functions to check user permissions within organizations.
 * It enforces the rule that only organization owners can perform administrative actions
 * like adding members, creating teams, etc., while members have read-only access.
 */

/**
 * Get the organization role for the current user
 */
export function getOrganizationRole(organization: Organization, currentUserId: string | number): OrganizationRole {
  // Handle both string and number comparisons
  const userIdString = String(currentUserId);
  const userIdNumber = Number(currentUserId);
  
  // Handle both ownerId (frontend interface) and owner_id (backend response)
  const ownerIdFromApi = (organization as any).owner_id || organization.ownerId;
  const ownerIdString = String(ownerIdFromApi);
  const ownerIdNumber = Number(ownerIdFromApi);
  
  console.log('getOrganizationRole - Checking role for user:', userIdString, 'against owner:', ownerIdString);
  console.log('getOrganizationRole - Raw organization owner_id:', (organization as any).owner_id, 'ownerId:', organization.ownerId);
  console.log('getOrganizationRole - Types - currentUserId:', typeof currentUserId, 'ownerIdFromApi:', typeof ownerIdFromApi);
  console.log('getOrganizationRole - Numbers - currentUserId:', userIdNumber, 'ownerIdFromApi:', ownerIdNumber);
  
  // Check both string and number equality
  const isOwnerString = userIdString === ownerIdString;
  const isOwnerNumber = !isNaN(userIdNumber) && !isNaN(ownerIdNumber) && userIdNumber === ownerIdNumber;
  const isOwner = isOwnerString || isOwnerNumber;
  
  const role = isOwner ? 'owner' : 'member';
  
  console.log('getOrganizationRole - String match:', isOwnerString, 'Number match:', isOwnerNumber, 'Final result:', role, 'for org:', organization.name);
  
  return role;
}

/**
 * Check if the current user is the owner of the organization
 */
export function isOrganizationOwner(organization: Organization, currentUserId: string | number): boolean {
  return getOrganizationRole(organization, currentUserId) === 'owner';
}

/**
 * Check if the current user is a member (but not owner) of the organization
 */
export function isOrganizationMember(organization: Organization, currentUserId: string | number): boolean {
  return getOrganizationRole(organization, currentUserId) === 'member';
}

/**
 * Get all permissions for the current user in the organization
 */
export function getOrganizationPermissions(
  organization: Organization, 
  currentUserId: string | number
): OrganizationPermissions {
  const isOwner = isOrganizationOwner(organization, currentUserId);
  
  console.log('getOrganizationPermissions - Organization:', organization.name, 'User:', currentUserId, 'IsOwner:', isOwner);
  
  const permissions = {
    // Administrative permissions - only for owners
    canEdit: isOwner,
    canDelete: isOwner,
    canAddMembers: isOwner,
    canRemoveMembers: isOwner,
    canCreateTeams: isOwner,
    canManageTeams: isOwner,
    
    // Read permissions - both owners and members
    canViewMembers: true,
    canViewTeams: true,
  };
  
  console.log('getOrganizationPermissions - Calculated permissions:', permissions);
  
  return permissions;
}

/**
 * Check if user can perform a specific action in the organization
 */
export function canPerformAction(
  organization: Organization,
  currentUserId: string | number,
  action: keyof OrganizationPermissions
): boolean {
  const permissions = getOrganizationPermissions(organization, currentUserId);
  return permissions[action];
}

/**
 * Get user role display information
 */
export function getRoleDisplayInfo(role: OrganizationRole | MemberRole) {
  const roleInfo = {
    owner: {
      displayName: 'Owner',
      color: '#FF5630',
      description: 'Full administrative access'
    },
    admin: {
      displayName: 'Administrator', 
      color: '#FF8B00',
      description: 'Administrative access'
    },
    member: {
      displayName: 'Member',
      color: '#36B37E', 
      description: 'Standard member access'
    },
    viewer: {
      displayName: 'Viewer',
      color: '#5E6C84',
      description: 'Read-only access'
    }
  };
  
  return roleInfo[role] || roleInfo.member;
}

/**
 * Validation functions for UI components
 */
export const OrganizationPermissionHelpers = {
  /**
   * Show error message for unauthorized actions
   */
  getUnauthorizedMessage(action: string): string {
    return `Only organization owners can ${action.toLowerCase()}. You are a member of this organization.`;
  },

  /**
   * Check if user can edit organization details
   */
  canEditOrganization(organization: Organization, currentUserId: string | number): boolean {
    return canPerformAction(organization, currentUserId, 'canEdit');
  },

  /**
   * Check if user can delete organization
   */
  canDeleteOrganization(organization: Organization, currentUserId: string | number): boolean {
    return canPerformAction(organization, currentUserId, 'canDelete');
  },

  /**
   * Check if user can add members to organization
   */
  canAddMembers(organization: Organization, currentUserId: string | number): boolean {
    const result = canPerformAction(organization, currentUserId, 'canAddMembers');
    console.log('canAddMembers - Organization:', organization.name, 'User:', currentUserId, 'Result:', result);
    return result;
  },

  /**
   * Check if user can remove members from organization
   */
  canRemoveMembers(organization: Organization, currentUserId: string | number): boolean {
    return canPerformAction(organization, currentUserId, 'canRemoveMembers');
  },

  /**
   * Check if user can create teams in organization
   */
  canCreateTeams(organization: Organization, currentUserId: string | number): boolean {
    return canPerformAction(organization, currentUserId, 'canCreateTeams');
  },

  /**
   * Check if user can manage teams in organization
   */
  canManageTeams(organization: Organization, currentUserId: string | number): boolean {
    return canPerformAction(organization, currentUserId, 'canManageTeams');
  }
};

/**
 * Enhance organization object with role information
 */
export function enrichOrganizationWithRole(
  organization: Organization,
  currentUserId: string | number
): Organization {
  const userRole = getOrganizationRole(organization, currentUserId);
  const isOwner = userRole === 'owner';
  
  console.log('enrichOrganizationWithRole - Organization:', organization.name, 'UserRole:', userRole, 'IsOwner:', isOwner);
  
  return {
    ...organization,
    userRole,
    isOwner
  };
}

/**
 * Filter organizations by role
 */
export function filterOrganizationsByRole(
  organizations: Organization[],
  currentUserId: string | number,
  role: OrganizationRole
): Organization[] {
  return organizations.filter(org => getOrganizationRole(org, currentUserId) === role);
}