import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTaskService } from '@/hooks';
import type { Task } from '@/types';

const SprintComponent: React.FC = () => {
  const { taskService, isReady } = useTaskService();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && taskService) {
      loadTasks();
    }
  }, [taskService, isReady]);

  const loadTasks = async () => {
    if (!taskService) return;
    
    try {
      setLoading(true);
      setError(null);
      const allTasks = await taskService.getTasks();
      
      // Filter for active sprint tasks (not in Backlog or Done)
      const sprintTasks = allTasks.filter(task => 
        task.status !== 'Done' && task.status !== 'Backlog'
      );
      
      setTasks(sprintTasks);
    } catch (err) {
      console.error('Failed to load sprint tasks:', err);
      setError('Failed to load sprint tasks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading sprint tasks...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const completedPoints = tasks
    .filter(task => task.status === 'Done')
    .reduce((sum, task) => sum + (task.storyPoints || 0), 0);
  
  const totalPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Sprint Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">Current Sprint</Typography>
          <Button variant="contained">Sprint Report</Button>
        </Box>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Sprint Goal: Complete user stories and improve system functionality
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Duration</Typography>
            <Typography variant="body1">Current Sprint</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Chip label="Active" color="success" variant="outlined" />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Progress</Typography>
            <LinearProgress 
              variant="determinate" 
              value={totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0} 
              sx={{ width: 100, height: 6, borderRadius: 3 }} 
            />
          </Box>
        </Box>
      </Paper>
      
      {/* Sprint Metrics */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>Story Points</Typography>
            <Typography variant="h4">{completedPoints}/{totalPoints}</Typography>
            <Typography variant="body2" color="text.secondary">Completed / Total</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>Tasks</Typography>
            <Typography variant="h4">{tasks.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total in Sprint</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom">Completion Rate</Typography>
            <Typography variant="h4">
              {totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0}%
            </Typography>
            <Typography variant="body2" color="text.secondary">Story Points</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Sprint Backlog */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Sprint Backlog</Typography>
        
        {tasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No tasks found in current sprint
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }}>
              Add Task to Sprint
            </Button>
          </Box>
        ) : (
          <>
            <List>
              {tasks.map((task) => (
                <ListItem key={task.id} divider>
                  <ListItemText 
                    primary={task.title} 
                    secondary={
                      <Box component="span">
                        <Typography component="span" variant="body2">
                          Story Points: {task.storyPoints || 0} | 
                          Assignee: {task.assignee || 'Unassigned'} | 
                          Priority: {task.priority}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip 
                      label={task.status} 
                      color={
                        task.status === 'Done' ? 'success' : 
                        task.status === 'In Progress' ? 'warning' : 
                        'default'
                      } 
                      size="small" 
                    />
                    <Chip 
                      label={task.type} 
                      variant="outlined"
                      size="small" 
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={loadTasks}>
                Refresh Tasks
              </Button>
              <Button variant="outlined">
                View Burndown Chart
              </Button>
              <Button variant="outlined">
                Export Sprint Report
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SprintComponent;
