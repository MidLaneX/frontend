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
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  teamCount: number;
  settings?: OrganizationSettings;
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
  firstName: string;
  lastName: string;
  role: MemberRole;
  joinedAt: string;
  avatar?: string;
  teams: string[]; // Team IDs the member belongs to
}

export interface AddMemberRequest {
  userId: number;
  role?: MemberRole;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  leadId?: string;
  leadName?: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
  projectCount?: number;
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

export interface CreateTeamRequest {
  name: string;
  description?: string;
  leadId?: string;
  memberIds?: string[];
}

export interface UpdateTeamMemberRequest {
  memberId: string;
  role?: TeamRole;
}

export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export type TeamRole = 'lead' | 'member';

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
