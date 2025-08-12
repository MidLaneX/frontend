import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Card,
  CardContent,
  Avatar,
  Divider,
  LinearProgress,
  Badge,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fade,
  Slide,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assignment as EpicIcon,
  DragIndicator as DragIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  Comment as CommentIcon,
  BugReport as BugIcon,
  Task as TaskIcon,
  Star as StoryIcon,
  Timeline as SprintIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/types';
import type { SprintDTO } from '@/types/featurevise/sprint';
import { TaskService } from '@/services/TaskService';
import { SprintService } from '@/services/SprintService';

interface ScrumBoardProps {
  projectId: number;
  projectName?: string;
  templateType: string;
}

const statusColumns: TaskStatus[] = ['Todo', 'In Progress', 'Review', 'Done'];
const priorityOptions: TaskPriority[] = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
const typeOptions: TaskType[] = ['Story', 'Bug', 'Task', 'Epic'];

const ScrumBoard: React.FC<ScrumBoardProps> = ({ projectId, projectName, templateType }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [latestSprint, setLatestSprint] = useState<SprintDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set());

  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Backlog',
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

  // Filter tasks to only show those assigned to the latest sprint
  const sprintTasks = useMemo(() => {
    return tasks.filter(task => 
      task.sprintId && 
      task.sprintId > 0 && 
      latestSprint && 
      task.sprintId === latestSprint.id &&
      task.status !== 'Backlog' // Exclude backlog items from board
    );
  }, [tasks, latestSprint]);

  // Group tasks by epic (simplified - just group all non-epic tasks together)
  const tasksByEpic = useMemo(() => {
    const epics = sprintTasks.filter(task => task.type === 'Epic');
    const nonEpicTasks = sprintTasks.filter(task => task.type !== 'Epic');
    
    const grouped: { [key: string]: Task[] } = {};
    
    // Add all epics as separate groups
    epics.forEach(epic => {
      grouped[epic.id] = [epic]; // Just show the epic itself for now
    });
    
    // Add all non-epic tasks under "Stories & Tasks"
    if (nonEpicTasks.length > 0) {
      grouped['stories-tasks'] = nonEpicTasks;
    }
    
    return grouped;
  }, [sprintTasks]);

  // Get epic groups for sidebar
  const epicGroups = useMemo(() => {
    const epics = sprintTasks.filter(task => task.type === 'Epic');
    const result = [...epics];
    
    // Add virtual group for stories and tasks
    const nonEpicTasks = sprintTasks.filter(task => task.type !== 'Epic');
    if (nonEpicTasks.length > 0) {
      result.push({
        id: 'stories-tasks',
        title: 'Stories & Tasks',
        type: 'Story',
        status: 'Todo',
        priority: 'Medium',
        sprintId: latestSprint?.id || 0,
        assignee: '',
        reporter: '',
        dueDate: '',
        description: '',
        storyPoints: 0,
        labels: [],
        comments: [],
      } as Task);
    }
    
    return result;
  }, [sprintTasks, latestSprint]);

  const toggleEpicExpansion = (epicId: string) => {
    const newExpanded = new Set(expandedEpics);
    if (newExpanded.has(epicId)) {
      newExpanded.delete(epicId);
    } else {
      newExpanded.add(epicId);
    }
    setExpandedEpics(newExpanded);
  };

  const handleDelete = async (taskId: number) => {
    await TaskService.deleteTask(projectId, taskId, templateType);
    fetchTasks();
  };

  const handleSave = async () => {
    if (!newTaskData.title) return;

    if (editTask) {
      await TaskService.updateTask(projectId, Number(editTask.id), newTaskData, templateType);
    } else {
      await TaskService.createTask(projectId, newTaskData as Omit<Task, 'id'>, templateType);
    }

    setOpenDialog(false);
    setEditTask(null);
    resetForm();
    fetchTasks();
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination, source } = result;
    const taskId = Number(draggableId);
    const newStatus = destination.droppableId as TaskStatus;

    if (source.droppableId !== newStatus) {
      try {
        await TaskService.updateTaskStatus(projectId, taskId, newStatus, templateType);
        await fetchTasks(); // Refresh to show updated state
      } catch (error) {
        console.error('Failed to update task status:', error);
        setError('Failed to update task status');
      }
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
      case 'Epic': return <EpicIcon sx={{ color: '#8b5a2b' }} />;
      case 'Story': return <StoryIcon sx={{ color: '#4caf50' }} />;
      case 'Bug': return <BugIcon sx={{ color: '#f44336' }} />;
      case 'Task': return <TaskIcon sx={{ color: '#2196f3' }} />;
      default: return <TaskIcon sx={{ color: '#2196f3' }} />;
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
    <Fade in timeout={300}>
      <Card
        elevation={2}
        sx={{
          mb: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'grab',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            borderColor: 'primary.main',
          },
          '&:active': {
            cursor: 'grabbing',
            transform: 'rotate(3deg)',
          },
        }}
      >
        <CardContent sx={{ p: 2, pb: '16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
            {getTaskIcon(task.type)}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
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
                  setNewTaskData(task);
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
                icon={<FlagIcon />}
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  backgroundColor: `${getPriorityColor(task.priority)}20`,
                  color: getPriorityColor(task.priority),
                  '& .MuiChip-icon': { fontSize: '0.8rem' },
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
    </Fade>
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
          <SprintIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              {latestSprint?.name || 'Active Sprint'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {projectName} • {sprintTasks.length} issues
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
        {/* Epics Sidebar */}
        <Paper
          elevation={0}
          sx={{
            width: 320,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              Epics & Issues
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {epicGroups.length} groups
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {epicGroups.map((epic) => (
                  <Box key={epic.id}>
                    <ListItem
                      component="button"
                      onClick={() => toggleEpicExpansion(String(epic.id))}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.04)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {getTaskIcon(epic.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight={600}>
                            {epic.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {tasksByEpic[String(epic.id)]?.length || 0} issues
                          </Typography>
                        }
                      />
                      {expandedEpics.has(String(epic.id)) ? (
                        <ExpandLessIcon fontSize="small" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" />
                      )}
                    </ListItem>

                    <Collapse in={expandedEpics.has(String(epic.id))}>
                      <Box sx={{ bgcolor: 'rgba(0,0,0,0.02)', px: 2, py: 1 }}>
                        {tasksByEpic[String(epic.id)]?.map((task) => (
                          <Box
                            key={task.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              py: 0.5,
                              pl: 2,
                            }}
                          >
                            {getTaskIcon(task.type)}
                            <Typography
                              variant="body2"
                              sx={{
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {task.title}
                            </Typography>
                            <Chip
                              label={task.status}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 18 }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Collapse>
                  </Box>
                ))}
              </List>
            )}
          </Box>
        </Paper>

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
            <DragDropContext onDragEnd={handleDragEnd}>
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
                {statusColumns.map((status) => (
                  <Droppable droppableId={status} key={status}>
                    {(provided, snapshot) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        elevation={0}
                        sx={{
                          minWidth: 280,
                          maxWidth: 320,
                          flex: '0 0 auto',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: snapshot.isDraggingOver ? 'rgba(25, 118, 210, 0.04)' : 'white',
                          transition: 'background-color 0.2s ease',
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
                            bgcolor: snapshot.isDraggingOver ? 'rgba(25, 118, 210, 0.08)' : 'grey.50',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                              {status.toUpperCase()}
                            </Typography>
                            <Chip
                              label={sprintTasks.filter((task) => task.status === status).length}
                              size="small"
                              variant="outlined"
                              sx={{
                                minWidth: 24,
                                height: 20,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          {status === 'Done' && (
                            <LinearProgress
                              variant="determinate"
                              value={
                                sprintTasks.length > 0
                                  ? (sprintTasks.filter((task) => task.status === 'Done').length / sprintTasks.length) * 100
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
                          {sprintTasks
                            .filter((task) => task.status === status)
                            .map((task, index) => (
                              <Draggable key={String(task.id)} draggableId={String(task.id)} index={index}>
                                {(dragProvided, dragSnapshot) => (
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
                                    }}
                                  >
                                    {renderTaskCard(task)}
                                  </Box>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}

                          {/* Empty State */}
                          {sprintTasks.filter((task) => task.status === status).length === 0 && (
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
                                bgcolor: 'grey.25',
                              }}
                            >
                              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                {snapshot.isDraggingOver
                                  ? 'Drop issues here'
                                  : `No ${status.toLowerCase()} issues`}
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
          <Typography variant="h6" fontWeight={600}>
            {editTask ? 'Edit Issue' : 'Create Issue'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {editTask ? 'Update issue details' : 'Add a new issue to the sprint'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <TextField
            fullWidth
            label="Issue Summary"
            margin="normal"
            value={newTaskData.title}
            onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={3}
            value={newTaskData.description}
            onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              select
              label="Issue Type"
              value={newTaskData.type}
              onChange={(e) => setNewTaskData({ ...newTaskData, type: e.target.value as TaskType })}
              sx={{ flex: 1 }}
            >
              {typeOptions.map((t) => (
                <MenuItem key={t} value={t}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getTaskIcon(t)}
                    {t}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Priority"
              value={newTaskData.priority}
              onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value as TaskPriority })}
              sx={{ flex: 1 }}
            >
              {priorityOptions.map((p) => (
                <MenuItem key={p} value={p}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlagIcon sx={{ color: getPriorityColor(p), fontSize: 16 }} />
                    {p}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Assignee"
              value={newTaskData.assignee}
              onChange={(e) => setNewTaskData({ ...newTaskData, assignee: e.target.value })}
            />
            <TextField
              fullWidth
              label="Reporter"
              value={newTaskData.reporter}
              onChange={(e) => setNewTaskData({ ...newTaskData, reporter: e.target.value })}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              select
              label="Status"
              value={newTaskData.status}
              onChange={(e) => setNewTaskData({ ...newTaskData, status: e.target.value as TaskStatus })}
              sx={{ flex: 1 }}
            >
              {statusColumns.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Story Points"
              type="number"
              value={newTaskData.storyPoints ?? ''}
              onChange={(e) => setNewTaskData({ ...newTaskData, storyPoints: Number(e.target.value) })}
              inputProps={{ min: 0, max: 100 }}
              sx={{ flex: 1 }}
            />
          </Box>
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={newTaskData.dueDate?.slice(0, 10) || ''}
            onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3
            }}
          >
            {editTask ? 'Update Issue' : 'Create Issue'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScrumBoard;
