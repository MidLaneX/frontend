import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import type { Project } from "../../types";
import { ProjectService } from "../../services/ProjectService";
import { useAuth } from "../../context/AuthContext";

interface DeleteProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  onSuccess: () => void;
}

const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  open,
  onClose,
  project,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user ID
      const userId =
        user?.userId || parseInt(localStorage.getItem("userId") || "1");

      console.log("Deleting project:", {
        id: project.id,
        templateType: project.templateType,
        userId,
      });

      await ProjectService.deleteProject(
        Number(project.id),
        project.templateType,
        userId,
      );

      console.log("Project deleted successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error deleting project:", err);
      setError(err.message || "Failed to delete project");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
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
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          color: "#DE350B",
          pb: 1,
        }}
      >
        <WarningIcon sx={{ mr: 1, fontSize: 24 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Delete Project
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this project? This action cannot be
            undone.
          </Typography>

          {/* Project Details */}
          <Box
            sx={{
              p: 2,
              bgcolor: "#FFEBE6",
              borderRadius: 1,
              border: "1px solid #FFBDAD",
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Project:</strong> {project.name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Type:</strong> {project.type || "Not specified"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Template:</strong> {project.templateType}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Project ID:</strong> {project.id}
            </Typography>
            <Typography variant="body2">
              <strong>Created By:</strong> {project.createdBy || "Unknown"}
            </Typography>
          </Box>
        </Box>

        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Warning:</strong> Deleting this project will remove all
            associated data, tasks, and team assignments. This action requires
            administrator privileges.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ color: "#5E6C84" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
          sx={{
            bgcolor: "#DE350B",
            color: "white",
            "&:hover": { bgcolor: "#BF2600" },
            "&:disabled": {
              bgcolor: "#F4F5F7",
              color: "#A5ADBA",
            },
          }}
        >
          {loading ? "Deleting..." : "Delete Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteProjectDialog;
