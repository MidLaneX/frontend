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
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { tokenManager } from '../utils/tokenManager';
// Note: OrganizationService temporarily removed, using direct API calls with permission checking
import { organizationsApi } from '../api/endpoints/organizations';
import { teamsApi } from '../api/endpoints/teams';
import {
  enrichOrganizationWithRole,
  OrganizationPermissionHelpers,
  getRoleDisplayInfo
} from '../utils/organizationPermissions';
import CreateOrganizationModal from '../components/features/CreateOrganizationModal';
import AddMemberModal from '../components/features/AddMemberModal';
import AddTeamMemberModal from '../components/features/AddTeamMemberModal';
import CreateTeamModal from '../components/features/CreateTeamModal';
import TeamSettingsDrawer from '../components/features/TeamSettingsDrawer';
import type {
  OrganizationWithRole,
  OrganizationMember,
  Team,
  CreateOrganizationRequest,
  AddMemberRequest,
  CreateTeamRequest,
  MemberRole,
  OrganizationRole,
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
  const [ownedOrganizations, setOwnedOrganizations] = useState<OrganizationWithRole[]>([]);
  const [memberOrganizations, setMemberOrganizations] = useState<OrganizationWithRole[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationWithRole | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationTabValue, setOrganizationTabValue] = useState(0); // 0: Member orgs, 1: Owned orgs
  const [detailTabValue, setDetailTabValue] = useState(0); // 0: Members, 1: Teams
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
  const [addTeamMemberModalOpen, setAddTeamMemberModalOpen] = useState(false);
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const [teamSettingsDrawerOpen, setTeamSettingsDrawerOpen] = useState(false);

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
      const currentUserId = tokenManager.getUserId();
      console.log('Current user ID from tokenManager:', currentUserId, 'Type:', typeof currentUserId);
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }
      
      // Load owned and member organizations separately
      const [ownedOrgs, memberOrgs] = await Promise.all([
        organizationsApi.getOwnedOrganizations(),
        organizationsApi.getMemberOrganizations()
      ]);
      
      console.log('Owned organizations loaded:', ownedOrgs);
      console.log('Member organizations loaded:', memberOrgs);
      console.log('Sample owned org structure:', ownedOrgs[0]);
      console.log('Sample member org structure:', memberOrgs[0]);
      
      // Enrich organizations with role information
      const enrichedOwnedOrgs = ownedOrgs.map(org => {
        console.log('Enriching owned org:', org.name, 'ownerId:', org.ownerId, 'currentUserId:', currentUserId);
        const enriched = enrichOrganizationWithRole(org, currentUserId);
        console.log('Enriched owned org role:', enriched.userRole);
        return enriched as OrganizationWithRole;
      });
      
      const enrichedMemberOrgs = memberOrgs.map(org => {
        console.log('Enriching member org:', org.name, 'ownerId:', org.ownerId, 'currentUserId:', currentUserId);
        const enriched = enrichOrganizationWithRole(org, currentUserId);
        console.log('Enriched member org role:', enriched.userRole);
        return enriched as OrganizationWithRole;
      });
      
      setOwnedOrganizations(enrichedOwnedOrgs);
      setMemberOrganizations(enrichedMemberOrgs);
      
      // Select the first organization from member organizations (priority), then owned organizations
      if (enrichedMemberOrgs.length > 0 && !selectedOrg) {
        setSelectedOrg(enrichedMemberOrgs[0]);
        setOrganizationTabValue(0); // Set to member organizations tab
      } else if (enrichedOwnedOrgs.length > 0 && !selectedOrg) {
        setSelectedOrg(enrichedOwnedOrgs[0]);
        setOrganizationTabValue(1); // Set to owned organizations tab
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
        organizationsApi.getOrganizationMembers(orgId),
        teamsApi.getTeams(orgId)
      ]);
      console.log('Members loaded:', membersData);
      console.log('First member data:', membersData[0]);
      console.log('Teams loaded:', teamsData);
      console.log('First team data:', teamsData[0]);
      console.log('First team ID:', teamsData[0]?.id, 'Type:', typeof teamsData[0]?.id);
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
      const newOrg = await organizationsApi.createOrganization(data, userId);
      const enrichedOrg = enrichOrganizationWithRole(newOrg, userId) as OrganizationWithRole;
      
      // Add to owned organizations since user created it
      setOwnedOrganizations(prev => [...prev, enrichedOrg]);
      setSelectedOrg(enrichedOrg);
      setOrganizationTabValue(1); // Switch to owned organizations tab
    } catch (err: any) {
      throw err;
    }
  };

  const handleAddMember = async (data: AddMemberRequest) => {
    if (!selectedOrg) return;
    
    const currentUserId = tokenManager.getUserId();
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }
    
    // Check permissions
    if (!OrganizationPermissionHelpers.canAddMembers(selectedOrg, currentUserId)) {
      throw new Error('Only organization owners can add members');
    }
    
    try {
      await organizationsApi.addMember(selectedOrg.id, data);
      // Reload the complete members list to ensure all fields are properly populated
      await loadOrganizationData(selectedOrg.id);
    } catch (err: any) {
      throw err;
    }
  };

  const handleCreateTeam = async (data: CreateTeamRequest) => {
    if (!selectedOrg) return;
    
    const currentUserId = tokenManager.getUserId();
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }
    
    // Check permissions
    if (!OrganizationPermissionHelpers.canCreateTeams(selectedOrg, currentUserId)) {
      throw new Error('Only organization owners can create teams');
    }
    
    try {
      const newTeam = await teamsApi.createTeam(data);
      setTeams(prev => [...prev, newTeam]);
    } catch (err: any) {
      throw err;
    }
  };

  const handleAddTeamMembers = async (memberIds: string[]) => {
    if (!selectedOrg || !selectedTeam) return;
    
    console.log('handleAddTeamMembers - selectedTeam:', selectedTeam);
    console.log('handleAddTeamMembers - selectedTeam.id:', selectedTeam.id);
    console.log('handleAddTeamMembers - memberIds:', memberIds);
    
    const currentUserId = tokenManager.getUserId();
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }
    
    // Check permissions
    if (!OrganizationPermissionHelpers.canManageTeams(selectedOrg, currentUserId)) {
      throw new Error('Only organization owners can manage team members');
    }
    
    if (!selectedTeam.id) {
      console.error('Selected team has no ID:', selectedTeam);
      throw new Error('Invalid team selected - missing team ID');
    }
    
    try {
      // Add members one by one and return the final team state
      let updatedTeam: Team | null = null;
      for (const userId of memberIds) {
        console.log('Adding user to team:', userId, 'to team:', selectedTeam.id);
        updatedTeam = await teamsApi.addTeamMemberById(selectedTeam.id, userId);
      }
      if (updatedTeam) {
        setTeams(prev => prev.map(t => t.id === selectedTeam.id ? updatedTeam : t));
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedOrg) return;
    
    const currentUserId = tokenManager.getUserId();
    if (!currentUserId) {
      setError('User not authenticated');
      return;
    }
    
    // Check permissions
    if (!OrganizationPermissionHelpers.canRemoveMembers(selectedOrg, currentUserId)) {
      setError('Only organization owners can remove members');
      return;
    }
    
    try {
      await organizationsApi.removeMember(selectedOrg.id, memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
      setMemberMenuAnchor(null);
    } catch (err: any) {
      setError('Failed to remove member');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: MemberRole) => {
    if (!selectedOrg) return;
    
    const currentUserId = tokenManager.getUserId();
    if (!currentUserId) {
      setError('User not authenticated');
      return;
    }
    
    // Check permissions
    if (!OrganizationPermissionHelpers.canAddMembers(selectedOrg, currentUserId)) {
      setError('Only organization owners can update member roles');
      return;
    }
    
    try {
      const updatedMember = await organizationsApi.updateMemberRole(selectedOrg.id, memberId, newRole);
      setMembers(prev => prev.map(m => m.id === memberId ? updatedMember : m));
      setMemberMenuAnchor(null);
    } catch (err: any) {
      setError('Failed to update member role: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!selectedOrg) return;
    
    const currentUserId = tokenManager.getUserId();
    if (!currentUserId) {
      setError('User not authenticated');
      return;
    }
    
    // Check permissions
    if (!OrganizationPermissionHelpers.canManageTeams(selectedOrg, currentUserId)) {
      setError('Only organization owners can delete teams');
      return;
    }
    
    try {
      await teamsApi.deleteTeam(selectedOrg.id, teamId);
      setTeams(prev => prev.filter(t => t.id !== teamId));
      setTeamMenuAnchor(null);
    } catch (err: any) {
      setError('Failed to delete team');
    }
  };

  // Team Settings Handlers
  const handleOpenTeamSettings = (team: Team) => {
    setSelectedTeam(team);
    setTeamSettingsDrawerOpen(true);
  };

  const handleCloseTeamSettings = () => {
    setTeamSettingsDrawerOpen(false);
    setSelectedTeam(null);
  };

  const handleTeamSettingsAddMember = async (memberIds: string[]) => {
    if (!selectedTeam) return;
    
    // Add members one by one and return the final team state
    let updatedTeam: Team | null = null;
    for (const userId of memberIds) {
      updatedTeam = await teamsApi.addTeamMemberById(selectedTeam.id, userId);
    }
    if (updatedTeam) {
      setTeams(prev => prev.map(t => t.id === selectedTeam.id ? updatedTeam : t));
      setSelectedTeam(updatedTeam); // Update the selected team with new data
    }
  };

  const handleTeamSettingsRemoveMember = async (userId: string) => {
    if (!selectedTeam) return;
    
    await teamsApi.removeTeamMemberById(selectedTeam.id, userId);
    // Reload organization data to get updated team information
    await loadOrganizationData(selectedOrg!.id);
    // Update selected team with fresh data
    const updatedTeams = await teamsApi.getTeams(selectedOrg!.id);
    const updatedTeam = updatedTeams.find(t => t.id === selectedTeam.id);
    if (updatedTeam) {
      setSelectedTeam(updatedTeam);
    }
  };

  const handleTeamSettingsUpdateTeam = async (data: { team_name: string; description: string }) => {
    if (!selectedTeam) return;
    
    const updatedTeam = await teamsApi.updateTeamById(selectedTeam.id, data);
    setTeams(prev => prev.map(t => t.id === selectedTeam.id ? updatedTeam : t));
    setSelectedTeam(updatedTeam);
  };

  const handleTeamSettingsUpdateLead = async (userId: string) => {
    if (!selectedTeam) return;
    
    const updatedTeam = await teamsApi.updateTeamLead(selectedTeam.id, userId);
    setTeams(prev => prev.map(t => t.id === selectedTeam.id ? updatedTeam : t));
    setSelectedTeam(updatedTeam);
  };

// getCurrentUserRole function removed - using direct permission checking instead

  const getCurrentUserPermissions = () => {
    if (!selectedOrg) {
      return {
        canManageMembers: false,
        canManageTeams: false,
        canEditOrg: false,
        canDeleteOrg: false
      };
    }
    
    const currentUserId = tokenManager.getUserId();
    if (!currentUserId) {
      return {
        canManageMembers: false,
        canManageTeams: false,
        canEditOrg: false,
        canDeleteOrg: false
      };
    }
    
    // Debug logging
    console.log('Permission check - Selected Org:', selectedOrg);
    console.log('Permission check - Current User ID:', currentUserId);
    console.log('Permission check - Organization Owner ID:', selectedOrg.ownerId);
    console.log('Permission check - User Role:', selectedOrg.userRole);
    console.log('Permission check - Is Owner:', selectedOrg.isOwner);
    
    const canManageMembers = OrganizationPermissionHelpers.canAddMembers(selectedOrg, currentUserId);
    const canManageTeams = OrganizationPermissionHelpers.canCreateTeams(selectedOrg, currentUserId);
    
    console.log('Permission check - Can Manage Members:', canManageMembers);
    console.log('Permission check - Can Manage Teams:', canManageTeams);
    
    return {
      canManageMembers,
      canManageTeams,
      canEditOrg: OrganizationPermissionHelpers.canEditOrganization(selectedOrg, currentUserId),
      canDeleteOrg: OrganizationPermissionHelpers.canDeleteOrganization(selectedOrg, currentUserId)
    };
  };

  const userPermissions = getCurrentUserPermissions();
  const canManageMembers = userPermissions.canManageMembers;
  const canManageTeams = userPermissions.canManageTeams;

  const getRoleIcon = (role: MemberRole | OrganizationRole) => {
    switch (role) {
      case 'owner': return <OwnerIcon fontSize="small" />;
      case 'admin': return <AdminIcon fontSize="small" />;
      case 'member': return <PeopleIcon fontSize="small" />;
      case 'viewer': return <ViewIcon fontSize="small" />;
      default: return <PeopleIcon fontSize="small" />;
    }
  };

  const getRoleDisplayName = (role: MemberRole | OrganizationRole): string => {
    return getRoleDisplayInfo(role).displayName;
  };

  const getRoleColor = (role: MemberRole | OrganizationRole): string => {
    return getRoleDisplayInfo(role).color;
  };

  const totalOrganizations = ownedOrganizations.length + memberOrganizations.length;
  
  if (loading && totalOrganizations === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Loading Organizations...</Typography>
        <Skeleton variant="text" width={300} height={40} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
      </Box>
    );
  }

  // Show error state if there's an error and no organizations loaded
  if (error && totalOrganizations === 0) {
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
            {selectedOrg && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={`You are: ${getRoleDisplayName(selectedOrg.userRole || 'member')}`}
                  size="small"
                  variant="outlined"
                  icon={getRoleIcon(selectedOrg.userRole || 'member')}
                  sx={{
                    bgcolor: selectedOrg.userRole === 'owner' ? '#E3F2FD' : '#FFF3E0',
                    borderColor: selectedOrg.userRole === 'owner' ? '#2196F3' : '#FF9800',
                  }}
                />
              </Box>
            )}
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
        
        {selectedOrg && selectedOrg.userRole === 'member' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You are a member of this organization. Only organization owners can add members, create teams, or modify organization settings.
          </Alert>
        )}

        {/* Organization Tabs */}
        {totalOrganizations > 0 && (
          <Paper sx={{ mb: 3, borderRadius: 2 }}>
            <Tabs
              value={organizationTabValue}
              onChange={(_, newValue) => setOrganizationTabValue(newValue)}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                px: 2,
                pt: 1
              }}
            >
              <Tab 
                label={`You are part of (${memberOrganizations.length})`} 
                icon={<PeopleIcon />} 
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
              <Tab 
                label={`Owned by you (${ownedOrganizations.length})`} 
                icon={<OwnerIcon />} 
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
            </Tabs>

            {/* Member Organizations Tab */}
            <TabPanel value={organizationTabValue} index={0}>
              {memberOrganizations.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, p: 2 }}>
                  {memberOrganizations.map((org) => (
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
                              <Avatar sx={{ bgcolor: '#FF9800', width: 32, height: 32 }}>
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
                                setSelectedOrg(org);
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {org.description || 'No description'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                            <Chip
                              label="Member"
                              size="small"
                              icon={getRoleIcon('member')}
                              sx={{
                                bgcolor: '#FFF3E0',
                                color: '#F57C00',
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          <Box sx={{ pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                let userId = '';
                                try {
                                  const auth_tokens = localStorage.getItem('auth_tokens');
                                  if (auth_tokens) {
                                    const parsed = JSON.parse(auth_tokens);
                                    userId = parsed.userId || parsed.user_id || '';
                                  }
                                } catch (e) {
                                  userId = '';
                                }
                                window.location.href = `/organizationpage/${org.id}?userId=${userId}`;
                              }}
                              sx={{ textTransform: 'none' }}
                            >
                              Go to Projects
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrg(org);
                              }}
                              sx={{ textTransform: 'none' }}
                            >
                              Manage
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                    You're not a member of any organizations yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You'll see organizations you're invited to join here
                  </Typography>
                </Box>
              )}
            </TabPanel>

            {/* Owned Organizations Tab */}
            <TabPanel value={organizationTabValue} index={1}>
              {ownedOrganizations.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, p: 2 }}>
                  {ownedOrganizations.map((org) => (
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
                              <Avatar sx={{ bgcolor: '#4CAF50', width: 32, height: 32 }}>
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
                                setSelectedOrg(org);
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {org.description || 'No description'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                            <Chip
                              label="Owner"
                              size="small"
                              icon={getRoleIcon('owner')}
                              sx={{
                                bgcolor: '#E8F5E8',
                                color: '#2E7D32',
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          <Box sx={{ pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                let userId = '';
                                try {
                                  const auth_tokens = localStorage.getItem('auth_tokens');
                                  if (auth_tokens) {
                                    const parsed = JSON.parse(auth_tokens);
                                    userId = parsed.userId || parsed.user_id || '';
                                  }
                                } catch (e) {
                                  userId = '';
                                }
                                window.location.href = `/organizationpage/${org.id}?userId=${userId}`;
                              }}
                              sx={{ textTransform: 'none' }}
                            >
                              Go to Projects
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrg(org);
                              }}
                              sx={{ textTransform: 'none' }}
                            >
                              Manage
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <OwnerIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                    No organizations owned yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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
            </TabPanel>
          </Paper>
        )}
      </Box>

      {/* Organization Management Tabs */}
      {selectedOrg && (
        <Box>
          <Tabs
            value={detailTabValue}
            onChange={(_, newValue) => setDetailTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab label={`Members (${members.length})`} icon={<PeopleIcon />} iconPosition="start" />
            <Tab label={`Teams (${teams.length})`} icon={<GroupIcon />} iconPosition="start" />
          </Tabs>

          {/* Members Tab */}
          <TabPanel value={detailTabValue} index={0}>
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
                            {member.first_name?.[0] || 'U'}{member.last_name?.[0] || 'N'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {member.first_name || 'Unknown'} {member.last_name || 'Name'}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={getRoleDisplayName(member.role)}
                          size="small"
                          icon={getRoleIcon(member.role)}
                          sx={{
                            bgcolor: getRoleColor(member.role),
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                        {selectedOrg && selectedOrg.userRole === 'owner' && (
                          <Chip
                            label="You"
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        )}
                        {selectedOrg && selectedOrg.userRole === 'member' && (
                          <Chip
                            label="Member View"
                            size="small"
                            variant="outlined"
                            color="info"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        )}
                      </Box>
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
          <TabPanel value={detailTabValue} index={1}>
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
                              {team.team_name}
                            </Typography>
                            {team.leadName && (
                              <Typography variant="body2" color="text.secondary">
                                Lead: {team.leadName}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        {canManageTeams && selectedOrg?.userRole === 'owner' && (
                          <IconButton
                            size="small"
                            onClick={() => handleOpenTeamSettings(team)}
                            title="Team Settings"
                          >
                            <SettingsIcon fontSize="small" />
                          </IconButton>
                        )}
                        {canManageTeams && selectedOrg?.userRole !== 'owner' && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              console.log('Selected team for menu:', team);
                              console.log('Team ID:', team.id, 'Type:', typeof team.id);
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
      {totalOrganizations === 0 && !loading && (
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
        {selectedOrg && selectedOrg.userRole === 'owner' ? (
          <>
            <MenuItem disabled>
              <ListItemText primary={`Current: ${selectedMember?.role ? getRoleDisplayName(selectedMember.role) : 'Unknown'}`} />
            </MenuItem>
            <Divider />
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
          </>
        ) : (
          <MenuItem disabled>
            <ListItemText primary="Only owners can manage members" secondary="You are a member of this organization" />
          </MenuItem>
        )}
      </Menu>

      <Menu
        anchorEl={teamMenuAnchor}
        open={Boolean(teamMenuAnchor)}
        onClose={() => setTeamMenuAnchor(null)}
      >
        {selectedOrg && selectedOrg.userRole === 'owner' ? (
          <>
            <MenuItem onClick={() => setTeamMenuAnchor(null)}>
              <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Edit Team</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              setTeamMenuAnchor(null);
              setAddTeamMemberModalOpen(true);
            }}>
              <ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Add Member</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleDeleteTeam(selectedTeam?.id || '')} sx={{ color: 'error.main' }}>
              <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
              <ListItemText>Delete Team</ListItemText>
            </MenuItem>
          </>
        ) : (
          <MenuItem disabled>
            <ListItemText primary="Only owners can manage teams" secondary="You are a member of this organization" />
          </MenuItem>
        )}
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

          {selectedTeam && (
            <AddTeamMemberModal
              open={addTeamMemberModalOpen}
              onClose={() => setAddTeamMemberModalOpen(false)}
              onSubmit={handleAddTeamMembers}
              team={selectedTeam}
              organizationId={selectedOrg.id}
            />
          )}

          <TeamSettingsDrawer
            open={teamSettingsDrawerOpen}
            onClose={handleCloseTeamSettings}
            team={selectedTeam}
            members={members}
            onAddMember={handleTeamSettingsAddMember}
            onRemoveMember={handleTeamSettingsRemoveMember}
            onUpdateTeam={handleTeamSettingsUpdateTeam}
            onUpdateTeamLead={handleTeamSettingsUpdateLead}
            canManageTeams={canManageTeams && selectedOrg?.userRole === 'owner'}
          />
        </>
      )}
    </Box>
  );
};

export default OrganizationPage;
