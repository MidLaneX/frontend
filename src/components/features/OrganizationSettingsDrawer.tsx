import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  TextField,
  Divider,
  IconButton,
  Alert,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import type { OrganizationWithRole } from '../../types/api/organizations';

interface OrganizationSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  organization: OrganizationWithRole | null;
  onUpdateOrganization: (orgId: string, data: UpdateOrganizationData) => Promise<void>;
  onDeleteOrganization: (orgId: string) => Promise<void>;
}

interface UpdateOrganizationData {
  name: string;
  description: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
}

const OrganizationSettingsDrawer: React.FC<OrganizationSettingsDrawerProps> = ({
  open,
  onClose,
  organization,
  onUpdateOrganization,
  onDeleteOrganization,
}) => {
  const [formData, setFormData] = useState<UpdateOrganizationData>({
    name: '',
    description: '',
    website: '',
    industry: '',
    size: '',
    location: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Update form data when organization changes
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        description: organization.description || '',
        website: organization.website || '',
        industry: organization.industry || '',
        size: organization.size || '',
        location: organization.location || '',
      });
    }
  }, [organization]);

  // Reset form state when drawer closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
      setError('');
      setDeleteConfirmOpen(false);
    }
  }, [open]);

  const handleInputChange = (field: keyof UpdateOrganizationData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = async () => {
    if (!organization) return;

    try {
      setLoading(true);
      setError('');
      
      // Validate required fields
      if (!formData.name.trim()) {
        setError('Organization name is required');
        return;
      }

      await onUpdateOrganization(organization.id, formData);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update organization:', err);
      setError(err.message || 'Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        description: organization.description || '',
        website: organization.website || '',
        industry: organization.industry || '',
        size: organization.size || '',
        location: organization.location || '',
      });
    }
    setIsEditing(false);
    setError('');
  };

  const handleDelete = async () => {
    if (!organization) return;

    try {
      setDeleteLoading(true);
      await onDeleteOrganization(organization.id);
      setDeleteConfirmOpen(false);
      onClose();
    } catch (err: any) {
      console.error('Failed to delete organization:', err);
      setError(err.message || 'Failed to delete organization');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!organization) return null;

  const canEditOrDelete = organization.userRole === 'owner';

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: 400, maxWidth: '90vw' },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Organization Settings
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {!canEditOrDelete && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Only organization owners can modify organization settings.
              </Alert>
            )}

            {/* Organization Info */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Organization Details
                </Typography>
                {canEditOrDelete && !isEditing && (
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    Edit
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={`${organization.member_count} members`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${organization.team_count} teams`}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Organization Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  disabled={!isEditing}
                  required
                  fullWidth
                  variant="outlined"
                  size="small"
                />

                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  disabled={!isEditing}
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  size="small"
                />

                <TextField
                  label="Website"
                  value={formData.website}
                  onChange={handleInputChange('website')}
                  disabled={!isEditing}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="https://example.com"
                />

                <TextField
                  label="Industry"
                  value={formData.industry}
                  onChange={handleInputChange('industry')}
                  disabled={!isEditing}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="e.g. Technology, Healthcare, Finance"
                />

                <TextField
                  label="Company Size"
                  value={formData.size}
                  onChange={handleInputChange('size')}
                  disabled={!isEditing}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="e.g. 1-10, 11-50, 51-200"
                />

                <TextField
                  label="Location"
                  value={formData.location}
                  onChange={handleInputChange('location')}
                  disabled={!isEditing}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="e.g. New York, USA"
                />
              </Box>

              {isEditing && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                    sx={{ textTransform: 'none' }}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={loading}
                    sx={{ textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Danger Zone */}
            {canEditOrDelete && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'error.main' }}>
                  Danger Zone
                </Typography>
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'error.main',
                    borderRadius: 1,
                    p: 2,
                    bgcolor: 'error.lighter',
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 2, color: 'error.main' }}>
                    Deleting this organization will permanently remove all data, including teams, members, and projects. This action cannot be undone.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteConfirmOpen(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    Delete Organization
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !deleteLoading && setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete the organization <strong>"{organization.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action will permanently delete:
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 2, pl: 2 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              {organization.member_count} organization members
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              {organization.team_count} teams and their data
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              All associated projects and workflows
            </Typography>
          </Box>
          <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleteLoading}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={deleteLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
            onClick={handleDelete}
            disabled={deleteLoading}
            sx={{ textTransform: 'none' }}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Organization'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrganizationSettingsDrawer;
