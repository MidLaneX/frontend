// Core domain types - Tasks
export interface Task {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  sprintId: number;
  assignee: string;
  reporter: string;
  dueDate: string;
  epic: string;
  priority: TaskPriority;
  status: TaskStatus;
  type: TaskType;
  storyPoints?: number;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  comments: Comment[];
}

export interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp: string;
}

export type TaskStatus = "Backlog" | "Todo" | "In Progress" | "Review" | "Done";
export type TaskPriority = "Highest" | "High" | "Medium" | "Low" | "Lowest";
export type TaskType = "Story" | "Bug" | "Task" | "Epic";
