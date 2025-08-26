import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import type { TaskPriority, TaskStatus, TaskType, Task } from '@/types';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>, editTask?: Task | null) => void;
  editTask?: Task | null;
  initialData?: Partial<Task>;
  statusOptions?: TaskStatus[];
  priorityOptions?: TaskPriority[];
  typeOptions?: TaskType[];
}

const defaultTaskData: Partial<Task> = {
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
};

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  open,
  onClose,
  onSave,
  editTask,
  initialData,
  statusOptions = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'],
  priorityOptions = ['Highest', 'High', 'Medium', 'Low', 'Lowest'],
  typeOptions = ['Story', 'Bug', 'Task', 'Epic'],
}) => {
  const [taskData, setTaskData] = React.useState<Partial<Task>>(
    initialData || editTask || defaultTaskData
  );

  React.useEffect(() => {
    setTaskData(initialData || editTask || defaultTaskData);
  }, [open, editTask, initialData]);

  const handleChange = (field: keyof Task, value: any) => {
    setTaskData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!taskData.title) return; // required field check
    onSave(taskData, editTask);
    setTaskData(defaultTaskData);
  };

  const handleClose = () => {
    setTaskData(defaultTaskData);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="create-task-dialog-title"
    >
      <DialogTitle id="create-task-dialog-title">
        {editTask ? 'Edit Task' : 'Create Task'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Title"
          margin="dense"
          value={taskData.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
        <TextField
          fullWidth
          label="Description"
          margin="dense"
          multiline
          value={taskData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
        <TextField
          fullWidth
          label="Assignee"
          margin="dense"
          value={taskData.assignee}
          onChange={(e) => handleChange('assignee', e.target.value)}
        />
        <TextField
          fullWidth
          label="Reporter"
          margin="dense"
          value={taskData.reporter}
          onChange={(e) => handleChange('reporter', e.target.value)}
        />
        <TextField
          fullWidth
          label="Due Date"
          type="date"
          margin="dense"
          value={taskData.dueDate?.slice(0, 10) || ''}
          onChange={(e) => handleChange('dueDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          fullWidth
          label="Priority"
          margin="dense"
          value={taskData.priority}
          onChange={(e) => handleChange('priority', e.target.value as TaskPriority)}
        >
          {priorityOptions.map((priority) => (
            <MenuItem key={priority} value={priority}>{priority}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          label="Status"
          margin="dense"
          value={taskData.status}
          onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
        >
          {statusOptions.map((status) => (
            <MenuItem key={status} value={status}>{status}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          label="Type"
          margin="dense"
          value={taskData.type}
          onChange={(e) => handleChange('type', e.target.value as TaskType)}
        >
          {typeOptions.map((type) => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="Story Points"
          type="number"
          margin="dense"
          value={taskData.storyPoints ?? ''}
          onChange={(e) => handleChange('storyPoints', Math.max(0, Number(e.target.value)))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskModal;
