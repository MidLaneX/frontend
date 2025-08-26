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
  Avatar,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material';
import { Group as GroupIcon } from '@mui/icons-material';
import type { CreateTeamRequest, OrganizationMember } from '../../types/api/organizations';

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTeamRequest) => Promise<void>;
  organizationMembers: OrganizationMember[];
  organizationName: string;
  loading?: boolean;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  open,
  onClose,
  onSubmit,
  organizationMembers,
  organizationName,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateTeamRequest>({
    name: '',
    description: '',
    leadId: '',
    memberIds: [],
  });
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create team');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      leadId: '',
      memberIds: [],
    });
    setError('');
    onClose();
  };

  const handleMemberChange = (event: any) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      memberIds: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const getSelectedMemberNames = () => {
    return organizationMembers
      .filter(member => formData.memberIds?.includes(member.id))
      .map(member => `${member.firstName || 'Unknown'} ${member.lastName || 'Name'}`)
      .join(', ');
  };

  const availableLeads = organizationMembers.filter(member => 
    ['admin', 'member'].includes(member.role)
  );

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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Team Information
              </Typography>
              
              <TextField
                fullWidth
                label="Team Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Enter team name"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <GroupIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                placeholder="Describe the team's purpose and responsibilities"
              />
            </Box>

            {/* Team Lead Selection */}
            {availableLeads.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Team Lead
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Select Team Lead (Optional)</InputLabel>
                  <Select
                    value={formData.leadId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, leadId: e.target.value }))}
                    label="Select Team Lead (Optional)"
                  >
                    <MenuItem value="">
                      <Typography color="text.secondary">No team lead</Typography>
                    </MenuItem>
                    {availableLeads.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {member.firstName?.[0] || 'U'}{member.lastName?.[0] || 'N'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {member.firstName || 'Unknown'} {member.lastName || 'Name'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.email}
                            </Typography>
                          </Box>
                          <Chip 
                            label={member.role} 
                            size="small" 
                            sx={{ ml: 'auto' }}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Team Members Selection */}
            {organizationMembers.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Team Members
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Select Members (Optional)</InputLabel>
                  <Select
                    multiple
                    value={formData.memberIds || []}
                    onChange={handleMemberChange}
                    input={<OutlinedInput label="Select Members (Optional)" />}
                    renderValue={() => getSelectedMemberNames() || 'No members selected'}
                  >
                    {organizationMembers.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        <Checkbox 
                          checked={(formData.memberIds || []).includes(member.id)} 
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {member.firstName?.[0] || 'U'}{member.lastName?.[0] || 'N'}
                          </Avatar>
                          <ListItemText
                            primary={`${member.firstName || 'Unknown'} ${member.lastName || 'Name'}`}
                            secondary={member.email}
                          />
                          <Chip 
                            label={member.role} 
                            size="small" 
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  You can add more members to the team later
                </Typography>
              </Box>
            )}
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
            Create Team
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CreateTeamModal;
