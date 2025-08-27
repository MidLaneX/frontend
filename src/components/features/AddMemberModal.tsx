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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import type { AddMemberRequest, MemberRole } from '../../types/api/organizations';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddMemberRequest) => Promise<void>;
  organizationName: string;
  loading?: boolean;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  open,
  onClose,
  onSubmit,
  organizationName,
  loading = false,
}) => {
  const [formData, setFormData] = useState<AddMemberRequest>({
    userId: 0,
    role: 'member',
  });
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.userId || formData.userId <= 0) {
      setError('Valid User ID is required');
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleClose = () => {
    setFormData({
      userId: 0,
      role: 'member',
    });
    setError('');
    onClose();
  };

  const getRoleDescription = (role: MemberRole): string => {
    const descriptions = {
      viewer: 'Can view projects and organization details',
      member: 'Can participate in projects and teams',
      admin: 'Can manage members, teams, and organization settings',
      owner: 'Full control over the organization',
    };
    return descriptions[role] || '';
  };

  const getRoleColor = (role: MemberRole): string => {
    const colors = {
      viewer: '#5E6C84',
      member: '#36B37E',
      admin: '#FF8B00',
      owner: '#FF5630',
    };
    return colors[role] || '#5E6C84';
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
          Add Member
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Add a new member to {organizationName}
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
            {/* User ID Input */}
            <TextField
              fullWidth
              label="User ID"
              type="number"
              value={formData.userId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, userId: parseInt(e.target.value) || 0 }))}
              required
              placeholder="Enter user ID"
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              helperText="Enter the ID of the user to add to this organization"
            />

            {/* Role Selection */}
            <Box>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as MemberRole }))}
                  label="Role"
                >
                  <MenuItem value="viewer">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label="Viewer" 
                        size="small" 
                        sx={{ bgcolor: getRoleColor('viewer'), color: 'white', minWidth: 60 }} 
                      />
                      <Typography variant="body2">View only access</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="member">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label="Member" 
                        size="small" 
                        sx={{ bgcolor: getRoleColor('member'), color: 'white', minWidth: 60 }} 
                      />
                      <Typography variant="body2">Standard access</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="admin">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label="Admin" 
                        size="small" 
                        sx={{ bgcolor: getRoleColor('admin'), color: 'white', minWidth: 60 }} 
                      />
                      <Typography variant="body2">Management access</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Role Description */}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 1 }}>
                {getRoleDescription(formData.role || 'member')}
              </Typography>
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
            Add Member
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default AddMemberModal;
