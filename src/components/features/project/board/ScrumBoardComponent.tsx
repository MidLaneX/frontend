import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Avatar,
  Tooltip,
  IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import { useTaskService } from '@/hooks';
import type { Task, TaskStatus } from '@/types';

const ScrumBoardComponent: React.FC = () => {
  const { taskService, onUpdateTaskStatus, isReady } = useTaskService();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);

  const columns: { title: string; status: TaskStatus; color: string }[] = [
    { title: 'Backlog', status: 'Backlog', color: '#f5f5f5' },
    { title: 'To Do', status: 'Todo', color: '#e3f2fd' },
    { title: 'In Progress', status: 'In Progress', color: '#fff3e0' },
    { title: 'Review', status: 'Review', color: '#f3e5f5' },
    { title: 'Done', status: 'Done', color: '#e8f5e8' }
  ];

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
      console.error('Failed to load scrum board tasks:', err);
      setError('Failed to load scrum board tasks');
    } finally {
      setLoading(false);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (!onUpdateTaskStatus) return;
    
    try {
      setUpdatingTask(taskId);
      await onUpdateTaskStatus(taskId, newStatus);
      
      // Update local state immediately for better UX
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error('Failed to update task status:', err);
      // Reload tasks to ensure consistency
      await loadTasks();
    } finally {
      setUpdatingTask(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Highest':
      case 'High': return '#ff5630';
      case 'Medium': return '#ffab00';
      case 'Low':
      case 'Lowest': return '#36b37e';
      default: return '#6b778c';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading scrum board...</Typography>
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
      {/* Board Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">Scrum Board</Typography>
          <Typography variant="body2" color="text.secondary">
            {tasks.length} total tasks across all columns
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh Board">
            <IconButton onClick={loadTasks} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
          >
            Add Story
          </Button>
        </Box>
      </Box>

      {/* Board Columns */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        overflowX: 'auto', 
        minHeight: '70vh', 
        pb: 2,
        '&::-webkit-scrollbar': {
          height: 8,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#888',
          borderRadius: 4,
        },
      }}>
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.status);
          
          return (
            <Paper 
              key={column.status} 
              sx={{ 
                minWidth: 320, 
                flex: '0 0 320px', 
                backgroundColor: column.color, 
                p: 2,
                height: 'fit-content',
                minHeight: '500px'
              }}
            >
              {/* Column Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {column.title}
                </Typography>
                <Chip 
                  label={columnTasks.length} 
                  size="small" 
                  variant="outlined"
                  sx={{ 
                    backgroundColor: 'white',
                    fontWeight: 600 
                  }}
                />
              </Box>
              
              {/* Column Tasks */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {columnTasks.map((task) => (
                  <Card 
                    key={task.id} 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: updatingTask === task.id ? 0.6 : 1,
                      '&:hover': { 
                        boxShadow: 3,
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      {/* Task Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                          {task.title}
                        </Typography>
                        <Box 
                          sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            backgroundColor: getPriorityColor(task.priority),
                            ml: 1,
                            mt: 0.5
                          }} 
                        />
                      </Box>
                      
                      {/* Task Description */}
                      {task.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem' }}>
                          {task.description.length > 100 
                            ? `${task.description.substring(0, 100)}...` 
                            : task.description
                          }
                        </Typography>
                      )}
                      
                      {/* Task Labels */}
                      {task.labels && task.labels.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                          {task.labels.slice(0, 3).map((label) => (
                            <Chip 
                              key={label}
                              label={label} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          ))}
                          {task.labels.length > 3 && (
                            <Chip 
                              label={`+${task.labels.length - 3}`}
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                        </Box>
                      )}
                      
                      {/* Task Footer */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={task.type}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                          <Chip 
                            label={`${task.storyPoints || 0} SP`} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        </Box>
                        <Tooltip title={task.assignee || 'Unassigned'}>
                          <Avatar sx={{ 
                            width: 28, 
                            height: 28, 
                            fontSize: '0.75rem',
                            backgroundColor: task.assignee ? '#1976d2' : '#bdbdbd'
                          }}>
                            {task.assignee ? getInitials(task.assignee) : '?'}
                          </Avatar>
                        </Tooltip>
                      </Box>
                      
                      {/* Status Change Actions */}
                      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {columns
                          .filter(col => col.status !== column.status)
                          .slice(0, 2) // Show only 2 quick actions
                          .map(targetColumn => (
                            <Button
                              key={targetColumn.status}
                              size="small"
                              variant="outlined"
                              onClick={() => handleStatusChange(task.id, targetColumn.status)}
                              disabled={updatingTask === task.id}
                              sx={{ 
                                fontSize: '0.65rem', 
                                minWidth: 'auto', 
                                px: 1.5, 
                                py: 0.5,
                                height: 24
                              }}
                            >
                              → {targetColumn.title}
                            </Button>
                          ))}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add Item Button */}
                <Button 
                  variant="outlined" 
                  sx={{ 
                    borderStyle: 'dashed', 
                    color: 'text.secondary',
                    py: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                  startIcon={<AddIcon />}
                >
                  Add Item
                </Button>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default ScrumBoardComponent;
