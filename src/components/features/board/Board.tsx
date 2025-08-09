import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface BoardProps {
  projectId: string;
  projectName: string;
}

const Board: React.FC<BoardProps> = ({ projectId, projectName }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Board - {projectName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Project ID: {projectId}
        </Typography>
        
        {/* Board content will go here */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Paper sx={{ p: 2, minWidth: 300, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>To Do</Typography>
            <Typography variant="body2">Board functionality coming soon...</Typography>
          </Paper>
          
          <Paper sx={{ p: 2, minWidth: 300, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>In Progress</Typography>
            <Typography variant="body2">Drag and drop support...</Typography>
          </Paper>
          
          <Paper sx={{ p: 2, minWidth: 300, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>Done</Typography>
            <Typography variant="body2">Completed tasks...</Typography>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
};

export default Board;
