import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardActionArea,
  CardContent,
  TextField,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormHelperText,
  Chip,
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  Code as SoftwareIcon,
  Dashboard as ClassicIcon,
  Work as ProjectIcon,
  Warning as WarningIcon,
  SwapHoriz as SwapIcon,
} from "@mui/icons-material";
import { teamsApi } from "@/api/endpoints/teams";
import { ProjectService } from "@/services/ProjectService";
import type { Team } from "@/types/api/organizations";

interface TeamAssignment {
  teamId: string;
  projectId: number;
  projectName: string;
}

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreateProject: (projectData: any) => void;
  loading: boolean;
  orgId: number;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  open,
  onClose,
  onCreateProject,
  loading,
  orgId,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedType, setSelectedType] = useState<
    "agile" | "waterfall" | "hybrid" | ""
  >("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    teamId: "",
  });
  
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
    if (open && orgId) {
      fetchTeams();
      fetchTeamAssignments();
    }
  }, [open, orgId]);

  const fetchTeams = async () => {
    setLoadingTeams(true);
    setTeamsError(null);
    try {
      const data = await teamsApi.getTeams(String(orgId));
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
      const userId = parseInt(localStorage.getItem("userId") || "5");
      
      // Fetch all projects to check team assignments
      const projects = await ProjectService.getAllProjects(userId, orgId, "scrum");
      
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

  const handleTeamChange = (teamId: string) => {
    setProjectData((prev) => ({
      ...prev,
      teamId: teamId,
    }));
    
    // Check if this team is already assigned to another project
    if (teamId && teamAssignments.has(teamId)) {
      const assignment = teamAssignments.get(teamId);
      if (assignment) {
        setShowReassignWarning(true);
        setSelectedTeamInfo(assignment);
      }
    } else {
      setShowReassignWarning(false);
      setSelectedTeamInfo(null);
    }
  };

  const getTeamAssignmentStatus = (teamId: string) => {
    const assignment = teamAssignments.get(teamId);
    if (!assignment) return null;
    
    // If assigned to a project, show that project name
    return { type: 'assigned', text: `Assigned to: ${assignment.projectName}`, color: 'warning' };
  };

  const steps = ["Select Type", "Project Details"];

  // Each project type has ONLY ONE template
  const projectTypes = [
    {
      type: "Software",
      template: "scrum",
      description: "Agile development with Scrum methodology",
      icon: SoftwareIcon,
      color: "#0052CC",
    },
    {
      type: "Business",
      template: "startup",
      description: "Startup and business strategy projects",
      icon: BusinessIcon,
      color: "#00875A",
    },
    {
      type: "Classic",
      template: "traditional",
      description: "Traditional project management approach",
      icon: ClassicIcon,
      color: "#6554C0",
    },
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleTypeSelect = (type: string, template: string) => {
    setSelectedType(type as "agile" | "waterfall" | "hybrid" | "");
    setSelectedTemplate(template);
    handleNext(); // Skip template selection, go directly to project details
  };

  const handleCreate = () => {
    const finalProjectData = {
      ...projectData,
      type: selectedType,
      templateType: selectedTemplate,
    };
    onCreateProject(finalProjectData);
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedType("");
    setSelectedTemplate("");
    setProjectData({ name: "", description: "", teamId: "" });
    setShowReassignWarning(false);
    setSelectedTeamInfo(null);
    onClose();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, textAlign: "center" }}
            >
              Choose the type of project you want to create
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {projectTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card
                    key={type.type}
                    sx={{
                      border: "1px solid #DFE1E6",
                      "&:hover": {
                        borderColor: type.color,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <CardActionArea onClick={() => handleTypeSelect(type.type, type.template)}>
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 1,
                              backgroundColor: `${type.color}15`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <IconComponent
                              sx={{ color: type.color, fontSize: 24 }}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="h6" fontWeight={600}>
                                {type.type}
                              </Typography>
                              <Chip 
                                label={type.template.toUpperCase()} 
                                size="small"
                                sx={{ 
                                  height: 20,
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  bgcolor: `${type.color}15`,
                                  color: type.color,
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {type.description}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              Fill in the project details
            </Typography>
            <TextField
              label="Project Name"
              value={projectData.name}
              onChange={(e) =>
                setProjectData((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={projectData.description}
              onChange={(e) =>
                setProjectData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              fullWidth
              multiline
              rows={3}
            />
            
            {/* Reassignment Warning - Modern Design */}
            {showReassignWarning && selectedTeamInfo && (
              <Alert 
                severity="warning" 
                icon={<SwapIcon />}
                sx={{ 
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
                    Creating this project with this team will automatically remove the team from <strong>{selectedTeamInfo.projectName}</strong>.
                  </Typography>
                </Box>
              </Alert>
            )}
            
            {/* Team Selection Dropdown */}
            <FormControl fullWidth>
              <InputLabel id="team-select-label">
                Select Team (Optional)
              </InputLabel>
              <Select
                labelId="team-select-label"
                value={projectData.teamId}
                onChange={(e) => handleTeamChange(e.target.value)}
                label="Select Team (Optional)"
                disabled={loadingTeams}
              >
                <MenuItem value="">
                  <em>None (assign later)</em>
                </MenuItem>
                {teams.map((team) => {
                  const assignmentStatus = getTeamAssignmentStatus(team.id);
                  const isAssigned = assignmentStatus?.type === 'assigned';
                  
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
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, flex: 1 }}>
                          {team.team_name}
                        </Typography>
                        {isAssigned && (
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
                        {isAssigned && assignmentStatus && (
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
              {!loadingTeams && !teamsError && (
                <FormHelperText>
                  Select a team to assign to this project
                </FormHelperText>
              )}
            </FormControl>
          </Box>
        );

      default:
        return null;
    }
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
          minHeight: 500,
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ProjectIcon sx={{ color: "#0052CC" }} />
            <Typography variant="h6" fontWeight={600}>
              Create Project
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={activeStep === 0 ? handleClose : handleBack}
          sx={{ textTransform: "none" }}
        >
          {activeStep === 0 ? "Cancel" : "Back"}
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={loading || !projectData.name.trim()}
            sx={{ textTransform: "none" }}
          >
            {loading ? "Creating..." : "Create Project"}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectModal;
