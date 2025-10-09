import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  AccountTreeRounded as EpicIcon,
  BugReport as BugIcon,
  Task as TaskIcon,
  Star as StoryIcon,
  Timeline as SprintIcon,
} from '@mui/icons-material';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/types';
import { TaskService } from '@/services/TaskService';

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  editTask?: Task | null;
  projectId: number;
  templateType: string;
  defaultStatus?: TaskStatus;
  showSprintInfo?: boolean;
  sprintInfo?: {
    id: number;
    name: string;
  };
  title?: string;
  subtitle?: string;
}

const statusOptions: TaskStatus[] = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];
const priorityOptions: TaskPriority[] = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
const typeOptions: TaskType[] = ['Story', 'Bug', 'Task', 'Epic'];

const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
  open,
  onClose,
  onSave,
  editTask,
  projectId,
  templateType,
  defaultStatus = 'Backlog',
  showSprintInfo = false,
  sprintInfo,
  title,
  subtitle,
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'Medium',
    status: defaultStatus,
    type: 'Task',
    assignee: '',
    reporter: '',
    dueDate: '',
    epic: '',
    storyPoints: 3,
    labels: [],
    comments: [],
    sprintId: sprintInfo?.id || 0,
  });

  const [availableEpics, setAvailableEpics] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available epics
  useEffect(() => {
    const fetchEpics = async () => {
      try {
        const tasks = await TaskService.getTasksByProjectId(projectId, templateType);
        const epics = tasks.filter(task => task.type === 'Epic');
        setAvailableEpics(epics);
      } catch (error) {
        console.error('Failed to fetch epics:', error);
      }
    };

    if (open) {
      fetchEpics();
    }
  }, [open, projectId, templateType]);

  // Initialize form data when dialog opens or editTask changes
  useEffect(() => {
    if (editTask) {
      setFormData({
        ...editTask,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        status: defaultStatus,
        type: 'Task',
        assignee: '',
        reporter: '',
        dueDate: '',
        epic: '',
        storyPoints: 3,
        labels: [],
        comments: [],
        sprintId: sprintInfo?.id || 0,
      });
    }
    setError(null);
  }, [editTask, defaultStatus, sprintInfo, open]);

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      status: defaultStatus,
      type: 'Task',
      assignee: '',
      reporter: '',
      dueDate: '',
      epic: '',
      storyPoints: 3,
      labels: [],
      comments: [],
      sprintId: sprintInfo?.id || 0,
    });
    setError(null);
    onClose();
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

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
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
          {title || (editTask ? 'Edit Task' : 'Create Task')}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}
        
        {/* Sprint Info */}
        {showSprintInfo && sprintInfo && !editTask && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            p: 1.5, 
            bgcolor: 'primary.50', 
            border: '1px solid', 
            borderColor: 'primary.200',
            borderRadius: 2,
            mt: 1
          }}>
            <SprintIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="caption" color="primary.main" fontWeight={500}>
              This task will be assigned to: <strong>{sprintInfo.name}</strong>
            </Typography>
          </Box>
        )}
        
        {/* Epic Assignment Info */}
        {availableEpics.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            p: 1.5, 
            bgcolor: 'info.50', 
            border: '1px solid', 
            borderColor: 'info.200',
            borderRadius: 2,
            mt: 1
          }}>
            <EpicIcon sx={{ fontSize: 16, color: 'info.main' }} />
            <Typography variant="caption" color="info.main" fontWeight={500}>
              {availableEpics.length} epic{availableEpics.length !== 1 ? 's' : ''} available for assignment
            </Typography>
          </Box>
        )}
      </DialogTitle>

      <DialogContent sx={{ pt: '12px !important' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Task Title"
          margin="normal"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          error={!formData.title?.trim()}
          helperText={!formData.title?.trim() ? 'Title is required' : ''}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Description"
          margin="normal"
          multiline
          rows={3}
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Task Type</InputLabel>
            <Select
              value={formData.type || 'Task'}
              label="Task Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
            >
              {typeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getTaskIcon(type)}
                    {type}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority || 'Medium'}
              label="Priority"
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
            >
              {priorityOptions.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box 
                      sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        backgroundColor: getPriorityColor(priority) 
                      }} 
                    />
                    {priority}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={formData.status || defaultStatus}
            label="Status"
            onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
          >
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Story Points - Enhanced Visibility */}
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          border: '2px solid', 
          borderColor: 'primary.main',
          borderRadius: 3,
          backgroundColor: 'primary.50'
        }}>
          <Typography variant="subtitle2" fontWeight={600} color="primary.main" sx={{ mb: 1 }}>
            📊 Story Points Estimation
          </Typography>
          <TextField
            label="Story Points"
            type="number"
            value={formData.storyPoints ?? ''}
            onChange={(e) => setFormData({ ...formData, storyPoints: Number(e.target.value) })}
            inputProps={{ min: 0, max: 100 }}
            fullWidth
            sx={{ 
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.dark',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.dark',
                },
              },
              '& .MuiInputBase-input': {
                fontWeight: 700,
                fontSize: '1.2rem',
                textAlign: 'center',
                color: 'primary.main',
              },
              '& .MuiInputLabel-root': {
                fontWeight: 600,
                color: 'primary.main',
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
            💡 Use Fibonacci scale: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89
          </Typography>
        </Box>

        {/* Epic Assignment */}
        {availableEpics.length > 0 && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Assign to Epic (Optional)</InputLabel>
            <Select
              value={formData.epic || ''}
              label="Assign to Epic (Optional)"
              onChange={(e) => setFormData({ ...formData, epic: e.target.value })}
            >
              <MenuItem value="">
                <em>No Epic</em>
              </MenuItem>
              {availableEpics.map((epic) => (
                <MenuItem key={epic.id} value={epic.title}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EpicIcon sx={{ fontSize: 16, color: '#8b5a2b' }} />
                    <Typography variant="body2" noWrap>
                      {epic.title}
                    </Typography>
                    {epic.storyPoints && (
                      <Chip 
                        label={`${epic.storyPoints} SP`} 
                        size="small" 
                        variant="outlined"
                        sx={{ height: 16, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Assignee"
            value={formData.assignee || ''}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
          />
          <TextField
            fullWidth
            label="Reporter"
            value={formData.reporter || ''}
            onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
          />
        </Box>

        <TextField
          fullWidth
          label="Due Date"
          type="date"
          value={formData.dueDate?.slice(0, 10) || ''}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          sx={{ textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={loading || !formData.title?.trim()}
          sx={{ 
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 3
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Saving...
            </>
          ) : (
            editTask ? 'Update Task' : 'Create Task'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskFormDialog;