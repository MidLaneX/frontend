// Organization-related types and interfaces

export interface Organization {
  id: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
  member_count: number;
  team_count: number;
  settings?: OrganizationSettings;
  // Role-based properties
  userRole?: OrganizationRole; // Current user's role in this organization
  isOwner?: boolean; // Quick check if current user is the owner
  
  // Backend compatibility - these should be mapped to the above properties
  owner_id?: string;
  owner_name?: string;
  owner_email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrganizationWithRole extends Organization {
  userRole: OrganizationRole;
  isOwner: boolean;
}

export interface OrganizationSettings {
  allowPublicProjects: boolean;
  requireApprovalForMembers: boolean;
  defaultMemberRole: MemberRole;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: MemberRole;
  joinedAt: string;
  avatar?: string;
  teams: string[]; // Team IDs the member belongs to
  
  // Backend compatibility - these should be mapped to the above properties
  user_id?: string;
  firstName?: string;
  lastName?: string;
  joined_at?: string;
}

export interface AddMemberRequest {
  userEmail: string;
  role?: MemberRole;
}

export interface Team {
  id: string;
  team_name: string;
  description?: string;
  organizationId: string;
  leadId?: string;
  leadName?: string;
  members?: TeamMember[]; // Made optional since backend might not always include members
  createdAt: string;
  updatedAt: string;
  projectCount?: number;
  
  // Additional properties from backend
  memberCount?: number; // From OrganizationTeamResponse
  teamType?: string; // Team type (DEVELOPMENT, DESIGN, etc.)
  maxMembers?: number; // Maximum members allowed
  status?: string; // Team status (ACTIVE, INACTIVE, etc.)
  hasAvailableSlots?: boolean; // Whether team has available slots
  
  // Backend compatibility - these should be mapped to the above properties
  team_id?: string;
  teamId?: string; // From OrganizationTeamResponse
  teamName?: string; // From OrganizationTeamResponse
  name?: string;
  organization_id?: string;
  lead_id?: string;
  lead_name?: string;
  teamLeadId?: string; // From TeamResponse
  teamLeadName?: string; // From TeamResponse
  created_at?: string;
  updated_at?: string;
  project_count?: number;
  member_count?: number; // From OrganizationTeamResponse
  team_type?: string; // From OrganizationTeamResponse
  currentMemberCount?: number; // From TeamResponse
}

export interface TeamMember {
  id: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: TeamRole;
  joinedAt: string;
  avatar?: string;
}

// Raw backend response format
export interface TeamMemberDetailRaw {
  member_id: number;
  name: string;
  email: string;
  role: string;
  team_lead: boolean;
}

// Transformed frontend format  
export interface TeamMemberDetail {
  memberId: number;
  name: string;
  email: string;
  role: string;
  isTeamLead: boolean;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  teamType: TeamType;
  maxMembers: number;
  organizationId: number;
}

export interface UpdateTeamMemberRequest {
  memberId: string;
  role?: TeamRole;
}

export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

// Organization role represents current user's role in the organization
export type OrganizationRole = 'owner' | 'member';

export type TeamRole = 'lead' | 'member';

export type TeamType = 'development' | 'design' | 'marketing' | 'sales' | 'support' | 'operations' | 'management' | 'other';

// UI-specific types
export interface OrganizationCardProps {
  organization: Organization;
  onEdit: (org: Organization) => void;
  onDelete: (orgId: string) => void;
  onViewDetails: (orgId: string) => void;
}

export interface MemberCardProps {
  member: OrganizationMember;
  currentUserRole: MemberRole;
  onRoleChange: (memberId: string, newRole: MemberRole) => void;
  onRemove: (memberId: string) => void;
}

export interface TeamCardProps {
  team: Team;
  currentUserRole: MemberRole;
  onEdit: (team: Team) => void;
  onDelete: (teamId: string) => void;
  onMemberAdd: (teamId: string) => void;
  onMemberRemove: (teamId: string, memberId: string) => void;
  onPromoteToLead: (teamId: string, memberId: string) => void;
  onDemoteFromLead: (teamId: string, memberId: string) => void;
}

// Response types for different organization API endpoints
export interface OrganizationListResponse {
  ownedOrganizations: Organization[];
  memberOrganizations: Organization[];
  allOrganizations: OrganizationWithRole[];
}

// Permission helper interface
export interface OrganizationPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canAddMembers: boolean;
  canRemoveMembers: boolean;
  canCreateTeams: boolean;
  canManageTeams: boolean;
  canViewMembers: boolean;
  canViewTeams: boolean;
}
