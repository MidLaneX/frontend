import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTaskService } from '@/hooks';
import type { Task, TaskStatus, TaskPriority } from '@/types';

const BacklogComponent: React.FC = () => {
  const { taskService, onUpdateTask, isReady } = useTaskService();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
      setTasks(allTasks);
    } catch (err) {
      console.error('Failed to load backlog tasks:', err);
      setError('Failed to load backlog tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleUpdatePriority = async (newPriority: TaskPriority) => {
    if (!selectedTask || !onUpdateTask) return;
    
    try {
      await onUpdateTask(selectedTask.id, { priority: newPriority });
      await loadTasks(); // Refresh the list
      handleMenuClose();
    } catch (err) {
      console.error('Failed to update task priority:', err);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'Highest': return 'error';
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      case 'Lowest': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Done': return 'success';
      case 'In Progress': return 'warning';
      case 'Review': return 'info';
      case 'Todo': return 'default';
      case 'Backlog': return 'default';
      default: return 'default';
    }
  };

  // Group tasks by priority for better organization
  const groupedTasks = tasks.reduce((groups, task) => {
    const priority = task.priority || 'Medium';
    if (!groups[priority]) {
      groups[priority] = [];
    }
    groups[priority].push(task);
    return groups;
  }, {} as Record<string, Task[]>);

  const priorityOrder: TaskPriority[] = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading product backlog...</Typography>
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Backlog Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>Product Backlog</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and prioritize your project backlog items ({tasks.length} total tasks)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained">Add Story</Button>
            <Button variant="outlined" onClick={loadTasks}>Refresh</Button>
          </Box>
        </Box>
      </Paper>

      {tasks.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No items in backlog
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start by adding user stories, bugs, or tasks to your product backlog
          </Typography>
          <Button variant="contained">Create First Item</Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {priorityOrder.map(priority => {
            const priorityTasks = groupedTasks[priority] || [];
            if (priorityTasks.length === 0) return null;

            return (
              <Paper key={priority} elevation={1} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip 
                    label={`${priority} Priority`}
                    color={getPriorityColor(priority)}
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {priorityTasks.length} {priorityTasks.length === 1 ? 'item' : 'items'}
                  </Typography>
                </Box>
                
                <List dense>
                  {priorityTasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem 
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            onClick={(e) => handleMenuClick(e, task)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                {task.title}
                              </Typography>
                              <Chip 
                                label={task.type} 
                                size="small" 
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {task.description || 'No description'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Typography variant="caption">
                                  Story Points: {task.storyPoints || 0}
                                </Typography>
                                <Typography variant="caption">
                                  Assignee: {task.assignee || 'Unassigned'}
                                </Typography>
                                <Chip 
                                  label={task.status} 
                                  color={getStatusColor(task.status)} 
                                  size="small" 
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < priorityTasks.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleUpdatePriority('Highest')}>
          Set Highest Priority
        </MenuItem>
        <MenuItem onClick={() => handleUpdatePriority('High')}>
          Set High Priority
        </MenuItem>
        <MenuItem onClick={() => handleUpdatePriority('Medium')}>
          Set Medium Priority
        </MenuItem>
        <MenuItem onClick={() => handleUpdatePriority('Low')}>
          Set Low Priority
        </MenuItem>
        <MenuItem onClick={() => handleUpdatePriority('Lowest')}>
          Set Lowest Priority
        </MenuItem>
      </Menu>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="outlined">
          Refine Backlog
        </Button>
        <Button variant="outlined">
          Sprint Planning
        </Button>
        <Button variant="outlined">
          Export Backlog
        </Button>
      </Box>
    </Box>
  );
};

export default BacklogComponent;
