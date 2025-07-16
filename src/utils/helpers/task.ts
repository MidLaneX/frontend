import type { TaskPriority, TaskStatus } from '../../types/common';

// Task utilities
export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'Highest':
      return '#d73502';
    case 'High':
      return '#ff5722';
    case 'Medium':
      return '#ff9800';
    case 'Low':
      return '#4caf50';
    case 'Lowest':
      return '#9e9e9e';
    default:
      return '#9e9e9e';
  }
};

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'Backlog':
      return '#9e9e9e';
    case 'Todo':
      return '#2196f3';
    case 'In Progress':
      return '#ff9800';
    case 'Review':
      return '#9c27b0';
    case 'Done':
      return '#4caf50';
    default:
      return '#9e9e9e';
  }
};

export const getTaskTypeIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'story':
      return '📖';
    case 'bug':
      return '🐛';
    case 'task':
      return '✅';
    case 'epic':
      return '🎯';
    default:
      return '📋';
  }
};
