import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
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
  Assignment as TaskIcon,
  BugReport as BugIcon,
  AutoStories as StoryIcon,
  Category as EpicIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  ViewWeek as BoardIcon,
} from '@mui/icons-material';
import { TaskService } from '@/services/TaskService';
import { TaskFormDialog } from '@/components/features';
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
    console.log('Drag end result:', result);
    
    if (!result.destination) {
      console.log('No destination - drag cancelled');
      return;
    }

    const { draggableId, destination, source } = result;
    // Extract actual task ID from draggableId (remove 'task-' prefix)
    const taskId = Number(draggableId.replace('task-', ''));
    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    // Check if status actually changed
    if (oldStatus === newStatus) {
      console.log('Same status - no update needed');
      return;
    }

    console.log(`Moving task ${taskId} from "${oldStatus}" to "${newStatus}"`);

    // Find the task to verify it exists
    const task = tasks.find(t => Number(t.id) === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      setError(`Task ${taskId} not found`);
      return;
    }

    console.log('Found task:', { id: task.id, title: task.title, currentStatus: task.status, type: task.type });

    // Optimistic update - immediately update the UI
    const originalTasks = [...tasks];
    setTasks(prevTasks => 
      prevTasks.map(t => 
        Number(t.id) === taskId 
          ? { ...t, status: newStatus as TaskStatus }
          : t
      )
    );

    try {
      console.log(`Calling TaskService.updateTaskStatus(${projectId}, ${taskId}, "${newStatus}", "${templateType}")`);
      
      const updatedTask = await TaskService.updateTaskStatus(Number(projectId), taskId, newStatus as TaskStatus, templateType);
      
      if (!updatedTask) {
        throw new Error('No response from server');
      }
      
      console.log('Task status updated successfully:', updatedTask);
      
      // Clear any existing errors
      setError(null);
      
    } catch (error) {
      console.error('Failed to update task status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to update task status: ${errorMessage}`);
      
      // Revert optimistic update on error
      setTasks(originalTasks);
    }
  };

  const handleSave = async (taskData: Partial<Task>) => {
    try {
      if (editTask) {
        await TaskService.updateTask(Number(projectId), Number(editTask.id), taskData, templateType);
      } else {
        await TaskService.createTask(Number(projectId), taskData as Omit<Task, 'id'>, templateType);
      }

      setOpenDialog(false);
      setEditTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
      setError('Failed to save task.');
    }
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
    <Draggable key={`task-${task.id}`} draggableId={`task-${task.id}`} index={index}>
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

        {/* Task Form Dialog */}
        <TaskFormDialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setEditTask(null);
          }}
          onSave={handleSave}
          editTask={editTask}
          projectId={Number(projectId)}
          templateType={templateType || 'kanban'}
          defaultStatus="Todo"
          title="Board Task"
          subtitle={`Add or edit tasks for your ${projectName || 'project'} board`}
        />
      </Box>
    </DragDropContext>
  );
};

export default Board;