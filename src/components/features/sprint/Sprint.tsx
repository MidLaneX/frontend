import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  List, 
  ListItem, 
  ListItemText,
  LinearProgress,
  Avatar
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';

interface SprintProps {
  projectId: string;
  projectName: string;
}

const Sprint: React.FC<SprintProps> = () => {
  // Mock sprint data - replace with API call
  const currentSprint = {
    name: 'Sprint 3',
    goal: 'Implement user authentication and dashboard features',
    startDate: '2024-02-01',
    endDate: '2024-02-14',
    status: 'Active',
    progress: 65,
    totalStoryPoints: 34,
    completedStoryPoints: 22
  };

  const sprintBacklog = [
    {
      id: 1,
      title: 'User Login Form',
      storyPoints: 5,
      assignee: 'John Doe',
      status: 'Done'
    },
    {
      id: 2,
      title: 'Dashboard Layout',
      storyPoints: 8,
      assignee: 'Jane Smith',
      status: 'In Progress'
    },
    {
      id: 3,
      title: 'User Profile Page',
      storyPoints: 13,
      assignee: 'Mike Johnson',
      status: 'To Do'
    },
    {
      id: 4,
      title: 'Password Reset',
      storyPoints: 8,
      assignee: 'Sarah Wilson',
      status: 'In Progress'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'success';
      case 'In Progress': return 'warning';
      case 'To Do': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Sprint Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {currentSprint.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<EditIcon />}>
              Edit Sprint
            </Button>
            <Button variant="contained" startIcon={<AssessmentIcon />}>
              Sprint Report
            </Button>
          </Box>
        </Box>

        <Typography variant="h6" color="text.secondary" gutterBottom>
          Sprint Goal: {currentSprint.goal}
        </Typography>

        <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Duration</Typography>
            <Typography variant="body1">
              {currentSprint.startDate} - {currentSprint.endDate}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Box>
              <Chip 
                label={currentSprint.status} 
                color="success" 
                variant="outlined" 
                icon={<PlayArrowIcon />}
              />
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Progress</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={currentSprint.progress} 
                sx={{ width: 100, height: 6, borderRadius: 3 }}
              />
              <Typography variant="body2">{currentSprint.progress}%</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Sprint Statistics */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Story Points
            </Typography>
            <Typography variant="h4">
              {currentSprint.completedStoryPoints}/{currentSprint.totalStoryPoints}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed / Total
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Burndown Rate
            </Typography>
            <Typography variant="h4">
              Good
            </Typography>
            <Typography variant="body2" color="text.secondary">
              On track to meet sprint goal
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Team Velocity
            </Typography>
            <Typography variant="h4">
              28
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average story points per sprint
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Sprint Backlog */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Sprint Backlog
        </Typography>
        
        <List>
          {sprintBacklog.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={item.title}
                secondary={`Story Points: ${item.storyPoints} | Assignee: ${item.assignee}`}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={item.status} 
                  color={getStatusColor(item.status) as any}
                  size="small"
                />
                <Avatar sx={{ width: 32, height: 32 }}>
                  {item.assignee.split(' ').map(n => n[0]).join('')}
                </Avatar>
              </Box>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained">Add Story</Button>
          <Button variant="outlined">View Burndown Chart</Button>
          <Button variant="outlined">Sprint Planning</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Sprint;
