import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountTreeRounded as EpicIcon,
  Flag as FlagIcon,
  Comment as CommentIcon,
  BugReport as BugIcon,
  Task as TaskIcon,
  Star as StoryIcon,
  Timeline as SprintIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/types';
import type { SprintDTO } from '@/types/featurevise/sprint';
import { TaskService } from '@/services/TaskService';
import { SprintService } from '@/services/SprintService';
import { TaskFormDialog } from '@/components/features';

interface ScrumBoardProps {
  projectId: number;
  projectName?: string;
  templateType: string;
}

const statusColumns: TaskStatus[] = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];

const ScrumBoard: React.FC<ScrumBoardProps> = ({ projectId, projectName, templateType }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [latestSprint, setLatestSprint] = useState<SprintDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await TaskService.getTasksByProjectId(projectId, templateType);
      setTasks(data);
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestSprint = async () => {
    try {
      const response = await SprintService.getLatestSprint(projectId);
      setLatestSprint(response.data);
    } catch (error) {
      console.error('Failed to fetch latest sprint:', error);
      setLatestSprint(null);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchLatestSprint();
  }, [projectId, templateType]);



  // Show only tasks from the latest sprint
  const sprintTasks = useMemo(() => {
    if (!latestSprint) return tasks; // If no sprint, show all tasks
    return tasks.filter(task => task.sprintId === latestSprint.id);
  }, [tasks, latestSprint]);

  // Separate epics from other tasks
  const { epics, nonEpicTasks } = useMemo(() => {
    const epicTasks = sprintTasks.filter(task => task.type === 'Epic');
    const otherTasks = sprintTasks.filter(task => task.type !== 'Epic');
    
    return {
      epics: epicTasks,
      nonEpicTasks: otherTasks
    };
  }, [sprintTasks]);

  const handleDelete = async (taskId: number) => {
    await TaskService.deleteTask(projectId, taskId, templateType);
    fetchTasks();
  };

  const handleSave = async (taskData: Partial<Task>) => {
    try {
      if (editTask) {
        await TaskService.updateTask(projectId, Number(editTask.id), taskData, templateType);
      } else {
        // For new tasks in scrum board, automatically assign to latest sprint
        const sprintId = latestSprint?.id || 0;
        const taskWithSprint = {
          ...taskData,
          sprintId: sprintId,
        } as Omit<Task, 'id'>;
        
        console.log('Creating task with sprint assignment:', {
          taskTitle: taskWithSprint.title,
          sprintId: taskWithSprint.sprintId,
          sprintName: latestSprint?.name || 'No sprint',
          templateType
        });
        
        const createdTask = await TaskService.createTask(projectId, taskWithSprint, templateType);
        
        if (!createdTask) {
          setError('Failed to create task. Please try again.');
          return;
        }
        
        // Clear any existing errors on successful creation
        setError(null);
      }

      setOpenDialog(false);
      setEditTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Failed to save task. Please try again.');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    console.log(' Drag end result:', result);
    
    if (!result.destination) {
      console.log(' No destination - drag cancelled');
      return;
    }

    const { draggableId, destination, source } = result;
    // Extract actual task ID from draggableId (remove 'task-' prefix)
    const taskId = Number(draggableId.replace('task-', ''));
    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    // Check if status actually changed
    if (oldStatus === newStatus) {
      console.log('ℹ Same status - no update needed');
      return;
    }

    console.log(`Moving task ${taskId} from "${oldStatus}" to "${newStatus}"`);

    // Find the task to verify it exists
    const task = tasks.find(t => Number(t.id) === taskId);
    if (!task) {
      console.error('❌ Task not found:', taskId);
      setError(`Task ${taskId} not found`);
      return;
    }

    console.log('Found task:', { id: task.id, title: task.title, currentStatus: task.status, type: task.type });

    // Prevent moving epics to status columns and prevent moving non-epics to epic section
    if (task.type === 'Epic' && newStatus !== 'Epic') {
      console.log('❌ Cannot move Epic to status column');
      setError('Epics cannot be moved to status columns');
      return;
    }

    if (task.type !== 'Epic' && newStatus === 'Epic') {
      console.log('❌ Cannot move non-Epic to Epic section');
      setError('Only Epics can be placed in the Epic section');
      return;
    }

    // If moving within Epic section or from Epic section, don't change status
    if (oldStatus === 'Epic' && newStatus === 'Epic') {
      console.log(' Moving within Epic section - no status change needed');
      return;
    }

    // Regular status moves (between status columns)
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
      
      const updatedTask = await TaskService.updateTaskStatus(projectId, taskId, newStatus as TaskStatus, templateType);
      
      if (!updatedTask) {
        throw new Error('No response from server');
      }
      
      console.log(' Task status updated successfully:', updatedTask);
      
      // Clear any existing errors
      setError(null);
      
    } catch (error) {
      console.error(' Failed to update task status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to update task status: ${errorMessage}`);
      
      // Revert optimistic update on error
      setTasks(originalTasks);
    }
  };



  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'Epic': return <EpicIcon sx={{ color: '#8b5a2b' }} />;
      case 'Story': return <StoryIcon sx={{ color: '#4caf50' }} />;
      case 'Bug': return <BugIcon sx={{ color: '#f44336' }} />;
      case 'Task': return <TaskIcon sx={{ color: '#2196f3' }} />;
      default: return <TaskIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const getStatusColor = (status: TaskStatus | string) => {
    switch (status) {
      case 'Backlog': return { bg: 'rgba(158, 158, 158, 0.1)', border: '#9e9e9e', text: '#424242' };
      case 'Todo': return { bg: 'rgba(102, 102, 102, 0.1)', border: '#666666', text: '#333333' };
      case 'In Progress': return { bg: 'rgba(255, 152, 0, 0.1)', border: '#ff9800', text: '#e65100' };
      case 'Review': return { bg: 'rgba(156, 39, 176, 0.1)', border: '#9c27b0', text: '#7b1fa2' };
      case 'Done': return { bg: 'rgba(76, 175, 80, 0.1)', border: '#4caf50', text: '#2e7d32' };
      case 'Epic': return { bg: 'rgba(103, 58, 183, 0.1)', border: '#673ab7', text: '#512da8' };
      default: return { bg: 'rgba(102, 102, 102, 0.1)', border: '#666666', text: '#333333' };
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

  const renderTaskCard = (task: Task) => (
    <Card
      elevation={2}
      sx={{
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent sx={{ p: 2, pb: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          {getTaskIcon(task.type)}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {task.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
              onClick={(e) => {
                e.stopPropagation();
                setEditTask(task);
                setOpenDialog(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(Number(task.id));
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              fontSize: '0.8rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {task.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1, minWidth: 0 }}>
            <Chip
              label={task.priority}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                backgroundColor: `${getPriorityColor(task.priority)}20`,
                color: getPriorityColor(task.priority),
                border: `1px solid ${getPriorityColor(task.priority)}40`,
              }}
            />
            {task.storyPoints && task.storyPoints > 0 && (
              <Chip
                label={`${task.storyPoints} SP`}
                size="small"
                variant="outlined"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
            {task.assignee && (
              <Tooltip title={`Assigned to: ${task.assignee}`}>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: '0.7rem',
                    backgroundColor: 'primary.main',
                  }}
                >
                  {task.assignee.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            )}
            {task.comments && task.comments.length > 0 && (
              <Tooltip title={`${task.comments.length} comments`}>
                <Badge badgeContent={task.comments.length} color="secondary" max={9}>
                  <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Badge>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
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
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <SprintIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {projectName || 'Project'} - Scrum Board
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${sprintTasks.length} sprint issues`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
              <Chip
                label={`${epics.length} epics`}
                size="small"
                variant="outlined"
                color="secondary"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
              <Chip
                label={`${nonEpicTasks.filter(t => t.status === 'Backlog').length} in backlog`}
                size="small"
                variant="filled"
                color="default"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
              <Chip
                label={`${nonEpicTasks.filter(t => t.status === 'Done').length} completed`}
                size="small"
                variant="filled"
                color="success"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
              {latestSprint && (
                <Chip
                  label={`${latestSprint.name} (${new Date(latestSprint.startDate).toLocaleDateString()} - ${new Date(latestSprint.endDate).toLocaleDateString()})`}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ fontSize: '0.75rem', height: 20 }}
                />
              )}
            </Typography>
          </Box>
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
          Create Issue
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Board Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd} key="scrum-board-dnd">
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  gap: 2,
                  p: 2,
                  overflow: 'auto',
                  minHeight: 0,
                }}
              >
                {/* Epic Column */}
                <Droppable droppableId="Epic" key="Epic">
                  {(provided: any, snapshot: any) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      elevation={0}
                      sx={{
                        minWidth: 280,
                        maxWidth: 320,
                        flex: '1 1 0',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: snapshot.isDraggingOver ? '#2196f3' : 'divider',
                        bgcolor: snapshot.isDraggingOver ? 'rgba(33, 150, 243, 0.04)' : 'white',
                        transition: 'all 0.2s ease',
                        maxHeight: '100%',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Column Header */}
                      <Box
                        sx={{
                          p: 2,
                          borderBottom: 1,
                          borderColor: 'divider',
                          bgcolor: snapshot.isDraggingOver ? 'rgba(33, 150, 243, 0.04)' : 'grey.50',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                              EPICS
                            </Typography>
                          </Box>
                          <Chip
                            label={epics.length}
                            size="small"
                            variant="outlined"
                            sx={{
                              minWidth: 24,
                              height: 20,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              borderColor: '#2196f3',
                              color: '#1976d2',
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Epic Tasks */}
                      <Box
                        sx={{
                          flex: 1,
                          p: 1.5,
                          overflow: 'auto',
                          minHeight: 200,
                        }}
                      >
                        {epics.map((epic, index) => (
                          <Draggable key={`task-${epic.id}`} draggableId={`task-${epic.id}`} index={index}>
                            {(dragProvided: any, dragSnapshot: any) => (
                              <Box
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                sx={{
                                  transform: dragSnapshot.isDragging
                                    ? `${dragProvided.draggableProps.style?.transform} rotate(5deg)`
                                    : dragProvided.draggableProps.style?.transform,
                                  opacity: dragSnapshot.isDragging ? 0.8 : 1,
                                  transition: dragSnapshot.isDragging ? 'none' : 'transform 0.2s ease',
                                  cursor: dragSnapshot.isDragging ? 'grabbing' : 'grab',
                                }}
                              >
                                {renderTaskCard(epic)}
                              </Box>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* Empty State */}
                        {epics.length === 0 && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: 120,
                              color: 'text.secondary',
                              textAlign: 'center',
                              border: '2px dashed',
                              borderColor: 'divider',
                              borderRadius: 2,
                              bgcolor: 'rgba(33, 150, 243, 0.04)',
                            }}
                          >
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                              {snapshot.isDraggingOver
                                ? 'Drop epics here'
                                : 'No epics in this sprint'}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  )}
                </Droppable>

                {/* Status Columns */}
                {statusColumns.map((status) => (
                    <Droppable droppableId={status} key={status}>
                      {(provided: any, snapshot: any) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          elevation={0}
                          sx={{
                            minWidth: 280,
                            maxWidth: 320,
                            flex: '1 1 0',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: snapshot.isDraggingOver ? getStatusColor(status).border : 'divider',
                            bgcolor: snapshot.isDraggingOver ? getStatusColor(status).bg : 'white',
                            transition: 'all 0.2s ease',
                            maxHeight: '100%',
                            overflow: 'hidden',
                          }}
                        >
                          {/* Column Header */}
                          <Box
                            sx={{
                              p: 2,
                              borderBottom: 1,
                              borderColor: 'divider',
                              bgcolor: snapshot.isDraggingOver ? getStatusColor(status).bg : 'grey.50',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                  {status.toUpperCase()}
                                </Typography>
                              </Box>
                              <Chip
                                label={nonEpicTasks.filter((task) => task.status === status).length}
                                size="small"
                                variant="outlined"
                                sx={{
                                  minWidth: 24,
                                  height: 20,
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  borderColor: getStatusColor(status).border,
                                  color: getStatusColor(status).text,
                                }}
                              />
                            </Box>
                            {status === 'Done' && (
                              <LinearProgress
                                variant="determinate"
                                value={
                                  nonEpicTasks.length > 0
                                    ? (nonEpicTasks.filter((task) => task.status === 'Done').length / nonEpicTasks.length) * 100
                                    : 0
                                }
                                sx={{
                                  mt: 1,
                                  height: 4,
                                  borderRadius: 2,
                                  '& .MuiLinearProgress-bar': {
                                    background: 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)',
                                  },
                                }}
                              />
                            )}
                          </Box>

                          {/* Tasks */}
                          <Box
                            sx={{
                              flex: 1,
                              p: 1.5,
                              overflow: 'auto',
                              minHeight: 200,
                            }}
                          >
                            {nonEpicTasks
                              .filter((task) => task.status === status)
                              .map((task, index) => (
                                <Draggable key={`task-${task.id}`} draggableId={`task-${task.id}`} index={index}>
                                  {(dragProvided: any, dragSnapshot: any) => (
                                    <Box
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      {...dragProvided.dragHandleProps}
                                      sx={{
                                        transform: dragSnapshot.isDragging
                                          ? `${dragProvided.draggableProps.style?.transform} rotate(5deg)`
                                          : dragProvided.draggableProps.style?.transform,
                                        opacity: dragSnapshot.isDragging ? 0.8 : 1,
                                        transition: dragSnapshot.isDragging ? 'none' : 'transform 0.2s ease',
                                        cursor: dragSnapshot.isDragging ? 'grabbing' : 'grab',
                                      }}
                                    >
                                      {renderTaskCard(task)}
                                    </Box>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}

                            {/* Empty State */}
                            {nonEpicTasks.filter((task) => task.status === status).length === 0 && (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: 120,
                                  color: 'text.secondary',
                                  textAlign: 'center',
                                  border: '2px dashed',
                                  borderColor: 'divider',
                                  borderRadius: 2,
                                  bgcolor: getStatusColor(status).bg,
                                }}
                              >
                                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                  {snapshot.isDraggingOver
                                    ? `Drop items here`
                                    : `No ${status.toLowerCase()} items`}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      )}
                    </Droppable>
                  ))}
              </Box>
            </DragDropContext>
          )}
        </Box>
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
        projectId={projectId}
        templateType={templateType}
        defaultStatus="Todo"
        showSprintInfo={!editTask && !!latestSprint}
        sprintInfo={latestSprint ? { id: latestSprint.id, name: latestSprint.name } : undefined}
        title="Scrum Board Task"
        subtitle={editTask ? 'Update task details' : `Add a new task to the ${latestSprint?.name || 'current'} sprint`}
      />
    </Box>
  );
};

export default ScrumBoard;