import React from 'react';
import * as MuiIcons from '@mui/icons-material';
import type { FeatureComponentProps } from '../types/template';

// Lazy load components
const ProjectSummary = React.lazy(() => import('../components/features/project/ProjectSummary'));
const ProjectTimeline = React.lazy(() => import('../components/features/project/ProjectTimeline'));
const ProjectBacklog = React.lazy(() => import('../components/features/project/ProjectBacklog'));
const ProjectBoard = React.lazy(() => import('../components/features/project/ProjectBoard'));
const ProductBacklog = React.lazy(() => import('../components/features/scrum/ProductBacklog'));

// Component registry - maps component names to actual React components
export const FEATURE_COMPONENTS: Record<string, any> = {
  ProjectSummary,
  ProjectTimeline,
  ProjectBacklog,
  ProjectBoard,
  ProductBacklog,
  // Aliases for backward compatibility
  SprintBoard: ProjectBoard,
  KanbanBoard: ProjectBoard,
};

// Icon registry - maps icon names to Material-UI icons
export const FEATURE_ICONS: Record<string, React.ComponentType> = {
  Assessment: MuiIcons.Assessment,
  Timeline: MuiIcons.Timeline,
  FormatListBulleted: MuiIcons.FormatListBulleted,
  ViewKanban: MuiIcons.ViewKanban,
  EventNote: MuiIcons.EventNote,
  TrendingDown: MuiIcons.TrendingDown,
  Feedback: MuiIcons.Feedback,
  ShowChart: MuiIcons.ShowChart,
  Timer: MuiIcons.Timer,
  AccountTree: MuiIcons.AccountTree,
  Flag: MuiIcons.Flag,
  ViewTimeline: MuiIcons.ViewTimeline,
};

// Helper functions
export const getFeatureComponent = (componentName: string): React.ComponentType<FeatureComponentProps> | null => {
  return FEATURE_COMPONENTS[componentName] || null;
};

export const getFeatureIcon = (iconName: string): React.ComponentType | null => {
  return FEATURE_ICONS[iconName] || null;
};
