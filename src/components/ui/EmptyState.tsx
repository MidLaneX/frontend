import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Work as ProjectIcon,
} from '@mui/icons-material';

interface EmptyStateProps {
  onCreateProject: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateProject }) => {
  return (
    <Paper
      sx={{
        p: 8,
        textAlign: 'center',
        borderRadius: 2,
        border: '1px solid #DFE1E6',
        backgroundColor: '#FAFBFC',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <ProjectIcon sx={{ fontSize: 64, color: '#5E6C84' }} />
      </Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
        No projects yet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
        Create your first project to start organizing your work and collaborating with your team.
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreateProject}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          px: 4,
          py: 1.5,
        }}
      >
        Create Project
      </Button>
    </Paper>
  );
};

export default EmptyState;
