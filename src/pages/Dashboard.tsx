import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  Paper,
} from '@mui/material'
import {
  Add as AddIcon,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { ProjectService } from '../services/ProjectService'
import type { Project } from "../types"
import type { CreateProjectDTO } from "../types/dto"
import {
  ProjectStats,
  ProjectControls,
  ProjectCard,
  CreateProjectModal,
  EmptyState,
} from '../components/ui'

interface DashboardProps {
  orgId?: number;
  userId?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ orgId: orgIdProp, userId: userIdProp }) => {
  const { user, isAuthenticated } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'date'>('name');
  const itemsPerPage = 6;

  // Use props if provided, otherwise fallback to localStorage or user context
  const getUserId = () => {
    if (userIdProp) return userIdProp;
    if (user?.userId) return user.userId;
    
    // Try to get from localStorage auth_tokens
    try {
      const authTokens = localStorage.getItem('auth_tokens');
      if (authTokens) {
        const parsed = JSON.parse(authTokens);
        const id = parsed.userId || parsed.user_id;
        if (id) return typeof id === 'number' ? id : parseInt(id);
      }
    } catch (e) {
      console.warn('Failed to parse auth_tokens from localStorage:', e);
    }
    
    // Final fallback
    return parseInt(localStorage.getItem('userId') || '5');
  };

  const getOrgId = () => {
    if (orgIdProp) return orgIdProp;
    
    // Try to get from localStorage
    try {
      const storedOrgId = localStorage.getItem('orgId');
      if (storedOrgId) return parseInt(storedOrgId);
    } catch (e) {
      console.warn('Failed to parse orgId from localStorage:', e);
    }
    
    // Default fallback
    return 1;
  };

  const userId = getUserId();
  const [orgId, setOrgId] = useState(orgIdProp || getOrgId());

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starredProjects, setStarredProjects] = useState<string[]>(['1', '3']);

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
        return;
      }
      
      // Get orgId from multiple sources with fallback
      const currentOrgId = orgId || orgIdProp || parseInt(localStorage.getItem('orgId') || '1');
      
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching projects for user:', userId, 'orgId:', currentOrgId);
        const data = await ProjectService.getAllProjects(userId, currentOrgId, 'scrum');
        console.log('Fetched projects:', data);
        
        // Fetch assigned team information for each project
        const projectsWithTeams = await Promise.all(
          (data || []).map(async (project) => {
            try {
              const assignedTeamId = await ProjectService.getAssignedTeam(
                Number(project.id), 
                project.templateType
              );
              return {
                ...project,
                assignedTeamId
              };
            } catch (error) {
              console.warn(`Failed to fetch assigned team for project ${project.id}:`, error);
              return project;
            }
          })
        );
        
        setProjects(projectsWithTeams);
        
        // Set orgId if it wasn't set before
        if (!orgId && currentOrgId) {
          setOrgId(currentOrgId);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [userId, orgId, orgIdProp, isAuthenticated]);

  // Create project handler
  const handleCreateProject = async (projectData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure we have valid orgId and userId
      const currentOrgId = orgId || orgIdProp || getOrgId();
      const currentUserId = userId;
      
      console.log('Dashboard - Creating project with:', {
        userId: currentUserId,
        orgId: currentOrgId,
        projectData
      });
      
      if (!currentOrgId || !currentUserId) {
        throw new Error('Organization ID or User ID is missing. Please ensure you are properly logged in.');
      }
      
      // Store current context in localStorage for backend to access
      localStorage.setItem('currentUserId', String(currentUserId));
      localStorage.setItem('currentOrgId', String(currentOrgId));
      
      const now = new Date().toISOString();
      
      // Create the complete payload as expected by backend
      const createProjectPayload: CreateProjectDTO = {
        id: null,
        orgId: currentOrgId,
        name: projectData.name,
        type: projectData.type || 'SOFTWARE',
        templateType: projectData.templateType || 'scrum',
        features: projectData.features || ['Login', 'Dashboard', 'Analytics'],
        createdAt: now,
        updatedAt: now,
        createdBy: projectData.createdBy || user?.email || 'Unknown User'
      };
      
      console.log('Complete API payload:', createProjectPayload);
      console.log('Template type:', createProjectPayload.templateType);
      
      const result = await ProjectService.createProject(createProjectPayload, createProjectPayload.templateType);
      console.log('Successfully created project:', result);
      
      // If a team was selected during project creation, assign it to the project
      if (projectData.teamId && projectData.teamId !== '') {
        try {
          const teamIdNumber = parseInt(projectData.teamId);
          const projectIdNumber = Number(result.id);
          
          console.log('Assigning team to newly created project:', {
            projectId: projectIdNumber,
            projectIdType: typeof projectIdNumber,
            templateType: result.templateType,
            teamId: teamIdNumber,
            teamIdType: typeof teamIdNumber,
            originalTeamId: projectData.teamId
          });
          
          const assignments = await ProjectService.assignTeamToProject(
            projectIdNumber,
            result.templateType,
            teamIdNumber
          );
          console.log('Team assigned successfully:', assignments);
          
          // Show success message for team assignment
          console.log(`Team ${projectData.teamId} assigned to project "${result.name}" with ${assignments.length} members`);
        } catch (teamAssignError) {
          console.warn('Failed to assign team to project, but project was created:', teamAssignError);
          // Don't throw error here, project was created successfully
        }
      }
      
      setProjects(prev => [...prev, result]);
      setIsCreateModalOpen(false);
      
      // Update orgId state if it wasn't set before
      if (!orgId && currentOrgId) {
        setOrgId(currentOrgId);
        localStorage.setItem('orgId', String(currentOrgId));
      }
      
    } catch (err: any) {
      console.error('Error creating project:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create project. Please try again.';
      setError(errorMessage);
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

  // Refresh projects data (for when teams are assigned)
  const refreshProjects = async () => {
    if (!isAuthenticated || !userId) return;
    
    const currentOrgId = orgId || orgIdProp || getOrgId();
    try {
      const data = await ProjectService.getAllProjects(userId, currentOrgId, 'scrum');
      
      // Fetch assigned team information for each project
      const projectsWithTeams = await Promise.all(
        (data || []).map(async (project) => {
          try {
            const assignedTeamId = await ProjectService.getAssignedTeam(
              Number(project.id), 
              project.templateType
            );
            return {
              ...project,
              assignedTeamId
            };
          } catch (error) {
            console.warn(`Failed to fetch assigned team for project ${project.id}:`, error);
            return project;
          }
        })
      );
      
      setProjects(projectsWithTeams);
    } catch (err) {
      console.error('Error refreshing projects:', err);
    }
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

  // Filter and sort projects
  const filteredProjects = React.useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (project.key || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || (project.type || '').toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesType;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          // Simple progress calculation
          const aProgress = a.tasks ? (a.tasks.filter(task => task.status === 'Done').length / a.tasks.length) * 100 : 0;
          const bProgress = b.tasks ? (b.tasks.filter(task => task.status === 'Done').length / b.tasks.length) * 100 : 0;
          return bProgress - aProgress;
        case 'date':
          const aDate = a.timeline?.start ? new Date(a.timeline.start).getTime() : 0;
          const bDate = b.timeline?.start ? new Date(b.timeline.start).getTime() : 0;
          return bDate - aDate;
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

  const handleSortChange = (sort: string) => {
    setSortBy(sort as 'name' | 'progress' | 'date');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#FAFBFC',
      p: 3 
    }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4 
        }}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
              Projects
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and organize your projects
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateModalOpen(true)}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
            }}
          >
            Create Project
          </Button>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px' 
          }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Main Content */}
        {!loading && (
          <>
            {/* Statistics */}
            <ProjectStats
              totalProjects={totalProjects}
              totalTasks={totalTasks}
              completedTasks={completedTasks}
              totalTeamMembers={totalTeamMembers}
            />

            {/* Project Controls */}
            <ProjectControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterType={filterType}
              onFilterChange={setFilterType}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              projectCount={filteredProjects.length}
            />

            {/* Projects Grid/List */}
            {filteredProjects.length === 0 ? (
              <EmptyState onCreateProject={() => setIsCreateModalOpen(true)} />
            ) : (
              <>
                <Box sx={{ 
                  display: 'grid',
                  gap: 3,
                  gridTemplateColumns: viewMode === 'grid' ? {
                    xs: '1fr',
                    sm: 'repeat(auto-fill, minmax(350px, 1fr))',
                    lg: 'repeat(auto-fill, minmax(380px, 1fr))'
                  } : '1fr',
                  mb: 4,
                }}>
                  {paginatedProjects.map((project: Project) => (
                    <ProjectCard
                      key={project.id}
                      project={{
                        ...project,
                        id: String(project.id) // Convert to string for consistency
                      }}
                      isStarred={starredProjects.includes(String(project.id))}
                      onToggleStar={toggleStar}
                      onTeamAssigned={refreshProjects}
                    />
                  ))}
                </Box>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(_, page) => setCurrentPage(page)}
                      color="primary"
                    />
                  </Paper>
                )}
              </>
            )}
          </>
        )}

        {/* Create Project Modal */}
        <CreateProjectModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateProject={handleCreateProject}
          loading={loading}
        />
      </Box>
    </Box>
  )
}

export default Dashboard
