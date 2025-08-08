import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
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

// ErrorBoundary to catch lazy-loading errors
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error('Error loading feature component:', error, info);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

interface DynamicProjectNavigationProps {
  project: Project;
}

const FeaturePlaceholder = ({ featureId }: { featureId?: string }) => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {(featureId || 'Unknown').replace('_', ' ').toUpperCase()} Feature
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This feature is under development or missing.
      </Typography>
    </Paper>
  </Box>
);

const DynamicProjectNavigation: React.FC<DynamicProjectNavigationProps> = ({ project }) => {
  const { featureId } = useParams<{ featureId?: string }>();

  const features = project.features || [];
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    if (features.length === 0) return;

    // If valid URL param featureId
    if (featureId && features.some(f => f.path === featureId)) {
      setActiveTab(featureId);
    } 
    // Else if current tab is invalid, set to first feature
    else if (!activeTab || !features.some(f => f.path === activeTab)) {
      setActiveTab(features[0].path);
    }
  }, [features, featureId, activeTab]);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: string) => {
      setActiveTab(newValue);
    },
    []
  );

  const renderFeatureContent = () => {
    const activeFeature = features.find(f => f.path === activeTab);
    if (!activeFeature) return <FeaturePlaceholder featureId={activeTab} />;

    const FeatureComponent = lazy(() =>
      import(`./features/${activeFeature.path}`).catch(() => {
        return {
          default: () => <FeaturePlaceholder featureId={activeFeature.path} />,
        };
      })
    );

    return (
      <ErrorBoundary fallback={<FeaturePlaceholder featureId={activeFeature.path} />}>
        <Suspense
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading {activeFeature.name}...</Typography>
            </Box>
          }
        >
          <FeatureComponent projectId={project.id} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  if (features.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 3 }}>
        No features available for this project
      </Alert>
    );
  }

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Project features navigation"
      >
        {features.map((feature) => (
          <Tab
            key={feature.path}
            value={feature.path}
            label={feature.name}
            sx={{ textTransform: 'none' }}
          />
        ))}
      </Tabs>

      <Box sx={{ mt: 2 }}>{renderFeatureContent()}</Box>
    </Box>
  );
};

export default DynamicProjectNavigation;
