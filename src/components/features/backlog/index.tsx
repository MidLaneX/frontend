import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';

interface BacklogProps {
  projectId: string;
  projectName: string;
}

const Backlog: React.FC<BacklogProps> = ({ projectId, projectName }) => {
  const mockBacklogItems = [
    { id: 1, title: 'User Authentication', priority: 'High', story_points: 8 },
    { id: 2, title: 'Dashboard Layout', priority: 'Medium', story_points: 5 },
    { id: 3, title: 'API Integration', priority: 'High', story_points: 13 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Backlog - {projectName}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Project ID: {projectId}
        </Typography>
        
        <List>
          {mockBacklogItems.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={item.title}
                secondary={`Story Points: ${item.story_points}`}
              />
              <Chip 
                label={item.priority}
                color={item.priority === 'High' ? 'error' : 'default'}
                size="small"
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Backlog;
