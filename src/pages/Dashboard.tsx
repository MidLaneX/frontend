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

  // Use props if provided, otherwise fallback
  const userId = userIdProp || user?.userId || parseInt(localStorage.getItem('userId') || '5');
  const [orgId, setOrgId] = useState(orgIdProp);

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
      
      // Get orgId from multiple sources with fallback
      const currentOrgId = orgId || orgIdProp || parseInt(localStorage.getItem('orgId') || '1');
      
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching projects for user:', userId, 'orgId:', currentOrgId);
        const data = await ProjectService.getAllProjects(userId, currentOrgId, 'scrum');
        console.log('Fetched projects:', data);
        setProjects(data || []);
        
        // Set orgId if it wasn't set before
        if (!orgId && currentOrgId) {
          setOrgId(currentOrgId);
        }
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
  }, [userId, orgId, orgIdProp, isAuthenticated]);

  // Create project handler
  const handleCreateProject = async (projectData: any) => {
    setLoading(true);
    setError(null);
    try {
      const projectToCreate = {
        ...projectData,
        orgId: orgId || orgIdProp,
        userId: userId,
        role: 'ADMIN',
        createdBy: projectData.createdBy || user?.email || 'Unknown User'
      };
      console.log('Creating project:', projectToCreate);
      const result = await ProjectService.createProject(projectToCreate, projectToCreate.templateType);
      console.log('Created project:', result);
      setProjects(prev => [...prev, result]);
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

  // Filter and sort projects
  const filteredProjects = React.useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (project.description || '').toLowerCase().includes(searchQuery.toLowerCase());
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
