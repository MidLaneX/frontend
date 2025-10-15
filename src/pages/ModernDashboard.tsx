import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Alert,
  Fade,
  Stack,
  Divider,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Business as OrganizationIcon,
  Group as TeamIcon,
  Folder as ProjectIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  TrendingUp,
  People,
  Dashboard as DashboardIcon,
  AccessTime,
  ArrowForward,
  Star,
  Launch,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { organizationsApi } from '@/api/endpoints/organizations';
import { teamsApi } from '@/api/endpoints/teams';
// TODO: Will be used when projects API is integrated
// import { projectsApi } from '@/api/endpoints/projects';
import { useAuth } from '@/context/AuthContext';
import type { Organization } from '@/types/api/organizations';
import type { Team } from '@/types/api/organizations';

interface DashboardStats {
  totalOrganizations: number;
  totalTeams: number;
  totalProjects: number;
  recentActivity: number;
}

interface RecentProject {
  id: number;
  name: string;
  description: string;
  organizationName: string;
  teamName?: string;
  progress: number;
  status: 'active' | 'completed' | 'on-hold';
  lastActivity: string;
  memberCount: number;
  templateType: string;
}

const ModernDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    totalTeams: 0,
    totalProjects: 0,
    recentActivity: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  // TODO: Will be used for project menu interactions when projects are integrated
  // const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch organizations
      const orgsData = await organizationsApi.getAllUserOrganizations();
      setOrganizations(orgsData);

      // Fetch teams for all organizations
      let allTeams: Team[] = [];
      for (const org of orgsData) {
        try {
          const teamsData = await teamsApi.getTeams(org.id);
          allTeams = [...allTeams, ...teamsData];
        } catch (err) {
          console.warn(`Failed to fetch teams for org ${org.id}:`, err);
        }
      }
      setTeams(allTeams);

      // TODO: Fetch recent projects from API using userId from localStorage
      // const userId = localStorage.getItem('userId');
      // const projectsData = await projectsApi.getUserProjects(userId);
      // setRecentProjects(projectsData);
      setRecentProjects([]);

      // Calculate stats
      setStats({
        totalOrganizations: orgsData.length,
        totalTeams: allTeams.length,
        totalProjects: 0, // Will be updated when projects API is integrated
        recentActivity: 12,
      });

    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // TODO: Restore when projects are integrated
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, _itemId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    // setSelectedItem(itemId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    // setSelectedItem(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00875A';
      case 'completed': return '#0052CC';
      case 'on-hold': return '#FF8B00';
      default: return '#5E6C84';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'on-hold': return 'On Hold';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width={300} height={60} />
            <Skeleton variant="text" width={500} height={30} sx={{ mt: 1 }} />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
              </Box>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(66.66% - 16px)' } }}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(33.33% - 16px)' } }}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        pt: 4,
        pb: 6,
      }}
    >
      <Container maxWidth="xl">
        {error && (
          <Fade in={!!error}>
            <Alert 
              severity="error" 
              sx={{ mb: 4 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 3,
                boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
              }}
            >
              <DashboardIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  color: 'text.primary',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  letterSpacing: '-0.02em',
                  mb: 0.5,
                }}
              >
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 400,
                  fontSize: '1.1rem',
                }}
              >
                Here's what's happening with your projects and teams
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 6, flexWrap: 'wrap' }}>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <Card 
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  transform: 'translate(30px, -30px)',
                },
              }}
            >
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <OrganizationIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalOrganizations}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, opacity: 0.9 }}>
                  Organizations
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                  Active workspaces
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <Card 
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #00875A 0%, #006644 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 135, 90, 0.3)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  transform: 'translate(30px, -30px)',
                },
              }}
            >
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <TeamIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalTeams}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, opacity: 0.9 }}>
                  Teams
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                  Collaborative groups
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <Card 
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(156, 39, 176, 0.3)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  transform: 'translate(30px, -30px)',
                },
              }}
            >
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <ProjectIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalProjects}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, opacity: 0.9 }}>
                  Projects
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                  Active initiatives
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <Card 
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #ff5722 0%, #e64a19 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(255, 87, 34, 0.3)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  transform: 'translate(30px, -30px)',
                },
              }}
            >
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <TrendingUp sx={{ fontSize: 40, opacity: 0.9 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.recentActivity}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, opacity: 0.9 }}>
                  Recent Activity
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                  This week
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {/* Recent Projects */}
          <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(66.66% - 16px)' } }}>
            <Card 
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ProjectIcon sx={{ fontSize: 24, color: 'primary.main', mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Recent Projects
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    View All
                  </Button>
                </Box>
              </Box>
              
              <Box sx={{ p: 0 }}>
                {recentProjects.length > 0 ? (
                  recentProjects.map((project, index) => (
                    <Box 
                      key={project.id}
                      sx={{ 
                        p: 3,
                        borderBottom: index < recentProjects.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => navigate(`/projects/${project.id}/${project.templateType}`)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ flex: 1, mr: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 700, 
                                color: 'text.primary',
                                mr: 2,
                              }}
                            >
                              {project.name}
                            </Typography>
                            <Chip
                              label={getStatusLabel(project.status)}
                              size="small"
                              sx={{
                                bgcolor: getStatusColor(project.status),
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                          </Box>
                          
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'text.secondary',
                              mb: 2,
                              lineHeight: 1.5,
                            }}
                          >
                            {project.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <OrganizationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {project.organizationName}
                              </Typography>
                            </Box>
                            {project.teamName && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TeamIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {project.teamName}
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <People sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {project.memberCount} members
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  Progress
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                  {project.progress}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={project.progress}
                                sx={{ 
                                  height: 6, 
                                  borderRadius: 3,
                                  bgcolor: 'action.hover',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: getStatusColor(project.status),
                                    borderRadius: 3,
                                  },
                                }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AccessTime sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {project.lastActivity}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuClick(e, project.id.toString());
                          }}
                          sx={{ ml: 1 }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <ProjectIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                      No projects yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                      Create your first project to get started with managing your work
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      component={Link}
                      to="/organizations"
                      sx={{ 
                        textTransform: 'none',
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)',
                        }
                      }}
                    >
                      Create Project
                    </Button>
                  </Box>
                )}
              </Box>
            </Card>
          </Box>

          {/* Organizations & Teams */}
          <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(33.33% - 16px)' } }}>
            <Stack spacing={3}>
              {/* Organizations */}
              <Card 
                sx={{ 
                  borderRadius: 3,
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <OrganizationIcon sx={{ fontSize: 20, color: 'primary.main', mr: 1.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                        Organizations
                      </Typography>
                    </Box>
                    <Button
                      variant="text"
                      size="small"
                      component={Link}
                      to="/organizations"
                      endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                      sx={{ 
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        minWidth: 'auto',
                      }}
                    >
                      View All
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ p: 2 }}>
                  {organizations.slice(0, 3).map((org) => (
                    <Box 
                      key={org.id}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      component={Link}
                      to={`/organizationpage/${org.id}`}
                    >
                      <Avatar 
                        sx={{ 
                          width: 36, 
                          height: 36, 
                          bgcolor: 'primary.main',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          mr: 2,
                        }}
                      >
                        {org.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {org.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            display: 'block',
                          }}
                        >
                          {org.description || 'No description'}
                        </Typography>
                      </Box>
                      <Launch sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Box>
                  ))}
                  
                  {organizations.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        No organizations yet
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        component={Link}
                        to="/organizations"
                        sx={{ 
                          textTransform: 'none',
                          borderRadius: 2,
                        }}
                      >
                        Create Organization
                      </Button>
                    </Box>
                  )}
                </Box>
              </Card>

              {/* Teams */}
              <Card 
                sx={{ 
                  borderRadius: 3,
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TeamIcon sx={{ fontSize: 20, color: 'success.main', mr: 1.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                        Your Teams
                      </Typography>
                    </Box>
                    <Button
                      variant="text"
                      size="small"
                      endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                      sx={{ 
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        minWidth: 'auto',
                      }}
                    >
                      View All
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ p: 2 }}>
                  {teams.slice(0, 4).map((team) => (
                    <Box 
                      key={team.id}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: 'success.main',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          mr: 2,
                        }}
                      >
                        {team.team_name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '0.875rem',
                          }}
                        >
                          {team.team_name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            display: 'block',
                          }}
                        >
                          {team.memberCount || 0} members
                        </Typography>
                      </Box>
                      {team.leadName && (
                        <Tooltip title={`Team Lead: ${team.leadName}`}>
                          <Star sx={{ fontSize: 14, color: 'warning.main' }} />
                        </Tooltip>
                      )}
                    </Box>
                  ))}
                  
                  {teams.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        No teams yet
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        sx={{ 
                          textTransform: 'none',
                          borderRadius: 2,
                        }}
                      >
                        Join Team
                      </Button>
                    </Box>
                  )}
                </Box>
              </Card>
            </Stack>
          </Box>
        </Box>
      </Container>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 180,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }
        }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.875rem' }}>
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.875rem' }}>
          Edit Project
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.875rem', color: 'error.main' }}>
          Archive
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ModernDashboard;