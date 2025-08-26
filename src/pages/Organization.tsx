import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Divider,
  Alert,
  Skeleton,
  AvatarGroup,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
  AdminPanelSettings as AdminIcon,
  Visibility as ViewIcon,
  SupervisorAccount as OwnerIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { tokenManager } from '../utils/tokenManager';
import { OrganizationService } from '../services/OrganizationService';
import CreateOrganizationModal from '../components/features/CreateOrganizationModal';
import AddMemberModal from '../components/features/AddMemberModal';
import CreateTeamModal from '../components/features/CreateTeamModal';
import type {
  Organization,
  OrganizationMember,
  Team,
  CreateOrganizationRequest,
  AddMemberRequest,
  CreateTeamRequest,
  MemberRole,
} from '../types/api/organizations';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const OrganizationPage: React.FC = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string>('');

  // Debug: Log user and token information
  useEffect(() => {
    console.log('Organization component mounted');
    console.log('Current user:', user);
    console.log('User ID from tokenManager:', tokenManager.getUserId());
    console.log('Has tokens:', tokenManager.hasTokens());
  }, [user]);

  // Modal states
  const [createOrgModalOpen, setCreateOrgModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);

  // Menu states
  const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(null);
  const [teamMenuAnchor, setTeamMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      loadOrganizationData(selectedOrg.id);
    }
  }, [selectedOrg]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      
      console.log('Loading organizations...');
      const orgs = await OrganizationService.getOrganizations();
      console.log('Organizations loaded:', orgs);
      
      setOrganizations(orgs);
      if (orgs.length > 0 && !selectedOrg) {
        setSelectedOrg(orgs[0]);
      }
    } catch (err: any) {
      console.error('Failed to load organizations:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load organizations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationData = async (orgId: string) => {
    try {
      console.log('Loading organization data for:', orgId);
      const [membersData, teamsData] = await Promise.all([
        OrganizationService.getOrganizationMembers(orgId),
        OrganizationService.getTeams(orgId)
      ]);
      console.log('Members loaded:', membersData);
      console.log('First member data:', membersData[0]);
      console.log('Teams loaded:', teamsData);
      setMembers(membersData);
      setTeams(teamsData);
    } catch (err: any) {
      console.error('Failed to load organization data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load organization data';
      setError(errorMessage);
    }
  };

  const handleCreateOrganization = async (data: CreateOrganizationRequest) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get userId from user context or fallback to tokenManager
    const userId = user.userId || tokenManager.getUserId();
    
    if (!userId) {
      throw new Error('User ID not available. Please log in again.');
    }
    
    try {
      const newOrg = await OrganizationService.createOrganization(data, userId);
      setOrganizations(prev => [...prev, newOrg]);
      setSelectedOrg(newOrg);
    } catch (err: any) {
      throw err;
    }
  };

  const handleAddMember = async (data: AddMemberRequest) => {
    if (!selectedOrg) return;
    try {
      const newMember = await OrganizationService.addMember(selectedOrg.id, data);
      setMembers(prev => [...prev, newMember]);
    } catch (err: any) {
      throw err;
    }
  };

  const handleCreateTeam = async (data: CreateTeamRequest) => {
    try {
      const newTeam = await OrganizationService.createTeam(data);
      setTeams(prev => [...prev, newTeam]);
    } catch (err: any) {
      throw err;
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedOrg) return;
    try {
      await OrganizationService.removeMember(selectedOrg.id, memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
      setMemberMenuAnchor(null);
    } catch (err: any) {
      setError('Failed to remove member');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: MemberRole) => {
    if (!selectedOrg) return;
    try {
      const updatedMember = await OrganizationService.updateMemberRole(selectedOrg.id, memberId, newRole);
      setMembers(prev => prev.map(m => m.id === memberId ? updatedMember : m));
      setMemberMenuAnchor(null);
    } catch (err: any) {
      setError('Failed to update member role');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!selectedOrg) return;
    try {
      await OrganizationService.deleteTeam(selectedOrg.id, teamId);
      setTeams(prev => prev.filter(t => t.id !== teamId));
      setTeamMenuAnchor(null);
    } catch (err: any) {
      setError('Failed to delete team');
    }
  };

  const getCurrentUserRole = (): MemberRole => {
    // For now, assume the user is an admin. In a real app, this would come from auth context
    return 'admin';
  };

  const canManageMembers = OrganizationService.canManageMembers(getCurrentUserRole());
  const canManageTeams = OrganizationService.canManageTeams(getCurrentUserRole());

  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case 'owner': return <OwnerIcon fontSize="small" />;
      case 'admin': return <AdminIcon fontSize="small" />;
      case 'member': return <PeopleIcon fontSize="small" />;
      case 'viewer': return <ViewIcon fontSize="small" />;
      default: return <PeopleIcon fontSize="small" />;
    }
  };

  if (loading && organizations.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Loading Organizations...</Typography>
        <Skeleton variant="text" width={300} height={40} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
      </Box>
    );
  }

  // Show error state if there's an error and no organizations loaded
  if (error && organizations.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#172B4D', mb: 2 }}>
          Organizations
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => loadOrganizations()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "#f7f8f9",
        minHeight: "calc(100vh - 64px)",
        overflow: "auto",
        p: 3,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#172B4D', mb: 1 }}>
              Organizations
            </Typography>
            <Typography variant="body1" sx={{ color: '#5E6C84' }}>
              Manage your organizations, teams, and members
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOrgModalOpen(true)}
            sx={{
              bgcolor: '#0052CC',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
            }}
          >
            Create Organization
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Organization Selection */}
        {organizations.length > 0 && (
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Select Organization
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
              {organizations.map((org) => (
                <Box key={org.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedOrg?.id === org.id ? '2px solid #0052CC' : '1px solid #DFE1E6',
                      boxShadow: selectedOrg?.id === org.id ? '0 4px 12px rgba(0,82,204,0.15)' : 'none',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(9,30,66,0.15)',
                      },
                    }}
                    onClick={() => setSelectedOrg(org)}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: '#0052CC', width: 32, height: 32 }}>
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {org.name}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Organization menu functionality can be added later
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {org.description || 'No description'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={`${org.member_count} members`}
                          size="small"
                          icon={<PeopleIcon fontSize="small" />}
                        />
                        <Chip
                          label={`${org.team_count} teams`}
                          size="small"
                          icon={<GroupIcon fontSize="small" />}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </Box>

      {/* Organization Details */}
      {selectedOrg && (
        <Box>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab label={`Members (${members.length})`} icon={<PeopleIcon />} iconPosition="start" />
            <Tab label={`Teams (${teams.length})`} icon={<GroupIcon />} iconPosition="start" />
          </Tabs>

          {/* Members Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Organization Members
              </Typography>
              {canManageMembers && (
                <Button
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setAddMemberModalOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Add Member
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
              {members.map((member) => (
                <Box key={member.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 48, height: 48 }}>
                            {member.firstName?.[0] || 'U'}{member.lastName?.[0] || 'N'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {member.firstName || 'Unknown'} {member.lastName || 'Name'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {member.email}
                            </Typography>
                          </Box>
                        </Box>
                        {canManageMembers && member.role !== 'owner' && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setSelectedMember(member);
                              setMemberMenuAnchor(e.currentTarget);
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      <Chip
                        label={OrganizationService.getRoleDisplayName(member.role)}
                        size="small"
                        icon={getRoleIcon(member.role)}
                        sx={{
                          bgcolor: OrganizationService.getRoleColor(member.role),
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                      {member.teams?.length > 0 && (
                        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                          Member of {member.teams?.length} team(s)
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </TabPanel>

          {/* Teams Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Teams
              </Typography>
              {canManageTeams && (
                <Button
                  variant="outlined"
                  startIcon={<GroupAddIcon />}
                  onClick={() => setCreateTeamModalOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Create Team
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
              {teams?.map((team) => (
                <Box key={team.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#36B37E', width: 48, height: 48 }}>
                            <GroupIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {team.name}
                            </Typography>
                            {team.leadName && (
                              <Typography variant="body2" color="text.secondary">
                                Lead: {team.leadName}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        {canManageTeams && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setSelectedTeam(team);
                              setTeamMenuAnchor(e.currentTarget);
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      
                      {team.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {team.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {team.members?.length ?? 0} member(s)
                        </Typography>
                        <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 12 } }}>
                          {team.members?.map((member) => (
                            <Tooltip key={member.id} title={`${member.firstName || 'Unknown'} ${member.lastName || 'Name'}`}>
                              <Avatar>
                                {member.firstName?.[0] || 'U'}{member.lastName?.[0] || 'N'}
                              </Avatar>
                            </Tooltip>
                          )) ?? []}
                        </AvatarGroup>
                      </Box>

                      <Typography variant="caption" color="text.secondary">
                        Created {new Date(team.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </TabPanel>
        </Box>
      )}

      {/* Empty State */}
      {organizations.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 1, color: 'text.secondary' }}>
            No organizations yet
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Create your first organization to start managing teams and projects
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOrgModalOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            Create Organization
          </Button>
        </Box>
      )}

      {/* Menus */}
      <Menu
        anchorEl={memberMenuAnchor}
        open={Boolean(memberMenuAnchor)}
        onClose={() => setMemberMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleUpdateMemberRole(selectedMember?.id || '', 'admin')}>
          <ListItemIcon><AdminIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Make Admin</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdateMemberRole(selectedMember?.id || '', 'member')}>
          <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Make Member</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdateMemberRole(selectedMember?.id || '', 'viewer')}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Make Viewer</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleRemoveMember(selectedMember?.id || '')} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
          <ListItemText>Remove Member</ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={teamMenuAnchor}
        open={Boolean(teamMenuAnchor)}
        onClose={() => setTeamMenuAnchor(null)}
      >
        <MenuItem onClick={() => setTeamMenuAnchor(null)}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit Team</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setTeamMenuAnchor(null)}>
          <ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Add Member</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteTeam(selectedTeam?.id || '')} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
          <ListItemText>Delete Team</ListItemText>
        </MenuItem>
      </Menu>

      {/* Modals */}
      <CreateOrganizationModal
        open={createOrgModalOpen}
        onClose={() => setCreateOrgModalOpen(false)}
        onSubmit={handleCreateOrganization}
      />

      {selectedOrg && (
        <>
          <AddMemberModal
            open={addMemberModalOpen}
            onClose={() => setAddMemberModalOpen(false)}
            onSubmit={handleAddMember}
            organizationName={selectedOrg.name}
          />

          <CreateTeamModal
            open={createTeamModalOpen}
            onClose={() => setCreateTeamModalOpen(false)}
            onSubmit={handleCreateTeam}
            organizationId={parseInt(selectedOrg.id)}
            organizationName={selectedOrg.name}
          />
        </>
      )}
    </Box>
  );
};

export default OrganizationPage;
