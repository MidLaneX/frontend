import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Tooltip,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Comment as CommentIcon,
  PlayArrow as SprintIcon,
  Assignment as TasksIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/types';
import type { SprintDTO } from '@/types/featurevise/sprint';
import { TaskService } from '@/services/TaskService';
import { SprintService } from '@/services/SprintService';

interface BacklogProps {
  projectId: number;
  projectName?: string;
  templateType: string;
}

const statusOptions: TaskStatus[] = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];
const priorityOptions: TaskPriority[] = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
const typeOptions: TaskType[] = ['Story', 'Bug', 'Task', 'Epic'];

const Backlog: React.FC<BacklogProps> = ({ projectId, projectName, templateType }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestSprint, setLatestSprint] = useState<SprintDTO | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
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
      const response = await SprintService.getLatestSprint(projectId, templateType);
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
    setNewTaskData({
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
    fetchTasks();
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    await TaskService.updateTaskStatus(projectId, taskId, newStatus, templateType);
    fetchTasks();
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination, source } = result;
    const taskId = Number(draggableId);

    // If dropped on sprint area
    if (destination.droppableId === 'sprint' && source.droppableId === 'backlog' && latestSprint) {
      try {
        // Update task with sprint ID
        await TaskService.updateTask(projectId, taskId, { sprintId: latestSprint.id }, templateType);
        fetchTasks();
      } catch (error) {
        console.error('Failed to assign task to sprint:', error);
      }
    }

    // If dropped back to backlog from sprint
    if (destination.droppableId === 'backlog' && source.droppableId === 'sprint') {
      try {
        // Remove sprint assignment
        await TaskService.updateTask(projectId, taskId, { sprintId: 0 }, templateType);
        fetchTasks();
      } catch (error) {
        console.error('Failed to remove task from sprint:', error);
      }
    }
  };

  // Separate tasks by sprint assignment
  const backlogTasks = tasks.filter(task => !task.sprintId || task.sprintId === 0);
  const sprintTasks = tasks.filter(task => task.sprintId && task.sprintId !== 0 && task.sprintId === latestSprint?.id);

  const filteredBacklogTasks = backlogTasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.reporter?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSprintTasks = sprintTasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.reporter?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate sprint progress
  const sprintProgress = React.useMemo(() => {
    if (!sprintTasks.length) return 0;
    const completedTasks = sprintTasks.filter(task => task.status === 'Done').length;
    return Math.round((completedTasks / sprintTasks.length) * 100);
  }, [sprintTasks]);

  const renderTaskCard = (task: Task) => (
    <Paper sx={{ p: 2, height: '100%', cursor: 'grab' }}>
      <Typography variant="h6">{task.title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {task.description || 'No description'}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
        <Chip label={task.type} color="default" size="small" />
        <Chip label={task.priority} size="small" />
        <Chip label={task.status} color="primary" size="small" />
        <Chip label={`SP: ${task.storyPoints ?? 0}`} size="small" />
      </Stack>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Assignee: <strong>{task.assignee}</strong>
      </Typography>
      <Typography variant="body2">
        Reporter: <strong>{task.reporter}</strong>
      </Typography>
      <Typography variant="body2">Due: {task.dueDate?.slice(0, 10)}</Typography>

      {task.labels?.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {task.labels.map((label) => (
            <Chip key={label} label={label} size="small" sx={{ mr: 0.5 }} />
          ))}
        </Box>
      )}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          select
          size="small"
          value={task.status}
          onChange={(e) => handleStatusChange(Number(task.id), e.target.value as TaskStatus)}
        >
          {statusOptions.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>

        <Box>
          <Tooltip title="Edit">
            <IconButton
              onClick={() => {
                setEditTask(task);
                setNewTaskData(task);
                setOpenDialog(true);
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(Number(task.id))}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={`${task.comments.length} comments`}>
            <IconButton>
              <CommentIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Backlog - {projectName}</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            New Task
          </Button>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search by title, assignee, or reporter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Sprint Section */}
        {latestSprint && (
          <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SprintIcon fontSize="large" />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {latestSprint.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {new Date(latestSprint.startDate).toLocaleDateString()} - {new Date(latestSprint.endDate).toLocaleDateString()}
                  </Typography>
                  {latestSprint.goal && (
                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                      Goal: {latestSprint.goal}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Badge badgeContent={sprintTasks.length} color="secondary" sx={{ mb: 1 }}>
                  <TasksIcon sx={{ color: 'white' }} />
                </Badge>
                <Typography variant="h6" fontWeight="bold">
                  {sprintProgress}% Complete
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={sprintProgress}
                  sx={{
                    mt: 1,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'white',
                    },
                  }}
                />
              </Box>
            </Box>

            <Droppable droppableId="sprint">
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    minHeight: '120px',
                    border: '2px dashed',
                    borderColor: snapshot.isDraggingOver ? 'white' : 'rgba(255,255,255,0.5)',
                    borderRadius: 2,
                    p: 2,
                    backgroundColor: snapshot.isDraggingOver ? 'rgba(255,255,255,0.1)' : 'transparent',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {filteredSprintTasks.length === 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100px',
                        color: 'rgba(255,255,255,0.7)',
                        flexDirection: 'column',
                        gap: 1,
                      }}
                    >
                      <TimelineIcon fontSize="large" />
                      <Typography variant="body2">
                        {snapshot.isDraggingOver ? 'Drop tasks here to add to sprint' : 'Drag tasks from backlog to add to this sprint'}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {filteredSprintTasks.map((task, index) => (
                        <Box key={task.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33% - 8px)' } }}>
                          <Draggable draggableId={String(task.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  transform: snapshot.isDragging
                                    ? `${provided.draggableProps.style?.transform} rotate(5deg)`
                                    : provided.draggableProps.style?.transform,
                                }}
                              >
                                {renderTaskCard(task)}
                              </div>
                            )}
                          </Draggable>
                        </Box>
                      ))}
                    </Box>
                  )}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Paper>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {/* Backlog Section */}
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <TasksIcon color="primary" />
                <Typography variant="h6">Product Backlog</Typography>
                <Chip 
                  label={`${filteredBacklogTasks.length} tasks`} 
                  variant="outlined" 
                  size="small" 
                  color="primary"
                />
              </Box>

              <Droppable droppableId="backlog">
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      minHeight: '200px',
                      border: snapshot.isDraggingOver ? '2px dashed #1976d2' : '2px dashed transparent',
                      borderRadius: 2,
                      p: 2,
                      backgroundColor: snapshot.isDraggingOver ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {filteredBacklogTasks.length === 0 ? (
                      <Alert severity="info">No tasks found in backlog</Alert>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {filteredBacklogTasks.map((task, index) => (
                          <Box key={task.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33% - 8px)' } }}>
                            <Draggable draggableId={String(task.id)} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    transform: snapshot.isDragging
                                      ? `${provided.draggableProps.style?.transform} rotate(-3deg)`
                                      : provided.draggableProps.style?.transform,
                                  }}
                                >
                                  {renderTaskCard(task)}
                                </div>
                              )}
                            </Draggable>
                          </Box>
                        ))}
                      </Box>
                    )}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Paper>
          </>
        )}

      {/* Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            margin="dense"
            value={newTaskData.title}
            onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
          />
          <TextField
            fullWidth
            label="Description"
            margin="dense"
            multiline
            value={newTaskData.description}
            onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
          />
          <TextField
            fullWidth
            label="Assignee"
            margin="dense"
            value={newTaskData.assignee}
            onChange={(e) => setNewTaskData({ ...newTaskData, assignee: e.target.value })}
          />
          <TextField
            fullWidth
            label="Reporter"
            margin="dense"
            value={newTaskData.reporter}
            onChange={(e) => setNewTaskData({ ...newTaskData, reporter: e.target.value })}
          />
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            margin="dense"
            value={newTaskData.dueDate?.slice(0, 10) || ''}
            onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            fullWidth
            label="Priority"
            margin="dense"
            value={newTaskData.priority}
            onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value as TaskPriority })}
          >
            {priorityOptions.map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Status"
            margin="dense"
            value={newTaskData.status}
            onChange={(e) => setNewTaskData({ ...newTaskData, status: e.target.value as TaskStatus })}
          >
            {statusOptions.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Type"
            margin="dense"
            value={newTaskData.type}
            onChange={(e) => setNewTaskData({ ...newTaskData, type: e.target.value as TaskType })}
          >
            {typeOptions.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Story Points"
            type="number"
            margin="dense"
            value={newTaskData.storyPoints ?? ''}
            onChange={(e) => setNewTaskData({ ...newTaskData, storyPoints: Number(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
    </DragDropContext>
  );
};

export default Backlog;
