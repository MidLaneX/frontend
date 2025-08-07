import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';

interface TimelineProps {
  projectId: string;
  projectName: string;
}

const ProjectTimeline: React.FC<TimelineProps> = ({ projectId, projectName }) => {
  const timelineEvents = [
    { id: 1, title: 'Project Started', date: '2024-01-15', status: 'completed' },
    { id: 2, title: 'Sprint 1 Completed', date: '2024-01-30', status: 'completed' },
    { id: 3, title: 'Sprint 2 In Progress', date: '2024-02-15', status: 'current' },
    { id: 4, title: 'Release Planned', date: '2024-03-01', status: 'upcoming' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'current': return 'primary';
      case 'upcoming': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Timeline - {projectName}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Project ID: {projectId}
        </Typography>
        
        <List sx={{ mt: 3 }}>
          {timelineEvents.map((event) => (
            <ListItem key={event.id} divider>
              <ListItemText
                primary={event.title}
                secondary={event.date}
              />
              <Chip 
                label={event.status}
                color={getStatusColor(event.status) as any}
                size="small"
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default ProjectTimeline;
