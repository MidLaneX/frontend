import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import type { Project, Task } from '../types';
import { formatDate, getInitials, getPriorityConfig, getTaskTypeConfig } from '../utils';

interface ProjectTimelineProps {
  project: Project;
  tasks: Task[];
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project, tasks }) => {
  // Sort tasks by due date
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  // Group tasks by month
  const tasksByMonth = sortedTasks.reduce((acc, task) => {
    const month = new Date(task.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const getTaskProgress = (task: Task) => {
    switch (task.status) {
      case 'Done': return 100;
      case 'Review': return 80;
      case 'In Progress': return 50;
      case 'Todo': return 20;
      case 'Backlog': return 0;
      default: return 0;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Project Timeline Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Project Timeline - {project.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#5E6C84' }}>
              Duration:
            </Typography>
            <Chip 
              label={`${formatDate(project.timeline.start)} → ${formatDate(project.timeline.end)}`}
              sx={{ bgcolor: '#DEEBFF', color: '#0052CC' }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#5E6C84' }}>
              Total Tasks:
            </Typography>
            <Chip 
              label={`${tasks.length} tasks`}
              sx={{ bgcolor: '#E3FCEF', color: '#00875A' }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Timeline View */}
      <Box sx={{ position: 'relative' }}>
        {/* Timeline Line */}
        <Box
          sx={{
            position: 'absolute',
            left: 20,
            top: 0,
            bottom: 0,
            width: 2,
            bgcolor: '#DFE1E6',
            zIndex: 0
          }}
        />

        {Object.entries(tasksByMonth).map(([month, monthTasks], monthIndex) => (
          <Box key={month} sx={{ position: 'relative', mb: 4 }}>
            {/* Month Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#0052CC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  zIndex: 1
                }}
              >
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {monthIndex + 1}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#172B4D' }}>
                {month}
              </Typography>
              <Chip 
                label={`${monthTasks.length} tasks`}
                size="small"
                sx={{ ml: 2, bgcolor: '#F4F5F7', color: '#5E6C84' }}
              />
            </Box>

            {/* Tasks for this month */}
            <Box sx={{ ml: 6 }}>
              {monthTasks.map((task) => {
                const priorityConfig = getPriorityConfig(task.priority);
                const typeConfig = getTaskTypeConfig(task.type);
                const progress = getTaskProgress(task);
                const overdue = isOverdue(task.dueDate);

                return (
                  <Card 
                    key={task.id} 
                    sx={{ 
                      mb: 2, 
                      border: overdue ? '1px solid #DE350B' : '1px solid #DFE1E6',
                      bgcolor: overdue ? '#FFEBE6' : 'white'
                    }}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        {/* Task Icon */}
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: 1,
                            bgcolor: typeConfig.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            mt: 0.5
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'white', fontSize: '10px' }}>
                            {task.type.charAt(0)}
                          </Typography>
                        </Box>

                        {/* Task Content */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#172B4D' }}>
                              {task.title}
                            </Typography>
                            <Chip 
                              label={task.id}
                              size="small"
                              sx={{ 
                                fontSize: '10px', 
                                height: 20,
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
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {task.description}
                            </Typography>
                          )}

                          {/* Task Details */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={task.priority}
                              size="small"
                              sx={{
                                bgcolor: priorityConfig.bgColor,
                                color: priorityConfig.color,
                                fontSize: '11px',
                                height: 22
                              }}
                            />
                            <Chip
                              label={task.status}
                              size="small"
                              sx={{
                                bgcolor: task.status === 'Done' ? '#E3FCEF' :
                                         task.status === 'In Progress' ? '#FFF7E6' :
                                         task.status === 'Review' ? '#EAE6FF' : '#F4F5F7',
                                color: task.status === 'Done' ? '#00875A' :
                                       task.status === 'In Progress' ? '#FF8B00' :
                                       task.status === 'Review' ? '#6554C0' : '#5E6C84',
                                fontSize: '11px',
                                height: 22
                              }}
                            />
                            <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                              Due: {formatDate(task.dueDate)}
                              {overdue && (
                                <Typography component="span" sx={{ color: '#DE350B', ml: 0.5 }}>
                                  (Overdue)
                                </Typography>
                              )}
                            </Typography>
                          </Box>

                          {/* Progress Bar */}
                          <Box sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                                Progress
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                                {progress}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={progress} 
                              sx={{ 
                                height: 4, 
                                borderRadius: 2,
                                bgcolor: '#F4F5F7',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: progress === 100 ? '#36B37E' :
                                           progress >= 50 ? '#FF8B00' : '#0052CC'
                                }
                              }} 
                            />
                          </Box>

                          {/* Assignee */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 20,
                                height: 20,
                                fontSize: '10px',
                                bgcolor: '#0052CC'
                              }}
                            >
                              {getInitials(task.assignee)}
                            </Avatar>
                            <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                              {task.assignee}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Box>
        ))}

        {/* Empty State */}
        {Object.keys(tasksByMonth).length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#5E6C84', mb: 1 }}>
              No tasks scheduled
            </Typography>
            <Typography variant="body2" sx={{ color: '#8993A4' }}>
              Tasks will appear here once they have due dates assigned
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProjectTimeline;
