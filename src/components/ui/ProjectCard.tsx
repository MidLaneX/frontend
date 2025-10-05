import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import type { Project } from '@/types';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  GroupAdd as GroupAddIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import AssignTeamModal from '../features/AssignTeamModal';
import UpdateProjectModal from '../features/UpdateProjectModal';
import DeleteProjectDialog from '../features/DeleteProjectDialog';

interface ProjectCardProps {
  project: Project;
  isStarred: boolean;
  onToggleStar: (projectId: string, event: React.MouseEvent) => void;
  onTeamAssigned?: () => void; // Callback to refresh project data
  onProjectUpdated?: (updatedProject: Project) => void; // Callback when project is updated
  onProjectDeleted?: () => void; // Callback when project is deleted
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isStarred,
  onToggleStar,
  onTeamAssigned,
  onProjectUpdated,
  onProjectDeleted,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [assignTeamModalOpen, setAssignTeamModalOpen] = useState(false);
  const [updateProjectModalOpen, setUpdateProjectModalOpen] = useState(false);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const getProjectProgress = (project: Project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completed = project.tasks.filter(task => task.status === 'Done').length;
    return Math.round((completed / project.tasks.length) * 100);
  };

  const getProjectStatus = (project: Project) => {
    if (!project.timeline) return 'No Timeline';
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

  const getTeamAssignmentInfo = () => {
    // Check for actual assigned team ID from backend
    const hasAssignedTeam = project.assignedTeamId !== null && project.assignedTeamId !== undefined;
    
    // Fallback to assignedTeams array for backward compatibility
    const assignedTeams = project.assignedTeams || [];
    const teamMembers = project.teamMembers || [];
    
    if (hasAssignedTeam) {
      return {
        hasTeams: true,
        teamsCount: 1,
        membersCount: teamMembers.length,
        primaryTeam: { id: project.assignedTeamId!, name: `Team ${project.assignedTeamId}` },
        displayText: `Team ${project.assignedTeamId}`,
        teamId: project.assignedTeamId
      };
    }
    
    // Fallback to assignedTeams array (legacy)
    if (assignedTeams.length > 0) {
      const totalMembers = assignedTeams.reduce((sum, team) => sum + (team.memberCount || 0), 0);
      return {
        hasTeams: true,
        teamsCount: assignedTeams.length,
        membersCount: totalMembers || teamMembers.length,
        primaryTeam: assignedTeams[0],
        displayText: assignedTeams.length === 1 
          ? assignedTeams[0].name 
          : `${assignedTeams.length} teams`,
        teamId: assignedTeams[0].id
      };
    }
    
    return {
      hasTeams: false,
      teamsCount: 0,
      membersCount: teamMembers.length,
      primaryTeam: null,
      displayText: 'Unassigned',
      teamId: null
    };
  };

  const progress = getProjectProgress(project);
  const status = getProjectStatus(project);
  const teamInfo = getTeamAssignmentInfo();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleAssignTeamClick = () => {
    setMenuAnchor(null);
    setAssignTeamModalOpen(true);
  };

  const handleTeamAssignmentSuccess = () => {
    setAssignTeamModalOpen(false);
    onTeamAssigned?.(); // Refresh project data
  };

  const handleUpdateProjectClick = () => {
    setMenuAnchor(null);
    setUpdateProjectModalOpen(true);
  };

  const handleUpdateProjectSuccess = (updatedProject: Project) => {
    setUpdateProjectModalOpen(false);
    onProjectUpdated?.(updatedProject);
  };

  const handleDeleteProjectClick = () => {
    setMenuAnchor(null);
    setDeleteProjectDialogOpen(true);
  };

  const handleDeleteProjectSuccess = () => {
    setDeleteProjectDialogOpen(false);
    onProjectDeleted?.();
  };

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: '1px solid #E1E4E8',
        backgroundColor: '#FAFBFC',
        '&:hover': {
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          transform: 'translateY(-4px)',
          borderColor: '#CCE0FF',
          backgroundColor: '#FFFFFF',
        },
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: teamInfo.hasTeams 
            ? 'linear-gradient(90deg, #00875A 0%, #36B37E 100%)'
            : 'linear-gradient(90deg, #DFE1E6 0%, #B3BAC5 100%)',
          zIndex: 1
        }
      }}
    >
      <CardActionArea
        component={Link}
        to={`/projects/${project.id}/${project.templateType}`}
        sx={{ height: '100%' }}
      >
        <CardContent sx={{ 
          p: 3, 
          pt: 4, // Extra padding top to account for the colored bar
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ flex: 1, mr: 2 }}>
              <Typography 
                variant="h6" 
                fontWeight={600} 
                sx={{ 
                  mb: 1, 
                  lineHeight: 1.3,
                  color: '#172B4D',
                  fontSize: '1.1rem'
                }}
              >
                {project.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={project.type || 'Software'}
                  size="small"
                  sx={{
                    fontSize: '0.7rem',
                    height: 22,
                    fontWeight: 500,
                    backgroundColor: '#E6F3FF',
                    color: '#0052CC',
                    border: '1px solid #CCE0FF'
                  }}
                />
                <Chip
                  label={project.templateType.toUpperCase()}
                  size="small"
                  sx={{
                    fontSize: '0.7rem',
                    height: 22,
                    fontWeight: 500,
                    backgroundColor: '#F4F5F7',
                    color: '#5E6C84',
                    border: '1px solid #DFE1E6'
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={(e) => onToggleStar(String(project.id), e)}
                sx={{ 
                  color: isStarred ? '#FFAB00' : '#8993A4',
                  '&:hover': {
                    backgroundColor: isStarred ? '#FFF4E6' : '#F4F5F7'
                  }
                }}
              >
                {isStarred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ 
                  color: '#8993A4',
                  '&:hover': {
                    backgroundColor: '#F4F5F7'
                  }
                }}
                onClick={handleMenuClick}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          

          {/* Progress */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: '#F4F5F7',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  backgroundColor: progress === 100 ? '#00875A' : '#0052CC',
                },
              }}
            />
          </Box>

          {/* Timeline */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {project.timeline
                ? `${new Date(project.timeline.start).toLocaleDateString()} - ${new Date(project.timeline.end).toLocaleDateString()}`
                : 'No timeline available'}
            </Typography>
          </Box>

          {/* Team Assignment Section */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Team Assignment
              </Typography>
              {teamInfo.hasTeams && (
                <Typography variant="caption" color="text.secondary">
                  {teamInfo.membersCount} members
                </Typography>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {teamInfo.hasTeams ? (
                <>
                  <GroupIcon sx={{ fontSize: 16, color: '#00875A' }} />
                  <Typography variant="body2" fontWeight={500} color="#00875A">
                    {teamInfo.displayText}
                  </Typography>
                  {teamInfo.teamId && (
                    <Chip 
                      label={`ID: ${teamInfo.teamId}`}
                      size="small"
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        backgroundColor: '#E3FCEF',
                        color: '#00875A'
                      }}
                    />
                  )}
                  {teamInfo.teamsCount > 1 && (
                    <Chip 
                      label={`+${teamInfo.teamsCount - 1} more`}
                      size="small"
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        backgroundColor: '#E3FCEF',
                        color: '#00875A'
                      }}
                    />
                  )}
                </>
              ) : (
                <>
                  <PersonAddIcon sx={{ fontSize: 16, color: '#5E6C84' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {teamInfo.displayText}
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {/* Team Members Avatars */}
          {teamInfo.membersCount > 0 && (
            <Box sx={{ mb: 3 }}>
              <AvatarGroup 
                max={4} 
                sx={{ 
                  '& .MuiAvatar-root': { 
                    width: 28, 
                    height: 28, 
                    fontSize: 12,
                    border: '2px solid #fff',
                    backgroundColor: teamInfo.hasTeams ? '#00875A' : '#5E6C84'
                  },
                  '& .MuiAvatarGroup-avatar': {
                    backgroundColor: '#F4F5F7',
                    color: '#5E6C84',
                    fontSize: '0.7rem'
                  }
                }}
              >
                {project.teamMembers?.slice(0, 4).map((member, index) => (
                  <Tooltip key={index} title={member.name} arrow>
                    <Avatar>
                      {member.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            </Box>
          )}

          {/* Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Status:
              </Typography>
              <Chip
                label={status}
                size="small"
                sx={{
                  fontSize: '0.75rem',
                  height: 20,
                  backgroundColor: `${getStatusColor(status)}15`,
                  color: getStatusColor(status),
                  fontWeight: 500,
                }}
              />
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              {progress}% complete
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: { 
            minWidth: 220,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid #E1E4E8'
          }
        }}
      >
        <MenuItem onClick={handleAssignTeamClick} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <GroupAddIcon fontSize="small" sx={{ color: '#0052CC' }} />
          </ListItemIcon>
          <ListItemText 
            primary={teamInfo.hasTeams ? 'Reassign Team' : 'Assign Team'}
            secondary={teamInfo.hasTeams ? 'Change team assignment' : 'Assign a team to this project'}
            secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleUpdateProjectClick} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: '#0052CC' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Update Project"
            secondary="Edit project name, type, and details"
            secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
          />
        </MenuItem>
        <MenuItem onClick={handleDeleteProjectClick} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: '#DE350B' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Delete Project"
            secondary="Permanently remove this project"
            secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" sx={{ color: '#5E6C84' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Project Settings"
            secondary="Configure project details"
            secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
          />
        </MenuItem>
      </Menu>

      {/* Assign Team Modal */}
      <AssignTeamModal
        open={assignTeamModalOpen}
        onClose={() => setAssignTeamModalOpen(false)}
        projectId={Number(project.id)}
        projectName={project.name}
        templateType={project.templateType}
        onSuccess={handleTeamAssignmentSuccess}
      />

      {/* Update Project Modal */}
      <UpdateProjectModal
        open={updateProjectModalOpen}
        onClose={() => setUpdateProjectModalOpen(false)}
        project={project}
        onSuccess={handleUpdateProjectSuccess}
      />

      {/* Delete Project Dialog */}
      <DeleteProjectDialog
        open={deleteProjectDialogOpen}
        onClose={() => setDeleteProjectDialogOpen(false)}
        project={project}
        onSuccess={handleDeleteProjectSuccess}
      />
    </Card>
  );
};

export default ProjectCard;
