// DynamicProjectNavigation.tsx
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
import { useProjectFeatures } from '@/hooks';
import type { Project } from '@/types';

interface DynamicProjectNavigationProps {
  project: Project;
}

// Fallback placeholder loader for dynamic feature components
const FeaturePlaceholder = ({ featureId }: { featureId: string }) => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {featureId.charAt(0).toUpperCase() + featureId.slice(1)} Feature
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This feature is under development.
      </Typography>
    </Paper>
  </Box>
);

const DynamicProjectNavigation: React.FC<DynamicProjectNavigationProps> = ({ project }) => {
  const { featureId } = useParams<{ featureId?: string }>();
  const { features, loading, error } = useProjectFeatures(project.id.toString(), project.templateType);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    if (features.length > 0) {
      if (featureId && features.some(f => f.path === featureId)) {
        setActiveTab(featureId);
      } else if (!activeTab) {
        setActiveTab(features[0].path);
      }
    }
  }, [features, featureId, activeTab]);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  }, []);

  const renderFeatureContent = () => {
    const activeFeature = features.find(f => f.path === activeTab);
    if (!activeFeature) return null;

    let FeatureComponent: React.LazyExoticComponent<any>;
    try {
      FeatureComponent = lazy(() => import(`./features/${activeFeature.id}`));
    } catch (error) {
      return <FeaturePlaceholder featureId={activeFeature.id} />;
    }

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
        <FeatureComponent projectId={project.id} />
      </Suspense>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>
    );
  }

  if (!features.length) {
    return (
      <Alert severity="info" sx={{ m: 3 }}>No features available for this project</Alert>
    );
  }

  return (
    <Box>
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
            value={feature.path}
            label={feature.name}
            sx={{ textTransform: 'none' }}
          />
        ))}
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {renderFeatureContent()}
      </Box>
    </Box>
  );
};

export default DynamicProjectNavigation;
