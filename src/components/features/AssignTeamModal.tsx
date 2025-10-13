import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import { ProjectService } from "../../services/ProjectService";
import type { UserProjectDTO } from "../../types/dto";

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
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      handleReset();
    }
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

        {!success && (
          <TextField
            label="Team ID"
            type="number"
            value={selectedTeamId || ""}
            onChange={(e) =>
              setSelectedTeamId(
                e.target.value ? parseInt(e.target.value) : null,
              )
            }
            disabled={loading}
            fullWidth
            sx={{ mb: 2 }}
            helperText="Enter the ID of the team you want to assign to this project"
            InputProps={{
              inputProps: { min: 1 },
            }}
          />
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
