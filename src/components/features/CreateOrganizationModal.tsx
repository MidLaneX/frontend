import React, { useState } from 'react';
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
} from '@mui/material';
import type { CreateOrganizationRequest } from '../../types/api/organizations';

interface CreateOrganizationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOrganizationRequest) => Promise<void>;
  loading?: boolean;
}

const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateOrganizationRequest>({
    name: '',
    description: '',
    website: '',
    industry: '',
    size: '',
    location: '',
  });
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Organization name is required');
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create organization');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      website: '',
      industry: '',
      size: '',
      location: '',
    });
    setError('');
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
          Create Organization
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Set up a new organization to manage your team and projects
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ py: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Basic Information
              </Typography>
              
              <TextField
                fullWidth
                label="Organization Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Enter organization name"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                placeholder="Describe your organization's purpose and goals"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://your-organization.com"
                sx={{ mb: 2 }}
              />
            </Box>

            {/* Additional Information */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Additional Information
              </Typography>
              
              <TextField
                fullWidth
                label="Industry"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="e.g., Technology, Healthcare, Finance"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Organization Size"
                value={formData.size}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                placeholder="e.g., 1-10, 11-50, 51-200, 200+"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., San Francisco, CA or Remote"
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            Create Organization
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CreateOrganizationModal;
