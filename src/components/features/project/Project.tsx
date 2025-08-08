import React from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Alert,
  Button,
  CircularProgress,
} from "@mui/material";

import DynamicProjectNavigation from "./DynamicProjectNavigation";
import { useProject } from "@/hooks";

// Constants for consistent styling
const STYLES = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  notFoundContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
} as const;

/**
 * ProjectPage Component
 *
 * A comprehensive project management page that displays project details
 * and dynamic navigation based on backend-provided features.
 *
 * Features:
 * - Dynamic project loading with backend features  
 * - Backend-driven navigation tabs
 * - Dynamic component loading
 * - Scalable for any template type
 */
const ProjectPage: React.FC = () => {
  // Get project ID from URL parameters
  const { projectId } = useParams<{ projectId: string }>();
  
  // Use the hook to fetch project with template-specific features from backend
  const { 
    project, 
    loading, 
    error, 
    refetch 
  } = useProject({ 
    projectId: Number(projectId),
    template: 'scrum' // Default template - could be made dynamic
  });

  // Loading state
  if (loading) {
    return (
      <Box sx={STYLES.notFoundContainer}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={refetch}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  // Project not found
  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Project not found. Please check the project ID and try again.
        </Alert>
      </Box>
    );
  }

  // Main render
  return (
    <Box sx={STYLES.container}>
      {/* Dynamic Project Navigation with Backend Features */}
      <DynamicProjectNavigation
        project={project}
      />
    </Box>
  );
};

export default ProjectPage;
