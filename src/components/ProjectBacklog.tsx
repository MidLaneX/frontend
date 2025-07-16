import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { Task } from '../types';
import { formatDate, getInitials, getPriorityConfig, getTaskTypeConfig } from '../utils';

interface ProjectBacklogProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCreateTask: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const ProjectBacklog: React.FC<ProjectBacklogProps> = ({ 
  tasks, 
  onTaskClick, 
  onCreateTask,
  onUpdateTask 
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Filter and sort backlog items
  const backlogTasks = tasks
    .filter(task => task.status === 'Backlog')
    .sort((a, b) => {
      // Sort by priority first, then by creation date
      const priorityOrder = { 'Highest': 5, 'High': 4, 'Medium': 3, 'Low': 2, 'Lowest': 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const sprintReadyTasks = tasks.filter(task => ['Todo', 'In Progress', 'Review'].includes(task.status));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTaskId(null);
  };

  const handleStartSprint = (taskId: string) => {
    onUpdateTask(taskId, { status: 'Todo' });
    handleMenuClose();
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onTaskClick(task);
    }
    handleMenuClose();
  };

  const getTotalStoryPoints = (taskList: Task[]) => {
    return taskList.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#172B4D', mb: 1 }}>
            Backlog
          </Typography>
          <Typography variant="body2" sx={{ color: '#5E6C84' }}>
            Plan and prioritize your work
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateTask}
          sx={{
            bgcolor: '#0052CC',
            '&:hover': { bgcolor: '#0747A6' },
            textTransform: 'none',
            borderRadius: 2
          }}
        >
          Create Issue
        </Button>
      </Box>

      {/* Sprint Planning Section */}
      {sprintReadyTasks.length > 0 && (
        <Card sx={{ mb: 3, border: '1px solid #0052CC' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0052CC' }}>
                  Active Sprint
                </Typography>
                <Chip 
                  label={`${sprintReadyTasks.length} issues`}
                  size="small"
                  sx={{ bgcolor: '#DEEBFF', color: '#0052CC' }}
                />
                <Chip 
                  label={`${getTotalStoryPoints(sprintReadyTasks)} story points`}
                  size="small"
                  sx={{ bgcolor: '#E3FCEF', color: '#00875A' }}
                />
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: '#5E6C84' }}>
              {sprintReadyTasks.filter(t => t.status === 'Todo').length} to do • {' '}
              {sprintReadyTasks.filter(t => t.status === 'In Progress').length} in progress • {' '}
              {sprintReadyTasks.filter(t => t.status === 'Review').length} in review
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Backlog Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#172B4D' }}>
            Backlog
          </Typography>
          <Chip 
            label={`${backlogTasks.length} issues`}
            size="small"
            sx={{ bgcolor: '#F4F5F7', color: '#5E6C84' }}
          />
          <Chip 
            label={`${getTotalStoryPoints(backlogTasks)} story points`}
            size="small"
            sx={{ bgcolor: '#F4F5F7', color: '#5E6C84' }}
          />
        </Box>
      </Box>

      {/* Backlog Items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {backlogTasks.map((task) => {
          const priorityConfig = getPriorityConfig(task.priority);
          const typeConfig = getTaskTypeConfig(task.type);
          const isOverdue = new Date(task.dueDate) < new Date();

          return (
            <Card 
              key={task.id}
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid #DFE1E6',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  borderColor: '#B3D4FF'
                }
              }}
              onClick={() => onTaskClick(task)}
            >
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {/* Task Type Icon */}
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: 1,
                      bgcolor: typeConfig.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.5
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontSize: '10px', fontWeight: 600 }}>
                      {task.type === 'Story' ? 'S' : task.type === 'Bug' ? 'B' : task.type === 'Task' ? 'T' : 'E'}
                    </Typography>
                  </Box>

                  {/* Task Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500, 
                          color: '#172B4D',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {task.title}
                      </Typography>
                      <Chip 
                        label={task.id}
                        size="small"
                        sx={{ 
                          fontSize: '10px', 
                          height: 18,
                          bgcolor: '#F4F5F7',
                          color: '#5E6C84'
                        }}
                      />
                    </Box>

                    {task.description && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#5E6C84', 
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {task.description}
                      </Typography>
                    )}

                    {/* Task Meta */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={task.priority}
                        size="small"
                        sx={{
                          bgcolor: priorityConfig.bgColor,
                          color: priorityConfig.color,
                          fontSize: '10px',
                          height: 20
                        }}
                      />
                      
                      {task.storyPoints && (
                        <Chip
                          label={`${task.storyPoints} SP`}
                          size="small"
                          sx={{
                            bgcolor: '#F4F5F7',
                            color: '#5E6C84',
                            fontSize: '10px',
                            height: 20
                          }}
                        />
                      )}

                      <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                        Due: {formatDate(task.dueDate)}
                        {isOverdue && (
                          <Typography component="span" sx={{ color: '#DE350B', ml: 0.5 }}>
                            (Overdue)
                          </Typography>
                        )}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                        <Avatar
                          sx={{
                            width: 20,
                            height: 20,
                            fontSize: '10px',
                            bgcolor: '#0052CC'
                          }}
                          title={task.assignee}
                        >
                          {getInitials(task.assignee)}
                        </Avatar>
                        <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                          {task.assignee}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Actions Menu */}
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, task.id)}
                    sx={{ mt: 0.5 }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Empty State */}
      {backlogTasks.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: '#5E6C84', mb: 1 }}>
            Your backlog is empty
          </Typography>
          <Typography variant="body2" sx={{ color: '#8993A4', mb: 3 }}>
            Create issues to plan your work and manage your project backlog
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onCreateTask}
            sx={{ textTransform: 'none' }}
          >
            Create your first issue
          </Button>
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={() => selectedTaskId && handleStartSprint(selectedTaskId)}
          sx={{ fontSize: '14px' }}
        >
          <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />
          Start Sprint
        </MenuItem>
        <MenuItem 
          onClick={() => selectedTaskId && handleEditTask(selectedTaskId)}
          sx={{ fontSize: '14px' }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={handleMenuClose}
          sx={{ fontSize: '14px', color: '#DE350B' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProjectBacklog;
