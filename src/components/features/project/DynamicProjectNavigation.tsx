//DynamicNav

import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children?: React.ReactNode;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: ErrorBoundaryProps) {
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

const normalizeFeaturePath = (name: string) =>
  name.toLowerCase().replace(/\s+/g, '_'); // consistent with folder names

const FeaturePlaceholder = ({ featureName }: { featureName?: string }) => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {(featureName || 'Unknown').replace(/_/g, ' ').toLowerCase()} Feature
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This feature is under development or missing.
      </Typography>
    </Paper>
  </Box>
);

const DynamicProjectNavigation: React.FC<DynamicProjectNavigationProps> = ({ project }) => {
  const { featureName: paramFeatureName, projectId: projectId, templateType: templateType } = useParams<{
    featureName?: string;
    projectId?: string;
    templateType?: string;
  }>();

  const navigate = useNavigate();
  const features = project.features || [];

  const normalizedFeatures = React.useMemo(
    () =>
      features.map((f) => ({
        name: f,
        path: normalizeFeaturePath(f),
      })),
    [features]
  );

  const [activeTab, setActiveTab] = useState<string>('');

  // Sync activeTab with URL param and navigate if needed
  useEffect(() => {
    if (normalizedFeatures.length === 0) return;

    const validFeature = paramFeatureName && normalizedFeatures.some(f => f.path === paramFeatureName);

    if (validFeature) {
      if (paramFeatureName !== activeTab) {
        setActiveTab(paramFeatureName);
      }
    } else {
      // Redirect to first feature if paramFeatureName invalid or missing
      if (projectId && templateType && activeTab !== normalizedFeatures[0].path) {
        navigate(`/projects/${projectId}/${templateType}/${normalizedFeatures[0].path}`, { replace: true });
      }
      setActiveTab(normalizedFeatures[0].path);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramFeatureName, projectId, templateType, normalizedFeatures]);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: string) => {
      setActiveTab(newValue);
      if (projectId && templateType) {
        navigate(`/projects/${projectId}/${templateType}/${newValue}`);
      }
    },
    [navigate, projectId, templateType]
  );

  const renderFeatureContent = () => {
    const activeFeature = normalizedFeatures.find(f => f.path === activeTab);
    if (!activeFeature) return <FeaturePlaceholder featureName={activeTab} />;

    console.log('🚀 Loading feature:', {
      activeFeature,
      importPath: `../${activeFeature.path}/index.tsx`,
      projectId: parseInt(project.id),
      projectName: project.name,
      templateType: project.templateType,
    });

    // IMPORTANT: Use correct relative path for dynamic import
    // From: src/components/features/project/ 
    // To:   src/components/features/backlog/index, src/components/features/sprint/index, etc.
    const FeatureComponent = lazy(() =>
      import(`../${activeFeature.path}/index.tsx`).catch((error) => {
        console.error(`❌ Failed to load component for ${activeFeature.path}:`, error);
        return {
          default: () => <FeaturePlaceholder featureName={activeFeature.path} />,
        };
      })
    );

   return (
  <ErrorBoundary fallback={<FeaturePlaceholder featureName={activeFeature.path} />}>
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading {activeFeature.name}...</Typography>
        </Box>
      }
    >
      <FeatureComponent 
        projectId={project.id?.toString() || 'unknown'} 
        projectName={project.name || 'Unknown Project'} 
        templateType={templateType }
      />
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
        aria-label="Project Features Navigation"
      >
        {normalizedFeatures.map((feature) => (
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
