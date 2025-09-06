import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
  Alert,
  CircularProgress,
  Paper,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as TaskIcon,
  BugReport as BugIcon,
  AutoStories as StoryIcon,
  Category as EpicIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  ViewWeek as BoardIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { TaskService } from '@/services/TaskService';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/types';

interface BoardProps {
  projectId: string;
  projectName?: string;
  templateType?: string;
}

const statusColumns: TaskStatus[] = ['Todo', 'In Progress', 'Done'];
const priorityOptions: TaskPriority[] = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
const typeOptions: TaskType[] = ['Story', 'Bug', 'Task', 'Epic'];

const Board: React.FC<BoardProps> = ({ projectId, projectName, templateType = 'traditional' }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Todo',
    type: 'Task',
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

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination, source } = result;
    const taskId = Number(draggableId.replace('task-', ''));
    const newStatus = destination.droppableId as TaskStatus;
    const oldStatus = source.droppableId as TaskStatus;

    if (oldStatus === newStatus) return;

    console.log(`Moving task ${taskId} from "${oldStatus}" to "${newStatus}"`);

    // Optimistic update
    const originalTasks = [...tasks];
    setTasks(prevTasks => 
      prevTasks.map(t => 
        Number(t.id) === taskId 
          ? { ...t, status: newStatus }
          : t
      )
    );

    try {
      await TaskService.updateTaskStatus(Number(projectId), taskId, newStatus, templateType);
      setError(null);
    } catch (error) {
      console.error('Failed to update task status:', error);
      setError('Failed to update task status.');
      // Revert optimistic update
      setTasks(originalTasks);
    }
  };

  const handleDelete = async (taskId: number) => {
    try {
      await TaskService.deleteTask(Number(projectId), taskId, templateType);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task.');
    }
  };

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
      type: 'Task',
      assignee: '',
      reporter: '',
      dueDate: '',
      storyPoints: 3,
      labels: [],
      comments: [],
    });
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'Epic': return <EpicIcon sx={{ color: '#8b5a2b', fontSize: 18 }} />;
      case 'Story': return <StoryIcon sx={{ color: '#4caf50', fontSize: 18 }} />;
      case 'Bug': return <BugIcon sx={{ color: '#f44336', fontSize: 18 }} />;
      case 'Task': return <TaskIcon sx={{ color: '#2196f3', fontSize: 18 }} />;
      default: return <TaskIcon sx={{ color: '#2196f3', fontSize: 18 }} />;
    }
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

  const getColumnColor = (status: TaskStatus) => {
    switch (status) {
      case 'Todo': return { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' };
      case 'In Progress': return { bg: '#fff3e0', border: '#ff9800', text: '#e65100' };
      case 'Done': return { bg: '#e8f5e8', border: '#4caf50', text: '#2e7d32' };
      default: return { bg: '#f5f5f5', border: '#9e9e9e', text: '#424242' };
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => {
      const matchesStatus = task.status === status;
      const matchesSearch = 
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  };

  const renderTaskCard = (task: Task, index: number) => (
    <Draggable key={task.id} draggableId={`task-${task.id}`} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          elevation={snapshot.isDragging ? 8 : 2}
          sx={{
            mb: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: snapshot.isDragging ? 'primary.main' : 'divider',
            transition: 'all 0.2s ease-in-out',
            transform: snapshot.isDragging ? 'rotate(3deg)' : 'none',
            cursor: 'grab',
            '&:hover': {
              transform: snapshot.isDragging ? 'rotate(3deg)' : 'translateY(-1px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              borderColor: 'primary.main',
            },
            '&:active': {
              cursor: 'grabbing',
            },
            background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(250,252,255,1) 100%)',
          }}
        >
          <CardContent sx={{ p: 2, pb: '16px !important' }}>
            {/* Header with type and priority */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getTaskIcon(task.type)}
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {task.type}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<FlagIcon sx={{ fontSize: 12 }} />}
                  label={task.priority}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 10,
                    bgcolor: `${getPriorityColor(task.priority)}15`,
                    color: getPriorityColor(task.priority),
                    border: `1px solid ${getPriorityColor(task.priority)}50`,
                  }}
                />
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
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

            {/* Title */}
            <Typography variant="body1" fontWeight={600} sx={{ mb: 1, lineHeight: 1.3 }}>
              {task.title}
            </Typography>

            {/* Description */}
            {task.description && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {task.description}
              </Typography>
            )}

            {/* Footer with assignee, due date, and story points */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {task.assignee ? (
                  <Tooltip title={`Assigned to ${task.assignee}`}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                      {task.assignee.charAt(0).toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ) : (
                  <Tooltip title="Unassigned">
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'grey.300' }}>
                      <PersonIcon sx={{ fontSize: 14 }} />
                    </Avatar>
                  </Tooltip>
                )}
                
                {task.dueDate && (
                  <Tooltip title={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}>
                    <Chip
                      icon={<CalendarIcon sx={{ fontSize: 12 }} />}
                      label={new Date(task.dueDate).toLocaleDateString()}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        height: 20, 
                        fontSize: 10,
                        '& .MuiChip-icon': { marginLeft: '4px' }
                      }}
                    />
                  </Tooltip>
                )}
              </Box>

              {task.storyPoints && (
                <Chip
                  label={task.storyPoints}
                  size="small"
                  sx={{
                    height: 20,
                    minWidth: 28,
                    fontSize: 10,
                    fontWeight: 600,
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    border: '1px solid',
                    borderColor: 'primary.200',
                  }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  const renderColumn = (status: TaskStatus) => {
    const columnTasks = getTasksByStatus(status);
    const columnColor = getColumnColor(status);
    
    return (
      <Box key={status} sx={{ flex: 1, minWidth: 300 }}>
        <Paper
          elevation={1}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: columnColor.bg,
            border: `2px solid ${columnColor.border}20`,
            borderRadius: 2,
          }}
        >
          {/* Column Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: `2px solid ${columnColor.border}30`,
              bgcolor: `${columnColor.border}10`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography 
                variant="h6" 
                fontWeight={600}
                sx={{ color: columnColor.text }}
              >
                {status}
              </Typography>
              <Badge 
                badgeContent={columnTasks.length} 
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: columnColor.border,
                    color: 'white',
                  }
                }}
              >
                <Box />
              </Badge>
            </Box>
            
            {status === 'Done' && columnTasks.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={100} 
                  sx={{ 
                    height: 4, 
                    borderRadius: 2,
                    bgcolor: `${columnColor.border}30`,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: columnColor.border,
                    }
                  }} 
                />
                <Typography variant="caption" color={columnColor.text} sx={{ mt: 0.5, display: 'block' }}>
                  {columnTasks.length} completed
                </Typography>
              </Box>
            )}
          </Box>

          {/* Droppable Area */}
          <Droppable droppableId={status}>
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  flex: 1,
                  p: 2,
                  minHeight: 200,
                  bgcolor: snapshot.isDraggingOver ? `${columnColor.border}20` : 'transparent',
                  transition: 'background-color 0.2s ease',
                  borderRadius: '0 0 8px 8px',
                }}
              >
                {columnTasks.map((task, index) => renderTaskCard(task, index))}
                {provided.placeholder}
                
                {/* Add Task Button */}
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setNewTaskData({ ...newTaskData, status });
                    setOpenDialog(true);
                  }}
                  sx={{
                    mt: 2,
                    borderStyle: 'dashed',
                    borderColor: `${columnColor.border}50`,
                    color: columnColor.text,
                    '&:hover': {
                      borderColor: columnColor.border,
                      bgcolor: `${columnColor.border}10`,
                    },
                  }}
                >
                  Add Task
                </Button>
              </Box>
            )}
          </Droppable>
        </Paper>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading board...</Typography>
      </Box>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fafbfc' }}>
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BoardIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5" fontWeight={600}>
              Task Board
            </Typography>
            {projectName && (
              <Typography variant="body2" color="text.secondary">
                • {projectName}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              borderRadius: 3,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            Create Task
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <Box sx={{ p: 3, bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search tasks by title, assignee, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ maxWidth: 400 }}
          />
        </Box>

        {/* Board Columns */}
        <Box sx={{ flex: 1, display: 'flex', gap: 3, p: 3, overflow: 'auto' }}>
          {statusColumns.map(status => renderColumn(status))}
        </Box>

        {/* Create/Edit Task Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          fullWidth 
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            {editTask ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Title"
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
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newTaskData.type}
                    label="Type"
                    onChange={(e) => setNewTaskData({ ...newTaskData, type: e.target.value as TaskType })}
                  >
                    {typeOptions.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
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
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newTaskData.status}
                    label="Status"
                    onChange={(e) => setNewTaskData({ ...newTaskData, status: e.target.value as TaskStatus })}
                  >
                    {statusColumns.map(status => (
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
                  label="Reporter"
                  fullWidth
                  value={newTaskData.reporter}
                  onChange={(e) => setNewTaskData({ ...newTaskData, reporter: e.target.value })}
                />
              </Box>
              
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newTaskData.dueDate}
                onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
              />
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>
              {editTask ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DragDropContext>
  );
};

export default Board;