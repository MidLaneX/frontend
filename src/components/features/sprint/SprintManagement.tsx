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
  Card,
  CardContent,
  CardActions,
  Tab,
  Tabs,
  Badge,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Comment as CommentIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  CalendarMonth as CalendarIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/types';
import { TaskService } from '@/services/TaskService';
import { SprintService } from '@/services/SprintService';
import type { SprintDTO } from '@/types/featurevise/sprint';

interface SprintProps {
  projectId: number;
  projectName?: string;
  templateType: string;
}

const statusOptions: TaskStatus[] = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];
const priorityOptions: TaskPriority[] = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
const typeOptions: TaskType[] = ['Story', 'Bug', 'Task', 'Epic'];

const SprintManagement: React.FC<SprintProps> = ({ projectId, projectName, templateType }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Task management state
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
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
    sprintId: undefined,
  });

  // Sprint management state
  const [sprints, setSprints] = useState<SprintDTO[]>([]);
  const [activeSprint, setActiveSprint] = useState<SprintDTO | null>(null);
  const [openSprintDialog, setOpenSprintDialog] = useState(false);
  const [editSprint, setEditSprint] = useState<SprintDTO | null>(null);
  const [sprintLoading, setSprintLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const [newSprintData, setNewSprintData] = useState<Partial<SprintDTO>>({
    name: '',
    startDate: '',
    endDate: '',
    goal: '',
    status: 'planned',
  });

  const [latestSprint, setLatestSprint] = useState<SprintDTO | null>(null);

  // Fetch functions
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

  const fetchSprints = async () => {
    setSprintLoading(true);
    try {
      const response = await SprintService.getAllSprints(projectId, templateType);
      if (response?.data) {
        setSprints(response.data);
        const active = response.data.find((sprint: SprintDTO) => sprint.status === 'active');
        setActiveSprint(active || null);
      }
    } catch (error) {
      console.error('Failed to load sprints:', error);
    } finally {
      setSprintLoading(false);
    }
  };

  const fetchLatestSprint = async () => {
    try {
      const res = await SprintService.getLatestSprint(projectId, templateType);
      if (res?.data) {
        setLatestSprint(res.data);
        setNewTaskData((prev) => ({ ...prev, sprintId: res.data.id }));
      }
    } catch {
      console.error('Failed to load latest sprint.');
    }
  };

  // Sprint CRUD operations
  const handleCreateSprint = async () => {
    if (!newSprintData.name || !newSprintData.startDate || !newSprintData.endDate) return;

    try {
      await SprintService.createSprint(projectId, newSprintData as SprintDTO, templateType);
      setOpenSprintDialog(false);
      setEditSprint(null);
      resetSprintForm();
      fetchSprints();
    } catch (error) {
      console.error('Failed to create sprint:', error);
    }
  };

  const handleUpdateSprint = async () => {
    if (!editSprint?.id || !newSprintData.name) return;

    try {
      await SprintService.updateSprint(projectId, editSprint.id, newSprintData, templateType);
      setOpenSprintDialog(false);
      setEditSprint(null);
      resetSprintForm();
      fetchSprints();
    } catch (error) {
      console.error('Failed to update sprint:', error);
    }
  };

  const handleDeleteSprint = async (sprintId: number) => {
    try {
      await SprintService.deleteSprint(projectId, sprintId, templateType);
      fetchSprints();
    } catch (error) {
      console.error('Failed to delete sprint:', error);
    }
  };

  const handleSprintSave = async () => {
    if (editSprint) {
      await handleUpdateSprint();
    } else {
      await handleCreateSprint();
    }
  };

  // Task CRUD operations
  const handleTaskSave = async () => {
    if (!newTaskData.title) return;

    if (editTask) {
      await TaskService.updateTask(projectId, Number(editTask.id), newTaskData, templateType);
    } else {
      await TaskService.createTask(projectId, newTaskData as Omit<Task, 'id'>, templateType);
    }

    setOpenTaskDialog(false);
    setEditTask(null);
    resetTaskForm();
    fetchTasks();
  };

  const handleDelete = async (taskId: number) => {
    await TaskService.deleteTask(projectId, taskId, templateType);
    fetchTasks();
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    await TaskService.updateTaskStatus(projectId, taskId, newStatus, templateType);
    fetchTasks();
  };

  // Helper functions
  const resetSprintForm = () => {
    setNewSprintData({
      name: '',
      startDate: '',
      endDate: '',
      goal: '',
      status: 'planned',
    });
  };

  const resetTaskForm = () => {
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
      sprintId: latestSprint?.id ?? undefined,
    });
  };

  useEffect(() => {
    fetchTasks();
    fetchSprints();
    fetchLatestSprint();
  }, [projectId, templateType]);

  const filteredTasks = tasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.reporter?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Sprint Management - {projectName}</Typography>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />} 
            onClick={() => setOpenSprintDialog(true)}
          >
            New Sprint
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => setOpenTaskDialog(true)}
          >
            New Task
          </Button>
        </Stack>
      </Box>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab label="Sprint Board" icon={<TaskIcon />} />
          <Tab 
            label={
              <Badge badgeContent={sprints.length} color="primary">
                All Sprints
              </Badge>
            } 
            icon={<CalendarIcon />} 
          />
        </Tabs>
      </Box>

      {/* Active Sprint Info */}
      {activeSprint && currentTab === 0 && (
        <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">{activeSprint.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeSprint.startDate} - {activeSprint.endDate}
                </Typography>
                {activeSprint.goal && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Goal: {activeSprint.goal}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip 
                  label={activeSprint.status} 
                  color={activeSprint.status === 'active' ? 'success' : 'default'} 
                />
                <IconButton 
                  onClick={() => {
                    setEditSprint(activeSprint);
                    setNewSprintData(activeSprint);
                    setOpenSprintDialog(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Content based on current tab */}
      {currentTab === 0 ? (
        // Sprint Board Tab
        <>
          <TextField
            fullWidth
            size="small"
            placeholder="Search tasks by title, assignee, or reporter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />

          {loading ? (
            <CircularProgress sx={{ mt: 4 }} />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : filteredTasks.length === 0 ? (
            <Alert severity="info">No tasks found</Alert>
          ) : (
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 2
              }}
            >
              {filteredTasks.map((task) => (
                <Paper key={task.id} sx={{ p: 2, height: 'fit-content' }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>{task.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {task.description || 'No description'}
                  </Typography>
                  
                  {task.sprintId && (
                    <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                      Sprint: {task.sprintId}
                    </Typography>
                  )}
                  
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Chip label={task.type} color="default" size="small" />
                    <Chip label={task.priority} size="small" />
                    <Chip label={task.status} color="primary" size="small" />
                    <Chip label={`SP: ${task.storyPoints ?? 0}`} size="small" />
                  </Stack>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Assignee: <strong>{task.assignee}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Reporter: <strong>{task.reporter}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Due: {task.dueDate?.slice(0, 10)}
                    </Typography>
                  </Box>

                  {task.labels?.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {task.labels.map((label) => (
                        <Chip key={label} label={label} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TextField
                      select
                      size="small"
                      value={task.status}
                      onChange={(e) => handleStatusChange(Number(task.id), e.target.value as TaskStatus)}
                      sx={{ minWidth: 120 }}
                    >
                      {statusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Stack direction="row">
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => {
                            setEditTask(task);
                            setNewTaskData(task);
                            setOpenTaskDialog(true);
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
                    </Stack>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </>
      ) : (
        // All Sprints Tab
        <Box>
          {sprintLoading ? (
            <CircularProgress />
          ) : (
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: 2
              }}
            >
              {sprints.map((sprint) => (
                <Card key={sprint.id} sx={{ height: 'fit-content' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="start" sx={{ mb: 2 }}>
                      <Typography variant="h6">{sprint.name}</Typography>
                      <Chip 
                        label={sprint.status} 
                        color={
                          sprint.status === 'active' ? 'success' : 
                          sprint.status === 'completed' ? 'primary' : 'default'
                        }
                        size="small"
                      />
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {sprint.startDate} - {sprint.endDate}
                    </Typography>
                    
                    {sprint.goal && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Goal:</strong> {sprint.goal}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <TaskIcon fontSize="small" />
                      <Typography variant="body2">
                        {tasks.filter(task => task.sprintId === sprint.id).length} tasks
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1}>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setEditSprint(sprint);
                          setNewSprintData(sprint);
                          setOpenSprintDialog(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => sprint.id && handleDeleteSprint(sprint.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                    
                    <Stack direction="row" spacing={1}>
                      {sprint.status === 'planned' && (
                        <Button 
                          size="small" 
                          startIcon={<StartIcon />}
                          onClick={() => {
                            if (sprint.id) {
                              SprintService.updateSprint(projectId, sprint.id, { status: 'active' }, templateType)
                                .then(() => fetchSprints());
                            }
                          }}
                        >
                          Start
                        </Button>
                      )}
                      {sprint.status === 'active' && (
                        <Button 
                          size="small" 
                          startIcon={<StopIcon />}
                          onClick={() => {
                            if (sprint.id) {
                              SprintService.updateSprint(projectId, sprint.id, { status: 'completed' }, templateType)
                                .then(() => fetchSprints());
                            }
                          }}
                        >
                          Complete
                        </Button>
                      )}
                    </Stack>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Task Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} fullWidth maxWidth="sm">
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
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleTaskSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Sprint Dialog */}
      <Dialog open={openSprintDialog} onClose={() => setOpenSprintDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editSprint ? 'Edit Sprint' : 'Create Sprint'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Sprint Name"
            margin="dense"
            value={newSprintData.name}
            onChange={(e) => setNewSprintData({ ...newSprintData, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            margin="dense"
            value={newSprintData.startDate || ''}
            onChange={(e) => setNewSprintData({ ...newSprintData, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="End Date"
            type="date"
            margin="dense"
            value={newSprintData.endDate || ''}
            onChange={(e) => setNewSprintData({ ...newSprintData, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Sprint Goal"
            margin="dense"
            multiline
            rows={3}
            value={newSprintData.goal || ''}
            onChange={(e) => setNewSprintData({ ...newSprintData, goal: e.target.value })}
          />
          <TextField
            select
            fullWidth
            label="Status"
            margin="dense"
            value={newSprintData.status || 'planned'}
            onChange={(e) => setNewSprintData({ ...newSprintData, status: e.target.value })}
          >
            <MenuItem value="planned">Planned</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSprintDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSprintSave}>
            {editSprint ? 'Update Sprint' : 'Create Sprint'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SprintManagement;
