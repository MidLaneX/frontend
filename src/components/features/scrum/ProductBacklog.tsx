import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import type { FeatureComponentProps } from '@/types/template';

/**
 * Product Backlog Component for Scrum projects
 * This is an example of how template-specific features can be implemented
 */
const ProductBacklog: React.FC<FeatureComponentProps> = ({
  project,
  tasks,
  onTaskClick,
  onCreateTask,
  onUpdateTask
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Product Backlog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Prioritized list of features, user stories, and requirements for {project?.name}
          </Typography>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`Template: ${project?.templateType}`} color="primary" size="small" />
          <Chip label={`${tasks?.length || 0} Stories`} variant="outlined" size="small" />
          <Chip label="Scrum Feature" color="success" size="small" />
        </Box>

        <Typography variant="body1" sx={{ color: '#666', fontStyle: 'italic' }}>
          🚀 This is a Scrum-specific Product Backlog feature!
          <br />
          <br />
          Features are loaded dynamically based on the project's template type.
          <br />
          <br />
          Template Type: <strong>{project?.templateType}</strong>
          <br />
          Available Features: <strong>{project?.features?.join(', ')}</strong>
        </Typography>

        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>How this works:</strong>
            <br />
            1. Project template type determines available features
            <br />
            2. Features are fetched from the API (project.features array)
            <br />
            3. Navigation tabs are generated dynamically
            <br />
            4. Each feature loads its specific component
            <br />
            5. System is scalable for new templates and features
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductBacklog;
