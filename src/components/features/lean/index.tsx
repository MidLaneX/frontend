import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  Tooltip,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  TrendingUp as ValueStreamIcon,
  Speed as EfficiencyIcon,
  Timeline as FlowIcon,
  Assignment as TaskIcon,
  CalendarToday as CalendarIcon,
  Analytics as MetricsIcon,
} from '@mui/icons-material';
import { TaskService } from '@/services/TaskService';
import type { Task, TaskStatus, TaskPriority } from '@/types';

interface LeanProps {
  projectId: string;
  projectName?: string;
  templateType?: string;
}

const leanStages = [
  'Define Value',
  'Map Value Stream',
  'Create Flow',
  'Establish Pull',
  'Seek Perfection'
];

const statusOptions: TaskStatus[] = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];
const priorityOptions: TaskPriority[] = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
const leanTypes = ['Value Activity', 'Waste Elimination', 'Process Improvement', 'Flow Optimization', 'Pull System'];

const Lean: React.FC<LeanProps> = ({ projectId, projectName, templateType = 'lean' }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [selectedStage, setSelectedStage] = useState('Define Value');

  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Todo',
    type: 'Value Activity',
    assignee: '',
    reporter: '',
    dueDate: '',
    storyPoints: 3,
    labels: [],
    comments: [],
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await TaskService.getTasksByProjectId(Number(projectId), templateType);
      setTasks(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, templateType]);

  const handleSave = async () => {
    if (!newTaskData.title) return;

    try {
      if (editTask) {
        await TaskService.updateTask(Number(projectId), Number(editTask.id), newTaskData, templateType);
      } else {
        await TaskService.createTask(Number(projectId), newTaskData as Omit<Task, 'id'>, templateType);
      }

      setOpenDialog(false);
      setEditTask(null);
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
      setError('Failed to save task.');
    }
  };

  const resetForm = () => {
    setNewTaskData({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Todo',
      type: 'Value Activity',
      assignee: '',
      reporter: '',
      dueDate: '',
      storyPoints: 3,
      labels: [],
      comments: [],
    });
  };

  const getTasksByStage = (stage: string) => {
    return tasks.filter(task => 
      task.labels && task.labels.includes(stage)
    );
  };

  const getStageProgress = (stage: string) => {
    const stageTasks = getTasksByStage(stage);
    if (stageTasks.length === 0) return 0;
    const completedTasks = stageTasks.filter(task => task.status === 'Done');
    return (completedTasks.length / stageTasks.length) * 100;
  };

  const getCycleTime = () => {
    const completedTasks = tasks.filter(task => task.status === 'Done');
    return completedTasks.length > 0 ? (completedTasks.length / 30).toFixed(1) : '0'; // Mock calculation
  };

  const getLeadTime = () => {
    return '5.2'; // Mock lead time in days
  };

  const getThroughput = () => {
    return tasks.filter(task => task.status === 'Done').length;
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'Highest': return '#d32f2f';
      case 'High': return '#f57c00';
      case 'Medium': return '#1976d2';
      case 'Low': return '#388e3c';
      case 'Lowest': return '#7b1fa2';
      default: return '#1976d2';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Backlog': return '#757575';
      case 'Todo': return '#1976d2';
      case 'In Progress': return '#f57c00';
      case 'Review': return '#9c27b0';
      case 'Done': return '#4caf50';
      default: return '#757575';
    }
  };

  const renderTaskCard = (task: Task) => (
    <Card key={task.id} sx={{ mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {task.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={task.priority}
              size="small"
              sx={{
                bgcolor: `${getPriorityColor(task.priority)}15`,
                color: getPriorityColor(task.priority),
                border: `1px solid ${getPriorityColor(task.priority)}50`,
              }}
            />
            <Chip
              label={task.status}
              size="small"
              sx={{
                bgcolor: `${getStatusColor(task.status)}15`,
                color: getStatusColor(task.status),
              }}
            />
            <IconButton
              size="small"
              onClick={() => {
                setEditTask(task);
                setNewTaskData({
                  title: task.title,
                  description: task.description,
                  priority: task.priority,
                  status: task.status,
                  type: task.type,
                  assignee: task.assignee,
                  reporter: task.reporter,
                  dueDate: task.dueDate,
                  storyPoints: task.storyPoints,
                  labels: task.labels,
                  comments: task.comments,
                });
                setOpenDialog(true);
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
        
        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {task.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {task.assignee && (
              <Tooltip title={`Assigned to ${task.assignee}`}>
                <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                  {task.assignee.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            )}
            {task.dueDate && (
              <Chip
                icon={<CalendarIcon sx={{ fontSize: 12 }} />}
                label={new Date(task.dueDate).toLocaleDateString()}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: 10 }}
              />
            )}
          </Box>
          {task.storyPoints && (
            <Chip
              label={`${task.storyPoints} pts`}
              size="small"
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 600,
                bgcolor: 'primary.50',
                color: 'primary.main',
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading lean workspace...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8f9fa' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid #e0e0e0',
          bgcolor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ValueStreamIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Lean Workspace
            </Typography>
            {projectName && (
              <Typography variant="body2" color="text.secondary">
                {projectName}
              </Typography>
            )}
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Add Task
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Metrics Dashboard */}
      <Paper sx={{ m: 3, p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Lean Metrics
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
            <MetricsIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={600} color="primary.main">
              {getCycleTime()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cycle Time (days)
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
            <FlowIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={600} color="success.main">
              {getLeadTime()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lead Time (days)
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
            <EfficiencyIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={600} color="warning.main">
              {getThroughput()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Throughput (items)
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
            <TaskIcon sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={600} color="info.main">
              {((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100).toFixed(0)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completion Rate
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, display: 'flex', gap: 3, p: 3, overflow: 'auto' }}>
        {/* Lean Stages */}
        <Box sx={{ flex: 2 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 'fit-content' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Lean Implementation Stages
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Stage</InputLabel>
                <Select
                  value={selectedStage}
                  label="Select Stage"
                  onChange={(e) => setSelectedStage(e.target.value)}
                >
                  {leanStages.map(stage => (
                    <MenuItem key={stage} value={stage}>{stage}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {leanStages.map((stage, index) => {
              const stageTasks = getTasksByStage(stage);
              const progress = getStageProgress(stage);
              
              return (
                <Box
                  key={stage}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: selectedStage === stage ? '2px solid' : '1px solid',
                    borderColor: selectedStage === stage ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    bgcolor: selectedStage === stage ? 'primary.50' : 'white',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedStage(stage)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {index + 1}. {stage}
                    </Typography>
                    <Chip
                      label={`${stageTasks.length} tasks`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {progress.toFixed(0)}% complete
                  </Typography>
                </Box>
              );
            })}
          </Paper>
        </Box>

        {/* Tasks for Selected Stage */}
        <Box sx={{ flex: 3 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                {selectedStage} Tasks
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setNewTaskData({ ...newTaskData, labels: [selectedStage] });
                  setOpenDialog(true);
                }}
                sx={{ ml: 'auto' }}
              >
                Add Task
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {getTasksByStage(selectedStage).length > 0 ? (
              getTasksByStage(selectedStage).map(task => renderTaskCard(task))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TaskIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No tasks in {selectedStage}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Start by adding tasks to this lean stage
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setNewTaskData({ ...newTaskData, labels: [selectedStage] });
                    setOpenDialog(true);
                  }}
                >
                  Add First Task
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Create/Edit Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Task Title"
              fullWidth
              value={newTaskData.title}
              onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
            />
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newTaskData.description}
              onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Lean Stage</InputLabel>
                <Select
                  value={newTaskData.labels?.[0] || ''}
                  label="Lean Stage"
                  onChange={(e) => setNewTaskData({ ...newTaskData, labels: [e.target.value] })}
                >
                  {leanStages.map(stage => (
                    <MenuItem key={stage} value={stage}>{stage}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTaskData.priority}
                  label="Priority"
                  onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value as TaskPriority })}
                >
                  {priorityOptions.map(priority => (
                    <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newTaskData.type}
                  label="Type"
                  onChange={(e) => setNewTaskData({ ...newTaskData, type: e.target.value })}
                >
                  {leanTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newTaskData.status}
                  label="Status"
                  onChange={(e) => setNewTaskData({ ...newTaskData, status: e.target.value as TaskStatus })}
                >
                  {statusOptions.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Story Points"
                type="number"
                fullWidth
                value={newTaskData.storyPoints}
                onChange={(e) => setNewTaskData({ ...newTaskData, storyPoints: Number(e.target.value) })}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Assignee"
                fullWidth
                value={newTaskData.assignee}
                onChange={(e) => setNewTaskData({ ...newTaskData, assignee: e.target.value })}
              />
              
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newTaskData.dueDate}
                onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
              />
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Lean;
