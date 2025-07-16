import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import type { Task, Comment } from "@/types";

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, open, onClose, onUpdateTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');

  React.useEffect(() => {
    if (task) {
      setEditedTask(task);
    }
  }, [task]);

  if (!task || !editedTask) return null;

  const handleSave = () => {
    onUpdateTask(task.id, editedTask);
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now().toString(),
      author: 'Current User',
      text: newComment,
      timestamp: new Date().toISOString()
    };
    
    const updatedTask = {
      ...editedTask,
      comments: [...editedTask.comments, comment]
    };
    
    setEditedTask(updatedTask);
    onUpdateTask(task.id, updatedTask);
    setNewComment('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Bug': return '#DE350B';
      case 'Story': return '#36B37E';
      case 'Epic': return '#6554C0';
      case 'Task': return '#0052CC';
      default: return '#0052CC';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Highest': return '#DE350B';
      case 'High': return '#FF5630';
      case 'Medium': return '#FF8B00';
      case 'Low': return '#36B37E';
      case 'Lowest': return '#00875A';
      default: return '#6B778C';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: "600px",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={editedTask.type}
              size="small"
              sx={{
                bgcolor: getTypeColor(editedTask.type),
                color: "white",
                fontWeight: 600,
              }}
            />
            <Typography variant="h6" sx={{ color: "#172B4D", fontWeight: 600 }}>
              {editedTask.id}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", gap: 3 }}>
          {/* Main Content */}
          <Box sx={{ flex: 1 }}>
            {/* Title */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography
                  variant="h5"
                  sx={{ color: "#172B4D", fontWeight: 500, flex: 1 }}
                >
                  {isEditing ? (
                    <TextField
                      fullWidth
                      value={editedTask.title}
                      onChange={(e) =>
                        setEditedTask({ ...editedTask, title: e.target.value })
                      }
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    editedTask.title
                  )}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: "#5E6C84", fontWeight: 600, mb: 1 }}
              >
                Description
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={editedTask.description || ""}
                  onChange={(e) =>
                    setEditedTask({
                      ...editedTask,
                      description: e.target.value,
                    })
                  }
                  placeholder="Add a description..."
                  variant="outlined"
                />
              ) : (
                <Typography variant="body2" sx={{ color: "#172B4D" }}>
                  {editedTask.description || "No description provided"}
                </Typography>
              )}
            </Box>

            {/* Activity */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: "#5E6C84", fontWeight: 600, mb: 2 }}
              >
                Activity
              </Typography>

              {/* Add Comment */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  variant="outlined"
                  size="small"
                />
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    sx={{ textTransform: "none" }}
                  >
                    Comment
                  </Button>
                </Box>
              </Box>

              {/* Comments */}
              <Box>
                {editedTask.comments.map((comment: Comment) => (
                  <Box key={comment.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar
                        sx={{ width: 24, height: 24, mr: 1, fontSize: 12 }}
                      >
                        {comment.author.substring(0, 2).toUpperCase()}
                      </Avatar>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: "#172B4D" }}
                      >
                        {comment.author}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#5E6C84", ml: 1 }}
                      >
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#172B4D", ml: 4 }}
                    >
                      {comment.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Sidebar */}
          <Box sx={{ width: 280, pl: 2 }}>
            <Box sx={{ bgcolor: "#F4F5F7", borderRadius: 1, p: 2 }}>
              {/* Status */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#5E6C84",
                    fontWeight: 600,
                    display: "block",
                    mb: 1,
                  }}
                >
                  STATUS
                </Typography>
                {isEditing ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={editedTask.status}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          status: e.target.value as Task["status"],
                        })
                      }
                    >
                      <MenuItem value="Backlog">Backlog</MenuItem>
                      <MenuItem value="Todo">Todo</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Review">Review</MenuItem>
                      <MenuItem value="Done">Done</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Chip
                    label={editedTask.status}
                    size="small"
                    sx={{ bgcolor: "white" }}
                  />
                )}
              </Box>

              {/* Assignee */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#5E6C84",
                    fontWeight: 600,
                    display: "block",
                    mb: 1,
                  }}
                >
                  ASSIGNEE
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: 12 }}>
                    {editedTask.assignee
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" sx={{ color: "#172B4D" }}>
                    {editedTask.assignee}
                  </Typography>
                </Box>
              </Box>

              {/* Reporter */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#5E6C84",
                    fontWeight: 600,
                    display: "block",
                    mb: 1,
                  }}
                >
                  REPORTER
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: 12 }}>
                    {editedTask.reporter
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" sx={{ color: "#172B4D" }}>
                    {editedTask.reporter}
                  </Typography>
                </Box>
              </Box>

              {/* Priority */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#5E6C84",
                    fontWeight: 600,
                    display: "block",
                    mb: 1,
                  }}
                >
                  PRIORITY
                </Typography>
                {isEditing ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={editedTask.priority}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          priority: e.target.value as Task["priority"],
                        })
                      }
                    >
                      <MenuItem value="Highest">Highest</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Lowest">Lowest</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Chip
                    label={editedTask.priority}
                    size="small"
                    sx={{
                      bgcolor: getPriorityColor(editedTask.priority),
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>

              {/* Story Points */}
              {editedTask.storyPoints && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#5E6C84",
                      fontWeight: 600,
                      display: "block",
                      mb: 1,
                    }}
                  >
                    STORY POINTS
                  </Typography>
                  <Chip
                    label={editedTask.storyPoints}
                    size="small"
                    sx={{ bgcolor: "white" }}
                  />
                </Box>
              )}

              {/* Due Date */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#5E6C84",
                    fontWeight: 600,
                    display: "block",
                    mb: 1,
                  }}
                >
                  DUE DATE
                </Typography>
                <Typography variant="body2" sx={{ color: "#172B4D" }}>
                  {new Date(editedTask.dueDate).toLocaleDateString()}
                </Typography>
              </Box>

              {/* Labels */}
              {editedTask.labels.length > 0 && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#5E6C84",
                      fontWeight: 600,
                      display: "block",
                      mb: 1,
                    }}
                  >
                    LABELS
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {editedTask.labels.map((label: string) => (
                      <Chip
                        key={label}
                        label={label}
                        size="small"
                        sx={{ bgcolor: "white" }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {isEditing && (
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default TaskDetailModal;
