import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/types';
import { TaskService } from '@/services/TaskService';
import { SprintService } from '@/services/SprintService';
import type { SprintDTO } from '@/types/featurevise/sprint';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const [latestSprint, setLatestSprint] = useState<SprintDTO | null>(null);

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
      const res = await SprintService.getLatestSprint(projectId, templateType);
      if (res?.data) {
        setLatestSprint(res.data);
        setNewTaskData((prev) => ({ ...prev, sprintId: res.data.id }));
      }
    } catch {
      console.error('Failed to load latest sprint.');
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
      sprintId: latestSprint?.id ?? undefined,
    });
    fetchTasks();
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    await TaskService.updateTaskStatus(projectId, taskId, newStatus, templateType);
    fetchTasks();
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.reporter?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Backlog - {projectName}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          New Task
        </Button>
      </Box>

      {latestSprint && (
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Current Sprint: <strong>{latestSprint.name}</strong>
        </Typography>
      )}

      <TextField
        fullWidth
        size="small"
        placeholder="Search by title, assignee, or reporter..."
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
        <Grid container spacing={2}>
          {filteredTasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6">{task.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {task.description || 'No description'}
                </Typography>
                {task.sprintId && (
                  <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                    Sprint: {task.sprintId}
                  </Typography>
                )}
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
            </Grid>
          ))}
        </Grid>
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
  );
};

export default Backlog;
