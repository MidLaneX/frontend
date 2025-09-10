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
  LinearProgress,
  Divider,
  List,
  ListItemText,
  ListItemIcon,
  ListItemButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  AccountTree as FunctionalIcon,
  Person as PersonIcon,
  Assignment as TaskIcon,
  Group as DepartmentIcon,
  Business as OrganizationIcon,
  TrendingUp as PerformanceIcon,
  Speed as EfficiencyIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';
import { TaskService } from '@/services/TaskService';
import type { Task, TaskStatus, TaskPriority } from '@/types';

interface FunctionalProps {
  projectId: string;
  projectName?: string;
  templateType?: string;
}

const functionalDepartments = [
  { 
    name: 'Executive', 
    description: 'Strategic planning and leadership',
    color: '#1a237e',
    icon: OrganizationIcon,
  },
  { 
    name: 'Operations', 
    description: 'Daily operations and process management',
    color: '#2e7d32',
    icon: PerformanceIcon,
  },
  { 
    name: 'Finance', 
    description: 'Financial planning and accounting',
    color: '#d32f2f',
    icon: ReportIcon,
  },
  { 
    name: 'Human Resources', 
    description: 'People management and development',
    color: '#f57c00',
    icon: PersonIcon,
  },
  { 
    name: 'Marketing', 
    description: 'Marketing and customer acquisition',
    color: '#9c27b0',
    icon: PerformanceIcon,
  },
  { 
    name: 'Technology', 
    description: 'IT infrastructure and development',
    color: '#1976d2',
    icon: TaskIcon,
  },
];

const statusOptions: TaskStatus[] = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];
const priorityOptions: TaskPriority[] = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
const functionalTypes = ['Department Task', 'Administrative', 'Policy', 'Training', 'Compliance'];

const Functional: React.FC<FunctionalProps> = ({ projectId, projectName, templateType = 'functional' }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [expandedDepartment, setExpandedDepartment] = useState<string | false>(false);

  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Todo',
    type: 'Department Task',
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
      type: 'Department Task',
      assignee: '',
      reporter: '',
      dueDate: '',
      storyPoints: 3,
      labels: [],
      comments: [],
    });
  };

  const getTasksByDepartment = (department: string) => {
    return tasks.filter(task => 
      task.labels && task.labels.includes(department)
    );
  };

  const getDepartmentProgress = (department: string) => {
    const deptTasks = getTasksByDepartment(department);
    if (deptTasks.length === 0) return 0;
    const completedTasks = deptTasks.filter(task => task.status === 'Done');
    return (completedTasks.length / deptTasks.length) * 100;
  };

  const getOrganizationEfficiency = () => {
    const completedTasks = tasks.filter(task => task.status === 'Done').length;
    const totalTasks = tasks.length;
    return totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0';
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
    <Card key={task.id} sx={{ mb: 1, borderRadius: 1, border: '1px solid #e0e0e0' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {task.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              label={task.priority}
              size="small"
              sx={{
                bgcolor: `${getPriorityColor(task.priority)}15`,
                color: getPriorityColor(task.priority),
                fontSize: 10,
                height: 18,
              }}
            />
            <Chip
              label={task.status}
              size="small"
              sx={{
                bgcolor: `${getStatusColor(task.status)}15`,
                color: getStatusColor(task.status),
                fontSize: 10,
                height: 18,
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
              <EditIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Box>
        
        {task.description && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            {task.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {task.assignee && (
              <Avatar sx={{ width: 20, height: 20, fontSize: 10 }}>
                {task.assignee.charAt(0).toUpperCase()}
              </Avatar>
            )}
            {task.dueDate && (
              <Typography variant="caption" color="text.secondary">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </Typography>
            )}
          </Box>
          {task.storyPoints && (
            <Typography variant="caption" fontWeight={600} color="primary.main">
              {task.storyPoints} pts
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading functional organization workspace...</Typography>
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
          <FunctionalIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Functional Organization
            </Typography>
            {projectName && (
              <Typography variant="body2" color="text.secondary">
                {projectName} - Hierarchical structure
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

      {/* Functional Organization Metrics */}
      <Paper sx={{ m: 3, p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Organization Metrics
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
            <EfficiencyIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={600} color="success.main">
              {getOrganizationEfficiency()}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overall Efficiency
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
            <DepartmentIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={600} color="primary.main">
              {functionalDepartments.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Departments
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
            <TaskIcon sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={600} color="info.main">
              {tasks.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Tasks
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
            <ReportIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={600} color="warning.main">
              {tasks.filter(task => task.status === 'In Progress').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Tasks
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Functional Departments Hierarchy */}
      <Box sx={{ flex: 1, display: 'flex', gap: 3, px: 3, pb: 3, overflow: 'hidden' }}>
        {/* Department List */}
        <Paper sx={{ width: 300, p: 2, borderRadius: 2, overflow: 'auto' }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Departments
          </Typography>
          
          <List sx={{ p: 0 }}>
            {functionalDepartments.map(dept => {
              const Icon = dept.icon;
              const deptTasks = getTasksByDepartment(dept.name);
              const progress = getDepartmentProgress(dept.name);
              
              return (
                <ListItemButton
                  key={dept.name}
                  selected={expandedDepartment === dept.name}
                  onClick={() => setExpandedDepartment(expandedDepartment === dept.name ? false : dept.name)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    border: '1px solid #e0e0e0',
                    '&.Mui-selected': {
                      bgcolor: `${dept.color}10`,
                      borderColor: dept.color,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Icon sx={{ color: dept.color, fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={600}>
                        {dept.name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {dept.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              flex: 1,
                              height: 3,
                              borderRadius: 1.5,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: dept.color,
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {deptTasks.length}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Paper>

        {/* Department Tasks */}
        <Paper sx={{ flex: 1, p: 3, borderRadius: 2, overflow: 'auto' }}>
          {expandedDepartment ? (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  {(() => {
                    const dept = functionalDepartments.find(d => d.name === expandedDepartment);
                    const Icon = dept?.icon || TaskIcon;
                    return <Icon sx={{ color: dept?.color, fontSize: 24 }} />;
                  })()}
                  <Typography variant="h6" fontWeight={600}>
                    {expandedDepartment} Department
                  </Typography>
                  <Chip
                    label={`${getTasksByDepartment(expandedDepartment).length} tasks`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {functionalDepartments.find(d => d.name === expandedDepartment)?.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={getDepartmentProgress(expandedDepartment)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'grey.200',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {getDepartmentProgress(expandedDepartment).toFixed(0)}% complete
                  </Typography>
                </Box>
                
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setNewTaskData({ ...newTaskData, labels: [expandedDepartment] });
                    setOpenDialog(true);
                  }}
                  sx={{ mb: 3 }}
                >
                  Add Task to {expandedDepartment}
                </Button>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {getTasksByDepartment(expandedDepartment).length > 0 ? (
                getTasksByDepartment(expandedDepartment).map(task => renderTaskCard(task))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <TaskIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No tasks in {expandedDepartment}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Start by adding tasks to this department
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setNewTaskData({ ...newTaskData, labels: [expandedDepartment] });
                      setOpenDialog(true);
                    }}
                  >
                    Add First Task
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <FunctionalIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Select a Department
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a department from the left to view and manage its tasks
              </Typography>
            </Box>
          )}
        </Paper>
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
                <InputLabel>Department</InputLabel>
                <Select
                  value={newTaskData.labels?.[0] || ''}
                  label="Department"
                  onChange={(e) => setNewTaskData({ ...newTaskData, labels: [e.target.value] })}
                >
                  {functionalDepartments.map(dept => (
                    <MenuItem key={dept.name} value={dept.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <dept.icon sx={{ fontSize: 18, color: dept.color }} />
                        {dept.name}
                      </Box>
                    </MenuItem>
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
                  {functionalTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
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

export default Functional;
