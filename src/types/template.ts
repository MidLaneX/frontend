// Template and Feature types for scalable project management

export interface TemplateFeature {
  id: string;
  name: string;
  icon: string;
  component: string;
  path: string;
  description?: string;
  order?: number;
}

export interface Template {
  type: string;
  name: string;
  description: string;
  features: TemplateFeature[];
}

export interface FeatureComponentProps {
  project: any;
  tasks: any[];
  onTaskClick: (task: any) => void;
  onCreateTask: () => void;
  onUpdateTask: (taskId: string, updates: any) => void;
}

// Template configurations
export const TEMPLATE_CONFIGS: Record<string, Template> = {
  scrum: {
    type: 'scrum',
    name: 'Scrum',
    description: 'Agile development with sprints',
    features: [
      {
        id: 'summary',
        name: 'Summary',
        icon: 'Assessment',
        component: 'ProjectSummary',
        path: 'summary',
        order: 1
      },
      {
        id: 'product_backlog',
        name: 'Product Backlog',
        icon: 'FormatListBulleted',
        component: 'ProductBacklog',
        path: 'backlog',
        order: 2
      },
      {
        id: 'sprint_board',
        name: 'Sprint Board',
        icon: 'ViewKanban',
        component: 'SprintBoard',
        path: 'board',
        order: 3
      },
      {
        id: 'sprint_planning',
        name: 'Sprint Planning',
        icon: 'EventNote',
        component: 'SprintPlanning',
        path: 'planning',
        order: 4
      },
      {
        id: 'burndown',
        name: 'Burndown Chart',
        icon: 'TrendingDown',
        component: 'BurndownChart',
        path: 'burndown',
        order: 5
      },
      {
        id: 'retrospective',
        name: 'Retrospective',
        icon: 'Feedback',
        component: 'Retrospective',
        path: 'retrospective',
        order: 6
      }
    ]
  },
  kanban: {
    type: 'kanban',
    name: 'Kanban',
    description: 'Continuous flow management',
    features: [
      {
        id: 'summary',
        name: 'Summary',
        icon: 'Assessment',
        component: 'ProjectSummary',
        path: 'summary',
        order: 1
      },
      {
        id: 'kanban_board',
        name: 'Kanban Board',
        icon: 'ViewKanban',
        component: 'KanbanBoard',
        path: 'board',
        order: 2
      },
      {
        id: 'backlog',
        name: 'Backlog',
        icon: 'FormatListBulleted',
        component: 'ProjectBacklog',
        path: 'backlog',
        order: 3
      },
      {
        id: 'cumulative_flow',
        name: 'Cumulative Flow',
        icon: 'ShowChart',
        component: 'CumulativeFlow',
        path: 'flow',
        order: 4
      },
      {
        id: 'cycle_time',
        name: 'Cycle Time',
        icon: 'Timer',
        component: 'CycleTime',
        path: 'cycle-time',
        order: 5
      }
    ]
  },
  waterfall: {
    type: 'waterfall',
    name: 'Waterfall',
    description: 'Sequential project management',
    features: [
      {
        id: 'summary',
        name: 'Summary',
        icon: 'Assessment',
        component: 'ProjectSummary',
        path: 'summary',
        order: 1
      },
      {
        id: 'timeline',
        name: 'Timeline',
        icon: 'Timeline',
        component: 'ProjectTimeline',
        path: 'timeline',
        order: 2
      },
      {
        id: 'phases',
        name: 'Phases',
        icon: 'AccountTree',
        component: 'ProjectPhases',
        path: 'phases',
        order: 3
      },
      {
        id: 'milestones',
        name: 'Milestones',
        icon: 'Flag',
        component: 'Milestones',
        path: 'milestones',
        order: 4
      },
      {
        id: 'gantt',
        name: 'Gantt Chart',
        icon: 'ViewTimeline',
        component: 'GanttChart',
        path: 'gantt',
        order: 5
      }
    ]
  }
};

// Helper functions
export const getTemplateFeatures = (templateType: string): TemplateFeature[] => {
  const template = TEMPLATE_CONFIGS[templateType.toLowerCase()];
  return template ? template.features.sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
};

export const getTemplateConfig = (templateType: string): Template | null => {
  return TEMPLATE_CONFIGS[templateType.toLowerCase()] || null;
};

export const isFeatureAvailable = (templateType: string, featureId: string): boolean => {
  const features = getTemplateFeatures(templateType);
  return features.some(feature => feature.id === featureId);
};
