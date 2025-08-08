import React, { useState, useCallback, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Alert,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import type { Project } from '@/types';
import { useProjectFeatures } from '@/hooks';

// Lazy-loaded feature components
const ProjectSummary = lazy(() => import('./ProjectSummary'));
const ProjectBoard = lazy(() => import('./ProjectBoard'));
const ProjectBacklog = lazy(() => import('./ProjectBacklog'));
const ProjectTimeline = lazy(() => import('./ProjectTimeline'));

// Lazy-load additional feature components for different templates
const SprintComponent = lazy(() => import('../SprintComponent'));
const BacklogComponent = lazy(() => import('../BacklogComponent'));
const ScrumBoardComponent = lazy(() => import('../ScrumBoardComponent'));
const EstimationComponent = lazy(() => import('../EstimationComponent'));
const TimelineComponent = lazy(() => import('../TimelineComponent'));

// Add placeholder components for features not yet implemented
const FeaturePlaceholder = lazy(() => Promise.resolve({
  default: ({ featureId, projectId, templateType }: {
    featureId: string;
    projectId: string;
    templateType: string;
  }) => (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          {featureId.charAt(0).toUpperCase() + featureId.slice(1)} Feature
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This feature is under development for project {projectId} ({templateType})
        </Typography>
      </Paper>
    </Box>
  )
}));

interface DynamicProjectNavigationProps {
  project: Project;
}

/**
 * Maps backend feature identifiers to React components
 * This mapping allows backend to control which features are available
 */
const getFeatureComponent = (featureId: string) => {
  const componentMap: Record<string, React.LazyExoticComponent<any>> = {
    // Core project features
    'summary': ProjectSummary,
    'board': ProjectBoard,
    'backlog': ProjectBacklog,
    'timeline': ProjectTimeline,
    
    // Scrum-specific features
    'sprint_board': ScrumBoardComponent,
    'product_backlog': BacklogComponent,
    'sprint_planning': SprintComponent,
    'estimation': EstimationComponent,
    'burndown': TimelineComponent,
    'retrospective': FeaturePlaceholder,
    
    // Kanban features
    'kanban_board': ProjectBoard,
    'wip_limits': FeaturePlaceholder,
    'flow_analytics': FeaturePlaceholder,
    
    // Waterfall features  
    'project_timeline': TimelineComponent,
    'milestones': FeaturePlaceholder,
    'gantt_chart': FeaturePlaceholder,
    'resource_planning': FeaturePlaceholder,
    
    // Default fallback
    'default': FeaturePlaceholder
  };

  return componentMap[featureId] || componentMap['default'];
};

/**
 * DynamicProjectNavigation Component
 * 
 * Provides navigation based on backend-provided features
 * Uses useProjectFeatures hook to fetch available features from API
 */
const DynamicProjectNavigation: React.FC<DynamicProjectNavigationProps> = ({
  project,
}) => {
  const { featureId } = useParams<{ featureId?: string }>();
  
  // Use hook to fetch backend features
  const { features, loading, error } = useProjectFeatures(
    project.id?.toString() || '',
    project.templateType || 'scrum'
  );

  // Set active tab based on URL parameter or default to first feature
  const [activeTab, setActiveTab] = useState<string>('');

  // Update active tab when features are loaded or URL changes
  React.useEffect(() => {
    if (features.length > 0) {
      if (featureId && features.some(f => f.path === featureId)) {
        setActiveTab(featureId);
      } else if (!activeTab) {
        setActiveTab(features[0]?.path || '');
      }
    }
  }, [features, featureId, activeTab]);

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
   * Uses lazy-loaded components with Suspense
   */
  const renderFeatureContent = useCallback(() => {
    if (!activeTab) {
      return (
        <Alert severity="info" sx={{ m: 3 }}>
          No features available for this project
        </Alert>
      );
    }

    const activeFeature = features.find(f => f.path === activeTab);
    if (!activeFeature) {
      return (
        <Alert severity="warning" sx={{ m: 3 }}>
          Feature not found. Please select a valid feature from the tabs above.
        </Alert>
      );
    }

    console.log('🚀 Loading feature component:', {
      featureId: activeFeature.id,
      featureName: activeFeature.name,
      projectId: project.id,
      templateType: project.templateType
    });
    
    const FeatureComponent = getFeatureComponent(activeFeature.id);
    
    return (
      <Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>
              Loading {activeFeature.name}...
            </Typography>
          </Box>
        }
      >
        <FeatureComponent 
          projectId={project.id?.toString() || ''}
          projectName={project.name || ''}
          templateType={project.templateType || 'scrum'}
          project={project}
        />
      </Suspense>
    );
  }, [activeTab, features, project]);

  // Show error if no project
  if (!project) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Project not found
      </Alert>
    );
  }

  // Show loading state while fetching features
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          Loading project features...
        </Typography>
      </Box>
    );
  }

  // Show error if API call failed (but still show default features)
  if (error && features.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Failed to Load Features
          </Typography>
          <Typography>
            {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Show message if no features available from backend
  if (!features.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          <Typography variant="h6" gutterBottom>
            No Features Available
          </Typography>
          <Typography>
            This project doesn't have any features configured. Please check your project settings or contact your administrator.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="project features navigation"
        >
          {features.map((feature) => (
            <Tab
              key={feature.id}
              label={feature.name}
              value={feature.path}
              sx={{
                textTransform: 'none',
                minWidth: 120,
                fontSize: '0.875rem',
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Feature Content */}
      <Box sx={{ mt: 2 }}>
        {renderFeatureContent()}
      </Box>
    </Box>
  );
};

export default DynamicProjectNavigation;
