import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { Project } from '../../types';
import type { ProjectDTO } from '../../types/dto';
import { ProjectService } from '../../services/ProjectService';
import { useAuth } from '../../context/AuthContext';

interface UpdateProjectModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  onSuccess: (updatedProject: Project) => void;
}

const UpdateProjectModal: React.FC<UpdateProjectModalProps> = ({
  open,
  onClose,
  project,
  onSuccess
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    createdBy: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        type: project.type || 'Software',
        createdBy: project.createdBy?.toString() || ''
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get current user ID
      const userId = user?.userId || parseInt(localStorage.getItem('userId') || '1');
      
      // Prepare update data matching your backend API
      const updateData: Partial<ProjectDTO> = {
        name: formData.name,
        type: formData.type,
        createdBy: formData.createdBy
      };

      console.log('Updating project with data:', updateData);

      const updatedProject = await ProjectService.updateProject(
        Number(project.id),
        project.templateType,
        userId,
        updateData
      );

      console.log('Project updated successfully:', updatedProject);
      onSuccess(updatedProject);
      handleClose();
    } catch (err: any) {
      console.error('Error updating project:', err);
      setError(err.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: '',
      createdBy: ''
    });
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
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" sx={{ color: '#172B4D', fontWeight: 600 }}>
          Update Project
        </Typography>
        <Button
          onClick={handleClose}
          sx={{ minWidth: 'auto', p: 1 }}
          disabled={loading}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Project Name */}
            <TextField
              fullWidth
              label="Project Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              variant="outlined"
              disabled={loading}
            />

            {/* Project Type */}
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Project Type</InputLabel>
              <Select
                value={formData.type}
                label="Project Type"
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value="Software">Software</MenuItem>
                <MenuItem value="Business">Business</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
              </Select>
            </FormControl>

            {/* Created By */}
            <TextField
              fullWidth
              label="Created By"
              value={formData.createdBy}
              onChange={(e) => setFormData(prev => ({ ...prev, createdBy: e.target.value }))}
              variant="outlined"
              disabled={loading}
              helperText="Who created or owns this project"
            />

            {/* Project Info */}
            <Box sx={{ 
              p: 2, 
              bgcolor: '#F4F5F7', 
              borderRadius: 1,
              border: '1px solid #DFE1E6'
            }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Project ID:</strong> {project.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Template:</strong> {project.templateType}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Organization ID:</strong> {project.orgId}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ color: '#5E6C84' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.name.trim()}
            sx={{
              bgcolor: '#0052CC',
              '&:hover': { bgcolor: '#0747A6' }
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Updating...
              </>
            ) : (
              'Update Project'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UpdateProjectModal;