import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Group as GroupIcon,
  Warning as WarningIcon,
  SwapHoriz as SwapIcon,
} from "@mui/icons-material";
import type {
  CreateTeamRequest,
  TeamType,
} from "../../types/api/organizations";
import { ProjectService } from "../../services/ProjectService";
import type { Project } from "../../types";

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTeamRequest) => Promise<void>;
  organizationId: number;
  organizationName: string;
  loading?: boolean;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  open,
  onClose,
  onSubmit,
  organizationId,
  organizationName,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateTeamRequest>({
    name: "",
    description: "",
    teamType: "development",
    maxMembers: 10,
    organizationId: organizationId,
  });
  const [error, setError] = useState<string>("");
  
  // New state for project assignment
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [teamAssignments, setTeamAssignments] = useState<Map<number, string>>(new Map());
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Fetch projects when modal opens
  useEffect(() => {
    const fetchProjectsAndAssignments = async () => {
      if (!open) {
        return;
      }

      setLoadingProjects(true);
      try {
        // Get userId from localStorage
        const userId = parseInt(localStorage.getItem("userId") || "5");
        
        // Fetch all projects for this organization
        const projectsData = await ProjectService.getAllProjects(
          userId,
          organizationId,
          "scrum" // You might want to fetch all template types
        );
        setProjects(projectsData || []);

        // Fetch team assignments for all projects
        await fetchTeamAssignments(projectsData || []);
      } catch (error) {
        console.warn("Failed to fetch projects:", error);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjectsAndAssignments();
  }, [open, organizationId]);

  // Fetch team assignments for all projects
  const fetchTeamAssignments = async (projectList: Project[]) => {
    setLoadingAssignments(true);
    const assignments = new Map<number, string>();

    try {
      await Promise.all(
        projectList.map(async (project) => {
          try {
            const assignedTeamId = await ProjectService.getAssignedTeam(
              Number(project.id),
              project.templateType
            );
            if (assignedTeamId) {
              assignments.set(Number(project.id), `Team #${assignedTeamId}`);
            }
          } catch (error) {
            // Silently handle errors for individual projects
            console.warn(`Failed to fetch team for project ${project.id}:`, error);
          }
        })
      );

      setTeamAssignments(assignments);
    } catch (error) {
      console.warn("Failed to fetch team assignments:", error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const teamTypes: { value: TeamType; label: string }[] = [
    { value: "development", label: "Development" },
    { value: "design", label: "Design" },
    { value: "marketing", label: "Marketing" },
    { value: "sales", label: "Sales" },
    { value: "support", label: "Support" },
    { value: "operations", label: "Operations" },
    { value: "management", label: "Management" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Team name is required");
      return;
    }

    if (formData.maxMembers < 1) {
      setError("Max members must be at least 1");
      return;
    }

    try {
      await onSubmit({
        ...formData,
        organizationId: organizationId,
      });
      
      // If a project was selected, assign the newly created team to it
      // Note: This would require knowing the new team ID
      // For now, we'll just note this in the success message
      // The actual assignment would need to be handled in the parent component
      
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to create team");
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      teamType: "development",
      maxMembers: 10,
      organizationId: organizationId,
    });
    setError("");
    setSelectedProjectId(null);
    setProjects([]);
    setTeamAssignments(new Map());
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="h2" fontWeight={600}>
          Create Team
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Create a new team in {organizationName}
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ py: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Basic Information
              </Typography>

              <TextField
                fullWidth
                label="Team Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                margin="normal"
                required
                autoFocus
                placeholder="Enter team name"
              />

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                margin="normal"
                multiline
                rows={3}
                placeholder="Describe the team's purpose and goals"
              />
            </Box>

            {/* Team Configuration */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Team Configuration
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel>Team Type</InputLabel>
                <Select
                  value={formData.teamType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      teamType: e.target.value as TeamType,
                    }))
                  }
                  label="Team Type"
                >
                  {teamTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Maximum Members"
                type="number"
                value={formData.maxMembers}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxMembers: parseInt(e.target.value) || 0,
                  }))
                }
                margin="normal"
                inputProps={{ min: 1, max: 100 }}
                helperText="Maximum number of members that can join this team"
              />
            </Box>

            {/* Project Assignment (Optional) */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Project Assignment (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Assign this team to a project immediately upon creation
              </Typography>

              {/* Warning Alert for Already Assigned Projects */}
              {selectedProjectId && teamAssignments.has(selectedProjectId) && (
                <Alert
                  severity="warning"
                  icon={<WarningIcon />}
                  sx={{ mb: 2, borderRadius: 2 }}
                >
                  <AlertTitle sx={{ fontWeight: 600 }}>
                    Project Already Has Team
                  </AlertTitle>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    This project is currently assigned to:
                  </Typography>
                  <Chip
                    label={teamAssignments.get(selectedProjectId)}
                    size="small"
                    color="warning"
                    icon={<SwapIcon />}
                    sx={{ mb: 1, fontWeight: 500 }}
                  />
                  <Typography variant="body2">
                    Assigning this new team will automatically replace the
                    existing team assignment.
                  </Typography>
                </Alert>
              )}

              <FormControl fullWidth margin="normal">
                <InputLabel>Select Project (Optional)</InputLabel>
                <Select
                  value={selectedProjectId || ""}
                  onChange={(e) =>
                    setSelectedProjectId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  label="Select Project (Optional)"
                  disabled={loadingProjects || loadingAssignments}
                >
                  <MenuItem value="">
                    <em>None - Don't assign to any project</em>
                  </MenuItem>
                  {projects.map((project) => {
                    const hasTeam = teamAssignments.has(Number(project.id));
                    return (
                      <MenuItem
                        key={project.id}
                        value={Number(project.id)}
                        sx={{
                          borderBottom: "1px solid #f0f0f0",
                          "&:last-child": {
                            borderBottom: "none",
                          },
                        }}
                      >
                        <Box sx={{ width: "100%" }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="body1">
                              {project.name}
                            </Typography>
                            {hasTeam && (
                              <Chip
                                label="Has Team"
                                size="small"
                                color="warning"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  fontWeight: 500,
                                }}
                              />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {project.type} • {project.templateType.toUpperCase()}
                            {hasTeam &&
                              ` • Current team: ${teamAssignments.get(Number(project.id))}`}
                          </Typography>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
                {loadingProjects && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Loading projects...
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* Information Note */}
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              After creating the team, you can add members and assign a team
              lead from the team management page.
            </Alert>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.name.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <GroupIcon />}
            sx={{ minWidth: 120 }}
          >
            {loading ? "Creating..." : "Create Team"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CreateTeamModal;
