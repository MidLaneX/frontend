import React, { useState, useCallback, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import IconButton from '@mui/material/IconButton';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';

import type { Project } from '@/types';
import { getInitials } from '@/utils';
import { useProjectFeatures } from '@/hooks';

// Lazy-loaded feature components
const Board = lazy(() => import('../board/Board'));
const Backlog = lazy(() => import('../backlog/Backlog'));
const Sprint = lazy(() => import('../sprint/Sprint'));
const Estimation = lazy(() => import('../estimation/Estimation'));
const ScrumBoard = lazy(() => import('../scrum_board/ScrumBoard'));
const TimeLine = lazy(() => import('../timeLine/TimeLine'));

// Types
interface DynamicProjectNavigationProps {
  project: Project;
}

/**
 * Maps backend feature names to their corresponding React components
 */
const getFeatureComponent = (featureId: string) => {
  const featureMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
    'board': lazy(() => import('../scrum_board/ScrumBoard')),
    'Board': lazy(() => import('../scrum_board/ScrumBoard')),
    'scrum_board': lazy(() => import('../scrum_board/ScrumBoard')),
    'Scrum_Board': lazy(() => import('../scrum_board/ScrumBoard')),
    'backlog': lazy(() => import('../backlog/Backlog')),
    'Backlog': lazy(() => import('../backlog/Backlog')),
    'sprint': lazy(() => import('../sprint/Sprint')),
    'Sprint': lazy(() => import('../sprint/Sprint')),
    'estimation': lazy(() => import('../estimation/Estimation')),
    'Estimation': lazy(() => import('../estimation/Estimation')),
    'planning_poker': lazy(() => import('../estimation/Estimation')),
    'timeline': lazy(() => import('../timeLine/TimeLine')),
    'Timeline': lazy(() => import('../timeLine/TimeLine')),
    'timeLine': lazy(() => import('../timeLine/TimeLine')),
  };

  return featureMap[featureId] || lazy(() => Promise.resolve({
    default: ({ projectId, templateType }: { projectId: string; templateType: string }) => (
      <Box sx={{ p: 3 }}>
        <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            {featureId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This feature is under development for project {projectId} ({templateType})
          </Typography>
        </Paper>
      </Box>
    )
  }));
};

/**
 * DynamicProjectNavigation Component
 * 
 * Provides navigation based ONLY on backend-provided features
 * Uses hooks for API calls and lazy loading for each feature
 */
 */
const DynamicProjectNavigation: React.FC<DynamicProjectNavigationProps> = ({
  project,
  tasks,
  onTaskClick,
  onCreateTask,
  onUpdateTask,
}) => {
  const { featureId } = useParams<{ featureId?: string }>();
  
  // Get features based on project's template type or from project.features if available
  const features: TemplateFeature[] = useMemo(() => {
    // First try to use features from the project (from API response)
    if (project?.features && Array.isArray(project.features)) {
      return project.features.map((featureName: string, index: number) => ({
        id: featureName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: featureName.charAt(0).toUpperCase() + featureName.slice(1),
        icon: getIconForFeature(featureName),
        component: getComponentForFeature(featureName),
        path: featureName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        order: index + 1
      }));
    }
    
    // Fallback to template-based features if project features not available
    if (project?.templateType) {
      return getTemplateFeatures(project.templateType);
    }
    
    // Default fallback features
    return [
      {
        id: 'summary',
        name: 'Summary',
        icon: 'Assessment',
        component: 'ProjectSummary',
        path: 'summary',
        order: 1
      },
      {
        id: 'board',
        name: 'Board',
        icon: 'ViewKanban',
        component: 'ProjectBoard',
        path: 'board',
        order: 2
      }
    ];
  }, [project?.features, project?.templateType]);

  // Set active tab based on URL parameter or default to first feature
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (featureId && features.some(f => f.path === featureId)) {
      return featureId;
    }
    return features[0]?.path || 'summary';
  });

  // Helper functions
  function getIconForFeature(featureName: string): string {
    const iconMap: Record<string, string> = {
      'summary': 'Assessment',
      'backlog': 'FormatListBulleted',
      'board': 'ViewKanban',
      'timeline': 'Timeline',
      'sprint_board': 'ViewKanban',
      'product_backlog': 'FormatListBulleted',
      'kanban_board': 'ViewKanban',
      'burndown': 'TrendingDown',
      'retrospective': 'Feedback',
      'planning': 'EventNote'
    };
    
    const key = featureName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return iconMap[key] || 'Assessment';
  }

  function getComponentForFeature(featureName: string): string {
    const componentMap: Record<string, string> = {
      'summary': 'ProjectSummary',
      'backlog': 'ProjectBacklog',
      'board': 'ProjectBoard',
      'timeline': 'ProjectTimeline',
      'sprint_board': 'SprintBoard',
      'product_backlog': 'ProductBacklog',
      'kanban_board': 'KanbanBoard'
    };
    
    const key = featureName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return componentMap[key] || 'ProjectSummary';
  }

  // Event handlers
  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: string) => {
      setActiveTab(newValue);
      // Optionally update URL without page refresh
      // window.history.pushState({}, '', `/projects/${project.id}/${newValue}`);
    },
    []
  );

  /**
   * Renders the content for the currently active feature
   */
  const renderFeatureContent = useCallback(() => {
    const activeFeature = features.find(f => f.path === activeTab);
    if (!activeFeature) {
      return (
        <Alert severity="warning" sx={{ m: 3 }}>
          Feature not found. Please select a valid feature from the tabs above.
        </Alert>
      );
    }

    const FeatureComponent = getFeatureComponent(activeFeature.component);
    if (!FeatureComponent) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="info">
            <Typography variant="h6" gutterBottom>
              {activeFeature.name} Feature
            </Typography>
            <Typography>
              This feature is not yet implemented. Component: {activeFeature.component}
            </Typography>
          </Alert>
        </Box>
      );
    }

    return (
      <FeatureComponent
        project={project}
        tasks={tasks}
        onTaskClick={onTaskClick}
        onCreateTask={onCreateTask}
        onUpdateTask={onUpdateTask}
      />
    );
  }, [activeTab, features, project, tasks, onTaskClick, onCreateTask, onUpdateTask]);

  if (!project) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Project not found
      </Alert>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Project Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', p: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2, color: '#5e6c84', fontSize: '14px' }}>
          <Link underline="hover" color="inherit" href="/dashboard">
            Projects
          </Link>
          <Typography color="text.primary">{project.name}</Typography>
        </Breadcrumbs>

        {/* Project Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: project.type === 'Software' ? '#0052CC' : 
                      project.type === 'Marketing' ? '#FF5630' : '#36B37E',
              width: 40,
              height: 40,
              fontSize: 16,
              fontWeight: 'bold'
            }}
          >
            {project.key}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#172b4d', mb: 0.5 }}>
              {project.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#5e6c84' }}>
              {project.templateType} • {project.type} project
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: 12 } }}>
              {project.teamMembers?.map((member) => (
                <Avatar key={member.name} sx={{ bgcolor: '#36B37E' }}>
                  {getInitials(member.name)}
                </Avatar>
              ))}
            </AvatarGroup>
            
            <IconButton size="small">
              <StarBorderIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Description */}
        {project.description && (
          <Typography variant="body2" sx={{ color: '#5e6c84', lineHeight: 1.5 }}>
            {project.description}
          </Typography>
        )}
      </Box>

      {/* Dynamic Feature Tabs */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: 14,
              color: '#5e6c84',
              '&.Mui-selected': {
                color: '#0052CC',
                fontWeight: 600
              }
            }
          }}
        >
          {features.map((feature) => (
            <Tab
              key={feature.id}
              value={feature.path}
              label={feature.name}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Feature Content */}
      <Box sx={{ flex: 1 }}>
        {renderFeatureContent()}
      </Box>
    </Box>
  );
};

export default DynamicProjectNavigation;
