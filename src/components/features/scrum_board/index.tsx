import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/types';
import { TaskService } from '@/services/TaskService';

interface ScrumBoardProps {
  projectId: number;
  projectName?: string;
  templateType: string;
}

const statusColumns: TaskStatus[] = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];
const priorityOptions: TaskPriority[] = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
const typeOptions: TaskType[] = ['Story', 'Bug', 'Task', 'Epic'];

const ScrumBoard: React.FC<ScrumBoardProps> = ({ projectId, projectName, templateType }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchTasks();
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
    resetForm();
    fetchTasks();
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination, source } = result;
    const taskId = Number(draggableId);
    const newStatus = destination.droppableId as TaskStatus;

    if (source.droppableId !== newStatus) {
      await TaskService.updateTaskStatus(projectId, taskId, newStatus, templateType);
      fetchTasks();
    }
  };

  const resetForm = () => {
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
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Scrum Board - {projectName}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          New Task
        </Button>
      </Box>

      {loading ? (
        <CircularProgress sx={{ mt: 4 }} />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
            {statusColumns.map((status) => (
              <Droppable droppableId={status} key={status}>
                {(provided) => (
                  <Paper
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ p: 2, minWidth: 250, flex: '0 0 auto' }}
                  >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {status}
                    </Typography>
                    {tasks
                      .filter((task) => task.status === status)
                      .map((task, index) => (
                        <Draggable key={String(task.id)} draggableId={String(task.id)} index={index}>
                          {(dragProvided) => (
                            <Paper
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              sx={{ p: 2, mb: 2 }}
                            >
                              <Typography variant="subtitle1">{task.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {task.description || 'No description'}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                                <Chip label={task.type} size="small" />
                                <Chip label={task.priority} size="small" />
                                <Chip label={`SP: ${task.storyPoints ?? 0}`} size="small" />
                              </Stack>
                              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setEditTask(task);
                                      setNewTaskData(task);
                                      setOpenDialog(true);
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" onClick={() => handleDelete(Number(task.id))}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </Paper>
                )}
              </Droppable>
            ))}
          </Box>
        </DragDropContext>
      )}

      {/* Create/Edit Task Dialog */}
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
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
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
            {statusColumns.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
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
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
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
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScrumBoard;
