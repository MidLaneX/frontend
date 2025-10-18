import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { Project } from "@/types";
import { teamsApi } from "@/api/endpoints/teams";
import type { Team } from "@/types/api/organizations";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreateProject: (project: Omit<Project, "id" | "tasks"> & { teamId?: string }) => Promise<void>;
  loading?: boolean;
  orgId?: number;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  open,
  onClose,
  onCreateProject,
  loading = false,
  orgId,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    type: "Software" as Project["type"],
    startDate: "",
    endDate: "",
    teamMembers: [] as string[],
    teamId: "",
  });
  const [newMember, setNewMember] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      console.log("📂 Modal opened, resetting form");
      setFormData({
        name: "",
        key: "",
        description: "",
        type: "Software",
        startDate: "",
        endDate: "",
        teamMembers: [],
        teamId: "",
      });
      setNewMember("");
      setSubmitStatus({ type: null, message: "" });
      setSubmitting(false);
    }
  }, [open]);

  // Fetch teams when modal opens
  useEffect(() => {
    const fetchTeams = async () => {
      if (!open || !orgId) return;
      
      setLoadingTeams(true);
      try {
        const fetchedTeams = await teamsApi.getTeams(String(orgId));
        console.log("CreateProjectModal - Fetched teams:", fetchedTeams);
        setTeams(fetchedTeams);
      } catch (error) {
        console.error("Failed to fetch teams:", error);
        setTeams([]);
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, [open, orgId]);

  // Auto-close modal after error (success closes immediately)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    
    if (submitStatus.type === "error") {
      console.log("🔔 Auto-close triggered for error");
      // Close modal after 3 seconds for error
      timeoutId = setTimeout(() => {
        console.log("⏰ Auto-close timeout fired, closing modal now");
        handleClose();
      }, 3000);
    }
    
    return () => {
      if (timeoutId) {
        console.log("🧹 Cleaning up auto-close timeout");
        clearTimeout(timeoutId);
      }
    };
  }, [submitStatus.type]); // Watch submitStatus.type specifically

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.key ||
      !formData.startDate ||
      !formData.endDate
    ) {
      return;
    }

    setSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Convert date strings (YYYY-MM-DD) to ISO format for backend
      const startDate = formData.startDate ? new Date(formData.startDate + 'T00:00:00').toISOString() : new Date().toISOString();
      const endDate = formData.endDate ? new Date(formData.endDate + 'T23:59:59').toISOString() : new Date().toISOString();

      const project: Omit<Project, "id" | "tasks"> & { teamId?: string } = {
        name: formData.name,
        key: formData.key.toUpperCase(),
        type: formData.type,
        templateType: 'scrum', // Default template type
        features: [], // Initialize empty features array
        timeline: {
          start: startDate,
          end: endDate,
        },
        teamMembers: formData.teamMembers.map((name) => ({
          name,
          role: "Team Member",
        })),
        teamId: formData.teamId, // Include selected team
      };

      // Debug logging to verify type is captured
      console.log("CreateProjectModal - Project data being sent:", {
        ...project,
        typeDebug: `Type: "${project.type}" (${typeof project.type})`,
        teamIdDebug: `Team ID: "${project.teamId}"`,
      });

      await onCreateProject(project);
      
      console.log("✅ Project created successfully, closing modal");
      // Close immediately on success (like TaskFormDialog does)
      handleClose();
    } catch (error: any) {
      console.error("Failed to create project:", error);
      setSubmitStatus({
        type: "error",
        message: error.message || "Failed to create project. Please try again.",
      });
      // Modal will auto-close after 3 seconds due to useEffect
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Don't allow closing while submitting
    if (submitting) {
      console.log("⚠️ Cannot close modal while submitting");
      return;
    }
    
    console.log("🚪 Manual close triggered");
    setSubmitting(false);
    setFormData({
      name: "",
      key: "",
      description: "",
      type: "Software",
      startDate: "",
      endDate: "",
      teamMembers: [],
      teamId: "",
    });
    setNewMember("");
    setSubmitStatus({ type: null, message: "" });
    onClose();
  };

  const handleAddMember = () => {
    if (newMember.trim() && !formData.teamMembers.includes(newMember.trim())) {
      setFormData((prev) => ({
        ...prev,
        teamMembers: [...prev.teamMembers, newMember.trim()],
      }));
      setNewMember("");
    }
  };

  const handleRemoveMember = (member: string) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((m) => m !== member),
    }));
  };

  const generateKey = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    }
    return words
      .map((word) => word[0])
      .join("")
      .substring(0, 3)
      .toUpperCase();
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      key: prev.key || generateKey(name),
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: "500px",
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
            pb: 1,
          }}
        >
          <Typography variant="h6" sx={{ color: "#172B4D", fontWeight: 600 }}>
            Create New Project
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Success/Error Message */}
        {submitStatus.type && (
          <Alert 
            severity={submitStatus.type} 
            icon={submitStatus.type === "success" ? <CheckCircleIcon /> : undefined}
            sx={{ mb: 3 }}
          >
            {submitStatus.message}
            {submitStatus.type === "success" && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                Closing in 2 seconds...
              </Typography>
            )}
            {submitStatus.type === "error" && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                Closing in 3 seconds...
              </Typography>
            )}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Project Name */}
          <TextField
            fullWidth
            label="Project Name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            variant="outlined"
            disabled={submitting || submitStatus.type !== null}
          />

          {/* Project Key */}
          <TextField
            fullWidth
            label="Project Key"
            value={formData.key}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                key: e.target.value.toUpperCase(),
              }))
            }
            required
            variant="outlined"
            helperText="A unique identifier for your project (e.g., MLC, MAD)"
            inputProps={{ maxLength: 10 }}
            disabled={submitting || submitStatus.type !== null}
          />

          {/* Project Type */}
          <FormControl fullWidth>
            <InputLabel>Project Type</InputLabel>
            <Select
              value={formData.type}
              label="Project Type"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as Project["type"],
                }))
              }
              disabled={submitting || submitStatus.type !== null}
            >
              <MenuItem value="Software">Software</MenuItem>
              <MenuItem value="Business">Business</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
            </Select>
          </FormControl>

          {/* Team Assignment */}
          <FormControl fullWidth>
            <InputLabel>Assign Team (Optional)</InputLabel>
            <Select
              value={formData.teamId}
              label="Assign Team (Optional)"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  teamId: e.target.value,
                }))
              }
              disabled={submitting || submitStatus.type !== null || loadingTeams}
            >
              <MenuItem value="">
                <em>No Team</em>
              </MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={String(team.id)}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
            {loadingTeams && (
              <Typography variant="caption" sx={{ mt: 0.5, color: "#5E6C84" }}>
                Loading teams...
              </Typography>
            )}
          </FormControl>

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            multiline
            rows={3}
            variant="outlined"
            placeholder="Brief description of your project..."
            disabled={submitting || submitStatus.type !== null}
          />

          {/* Timeline */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
              }
              required
              InputLabelProps={{ shrink: true }}
              disabled={submitting || submitStatus.type !== null}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endDate: e.target.value }))
              }
              required
              InputLabelProps={{ shrink: true }}
              disabled={submitting || submitStatus.type !== null}
            />
          </Box>

          {/* Team Members */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: "#5E6C84", fontWeight: 600, mb: 1 }}
            >
              Team Members
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add team member..."
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddMember()}
                disabled={submitting || submitStatus.type !== null}
              />
              <Button
                variant="outlined"
                onClick={handleAddMember}
                disabled={!newMember.trim() || submitting || submitStatus.type !== null}
                sx={{ textTransform: "none" }}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {formData.teamMembers.map((member) => (
                <Chip
                  key={member}
                  label={member}
                  onDelete={() => handleRemoveMember(member)}
                  size="small"
                  sx={{ bgcolor: "#E3FCEF", color: "#00875A" }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleClose} 
          sx={{ textTransform: "none" }}
          disabled={submitting}
        >
          {submitStatus.type ? "Close" : "Cancel"}
        </Button>
        {!submitStatus.type && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !formData.name ||
              !formData.key ||
              !formData.startDate ||
              !formData.endDate ||
              submitting
            }
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              textTransform: "none",
              bgcolor: "#0052CC",
              "&:hover": { bgcolor: "#0747A6" },
            }}
          >
            {submitting ? "Creating..." : "Create Project"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectModal;
