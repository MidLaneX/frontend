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
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import WorkspacesIcon from '@mui/icons-material/Workspaces'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import ViewListIcon from '@mui/icons-material/ViewList'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Link } from 'react-router-dom'
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Fade from '@mui/material/Fade';
import Grow from '@mui/material/Grow';
import Skeleton from '@mui/material/Skeleton';
import type { Project } from "../types";
import { ProjectService } from '@/services/ProjectService';
import { UserService, type UserProfile } from '@/services/UserService';
import { useAuth } from '@/context/AuthContext';

interface DashboardProps {
  orgId?: number;
  userId?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ orgId: orgIdProp, userId: userIdProp }) => {
  const { user, isAuthenticated } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState<'type' | 'template' | 'details'>('type');
  const [selectedProjectType, setSelectedProjectType] = useState<string>('');
  const [selectedTemplateType, setSelectedTemplateType] = useState<string>('');
  
  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'date'>('name');
  const itemsPerPage = 6;
  // Project type and template options
  const projectTypeOptions = [
    { type: 'Classic', img: 'https://img.icons8.com/color/96/briefcase.png' },
    { type: 'Business', img: 'https://img.icons8.com/color/96/business.png' },
    { type: 'Software', img: 'https://img.icons8.com/color/96/source-code.png' }
  ];
  const templateOptions: Record<string, { template: string; img: string }[]> = {
    Software: [
      { template: 'Scrum', img: 'https://img.icons8.com/color/96/agile.png' },
      { template: 'Kanban', img: 'https://img.icons8.com/color/96/kanban.png' },
      { template: 'Waterfall', img: 'https://img.icons8.com/color/96/waterfall.png' }
    ],
    Business: [
      { template: 'Lean', img: 'https://img.icons8.com/color/96/strategy.png' },
      { template: 'Six Sigma', img: 'https://img.icons8.com/color/96/sigma.png' },
      { template: 'Startup', img: 'https://img.icons8.com/color/96/startup.png' }
    ],
    Classic: [
      { template: 'Traditional', img: 'https://img.icons8.com/color/96/organization.png' },
      { template: 'Matrix', img: 'https://img.icons8.com/color/96/matrix.png' },
      { template: 'Functional', img: 'https://img.icons8.com/color/96/functional.png' }
    ]
  };

  // Use props if provided, otherwise fallback
  const userId = userIdProp || user?.userId || parseInt(localStorage.getItem('userId') || '5');
  const [orgId, setOrgId] = useState(orgIdProp);
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
    orgId: orgIdProp || orgId,
    name: '',
    type: '',
    templateType: '',
    description: '',
    teamId: '',
    createdBy: user?.email || user?.username || 'Unknown User'
  });

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      setError('Project name is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Always use the current orgId for project creation
      const projectToCreate = {
        ...newProject,
        orgId: orgId || orgIdProp,
        userId: userId,
        role: role,
        type: selectedProjectType,
        templateType: selectedTemplateType,
        teamId: newProject.teamId,
        createdBy: newProject.createdBy || user?.email || user?.username || 'Unknown User'
      };
      console.log('Creating project:', projectToCreate);
      const result = await ProjectService.createProject(projectToCreate, projectToCreate.templateType);
      console.log('Created project:', result);
      setProjects(prev => [...prev, result]);
      setNewProject({ orgId: orgId || orgIdProp, name: '', type: '', templateType: '', description: '', teamId: '', createdBy: user?.email || user?.username || 'Unknown User' });
      setSelectedProjectType('');
      setSelectedTemplateType('');
      setCreateStep('type');
      setIsCreateModalOpen(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return '#00875A';
      case 'Completed': return '#0052CC';
      case 'Not Started': return '#5E6C84';
      default: return '#5E6C84';
    }
  };

  // Filter and sort projects
  const filteredProjects = React.useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || project.type.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesType;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          return getProjectProgress(b) - getProjectProgress(a);
        case 'date':
          return new Date(b.timeline.start).getTime() - new Date(a.timeline.start).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchQuery, filterType, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, sortBy]);

  return (
    <Box sx={{
      px: { xs: 2, sm: 4, md: 8 },
      py: { xs: 3, sm: 4 },
      bgcolor: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      minHeight: '100vh',
      minWidth: { xs: '100vw', sm: '80vw' },
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(30,60,114,0.1) 0%, rgba(42,82,152,0.1) 100%)',
        zIndex: 0,
      }
    }}>
      {/* Loading State */}
      {loading && (
        <Fade in={loading}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px',
            position: 'relative',
            zIndex: 1,
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress 
                size={60} 
                thickness={4}
                sx={{ 
                  color: 'white',
                  mb: 2,
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  }
                }} 
              />
              <Typography sx={{ 
                color: 'white', 
                fontSize: '18px',
                fontWeight: 500,
                letterSpacing: '0.5px'
              }}>
                ✨ Loading your amazing projects...
              </Typography>
            </Box>
          </Box>
        </Fade>
      )}

      {/* Enhanced Error State */}
      {error && (
        <Grow in={!!error}>
          <Box sx={{ 
            mb: 3, 
            p: 3, 
            bgcolor: 'rgba(255, 255, 255, 0.95)', 
            border: '1px solid #FF5630', 
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(255, 86, 48, 0.2)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            zIndex: 1,
          }}>
            <Typography color="error" sx={{ fontWeight: 500 }}>
              🚨 {error}
            </Typography>
            <Button 
              size="small" 
              onClick={() => setError(null)} 
              sx={{ 
                mt: 1, 
                color: '#FF5630',
                '&:hover': {
                  bgcolor: 'rgba(255, 86, 48, 0.1)'
                }
              }}
            >
              Dismiss
            </Button>
          </Box>
        </Grow>
      )}

      {/* Header Section & Create Project Form */}
      <Box sx={{ mb: 6, width: '100%', maxWidth: '1400px', position: 'relative', zIndex: 1 }}>
        <Fade in={true} timeout={800}>
          <Box sx={{
            width: '100%',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            mb: 4,
            gap: { xs: 3, sm: 0 },
          }}>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #fff, #bbdefb)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '32px', sm: '48px' },
                  mb: 1,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  textShadow: '0 2px 10px rgba(255,255,255,0.3)',
                }}
              >
                🚀 Projects Universe
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                  fontSize: { xs: '16px', sm: '20px' },
                  lineHeight: 1.5,
                  maxWidth: '600px',
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                ✨ Craft extraordinary experiences across teams and workflows with cutting-edge tools.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<RocketLaunchIcon sx={{ fontSize: '22px' }} />}
              onClick={() => setIsCreateModalOpen(true)}
              sx={{
                background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '16px',
                px: 4,
                py: 2,
                fontSize: '16px',
                height: '56px',
                boxShadow: '0 8px 32px rgba(33, 150, 243, 0.4)',
                border: 'none',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2, #1565C0)',
                  boxShadow: '0 12px 40px rgba(33, 150, 243, 0.6)',
                  transform: 'translateY(-2px) scale(1.05)',
                },
                '&:active': {
                  transform: 'translateY(0) scale(1.02)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Create Magic
            </Button>
          </Box>
        </Fade>

        {/* Statistics Cards */}
        <Grow in={true} timeout={1000}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: { xs: 2, sm: 3 },
            mb: 6,
            width: '100%',
          }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                  transform: 'translateY(-8px) scale(1.02)',
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #42A5F5, #1E88E5)', 
                  borderRadius: '16px', 
                  width: 48, 
                  height: 48, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 4px 16px rgba(66, 165, 245, 0.4)',
                }}>
                  <WorkspacesIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 0.5, fontSize: '28px' }}>
                  {totalProjects}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500, fontSize: '14px' }}>
                  🎯 Active Projects
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                  transform: 'translateY(-8px) scale(1.02)',
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #5C6BC0, #3F51B5)', 
                  borderRadius: '16px', 
                  width: 48, 
                  height: 48, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 4px 16px rgba(92, 107, 192, 0.4)',
                }}>
                  <AutoAwesomeIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 0.5, fontSize: '28px' }}>
                  {totalTasks}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500, fontSize: '14px' }}>
                  ⚡ Total Tasks
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                  transform: 'translateY(-8px) scale(1.02)',
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #81C784, #66BB6A)', 
                  borderRadius: '16px', 
                  width: 48, 
                  height: 48, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 4px 16px rgba(129, 199, 132, 0.4)',
                }}>
                  <CheckCircleIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 0.5, fontSize: '28px' }}>
                  {Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500, fontSize: '14px' }}>
                  🎉 Completed
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                  transform: 'translateY(-8px) scale(1.02)',
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #90CAF9, #64B5F6)', 
                  borderRadius: '16px', 
                  width: 48, 
                  height: 48, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 4px 16px rgba(144, 202, 249, 0.4)',
                }}>
                  <PeopleAltIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 0.5, fontSize: '28px' }}>
                  {totalTeamMembers}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500, fontSize: '14px' }}>
                  👥 Team Members
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Grow>
      </Box>

      {/* Enhanced Projects Section */}
      {!loading && !error && (
        <Box sx={{ width: '100%', maxWidth: '1400px', position: 'relative', zIndex: 1 }}>
          <Fade in={true} timeout={1200}>
            <Box>
              {/* Controls Section */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'stretch', md: 'center' },
                mb: 4,
                gap: 2,
                p: 3,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#2C3E50',
                      fontSize: '20px',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    🌟 Recent projects ({filteredProjects.length})
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2, 
                  alignItems: { xs: 'stretch', sm: 'center' } 
                }}>
                  {/* Search */}
                  <TextField
                    placeholder="🔍 Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    sx={{
                      minWidth: 200,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.8)',
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#2196F3',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2196F3',
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#7F8C8D' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  {/* Filter */}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      displayEmpty
                      sx={{
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.8)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2196F3',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2196F3',
                        },
                      }}
                    >
                      <MenuItem value="all">🎯 All Types</MenuItem>
                      <MenuItem value="software">💻 Software</MenuItem>
                      <MenuItem value="business">💼 Business</MenuItem>
                      <MenuItem value="classic">📊 Classic</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {/* Sort */}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'name' | 'progress' | 'date')}
                      sx={{
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.8)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2196F3',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2196F3',
                        },
                      }}
                    >
                      <MenuItem value="name">📝 Name</MenuItem>
                      <MenuItem value="progress">📈 Progress</MenuItem>
                      <MenuItem value="date">📅 Date</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {/* View Mode Toggle */}
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newMode) => newMode && setViewMode(newMode)}
                    size="small"
                    sx={{
                      '& .MuiToggleButton-root': {
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.5)',
                        background: 'rgba(255,255,255,0.5)',
                        '&.Mui-selected': {
                          background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1976D2, #1565C0)',
                          },
                        },
                        '&:hover': {
                          background: 'rgba(255,255,255,0.8)',
                        },
                      },
                    }}
                  >
                    <ToggleButton value="grid" aria-label="grid view">
                      <ViewModuleIcon />
                    </ToggleButton>
                    <ToggleButton value="list" aria-label="list view">
                      <ViewListIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>
            </Box>
          </Fade>
          
          {filteredProjects.length === 0 ? (
            <Grow in={true} timeout={1000}>
              <Box sx={{
                textAlign: 'center',
                py: { xs: 8, sm: 12 },
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                width: '100%',
                mx: 'auto',
              }}>
                <Typography variant="h4" sx={{ 
                  color: '#2C3E50', 
                  mb: 2, 
                  fontWeight: 600, 
                  fontSize: { xs: '20px', sm: '24px' }
                }}>
                  🎨 Ready to create something amazing?
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#7F8C8D', 
                  mb: 4, 
                  fontSize: { xs: '16px', sm: '18px' },
                  maxWidth: '400px',
                  mx: 'auto',
                  lineHeight: 1.6
                }}>
                  ✨ Start your journey by creating your first project and watch the magic unfold!
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<RocketLaunchIcon />}
                  onClick={() => setIsCreateModalOpen(true)}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '16px',
                    px: 4,
                    py: 2,
                    fontSize: '16px',
                    boxShadow: '0 8px 32px rgba(33, 150, 243, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2, #1565C0)',
                      boxShadow: '0 12px 40px rgba(33, 150, 243, 0.6)',
                      transform: 'translateY(-2px) scale(1.05)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Launch Your First Project
                </Button>
              </Box>
            </Grow>
          ) : (
            <Box>
              {/* Projects Grid */}
              <Box sx={{ 
                display: 'grid',
                gap: { xs: 3, sm: 4 },
                gridTemplateColumns: viewMode === 'grid' ? {
                  xs: '1fr',
                  sm: 'repeat(auto-fill, minmax(380px, 1fr))',
                  lg: 'repeat(auto-fill, minmax(420px, 1fr))'
                } : '1fr',
                width: '100%',
                mb: 4,
              }}>
                {paginatedProjects.map((project: Project, index: number) => {
                  const progress = getProjectProgress(project);
                  const status = getProjectStatus(project);
                  const isStarred = starredProjects.includes(project.id);
                  
                  return (
                    <Grow 
                      key={project.id} 
                      in={true} 
                      timeout={600 + (index * 100)}
                      style={{ transformOrigin: '0 0 0' }}
                    >
                      <Card 
                        sx={{
                          borderRadius: '24px',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                          '&:hover': {
                            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                            transform: 'translateY(-8px) scale(1.02)',
                          },
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: status === 'In Progress' ? 'linear-gradient(90deg, #2196F3, #1976D2)' :
                              status === 'Completed' ? 'linear-gradient(90deg, #4CAF50, #388E3C)' : 
                              'linear-gradient(90deg, #90CAF9, #64B5F6)',
                          },
                        }}
                      >
                        <CardActionArea component={Link} to={`/projects/${project.id}`}>
                          <CardContent sx={{ p: 4 }}>
                            {/* Project Header */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <Avatar 
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    background: project.type === 'Software' ? 'linear-gradient(135deg, #667eea, #764ba2)' :
                                      project.type === 'Marketing' ? 'linear-gradient(135deg, #FF6B6B, #4ECDC4)' : 
                                      'linear-gradient(135deg, #4ECDC4, #44A08D)',
                                    mr: 2,
                                    fontSize: 16,
                                    fontWeight: 700,
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                                  }}
                                >
                                  {project.key}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" sx={{ 
                                    fontWeight: 600,
                                    color: '#2C3E50',
                                    fontSize: '18px',
                                    mb: 0.5,
                                    lineHeight: 1.2,
                                  }}>
                                    {project.name}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#7F8C8D', fontSize: '14px' }}>
                                    {project.type} project • {project.key}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title={isStarred ? "Remove from favorites" : "Add to favorites"}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => toggleStar(project.id, e)}
                                    sx={{ 
                                      color: isStarred ? '#FFD700' : '#BDC3C7',
                                      '&:hover': { 
                                        bgcolor: isStarred ? 'rgba(255, 215, 0, 0.1)' : 'rgba(189, 195, 199, 0.1)',
                                        transform: 'scale(1.2)',
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    {isStarred ? <StarIcon /> : <StarBorderIcon />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="More options">
                                  <IconButton size="small" sx={{ color: '#BDC3C7' }}>
                                    <MoreVertIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                            
                            {/* Project Description */}
                            <Typography 
                              variant="body2"
                              sx={{
                                color: '#7F8C8D',
                                mb: 3,
                                lineHeight: 1.5,
                                fontSize: '14px',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {project.description}
                            </Typography>
                            
                            {/* Progress Section */}
                            <Box sx={{ mb: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 600 }}>
                                  📊 Progress
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#2C3E50', fontWeight: 700 }}>
                                  {progress}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                  height: 8,
                                  borderRadius: 8,
                                  bgcolor: 'rgba(189, 195, 199, 0.2)',
                                  '& .MuiLinearProgress-bar': {
                                    background: progress === 100 ? 'linear-gradient(90deg, #4CAF50, #388E3C)' :
                                      progress >= 70 ? 'linear-gradient(90deg, #2196F3, #1976D2)' :
                                      progress >= 30 ? 'linear-gradient(90deg, #42A5F5, #1E88E5)' : 
                                      'linear-gradient(90deg, #90CAF9, #64B5F6)',
                                    borderRadius: 8,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                  },
                                }}
                              />
                            </Box>
                            
                            {/* Timeline */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                              <CalendarTodayIcon sx={{ fontSize: 16, color: '#7F8C8D', mr: 1 }} />
                              <Typography variant="body2" sx={{ color: '#7F8C8D', fontSize: '12px' }}>
                                📅 {new Date(project.timeline.start).toLocaleDateString()} - {new Date(project.timeline.end).toLocaleDateString()}
                              </Typography>
                            </Box>
                            
                            <Divider sx={{ mb: 3, background: 'rgba(189, 195, 199, 0.3)' }} />
                            
                            {/* Footer */}
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
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                  } 
                                }}
                              >
                                {(project.teamMembers || []).map((member: any, memberIndex: number) => (
                                  <Tooltip key={member.name} title={`${member.name} (${member.role})`}>
                                    <Avatar sx={{ 
                                      background: `linear-gradient(135deg, hsl(${memberIndex * 60}, 70%, 60%), hsl(${memberIndex * 60 + 30}, 70%, 70%))` 
                                    }}>
                                      {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                    </Avatar>
                                  </Tooltip>
                                ))}
                              </AvatarGroup>
                              
                              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Chip
                                  label={`${(project.tasks || []).length} tasks`}
                                  size="small"
                                  icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
                                  sx={{
                                    background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(68, 160, 141, 0.2))',
                                    color: '#2C3E50',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    height: 28,
                                    borderRadius: '14px',
                                    '& .MuiChip-icon': { color: '#4ECDC4' }
                                  }}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: status === 'In Progress' ? 'linear-gradient(135deg, #4ECDC4, #44A08D)' :
                                      status === 'Completed' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 
                                      'linear-gradient(135deg, #ffecd2, #fcb69f)',
                                  }} />
                                  <Typography variant="caption" sx={{ 
                                    color: '#2C3E50', 
                                    fontSize: '12px',
                                    fontWeight: 600
                                  }}>
                                    {status}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grow>
                  );
                })}
              </Box>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  mt: 4,
                  p: 3,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(e, page) => setCurrentPage(page)}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: '12px',
                        fontWeight: 600,
                        '&.Mui-selected': {
                          background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1976D2, #1565C0)',
                          },
                        },
                        '&:hover': {
                          background: 'rgba(33, 150, 243, 0.1)',
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Advanced Modal for creating a project */}
      {isCreateModalOpen && (
        <Fade in={isCreateModalOpen}>
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}>
            <Grow in={isCreateModalOpen} timeout={300}>
              <Paper sx={{
                p: { xs: 3, sm: 5 },
                width: { xs: '90vw', sm: 500, md: 600 },
                maxWidth: '95vw',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                position: 'relative',
                zIndex: 2100,
                mx: 'auto',
                my: { xs: 2, sm: 0 },
                overflowY: 'auto',
                maxHeight: { xs: '90vh', sm: '85vh' }
              }}>
                {createStep === 'type' && (
                  <>
                    <Typography variant="h4" sx={{ 
                      mb: 3, 
                      fontWeight: 700,
                      color: '#2C3E50',
                      textAlign: 'center',
                      fontSize: { xs: '24px', sm: '28px' }
                    }}>
                      🎨 Choose Your Project Type
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      mb: 4, 
                      color: '#7F8C8D',
                      textAlign: 'center',
                      fontSize: '16px',
                      lineHeight: 1.6
                    }}>
                      Select the perfect foundation for your amazing project
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mb: 4, flexWrap: 'wrap' }}>
                      {projectTypeOptions.map(opt => (
                        <Button 
                          key={opt.type} 
                          onClick={() => { setSelectedProjectType(opt.type); setCreateStep('template'); }} 
                          sx={{ 
                            p: 3, 
                            borderRadius: '20px', 
                            background: selectedProjectType === opt.type ? 
                              'linear-gradient(135deg, #2196F3, #1976D2)' : 
                              'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))',
                            border: selectedProjectType === opt.type ? 
                              '2px solid #2196F3' : 
                              '2px solid rgba(255,255,255,0.5)',
                            boxShadow: selectedProjectType === opt.type ? 
                              '0 8px 32px rgba(33, 150, 243, 0.4)' : 
                              '0 4px 16px rgba(0,0,0,0.1)',
                            minWidth: 140, 
                            flexDirection: 'column', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            color: selectedProjectType === opt.type ? 'white' : '#2C3E50',
                            '&:hover': {
                              background: selectedProjectType === opt.type ? 
                                'linear-gradient(135deg, #1976D2, #1565C0)' :
                                'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(25, 118, 210, 0.1))',
                              transform: 'translateY(-4px) scale(1.05)',
                              boxShadow: '0 12px 40px rgba(33, 150, 243, 0.3)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          <img src={opt.img} alt={opt.type} style={{ width: 48, height: 48 }} />
                          <Typography sx={{ fontWeight: 600, fontSize: '16px' }}>{opt.type}</Typography>
                        </Button>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => { setIsCreateModalOpen(false); setCreateStep('type'); setSelectedProjectType(''); setSelectedTemplateType(''); }}
                        sx={{
                          borderRadius: '12px',
                          px: 4,
                          py: 1.5,
                          borderColor: '#BDC3C7',
                          color: '#7F8C8D',
                          '&:hover': {
                            borderColor: '#2196F3',
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </>
                )}
                {createStep === 'template' && (
                  <>
                    <Typography variant="h4" sx={{ 
                      mb: 3, 
                      fontWeight: 700,
                      color: '#2C3E50',
                      textAlign: 'center',
                      fontSize: { xs: '24px', sm: '28px' }
                    }}>
                      🛠️ Select Template
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      mb: 4, 
                      color: '#7F8C8D',
                      textAlign: 'center',
                      fontSize: '16px',
                      lineHeight: 1.6
                    }}>
                      Choose the methodology that fits your workflow
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mb: 4, flexWrap: 'wrap' }}>
                      {templateOptions[selectedProjectType]?.map(opt => (
                        <Button 
                          key={opt.template} 
                          onClick={() => { setSelectedTemplateType(opt.template); setCreateStep('details'); }} 
                          sx={{ 
                            p: 3, 
                            borderRadius: '20px', 
                            background: selectedTemplateType === opt.template ? 
                              'linear-gradient(135deg, #5C6BC0, #3F51B5)' : 
                              'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))',
                            border: selectedTemplateType === opt.template ? 
                              '2px solid #5C6BC0' : 
                              '2px solid rgba(255,255,255,0.5)',
                            boxShadow: selectedTemplateType === opt.template ? 
                              '0 8px 32px rgba(92, 107, 192, 0.4)' : 
                              '0 4px 16px rgba(0,0,0,0.1)',
                            minWidth: 140, 
                            flexDirection: 'column', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            color: selectedTemplateType === opt.template ? 'white' : '#2C3E50',
                            '&:hover': {
                              background: selectedTemplateType === opt.template ? 
                                'linear-gradient(135deg, #3F51B5, #303F9F)' :
                                'linear-gradient(135deg, rgba(92, 107, 192, 0.1), rgba(63, 81, 181, 0.1))',
                              transform: 'translateY(-4px) scale(1.05)',
                              boxShadow: '0 12px 40px rgba(92, 107, 192, 0.3)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          <img src={opt.img} alt={opt.template} style={{ width: 48, height: 48 }} />
                          <Typography sx={{ fontWeight: 600, fontSize: '16px' }}>{opt.template}</Typography>
                        </Button>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => setCreateStep('type')}
                        sx={{
                          borderRadius: '12px',
                          px: 4,
                          py: 1.5,
                          borderColor: '#BDC3C7',
                          color: '#7F8C8D',
                          '&:hover': {
                            borderColor: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          }
                        }}
                      >
                        Back
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={() => { setIsCreateModalOpen(false); setCreateStep('type'); setSelectedProjectType(''); setSelectedTemplateType(''); }}
                        sx={{
                          borderRadius: '12px',
                          px: 4,
                          py: 1.5,
                          borderColor: '#BDC3C7',
                          color: '#7F8C8D',
                          '&:hover': {
                            borderColor: '#4ECDC4',
                            backgroundColor: 'rgba(78, 205, 196, 0.1)',
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </>
                )}
                {createStep === 'details' && (
                  <>
                    <Typography variant="h4" sx={{ 
                      mb: 3, 
                      fontWeight: 700,
                      color: '#2C3E50',
                      textAlign: 'center',
                      fontSize: { xs: '24px', sm: '28px' }
                    }}>
                      ✨ Project Details
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      mb: 4, 
                      color: '#7F8C8D',
                      textAlign: 'center',
                      fontSize: '16px',
                      lineHeight: 1.6
                    }}>
                      Fill in the details to bring your project to life
                    </Typography>
                    <TextField
                      label="🎯 Project Name"
                      value={newProject.name}
                      onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
                      fullWidth
                      sx={{ 
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '& fieldset': {
                            borderColor: 'rgba(189, 195, 199, 0.5)',
                          },
                          '&:hover fieldset': {
                            borderColor: '#4ECDC4',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#4ECDC4',
                          },
                        },
                      }}
                    />
                    <TextField
                      label="📝 Description"
                      value={newProject.description}
                      onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                      fullWidth
                      multiline
                      rows={3}
                      sx={{ 
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '& fieldset': {
                            borderColor: 'rgba(189, 195, 199, 0.5)',
                          },
                          '&:hover fieldset': {
                            borderColor: '#4ECDC4',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#4ECDC4',
                          },
                        },
                      }}
                    />
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>👥 Team ID</InputLabel>
                      <Select
                        label="👥 Team ID"
                        value={newProject.teamId}
                        onChange={e => setNewProject(p => ({ ...p, teamId: e.target.value }))}
                        sx={{
                          borderRadius: '12px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(189, 195, 199, 0.5)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#4ECDC4',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#4ECDC4',
                          },
                        }}
                      >
                        {[1,2,3,4,5].map(id => (
                          <MenuItem key={id} value={id}>Team {id}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="👤 Created By"
                      value={newProject.createdBy}
                      onChange={e => setNewProject(p => ({ ...p, createdBy: e.target.value }))}
                      fullWidth
                      sx={{ 
                        mb: 4,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '& fieldset': {
                            borderColor: 'rgba(189, 195, 199, 0.5)',
                          },
                          '&:hover fieldset': {
                            borderColor: '#4ECDC4',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#4ECDC4',
                          },
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        onClick={handleCreateProject}
                        startIcon={<RocketLaunchIcon />}
                        sx={{ 
                          background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                          color: 'white',
                          borderRadius: '12px',
                          px: 4,
                          py: 1.5,
                          fontSize: '16px',
                          fontWeight: 600,
                          boxShadow: '0 8px 32px rgba(255, 107, 107, 0.4)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #FF5252, #26A69A)',
                            boxShadow: '0 12px 40px rgba(255, 107, 107, 0.6)',
                            transform: 'translateY(-2px) scale(1.05)',
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        Create Magic
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={() => setCreateStep('template')}
                        sx={{
                          borderRadius: '12px',
                          px: 4,
                          py: 1.5,
                          borderColor: '#BDC3C7',
                          color: '#7F8C8D',
                          '&:hover': {
                            borderColor: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          }
                        }}
                      >
                        Back
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={() => { setIsCreateModalOpen(false); setCreateStep('type'); setSelectedProjectType(''); setSelectedTemplateType(''); }}
                        sx={{
                          borderRadius: '12px',
                          px: 4,
                          py: 1.5,
                          borderColor: '#BDC3C7',
                          color: '#7F8C8D',
                          '&:hover': {
                            borderColor: '#4ECDC4',
                            backgroundColor: 'rgba(78, 205, 196, 0.1)',
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </>
                )}
              </Paper>
            </Grow>
          </Box>
        </Fade>
      )}
    </Box>
  )
}

export default Dashboard
