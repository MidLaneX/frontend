import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTaskService } from '@/hooks';
import type { Task } from '@/types';

interface EstimationSession {
  id: string;
  taskId: string;
  isActive: boolean;
  participants: string[];
  estimates: Record<string, number>;
  finalEstimate?: number;
}

const fibonacciSequence = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

const EstimationComponent: React.FC = () => {
  const { taskService, onUpdateTask, isReady } = useTaskService();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<EstimationSession | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<number | null>(null);
  const [userName, setUserName] = useState('User');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showEstimateDialog, setShowEstimateDialog] = useState(false);

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
      // Get tasks that need estimation (without story points or with 0 story points)
      const allTasks = await taskService.getTasks();
      const unestimatedTasks = allTasks.filter(task => !task.storyPoints || task.storyPoints === 0);
      setTasks(unestimatedTasks);
    } catch (err) {
      console.error('Failed to load estimation tasks:', err);
      setError('Failed to load estimation tasks');
    } finally {
      setLoading(false);
    }
  };

  const startEstimation = (task: Task) => {
    const session: EstimationSession = {
      id: `session-${task.id}-${Date.now()}`,
      taskId: task.id,
      isActive: true,
      participants: [userName],
      estimates: {}
    };
    setCurrentSession(session);
    setSelectedEstimate(null);
    setShowEstimateDialog(true);
  };

  const submitEstimate = () => {
    if (!currentSession || selectedEstimate === null) return;
    
    const updatedSession = {
      ...currentSession,
      estimates: {
        ...currentSession.estimates,
        [userName]: selectedEstimate
      }
    };
    setCurrentSession(updatedSession);
  };

  const finalizeEstimate = async () => {
    if (!currentSession || !onUpdateTask) return;
    
    try {
      const task = tasks.find(t => t.id === currentSession.taskId);
      if (!task) return;

      // For demo purposes, use the user's estimate as final
      const finalEstimate = currentSession.estimates[userName] || selectedEstimate || 0;
      
      await onUpdateTask(task.id, {
        ...task,
        storyPoints: finalEstimate
      });

      // Update local state
      setTasks(prevTasks => 
        prevTasks.filter(t => t.id !== currentSession.taskId)
      );

      setCurrentSession(null);
      setSelectedEstimate(null);
      setShowEstimateDialog(false);
    } catch (err) {
      console.error('Failed to save estimate:', err);
    }
  };

  const cancelEstimation = () => {
    setCurrentSession(null);
    setSelectedEstimate(null);
    setShowEstimateDialog(false);
  };

  const startEditing = (task: Task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async (task: Task) => {
    if (!onUpdateTask || !editTitle.trim()) return;
    
    try {
      await onUpdateTask(task.id, {
        ...task,
        title: editTitle.trim()
      });

      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id ? { ...t, title: editTitle.trim() } : t
        )
      );

      setEditingTask(null);
      setEditTitle('');
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditTitle('');
  };

  const getEstimationStats = () => {
    const total = tasks.length;
    const estimated = tasks.filter(task => task.storyPoints && task.storyPoints > 0).length;
    const remaining = total - estimated;
    
    return { total, estimated, remaining };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading estimation board...</Typography>
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

  const stats = getEstimationStats();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">Story Point Estimation</Typography>
          <Typography variant="body2" color="text.secondary">
            Planning poker for accurate story point estimation
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            size="small"
            sx={{ width: 150 }}
          />
          <Tooltip title="Refresh Tasks">
            <IconButton onClick={loadTasks} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Stories
              </Typography>
              <Typography variant="h4" component="div">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Estimated
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {stats.estimated}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Remaining
              </Typography>
              <Typography variant="h4" component="div" color="warning.main">
                {stats.remaining}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Task List */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
          <Typography variant="h6">Stories Needing Estimation</Typography>
        </Box>
        
        {tasks.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              🎉 All stories have been estimated! Great work!
            </Typography>
          </Box>
        ) : (
          <List>
            {tasks.map((task, index) => (
              <React.Fragment key={task.id}>
                <ListItem sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    {/* Task Priority Indicator */}
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: task.priority === 'High' ? '#ff5722' : 
                                       task.priority === 'Medium' ? '#ff9800' : '#4caf50'
                      }} 
                    />
                    
                    {/* Task Details */}
                    <Box sx={{ flex: 1 }}>
                      {editingTask === task.id ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            size="small"
                            fullWidth
                            onKeyPress={(e) => e.key === 'Enter' && saveEdit(task)}
                          />
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => saveEdit(task)}
                          >
                            <SaveIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={cancelEdit}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {task.title}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => startEditing(task)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          {task.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {task.description.length > 150 
                                ? `${task.description.substring(0, 150)}...` 
                                : task.description
                              }
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={task.type} size="small" variant="outlined" />
                            <Chip label={task.priority} size="small" color="default" />
                            {task.assignee && (
                              <Chip 
                                avatar={<Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>
                                  {task.assignee.split(' ').map(n => n[0]).join('')}
                                </Avatar>}
                                label={task.assignee} 
                                size="small" 
                                variant="outlined" 
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      startIcon={<PlayCircleIcon />}
                      onClick={() => startEstimation(task)}
                      disabled={editingTask === task.id}
                    >
                      Estimate
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < tasks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Estimation Dialog */}
      <Dialog 
        open={showEstimateDialog} 
        onClose={cancelEstimation}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PlayCircleIcon color="primary" />
            <Box>
              <Typography variant="h6">
                Estimate Story Points
              </Typography>
              {currentSession && (
                <Typography variant="body2" color="text.secondary">
                  {tasks.find(t => t.id === currentSession.taskId)?.title}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {currentSession && (
            <Box>
              {/* Story Details */}
              <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                <Typography variant="body1" gutterBottom>
                  {tasks.find(t => t.id === currentSession.taskId)?.description}
                </Typography>
              </Paper>

              {/* Estimation Cards */}
              <Typography variant="h6" gutterBottom>
                Select Your Estimate
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {fibonacciSequence.map((points) => (
                  <Grid item key={points}>
                    <Card 
                      sx={{ 
                        width: 80, 
                        height: 100, 
                        cursor: 'pointer',
                        backgroundColor: selectedEstimate === points ? '#1976d2' : 'white',
                        color: selectedEstimate === points ? 'white' : 'inherit',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: selectedEstimate === points ? '#1565c0' : '#f5f5f5',
                          transform: 'scale(1.05)'
                        }
                      }}
                      onClick={() => setSelectedEstimate(points)}
                    >
                      <CardContent sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%',
                        p: 1,
                        '&:last-child': { pb: 1 }
                      }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {points}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Current Estimates */}
              {Object.keys(currentSession.estimates).length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Current Estimates
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {Object.entries(currentSession.estimates).map(([participant, estimate]) => (
                      <Chip
                        key={participant}
                        avatar={<Avatar sx={{ width: 24, height: 24 }}>
                          {participant[0].toUpperCase()}
                        </Avatar>}
                        label={`${participant}: ${estimate} pts`}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={cancelEstimation}>
            Cancel
          </Button>
          {selectedEstimate !== null && !currentSession?.estimates[userName] && (
            <Button onClick={submitEstimate} variant="outlined">
              Submit Estimate
            </Button>
          )}
          {currentSession?.estimates[userName] && (
            <Button onClick={finalizeEstimate} variant="contained">
              Finalize Estimate
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EstimationComponent;
