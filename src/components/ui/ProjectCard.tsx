import React, { useState, useEffect } from "react";
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
  Skeleton,
} from "@mui/material";
import type { Project } from "@/types";
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
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import AssignTeamModal from "../features/AssignTeamModal";
import UpdateProjectModal from "../features/UpdateProjectModal";
import DeleteProjectDialog from "../features/DeleteProjectDialog";
import { teamsApi } from "@/api/endpoints/teams";

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
  const [teamName, setTeamName] = useState<string>("");
  const [loadingTeamName, setLoadingTeamName] = useState(false);

  // Fetch team name when component mounts or assignedTeamId changes
  useEffect(() => {
    const fetchTeamName = async () => {
      if (!project.assignedTeamId) {
        setTeamName("");
        return;
      }

      setLoadingTeamName(true);
      try {
        // Get orgId from localStorage
        const storedOrgId = localStorage.getItem("orgId");
        if (!storedOrgId) {
          setTeamName(`Team #${project.assignedTeamId}`);
          return;
        }

        const teams = await teamsApi.getTeams(storedOrgId);
        const team = teams.find(
          (t) => String(t.id) === String(project.assignedTeamId)
        );

        if (team && team.team_name) {
          setTeamName(team.team_name);
        } else {
          setTeamName(`Team #${project.assignedTeamId}`);
        }
      } catch (error) {
        console.warn("Failed to fetch team name:", error);
        setTeamName(`Team #${project.assignedTeamId}`);
      } finally {
        setLoadingTeamName(false);
      }
    };

    fetchTeamName();
  }, [project.assignedTeamId]);
  const getProjectProgress = (project: Project) => {
    // Safety check: ensure tasks array exists and has items
    if (!project.tasks || !Array.isArray(project.tasks) || project.tasks.length === 0) {
      return 0;
    }
    
    // Count completed tasks (status === "Done")
    const completed = project.tasks.filter(
      (task) => task.status === "Done"
    ).length;
    
    // Calculate percentage
    const percentage = Math.round((completed / project.tasks.length) * 100);
    
    return percentage;
  };

  const getProjectStatus = (project: Project) => {
    if (!project.timeline) return "No Timeline";
    const now = new Date();
    const start = new Date(project.timeline.start);
    const end = new Date(project.timeline.end);

    if (now < start) return "Not Started";
    if (now > end) return "Completed";
    return "In Progress";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "#00875A";
      case "Completed":
        return "#0052CC";
      case "Not Started":
        return "#5E6C84";
      default:
        return "#5E6C84";
    }
  };

  const getTeamAssignmentInfo = () => {
    // Check for actual assigned team ID from backend
    const hasAssignedTeam =
      project.assignedTeamId !== null && project.assignedTeamId !== undefined;

    // Fallback to assignedTeams array for backward compatibility
    const assignedTeams = project.assignedTeams || [];
    const teamMembers = project.teamMembers || [];

    if (hasAssignedTeam) {
      return {
        hasTeams: true,
        teamsCount: 1,
        membersCount: teamMembers.length,
        primaryTeam: {
          id: project.assignedTeamId!,
          name: teamName || `Team #${project.assignedTeamId}`,
        },
        displayText: teamName || `Team #${project.assignedTeamId}`,
        teamId: project.assignedTeamId,
      };
    }

    // Fallback to assignedTeams array (legacy)
    if (assignedTeams.length > 0) {
      const totalMembers = assignedTeams.reduce(
        (sum, team) => sum + (team.memberCount || 0),
        0,
      );
      return {
        hasTeams: true,
        teamsCount: assignedTeams.length,
        membersCount: totalMembers || teamMembers.length,
        primaryTeam: assignedTeams[0],
        displayText:
          assignedTeams.length === 1
            ? assignedTeams[0].name
            : `${assignedTeams.length} teams`,
        teamId: assignedTeams[0].id,
      };
    }

    return {
      hasTeams: false,
      teamsCount: 0,
      membersCount: teamMembers.length,
      primaryTeam: null,
      displayText: "Unassigned",
      teamId: null,
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
        height: "100%",
        borderRadius: 2.5,
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
        "&:hover": {
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(102, 126, 234, 0.15)",
          transform: "translateY(-4px)",
          border: "1px solid rgba(102, 126, 234, 0.3)",
        },
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: teamInfo.hasTeams
            ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
            : "linear-gradient(90deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)",
          zIndex: 1,
        },
      }}
    >
      <CardActionArea
        component={Link}
        to={`/projects/${project.id}/${project.templateType}`}
        sx={{ height: "100%" }}
      >
        <CardContent
          sx={{
            p: 3,
            pt: 4, // Extra padding top to account for the colored bar
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 3,
            }}
          >
            <Box sx={{ flex: 1, mr: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  lineHeight: 1.3,
                  color: "#1e293b",
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                {project.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={project.type || "Software"}
                  size="small"
                  sx={{
                    fontSize: "0.7rem",
                    height: 22,
                    fontWeight: 600,
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)",
                    color: "#667eea",
                    border: "1px solid rgba(102, 126, 234, 0.25)",
                  }}
                />
                <Chip
                  label={project.templateType.toUpperCase()}
                  size="small"
                  sx={{
                    fontSize: "0.7rem",
                    height: 22,
                    fontWeight: 600,
                    background: "rgba(100, 116, 139, 0.1)",
                    color: "#64748b",
                    border: "1px solid rgba(100, 116, 139, 0.2)",
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={(e) => onToggleStar(String(project.id), e)}
                sx={{
                  color: isStarred ? "#FFAB00" : "#8993A4",
                  "&:hover": {
                    backgroundColor: isStarred ? "#FFF4E6" : "#F4F5F7",
                  },
                }}
              >
                {isStarred ? (
                  <StarIcon fontSize="small" />
                ) : (
                  <StarBorderIcon fontSize="small" />
                )}
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: "#8993A4",
                  "&:hover": {
                    backgroundColor: "#F4F5F7",
                  },
                }}
                onClick={handleMenuClick}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Progress - Only show if project has tasks */}
          {project.tasks && project.tasks.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "#64748b",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                  }}
                >
                  Progress
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: progress === 100 ? "#10b981" : "#667eea",
                  }}
                >
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 1.5,
                  background: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid rgba(100, 116, 139, 0.15)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 1.5,
                    background: progress === 100 
                    ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                    : "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: progress > 0 
                    ? `0 2px 8px ${progress === 100 ? "rgba(16, 185, 129, 0.3)" : "rgba(102, 126, 234, 0.3)"}`
                    : "none",
                },
              }}
            />
            </Box>
          )}

          {/* Timeline */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <CalendarIcon
              sx={{ fontSize: 16, color: "text.secondary", mr: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {project.timeline
                ? `${new Date(project.timeline.start).toLocaleDateString()} - ${new Date(project.timeline.end).toLocaleDateString()}`
                : "No timeline available"}
            </Typography>
          </Box>

          {/* Team Assignment Section */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Team Assignment
              </Typography>
              {teamInfo.hasTeams && (
                <Typography variant="caption" color="text.secondary">
                  {teamInfo.membersCount} members
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {teamInfo.hasTeams ? (
                <>
                  <GroupIcon sx={{ fontSize: 16, color: "#00875A" }} />
                  {loadingTeamName ? (
                    <Skeleton width={120} height={20} />
                  ) : (
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="#00875A"
                    >
                      {teamInfo.displayText}
                    </Typography>
                  )}
                  {teamInfo.teamsCount > 1 && (
                    <Chip
                      label={`+${teamInfo.teamsCount - 1} more`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        backgroundColor: "#E3FCEF",
                        color: "#00875A",
                      }}
                    />
                  )}
                </>
              ) : (
                <>
                  <PersonAddIcon sx={{ fontSize: 16, color: "#5E6C84" }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}
                  >
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
                  "& .MuiAvatar-root": {
                    width: 28,
                    height: 28,
                    fontSize: 12,
                    border: "2px solid #fff",
                    backgroundColor: teamInfo.hasTeams ? "#00875A" : "#5E6C84",
                  },
                  "& .MuiAvatarGroup-avatar": {
                    backgroundColor: "#F4F5F7",
                    color: "#5E6C84",
                    fontSize: "0.7rem",
                  },
                }}
              >
                {project.teamMembers?.slice(0, 4).map((member, index) => (
                  <Tooltip key={index} title={member.name} arrow>
                    <Avatar>{member.name.charAt(0).toUpperCase()}</Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            </Box>
          )}

          {/* Footer */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: "auto",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Status:
              </Typography>
              <Chip
                label={status}
                size="small"
                sx={{
                  fontSize: "0.75rem",
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
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            border: "1px solid #E1E4E8",
          },
        }}
      >
        <MenuItem onClick={handleAssignTeamClick} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <GroupAddIcon fontSize="small" sx={{ color: "#0052CC" }} />
          </ListItemIcon>
          <ListItemText
            primary={teamInfo.hasTeams ? "Reassign Team" : "Assign Team"}
            secondary={
              teamInfo.hasTeams
                ? "Change team assignment"
                : "Assign a team to this project"
            }
            secondaryTypographyProps={{
              variant: "caption",
              color: "text.secondary",
            }}
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleUpdateProjectClick} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: "#0052CC" }} />
          </ListItemIcon>
          <ListItemText
            primary="Update Project"
            secondary="Edit project name, type, and details"
            secondaryTypographyProps={{
              variant: "caption",
              color: "text.secondary",
            }}
          />
        </MenuItem>
        <MenuItem onClick={handleDeleteProjectClick} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: "#DE350B" }} />
          </ListItemIcon>
          <ListItemText
            primary="Delete Project"
            secondary="Permanently remove this project"
            secondaryTypographyProps={{
              variant: "caption",
              color: "text.secondary",
            }}
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" sx={{ color: "#5E6C84" }} />
          </ListItemIcon>
          <ListItemText
            primary="Project Settings"
            secondary="Configure project details"
            secondaryTypographyProps={{
              variant: "caption",
              color: "text.secondary",
            }}
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
