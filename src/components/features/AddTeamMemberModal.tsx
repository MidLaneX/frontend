import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Checkbox,
  Chip,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Search as SearchIcon,
  Group as GroupIcon 
} from '@mui/icons-material';
import type { OrganizationMember, Team } from '../../types/api/organizations';
import { OrganizationService } from '../../services/OrganizationService';

interface AddTeamMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (memberIds: string[]) => Promise<void>;
  team: Team;
  organizationId: string;
  loading?: boolean;
}

const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  open,
  onClose,
  onSubmit,
  team,
  organizationId,
  loading = false,
}) => {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<OrganizationMember[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState<string>('');

  // Load organization members when modal opens
  useEffect(() => {
    if (open && organizationId) {
      loadOrganizationMembers();
    }
  }, [open, organizationId]);

  // Filter members based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = members.filter(member =>
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [members, searchQuery]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSelectedMemberIds(new Set());
      setSearchQuery('');
      setError('');
    }
  }, [open]);

  const loadOrganizationMembers = async () => {
    try {
      setLoadingMembers(true);
      setError('');
      
      const orgMembers = await OrganizationService.getOrganizationMembers(organizationId);
      
      // Filter out members who are already in the team
      const existingTeamMemberIds = new Set(team.members.map(m => m.userId));
      const availableMembers = orgMembers.filter(member => !existingTeamMemberIds.has(member.userId));
      
      setMembers(availableMembers);
    } catch (err: any) {
      console.error('Failed to load organization members:', err);
      setError('Failed to load organization members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    const newSelected = new Set(selectedMemberIds);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMemberIds(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedMemberIds.size === 0) {
      setError('Please select at least one member to add');
      return;
    }

    try {
      await onSubmit(Array.from(selectedMemberIds));
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add team members');
    }
  };

  const handleClose = () => {
    setSelectedMemberIds(new Set());
    setSearchQuery('');
    setError('');
    onClose();
  };

  const getMemberInitials = (member: OrganizationMember): string => {
    return `${member.first_name?.[0] || 'U'}${member.last_name?.[0] || 'N'}`;
  };

  const getMemberDisplayName = (member: OrganizationMember): string => {
    return `${member.first_name || 'Unknown'} ${member.last_name || 'Name'}`;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '60vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GroupIcon sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h5" component="h2" fontWeight={600}>
              Add Members to Team
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Select members to add to "{team.team_name}"
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search Field */}
        <TextField
          fullWidth
          placeholder="Search members by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Selection Summary */}
        {selectedMemberIds.size > 0 && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
            <Typography variant="subtitle2" color="primary.main" sx={{ mb: 1 }}>
              Selected Members ({selectedMemberIds.size})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Array.from(selectedMemberIds).map(memberId => {
                const member = members.find(m => m.id === memberId);
                return member ? (
                  <Chip
                    key={memberId}
                    label={getMemberDisplayName(member)}
                    onDelete={() => handleMemberToggle(memberId)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ) : null;
              })}
            </Box>
          </Box>
        )}

        {/* Members List */}
        {loadingMembers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredMembers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {members.length === 0 ? 'No available members' : 'No members found'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {members.length === 0 
                ? 'All organization members are already part of this team'
                : 'Try adjusting your search criteria'
              }
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredMembers.map((member, index) => (
              <React.Fragment key={member.id}>
                <ListItem
                  onClick={() => handleMemberToggle(member.id)}
                  component="div"
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: selectedMemberIds.has(member.id) ? 'action.selected' : 'transparent',
                    '&:hover': {
                      bgcolor: selectedMemberIds.has(member.id) ? 'action.selected' : 'action.hover',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                      {getMemberInitials(member)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {getMemberDisplayName(member)}
                        </Typography>
                        <Chip
                          label={member.role}
                          size="small"
                          color={member.role === 'owner' ? 'error' : member.role === 'admin' ? 'warning' : 'default'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {member.email}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Checkbox
                      checked={selectedMemberIds.has(member.id)}
                      onChange={() => handleMemberToggle(member.id)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                {index < filteredMembers.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
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
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || selectedMemberIds.size === 0}
          startIcon={loading ? <CircularProgress size={20} /> : <PersonIcon />}
        >
          Add {selectedMemberIds.size > 0 ? `${selectedMemberIds.size} ` : ''}Member{selectedMemberIds.size !== 1 ? 's' : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTeamMemberModal;