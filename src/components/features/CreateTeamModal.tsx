import React, { useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import { Group as GroupIcon } from "@mui/icons-material";
import type {
  CreateTeamRequest,
  TeamType,
} from "../../types/api/organizations";

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

            {/* Information Note */}
            <Alert severity="info">
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
