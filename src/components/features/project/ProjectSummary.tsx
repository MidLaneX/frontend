import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import type { Project, Task } from '@/types';
import { formatDate, getInitials } from '@/utils';

interface ProjectSummaryProps {
  project: Project;
  tasks: Task[];
}

const ProjectSummary: React.FC<ProjectSummaryProps> = ({ project, tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Done').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
  const todoTasks = tasks.filter(task => task.status === 'Todo').length;
  const backlogTasks = tasks.filter(task => task.status === 'Backlog').length;
  
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const priorityStats = {
    Highest: tasks.filter(t => t.priority === 'Highest').length,
    High: tasks.filter(t => t.priority === 'High').length,
    Medium: tasks.filter(t => t.priority === 'Medium').length,
    Low: tasks.filter(t => t.priority === 'Low').length,
    Lowest: tasks.filter(t => t.priority === 'Lowest').length,
  };

  const typeStats = {
    Story: tasks.filter(t => t.type === 'Story').length,
    Bug: tasks.filter(t => t.type === 'Bug').length,
    Task: tasks.filter(t => t.type === 'Task').length,
    Epic: tasks.filter(t => t.type === 'Epic').length,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Main Content Row */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Project Overview */}
          <Box sx={{ flex: 2 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Project Overview
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#5E6C84', mb: 1 }}>
                    {project.description}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Overall Progress
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#5E6C84' }}>
                      {completedTasks}/{totalTasks} completed ({Math.round(progress)}%)
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: '#F4F5F7',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#36B37E'
                      }
                    }} 
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F4F5F7', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#172B4D' }}>
                      {todoTasks}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#5E6C84' }}>
                      To Do
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#FFF7E6', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#172B4D' }}>
                      {inProgressTasks}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#5E6C84' }}>
                      In Progress
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#E3FCEF', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#172B4D' }}>
                      {completedTasks}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#5E6C84' }}>
                      Done
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F8F9FA', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#172B4D' }}>
                      {backlogTasks}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#5E6C84' }}>
                      Backlog
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Team & Timeline */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Project Details
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#5E6C84', mb: 1 }}>
                    Timeline
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(project.timeline.start)} - {formatDate(project.timeline.end)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#5E6C84', mb: 1 }}>
                    Project Type
                  </Typography>
                  <Chip 
                    label={project.type} 
                    size="small" 
                    sx={{ 
                      bgcolor: project.type === 'Software' ? '#DEEBFF' : 
                               project.type === 'Business' ? '#E3FCEF' : '#FFF7E6',
                      color: project.type === 'Software' ? '#0052CC' : 
                             project.type === 'Business' ? '#00875A' : '#FF8B00',
                      fontWeight: 600
                    }} 
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#5E6C84', mb: 1 }}>
                    Team Members ({project.teamMembers.length})
                  </Typography>
                  <AvatarGroup max={6} sx={{ justifyContent: 'flex-start' }}>
                    {project.teamMembers.map((member, index) => (
                      <Avatar 
                        key={index}
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          fontSize: '0.875rem',
                          bgcolor: '#0052CC'
                        }}
                        title={`${member.name} - ${member.role}`}
                      >
                        {getInitials(member.name)}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Bottom Row */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Priority Distribution */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Priority Distribution
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(priorityStats).map(([priority, count]) => (
                    <Chip
                      key={priority}
                      label={`${priority}: ${count}`}
                      size="small"
                      sx={{
                        bgcolor: priority === 'Highest' ? '#FFEBE6' :
                                 priority === 'High' ? '#FFEBE6' :
                                 priority === 'Medium' ? '#FFF7E6' :
                                 priority === 'Low' ? '#DEEBFF' : '#F4F5F7',
                        color: priority === 'Highest' ? '#DE350B' :
                               priority === 'High' ? '#FF5630' :
                               priority === 'Medium' ? '#FF8B00' :
                               priority === 'Low' ? '#0065FF' : '#5E6C84'
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Issue Type Distribution */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Issue Type Distribution
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(typeStats).map(([type, count]) => (
                    <Chip
                      key={type}
                      label={`${type}: ${count}`}
                      size="small"
                      sx={{
                        bgcolor: type === 'Story' ? '#E3FCEF' :
                                 type === 'Bug' ? '#FFEBE6' :
                                 type === 'Task' ? '#DEEBFF' : '#EAE6FF',
                        color: type === 'Story' ? '#00875A' :
                               type === 'Bug' ? '#DE350B' :
                               type === 'Task' ? '#0052CC' : '#6554C0'
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectSummary;
