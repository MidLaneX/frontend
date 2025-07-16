import type { Task, Project } from '../common';

// Component prop types
export interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onClick?: (task: Task) => void;
  draggable?: boolean;
}

export interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onClick?: (project: Project) => void;
}

export interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  status: Task['status'];
  onTaskMove?: (taskId: string, newStatus: Task['status']) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface CreateTaskModalProps extends ModalProps {
  projectId?: string;
  onSubmit: (task: Omit<Task, 'id'>) => void;
}

export interface CreateProjectModalProps extends ModalProps {
  onSubmit: (project: Omit<Project, 'id'>) => void;
}
