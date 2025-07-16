export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  reporter: string;
  dueDate: string;
  priority: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
  status: 'Backlog' | 'Todo' | 'In Progress' | 'Review' | 'Done';
  type: 'Story' | 'Bug' | 'Task' | 'Epic';
  storyPoints?: number;
  labels: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

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

export type ProjectType = 'Software' | 'Business' | 'Marketing';
export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];
export type TaskType = Task['type'];

export interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  isActive?: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
  key: string;
  avatar: string;
  type: ProjectType;
  starred: boolean;
}

export interface FilterState {
  search: string[];
  assignee: string[];
  priority: string[];
  type: string[];
  status: string[];
}
