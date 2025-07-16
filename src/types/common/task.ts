// Core domain types - Tasks
export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  reporter: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  type: TaskType;
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

export type TaskStatus = 'Backlog' | 'Todo' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
export type TaskType = 'Story' | 'Bug' | 'Task' | 'Epic';
