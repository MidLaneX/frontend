import type { Task } from './task';

// Core domain types - Projects
export interface Project {
  id: string | number; // Allow both string and number to match API response
  name: string;
  key?: string; // Make optional since API might not always return this
  description?: string; // Make optional since API might not always return this
  timeline?: ProjectTimeline; // Make optional since API might not always return this
  teamMembers?: TeamMember[]; // Make optional since API might not always return this
  tasks?: Task[]; // Make optional since API might not always return this
  type?: ProjectType; // Make optional since API might not always return this
  templateType: string;
  features: string[];
  orgId?: string | number | null; // Add fields that API actually returns
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: string | number | null;
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
