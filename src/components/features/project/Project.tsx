//projectpage 

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Alert, 
  CircularProgress 
} from '@mui/material';
import type { Project } from '@/types';
import { ProjectService } from '@/services/ProjectService';
import DynamicProjectNavigation from './DynamicProjectNavigation';

const ProjectPage: React.FC = () => {
  const { projectId: urlProjectId, templateType: urlTemplateType } = useParams<{
    projectId?: string;
    templateType?: string;
  }>();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectId = Number(urlProjectId);
  const templateType = urlTemplateType || 'scrum'; // Default template type fallback

  useEffect(() => {
    if (!projectId || !templateType) {
      setError('Project ID or Template Type is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    ProjectService.getProjectById(projectId, templateType)
      .then(res => {
        console.log('ProjectPage - Fetched project:', res);
        if (res) {
          console.log('ProjectPage - Project features:', res.features);
          setProject(res);
        } else {
          setError('Project not found.');
        }
      })
      .catch(err => {
        console.error('Failed to load project:', err);
        setError('Failed to load project. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, [projectId, templateType]);

  // Loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading project...</Typography>
      </Box>
    );
  }

  // Error
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Project not found
  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Project not found. Please check the project ID and try again.</Alert>
      </Box>
    );
  }

  // Project has no features
  if (!project.features || project.features.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Paper elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {project.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Template: {project.templateType?.charAt(0).toUpperCase() + project.templateType?.slice(1)} | Project ID: {project.id}
            </Typography>
          </Box>
        </Paper>
        <Box sx={{ p: 3 }}>
          <Alert severity="info">
            <Typography variant="h6" gutterBottom>No Features Available</Typography>
            <Typography>
              This project doesn't have any features configured. The backend should provide features for this project.
            </Typography>
          </Alert>
        </Box>
      </Box>
    );
  }

  // Success - Show the project with DynamicProjectNavigation
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Paper elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>{project.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Template: {project.templateType?.charAt(0).toUpperCase() + project.templateType?.slice(1)} | Project ID: {project.id}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Backend Features: [{project.features?.join(', ')}]
          </Typography>
        </Box>
      </Paper>

      {/* Render dynamic feature-based UI */}
      <DynamicProjectNavigation project={project} />
    </Box>
  );
};

export default ProjectPage;
