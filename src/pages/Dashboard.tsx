import React, { useState, useEffect } from 'react'
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
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import type { Project } from "../types";
import { ProjectService } from '@/services/ProjectService';
import { UserService, type UserProfile } from '@/services/UserService';
import { useAuth } from '@/context/AuthContext';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Get user info from auth context or use defaults
  const userId = user?.userId || parseInt(localStorage.getItem('userId') || '5');
  const [orgId, setOrgId] = useState(1);
  const [role, setRole] = useState('ADMIN');
  const [templateType, setTemplateType] = useState('scrum');
  const [teamIds, setTeamIds] = useState<number[]>([]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starredProjects, setStarredProjects] = useState<string[]>(['1', '3']);
  
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Fetch projects when filters change
  useEffect(() => {
    const fetchProjects = async () => {
      if (!isAuthenticated || !userId) {
        console.log('Skipping project fetch - user not authenticated or no userId');
        return;
      }
      
      console.log('=== PROJECT FETCH DEBUG ===');
      console.log('User authenticated:', isAuthenticated);
      console.log('User ID:', userId);
      console.log('API Base URL:', 'http://localhost:8080/api');
      
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching projects for user:', userId);
        console.log('API call parameters:', { userId, orgId, role, templateType, teamIds });
        const data = await ProjectService.getAllProjects(userId, orgId, role, templateType, teamIds);
        console.log('Fetched projects from API:', data);
        console.log('Number of projects:', data?.length || 0);
        if (data && data.length > 0) {
          console.log('First project sample:', data[0]);
        }
        setProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        console.error('Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          response: (err as any)?.response?.data,
          status: (err as any)?.response?.status,
          url: (err as any)?.config?.url
        });
        setError('Failed to load projects from API. Please check if the backend is running.');
        setProjects([]); // Ensure projects is empty array, not undefined
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [userId, orgId, role, templateType, teamIds, isAuthenticated]);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated || !userId) {
        return;
      }
      
      try {
        console.log('Fetching user profile for user:', userId);
        const profile = await UserService.getUserProfile(userId);
        console.log('Fetched user profile:', profile);
        setUserProfile(profile);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // Don't set error for profile fetch failure, just log it
      }
    };
    fetchUserProfile();
  }, [userId, isAuthenticated]);

  // Create project handler
  const [newProject, setNewProject] = useState({
    orgId: 1,
    name: '',
    type: 'Internal',
    templateType: 'scrum'
  });

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      setError('Project name is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log('Creating project:', newProject);
      const result = await ProjectService.createProject(newProject, newProject.templateType);
      console.log('Created project:', result);
      setProjects(prev => [...prev, result]);
      setNewProject({ orgId: orgId, name: '', type: 'Internal', templateType: templateType });
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
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
  const totalProjects = projects.length;
  const totalTasks = projects.reduce((sum, project) => sum + (project.tasks?.length || 0), 0);
  const completedTasks = projects.reduce((sum, project) => 
    sum + (project.tasks?.filter(task => task.status === 'Done').length || 0), 0
  );
  const totalTeamMembers = new Set(
    projects.flatMap(project => (project.teamMembers || []).map(member => member.name))
  ).size;

  const getProjectProgress = (project: Project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
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

  // Update user profile function
  const updateUserProfile = async (firstName: string, lastName: string, jobTitle: string, department: string) => {
    if (!userId) return;
    
    try {
      console.log('Updating user profile...');
      const updatedProfile = await UserService.updateUserProfile(userId, {
        firstName,
        lastName,
        jobTitle,
        department
      });
      console.log('Profile updated successfully:', updatedProfile);
      setUserProfile(updatedProfile);
      // You can add a success message here if needed
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 }, 
      bgcolor: '#f8fafc', 
      minHeight: '100vh',
      maxWidth: '1400px',
      mx: 'auto'
    }}>
      {/* Enhanced Loading State */}
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          bgcolor: 'white',
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <CircularProgress size={48} sx={{ mb: 3, color: '#3b82f6' }} />
          <Typography sx={{ color: '#64748b', fontSize: '16px', fontWeight: 500 }}>
            Loading your workspace...
          </Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '14px', mt: 1 }}>
            This might take a moment
          </Typography>
        </Box>
      )}

      {/* Enhanced Error State */}
      {error && (
        <Box sx={{ 
          mb: 4, 
          p: 3, 
          bgcolor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)'
        }}>
          <Typography sx={{ color: '#dc2626', fontWeight: 600, mb: 1 }}>
            {error}
          </Typography>
          <Button 
            size="small" 
            onClick={() => setError(null)} 
            sx={{ 
              mt: 1, 
              color: '#dc2626',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: '#fee2e2' }
            }}
          >
            Dismiss
          </Button>
        </Box>
      )}

      {/* Enhanced Header Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              color: '#1e293b',
              mb: 2,
              fontSize: { xs: '28px', sm: '32px', md: '36px' },
              background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Welcome back, {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : user?.email?.split('@')[0] || 'User'}! 👋
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#64748b',
              fontWeight: 400,
              fontSize: '18px'
            }}
          >
            {userProfile ? (
              <>
                {userProfile.job_title && userProfile.department 
                  ? `${userProfile.job_title} at ${userProfile.department}` 
                  : userProfile.job_title || userProfile.department || 'Here\'s what\'s happening with your projects today.'
                }
              </>
            ) : (
              'Here\'s what\'s happening with your projects today.'
            )}
          </Typography>
          
          {/* User Profile Debug Info - Remove this in production */}
          {userProfile && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: '#f8fafc', 
              borderRadius: 2, 
              border: '1px solid #e2e8f0' 
            }}>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>
                Profile loaded: {userProfile.email} | {userProfile.department}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Enhanced Statistics Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, 
          gap: 3, 
          mb: 4 
        }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              bgcolor: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                  {totalProjects}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Total Projects
                </Typography>
              </Box>
              <Box sx={{ 
                bgcolor: '#eff6ff', 
                borderRadius: '50%', 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <TrendingUpIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              bgcolor: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                  {totalTasks}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Total Issues
                </Typography>
              </Box>
              <Box sx={{ 
                bgcolor: '#ecfdf5', 
                borderRadius: '50%', 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <AssignmentIcon sx={{ color: '#10b981', fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              bgcolor: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                  {Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Completion Rate
                </Typography>
              </Box>
              <Box sx={{ 
                bgcolor: '#fef3c7', 
                borderRadius: '50%', 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <TrendingUpIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              bgcolor: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                  {totalTeamMembers}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Team Members
                </Typography>
              </Box>
              <Box sx={{ 
                bgcolor: '#f3f4f6', 
                borderRadius: '50%', 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <GroupIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Enhanced Projects Section */}
      {!loading && !error && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: '#1e293b',
                fontSize: '24px'
              }}
            >
              Your Projects ({projects.length})
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsCreateModalOpen(true)}
              sx={{
                bgcolor: '#3b82f6',
                color: 'white',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                '&:hover': {
                  bgcolor: '#2563eb',
                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Quick Create
            </Button>
          </Box>
          
          {projects.length === 0 ? (
            <Paper sx={{ 
              textAlign: 'center', 
              py: 8,
              px: 4,
              bgcolor: 'white',
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: '#f1f5f9', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#64748b' }} />
              </Box>
              <Typography variant="h5" sx={{ color: '#1e293b', mb: 2, fontWeight: 600 }}>
                No projects yet
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', mb: 4, maxWidth: 400, mx: 'auto' }}>
                Create your first project to start organizing your work and collaborating with your team.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateModalOpen(true)}
                sx={{
                  bgcolor: '#3b82f6',
                  color: 'white',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  '&:hover': {
                    bgcolor: '#2563eb',
                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Create Your First Project
              </Button>
            </Paper>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }
            }}>
              {Array.isArray(projects) && projects.map((project: Project) => {
            const progress = getProjectProgress(project);
            const status = getProjectStatus(project);
            const isStarred = starredProjects.includes(project.id);
            
            return (
              <Card 
                key={project.id}
                sx={{
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  bgcolor: 'white',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    transform: 'translateY(-4px)',
                    borderColor: '#3b82f6'
                  },
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <CardActionArea component={Link} to={`/projects/${project.id}`}>
                  <CardContent sx={{ p: 3 }}>
                    {/* Enhanced Project Header */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <Avatar 
                          sx={{ 
                            width: 48, 
                            height: 48, 
                            bgcolor: project.type === 'Software' ? '#3b82f6' : 
                                     project.type === 'Marketing' ? '#ef4444' : '#10b981',
                            mr: 2,
                            fontSize: 18,
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                        >
                          {project.key}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: '#1e293b',
                            fontSize: '18px',
                            mb: 0.5,
                            lineHeight: 1.2
                          }}>
                            {project.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '14px' }}>
                            {project.type} project • {project.key}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={status}
                          size="small"
                          sx={{
                            bgcolor: status === 'In Progress' ? '#ecfdf5' : 
                                    status === 'Completed' ? '#eff6ff' : '#f8fafc',
                            color: status === 'In Progress' ? '#059669' : 
                                   status === 'Completed' ? '#2563eb' : '#64748b',
                            fontWeight: 600,
                            fontSize: '12px',
                            height: 24,
                            borderRadius: 2
                          }}
                        />
                        <Tooltip title={isStarred ? "Remove from favorites" : "Add to favorites"}>
                          <IconButton
                            size="small"
                            onClick={(e) => toggleStar(project.id, e)}
                            sx={{ 
                              color: isStarred ? '#f59e0b' : '#94a3b8',
                              '&:hover': { 
                                bgcolor: isStarred ? '#fef3c7' : '#f1f5f9',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {isStarred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More options">
                          <IconButton size="small" sx={{ color: '#64748b' }}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    {/* Enhanced Project Description */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#64748b',
                        mb: 3,
                        lineHeight: 1.5,
                        fontSize: '14px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {project.description || 'No description provided for this project.'}
                    </Typography>
                    
                    {/* Enhanced Progress Section */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                          Progress
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 700 }}>
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#f1f5f9',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: progress === 100 ? '#10b981' : 
                                    progress >= 70 ? '#22d3ee' : 
                                    progress >= 30 ? '#f59e0b' : '#ef4444',
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                    
                    {/* Enhanced Timeline */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <CalendarTodayIcon sx={{ fontSize: 16, color: '#64748b', mr: 1.5 }} />
                      <Typography variant="body2" sx={{ color: '#64748b', fontSize: '13px' }}>
                        {new Date(project.timeline.start).toLocaleDateString()} - {new Date(project.timeline.end).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 3, borderColor: '#f1f5f9' }} />
                    
                    {/* Enhanced Footer */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <AvatarGroup 
                        max={4} 
                        sx={{ 
                          '& .MuiAvatar-root': { 
                            width: 32, 
                            height: 32, 
                            fontSize: 12,
                            fontWeight: 600,
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          } 
                        }}
                      >
                        {(project.teamMembers || []).map((member: any, index: number) => (
                          <Tooltip key={member.name} title={`${member.name} (${member.role})`}>
                            <Avatar sx={{ bgcolor: `hsl(${index * 60 + 200}, 70%, 50%)` }}>
                              {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={`${(project.tasks || []).length} issues`}
                          size="small"
                          icon={<AssignmentIcon sx={{ fontSize: 14 }} />}
                          sx={{
                            bgcolor: '#f8fafc',
                            color: '#64748b',
                            fontWeight: 600,
                            fontSize: '12px',
                            height: 28,
                            borderRadius: 2,
                            '& .MuiChip-icon': { color: '#64748b' }
                          }}
                        />
                        <Chip 
                          label={project.type}
                          size="small"
                          sx={{
                            bgcolor: project.type === 'Software' ? '#eff6ff' : 
                                     project.type === 'Marketing' ? '#fef2f2' : '#f0fdf4',
                            color: project.type === 'Software' ? '#2563eb' : 
                                   project.type === 'Marketing' ? '#dc2626' : '#16a34a',
                            fontWeight: 600,
                            fontSize: '12px',
                            height: 28,
                            borderRadius: 2
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
          )}
        </Box>
      )}

      {/* Enhanced Filter Controls - Moved to Bottom */}
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 3, 
        border: '1px solid #e2e8f0',
        bgcolor: 'white',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#1e293b', fontWeight: 600 }}>
          Project Filters
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
          gap: 2
        }}>
          <TextField
            label="Organization ID"
            type="number"
            value={orgId}
            onChange={e => setOrgId(Number(e.target.value))}
            size="small"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                }
              }
            }}
          />
          <TextField
            label="User ID"
            type="number"
            value={userId}
            size="small"
            disabled
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <TextField
            label="Role"
            value={role}
            onChange={e => setRole(e.target.value)}
            size="small"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                }
              }
            }}
          />
          <TextField
            label="Template Type"
            value={templateType}
            onChange={e => setTemplateType(e.target.value)}
            size="small"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                }
              }
            }}
          />
          <FormControl size="small">
            <InputLabel>Team IDs</InputLabel>
            <Select
              multiple
              value={teamIds}
              onChange={e => setTeamIds(typeof e.target.value === 'string' ? e.target.value.split(',').map(Number) : e.target.value as number[])}
              label="Team IDs"
              renderValue={selected => (selected as number[]).join(', ')}
              sx={{ 
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                }
              }}
            >
              {[1,2,3,4,5].map(id => (
                <MenuItem key={id} value={id}>{id}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Enhanced Create Project Section - Moved to Bottom */}
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 3, 
        border: '1px solid #e2e8f0',
        bgcolor: 'white',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#1e293b', fontWeight: 600 }}>
          Create New Project
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3
        }}>
          <TextField
            label="Project Name"
            value={newProject.name}
            onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
            size="small"
            placeholder="Enter project name..."
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                }
              }
            }}
          />
          <TextField
            label="Project Type"
            value={newProject.type}
            onChange={e => setNewProject(p => ({ ...p, type: e.target.value }))}
            size="small"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                }
              }
            }}
          />
          <TextField
            label="Template Type"
            value={newProject.templateType}
            onChange={e => setNewProject(p => ({ ...p, templateType: e.target.value }))}
            size="small"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                }
              }
            }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateProject}
          disabled={!newProject.name.trim()}
          sx={{
            bgcolor: '#3b82f6',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            '&:hover': {
              bgcolor: '#2563eb',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
              transform: 'translateY(-1px)'
            },
            '&:disabled': {
              bgcolor: '#e2e8f0',
              color: '#94a3b8',
              boxShadow: 'none'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Create Project
        </Button>
      </Paper>

      {/* Enhanced Modal for creating a project */}
      {isCreateModalOpen && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
          backdropFilter: 'blur(4px)'
        }}>
          <Paper sx={{ 
            p: 4, 
            minWidth: { xs: 320, sm: 480 }, 
            maxWidth: 600,
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            bgcolor: 'white',
            mx: 2
          }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#1e293b' }}>
              Create New Project
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Project Name"
                value={newProject.name}
                onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
                fullWidth
                placeholder="Enter a descriptive project name..."
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6'
                    }
                  }
                }}
              />
              <TextField
                label="Project Type"
                value={newProject.type}
                onChange={e => setNewProject(p => ({ ...p, type: e.target.value }))}
                fullWidth
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6'
                    }
                  }
                }}
              />
              <TextField
                label="Template Type"
                value={newProject.templateType}
                onChange={e => setNewProject(p => ({ ...p, templateType: e.target.value }))}
                fullWidth
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6'
                    }
                  }
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => setIsCreateModalOpen(false)}
                sx={{
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  borderRadius: 2,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#94a3b8',
                    bgcolor: '#f8fafc'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={async () => {
                  await handleCreateProject();
                  setIsCreateModalOpen(false);
                }}
                disabled={!newProject.name.trim()}
                sx={{
                  bgcolor: '#3b82f6',
                  color: 'white',
                  borderRadius: 2,
                  px: 4,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  '&:hover': {
                    bgcolor: '#2563eb',
                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
                  },
                  '&:disabled': {
                    bgcolor: '#e2e8f0',
                    color: '#94a3b8',
                    boxShadow: 'none'
                  }
                }}
              >
                Create Project
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  )
}

export default Dashboard
