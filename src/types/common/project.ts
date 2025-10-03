import type { Task } from './task';

// Core domain types - Projects
export interface Project {
  id: string | number | null; // Allow both string and number to match API response
  name: string;
  key?: string; // Make optional since API might not always return this
  timeline?: ProjectTimeline; // Make optional since API might not always return this
  teamMembers?: TeamMember[]; // Make optional since API might not always return this
  tasks?: Task[]; // Make optional since API might not always return this
  type?: string; // Make optional since API might not always return this
  templateType: string;
  features: string[];
  orgId?: string | number | null; // Add fields that API actually returns
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: string | number | null;
  assignedTeamId?: number | null; // Add field for assigned team ID
  assignedTeams?: Array<{ id: number; name: string; memberCount?: number }>; // Keep existing field for compatibility
}

export interface ProjectTimeline {
  start: string;
  end: string;
}

export interface TeamMember {
  name: string;
  role: string;
  avatar?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  key: string;
  avatar: string;
  type: ProjectType;
  starred: boolean;
}

export type ProjectType = 'Software' | 'Business' | 'Marketing';
