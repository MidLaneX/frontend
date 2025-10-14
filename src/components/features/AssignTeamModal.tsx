import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  AlertTitle,
} from "@mui/material";
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  SwapHoriz as SwapIcon,
} from "@mui/icons-material";
import { ProjectService } from "../../services/ProjectService";
import { teamsApi } from "@/api/endpoints/teams";
import type { UserProjectDTO } from "../../types/dto";
import type { Team } from "@/types/api/organizations";

interface TeamAssignment {
  teamId: string;
  projectId: number;
  projectName: string;
}

interface AssignTeamModalProps {
  open: boolean;
  onClose: () => void;
  projectId: number;
  projectName: string;
  templateType: string;
  onSuccess?: (assignments: UserProjectDTO[]) => void;
}

const AssignTeamModal: React.FC<AssignTeamModalProps> = ({
  open,
  onClose,
  projectId,
  projectName,
  templateType,
  onSuccess,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<UserProjectDTO[] | null>(null);

  // Teams state and fetching
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  
  // Team assignments tracking
  const [teamAssignments, setTeamAssignments] = useState<Map<string, TeamAssignment>>(new Map());
  const [showReassignWarning, setShowReassignWarning] = useState(false);
  const [selectedTeamInfo, setSelectedTeamInfo] = useState<TeamAssignment | null>(null);

  // Fetch teams when modal opens
  useEffect(() => {
    if (open) {
      fetchTeams();
      fetchTeamAssignments();
    }
  }, [open]);

  const fetchTeams = async () => {
    setLoadingTeams(true);
    setTeamsError(null);
    try {
      // Get orgId from localStorage
      const orgId = localStorage.getItem("orgId") || "1";
      const data = await teamsApi.getTeams(orgId);
      setTeams(data);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      setTeamsError("Failed to load teams");
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchTeamAssignments = async () => {
    try {
      const orgId = localStorage.getItem("orgId") || "1";
      const userId = parseInt(localStorage.getItem("userId") || "5");
      
      // Fetch all projects to check team assignments
      const projects = await ProjectService.getAllProjects(userId, parseInt(orgId), "scrum");
      
      const assignments = new Map<string, TeamAssignment>();
      
      // Check each project for assigned team
      await Promise.all(
        projects.map(async (project) => {
          try {
            const assignedTeamId = await ProjectService.getAssignedTeam(
              Number(project.id),
              project.templateType
            );
            
            if (assignedTeamId) {
              assignments.set(String(assignedTeamId), {
                teamId: String(assignedTeamId),
                projectId: Number(project.id),
                projectName: project.name,
              });
            }
          } catch (error) {
            // Ignore errors for individual projects
          }
        })
      );
      
      setTeamAssignments(assignments);
    } catch (error) {
      console.error("Failed to fetch team assignments:", error);
    }
  };

  const handleAssignTeam = async () => {
    if (!selectedTeamId) {
      setError("Please select a team");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const assignments = await ProjectService.assignTeamToProject(
        projectId,
        templateType,
        selectedTeamId,
      );

      setSuccess(assignments);
      onSuccess?.(assignments);

      // Auto-close after 2 seconds on success
      setTimeout(() => {
        onClose();
        handleReset();
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to assign team";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedTeamId(null);
    setError(null);
    setSuccess(null);
    setShowReassignWarning(false);
    setSelectedTeamInfo(null);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      handleReset();
    }
  };

  const handleTeamChange = (teamId: string | number) => {
    const numericTeamId = teamId ? parseInt(String(teamId)) : null;
    setSelectedTeamId(numericTeamId);
    
    // Check if this team is already assigned to another project
    if (numericTeamId && teamAssignments.has(String(numericTeamId))) {
      const assignment = teamAssignments.get(String(numericTeamId));
      
      // Only show warning if it's assigned to a DIFFERENT project
      if (assignment && assignment.projectId !== projectId) {
        setShowReassignWarning(true);
        setSelectedTeamInfo(assignment);
      } else {
        setShowReassignWarning(false);
        setSelectedTeamInfo(null);
      }
    } else {
      setShowReassignWarning(false);
      setSelectedTeamInfo(null);
    }
  };

  const getTeamAssignmentStatus = (teamId: string) => {
    const assignment = teamAssignments.get(teamId);
    if (!assignment) return null;
    
    // If this team is assigned to the current project, show "Current Team"
    if (assignment.projectId === projectId) {
      return { type: 'current', text: 'Current Team', color: 'success' };
    }
    
    // If assigned to another project, show that project name
    return { type: 'assigned', text: `Assigned to: ${assignment.projectName}`, color: 'warning' };
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Team to Project</DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Assign a team to <strong>{projectName}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Template: {templateType}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Successfully assigned team! {success.length} team member(s) added to
            the project.
          </Alert>
        )}

        {/* Reassignment Warning - Modern Design */}
        {!success && showReassignWarning && selectedTeamInfo && (
          <Alert 
            severity="warning" 
            icon={<SwapIcon />}
            sx={{ 
              mb: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'warning.main',
              '& .MuiAlert-icon': {
                fontSize: 28,
              }
            }}
          >
            <AlertTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SwapIcon sx={{ fontSize: 20 }} />
              Team Reassignment Notice
            </AlertTitle>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                This team is currently assigned to:
              </Typography>
              <Chip
                label={selectedTeamInfo.projectName}
                color="warning"
                variant="outlined"
                size="small"
                sx={{ 
                  fontWeight: 600,
                  mb: 1
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Assigning this team to <strong>{projectName}</strong> will automatically remove it from <strong>{selectedTeamInfo.projectName}</strong>.
              </Typography>
            </Box>
          </Alert>
        )}

        {!success && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="assign-team-select-label">
              Select Team
            </InputLabel>
            <Select
              labelId="assign-team-select-label"
              value={selectedTeamId || ""}
              onChange={(e) => handleTeamChange(e.target.value)}
              label="Select Team"
              disabled={loading || loadingTeams}
            >
              <MenuItem value="">
                <em>Select a team</em>
              </MenuItem>
              {teams.map((team) => {
                const assignmentStatus = getTeamAssignmentStatus(team.id);
                const isCurrentTeam = assignmentStatus?.type === 'current';
                const isAssignedElsewhere = assignmentStatus?.type === 'assigned';
                
                return (
                  <MenuItem 
                    key={team.id} 
                    value={team.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      py: 1.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                      ...(isCurrentTeam && {
                        bgcolor: 'success.50',
                        '&:hover': {
                          bgcolor: 'success.100',
                        },
                      }),
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, flex: 1 }}>
                        {team.team_name}
                      </Typography>
                      {isCurrentTeam && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Current Team"
                          size="small"
                          color="success"
                          sx={{ 
                            height: 24,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        />
                      )}
                      {isAssignedElsewhere && (
                        <Chip
                          icon={<WarningIcon />}
                          label="Assigned"
                          size="small"
                          color="warning"
                          sx={{ 
                            height: 24,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      {team.memberCount && (
                        <Typography variant="caption" color="text.secondary">
                          {team.memberCount} {team.memberCount === 1 ? 'member' : 'members'}
                        </Typography>
                      )}
                      {isAssignedElsewhere && assignmentStatus && (
                        <>
                          <Typography variant="caption" color="text.secondary">•</Typography>
                          <Typography 
                            variant="caption" 
                            color="warning.main"
                            sx={{ fontWeight: 500 }}
                          >
                            {assignmentStatus.text}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
            {loadingTeams && (
              <FormHelperText>
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={16} />
                  Loading teams...
                </Box>
              </FormHelperText>
            )}
            {teamsError && (
              <FormHelperText error>{teamsError}</FormHelperText>
            )}
            {!loadingTeams && !teamsError && teams.length === 0 && (
              <FormHelperText>
                No teams available. Please create a team first.
              </FormHelperText>
            )}
            {!loadingTeams && !teamsError && teams.length > 0 && (
              <FormHelperText>
                Select a team to assign to this project
              </FormHelperText>
            )}
          </FormControl>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {success ? "Close" : "Cancel"}
        </Button>
        {!success && (
          <Button
            onClick={handleAssignTeam}
            variant="contained"
            disabled={loading || !selectedTeamId}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Assigning..." : "Assign Team"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AssignTeamModal;
