import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import LinearProgress from '@mui/material/LinearProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import AddIcon from '@mui/icons-material/Add'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AssignmentIcon from '@mui/icons-material/Assignment'
import GroupIcon from '@mui/icons-material/Group'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { Link } from 'react-router-dom'
import { projects } from "../data/projects";
import CreateProjectModal from '../components/CreateProjectModal.tsx'
import type { Project } from "../types";

const Dashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectList, setProjectList] = useState(projects);
  const [starredProjects, setStarredProjects] = useState<string[]>(['1', '3']); // Example starred projects

  const handleCreateProject = (newProject: Omit<Project, 'id' | 'tasks'>) => {
    const project: Project = {
      ...newProject,
      id: (projectList.length + 1).toString(),
      tasks: []
    };
    setProjectList(prev => [...prev, project]);
  };

  const toggleStar = (projectId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setStarredProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Calculate statistics
  const totalProjects = projectList.length;
  const totalTasks = projectList.reduce((sum, project) => sum + project.tasks.length, 0);
  const completedTasks = projectList.reduce((sum, project) => 
    sum + project.tasks.filter(task => task.status === 'Done').length, 0
  );
  const totalTeamMembers = new Set(
    projectList.flatMap(project => project.teamMembers.map(member => member.name))
  ).size;

  const getProjectProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0;
    const completed = project.tasks.filter(task => task.status === 'Done').length;
    return Math.round((completed / project.tasks.length) * 100);
  };

  const getProjectStatus = (project: Project) => {
    const now = new Date();
    const start = new Date(project.timeline.start);
    const end = new Date(project.timeline.end);
    
    if (now < start) return 'Not Started';
    if (now > end) return 'Completed';
    return 'In Progress';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return '#00875A';
      case 'Completed': return '#0052CC';
      case 'Not Started': return '#5E6C84';
      default: return '#5E6C84';
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#FAFBFC', minHeight: '100vh', minWidth: '80vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600,
                color: '#172B4D',
                mb: 1,
                fontSize: '28px'
              }}
            >
              Projects Overview
            </Typography>
            <Typography variant="body1" sx={{ color: '#5E6C84', fontSize: '16px' }}>
              Monitor and manage all your MidLineX projects 
              with real-time insights
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateModalOpen(true)}
            sx={{
              bgcolor: '#0052CC',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(0,82,204,0.3)',
              '&:hover': {
                bgcolor: '#0747A6',
                boxShadow: '0 4px 12px rgba(0,82,204,0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Create Project
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid #DFE1E6',
              bgcolor: 'white',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(9,30,66,0.15)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#172B4D', mb: 0.5 }}>
                  {totalProjects}
                </Typography>
                <Typography variant="body2" sx={{ color: '#5E6C84', fontWeight: 500 }}>
                  Total Projects
                </Typography>
              </Box>
              <Box sx={{ 
                bgcolor: '#E3FCEF', 
                borderRadius: '50%', 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <TrendingUpIcon sx={{ color: '#00875A', fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid #DFE1E6',
              bgcolor: 'white',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(9,30,66,0.15)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#172B4D', mb: 0.5 }}>
                  {totalTasks}
                </Typography>
                <Typography variant="body2" sx={{ color: '#5E6C84', fontWeight: 500 }}>
                  Total Issues
                </Typography>
              </Box>
              <Box sx={{ 
                bgcolor: '#E7F3FF', 
                borderRadius: '50%', 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <AssignmentIcon sx={{ color: '#0052CC', fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid #DFE1E6',
              bgcolor: 'white',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(9,30,66,0.15)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#172B4D', mb: 0.5 }}>
                  {Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#5E6C84', fontWeight: 500 }}>
                  Completion Rate
                </Typography>
              </Box>
              <Box sx={{ 
                bgcolor: '#FFF7E6', 
                borderRadius: '50%', 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <TrendingUpIcon sx={{ color: '#FF8B00', fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid #DFE1E6',
              bgcolor: 'white',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(9,30,66,0.15)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#172B4D', mb: 0.5 }}>
                  {totalTeamMembers}
                </Typography>
                <Typography variant="body2" sx={{ color: '#5E6C84', fontWeight: 500 }}>
                  Team Members
                </Typography>
              </Box>
              <Box sx={{ 
                bgcolor: '#EAE6FF', 
                borderRadius: '50%', 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <GroupIcon sx={{ color: '#5243AA', fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Projects Section */}
      <Box>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600,
            color: '#172B4D',
            mb: 3,
            fontSize: '20px'
          }}
        >
          Projects ({projectList.length})
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gap: 3, 
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' 
        }}>
          {projectList.map((project) => {
            const progress = getProjectProgress(project);
            const status = getProjectStatus(project);
            const isStarred = starredProjects.includes(project.id);
            
            return (
              <Card 
                key={project.id}
                sx={{
                  boxShadow: '0 1px 3px rgba(9,30,66,0.25)',
                  borderRadius: 3,
                  border: '1px solid #DFE1E6',
                  bgcolor: 'white',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(9,30,66,0.15)',
                    transform: 'translateY(-4px)'
                  },
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <CardActionArea component={Link} to={`/projects/${project.id}`}>
                  <CardContent sx={{ p: 3 }}>
                    {/* Project Header */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <Avatar 
                          sx={{ 
                            width: 48, 
                            height: 48, 
                            bgcolor: project.type === 'Software' ? '#0052CC' : 
                                     project.type === 'Marketing' ? '#FF5630' : '#36B37E',
                            mr: 2,
                            fontSize: 18,
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}
                        >
                          {project.key}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: '#172B4D',
                            fontSize: '18px',
                            mb: 0.5,
                            lineHeight: 1.2
                          }}>
                            {project.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#5E6C84', fontSize: '14px' }}>
                            {project.type} project • {project.key}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={status}
                          size="small"
                          sx={{
                            bgcolor: status === 'In Progress' ? '#E3FCEF' : 
                                    status === 'Completed' ? '#E7F3FF' : '#F4F5F7',
                            color: getStatusColor(status),
                            fontWeight: 600,
                            fontSize: '12px',
                            height: 24
                          }}
                        />
                        <Tooltip title={isStarred ? "Remove from favorites" : "Add to favorites"}>
                          <IconButton
                            size="small"
                            onClick={(e) => toggleStar(project.id, e)}
                            sx={{ 
                              color: isStarred ? '#FFAB00' : '#5E6C84',
                              '&:hover': { 
                                bgcolor: isStarred ? '#FFF7E6' : '#F4F5F7',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {isStarred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More options">
                          <IconButton size="small" sx={{ color: '#5E6C84' }}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    {/* Project Description */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#5E6C84',
                        mb: 3,
                        lineHeight: 1.5,
                        fontSize: '14px'
                      }}
                    >
                      {project.description}
                    </Typography>
                    
                    {/* Progress Section */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#5E6C84', fontWeight: 600 }}>
                          Progress
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#172B4D', fontWeight: 600 }}>
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: '#F4F5F7',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: progress === 100 ? '#00875A' : 
                                    progress >= 70 ? '#36B37E' : 
                                    progress >= 30 ? '#FF8B00' : '#FF5630',
                            borderRadius: 3
                          }
                        }}
                      />
                    </Box>
                    
                    {/* Timeline */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <CalendarTodayIcon sx={{ fontSize: 16, color: '#5E6C84', mr: 1 }} />
                      <Typography variant="body2" sx={{ color: '#5E6C84', fontSize: '13px' }}>
                        {new Date(project.timeline.start).toLocaleDateString()} - {new Date(project.timeline.end).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {/* Footer */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <AvatarGroup 
                        max={5} 
                        sx={{ 
                          '& .MuiAvatar-root': { 
                            width: 32, 
                            height: 32, 
                            fontSize: 12,
                            fontWeight: 600,
                            border: '2px solid white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          } 
                        }}
                      >
                        {project.teamMembers.map((member, index) => (
                          <Tooltip key={member.name} title={`${member.name} (${member.role})`}>
                            <Avatar sx={{ bgcolor: `hsl(${index * 60}, 70%, 50%)` }}>
                              {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={`${project.tasks.length} issues`}
                          size="small"
                          icon={<AssignmentIcon sx={{ fontSize: 14 }} />}
                          sx={{
                            bgcolor: '#F4F5F7',
                            color: '#5E6C84',
                            fontWeight: 600,
                            fontSize: '12px',
                            height: 28,
                            '& .MuiChip-icon': { color: '#5E6C84' }
                          }}
                        />
                        <Chip 
                          label={project.type}
                          size="small"
                          sx={{
                            bgcolor: project.type === 'Software' ? '#E7F3FF' : 
                                     project.type === 'Marketing' ? '#FFEBE6' : '#EAE6FF',
                            color: project.type === 'Software' ? '#0052CC' : 
                                   project.type === 'Marketing' ? '#BF2600' : '#5243AA',
                            fontWeight: 600,
                            fontSize: '12px',
                            height: 28
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      </Box>

      <CreateProjectModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </Box>
  )
}

export default Dashboard
