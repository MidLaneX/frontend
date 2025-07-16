import React from 'react';
import Box from '@mui/material/Box';
import ProjectPage from '../components/Project.tsx';

const Project: React.FC = () => {
  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      bgcolor: '#f7f8f9'
    }}>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'transparent'
        }}
      >
        <ProjectPage />
      </Box>
    </Box>
  );
};

export default Project;
