import type { Task } from './task';

// Core domain types - Projects
export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  timeline: ProjectTimeline;
  teamMembers: TeamMember[];
  tasks: Task[];
  type: ProjectType;
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
