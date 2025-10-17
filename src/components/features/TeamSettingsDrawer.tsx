import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Chip,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  PersonRemove as PersonRemoveIcon,
  SupervisorAccount as LeadIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import type {
  Team,
  OrganizationMember,
  TeamMemberDetail,
} from "../../types/api/organizations";
import { teamsApi } from "../../api/endpoints/teams";

interface TeamSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  team: Team | null;
  members: OrganizationMember[];
  onAddMember: (memberIds: string[]) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  onUpdateTeam: (data: {
    team_name: string;
    description: string;
  }) => Promise<void>;
  onUpdateTeamLead: (userId: string) => Promise<void>;
  canManageTeams: boolean;
}

interface EditTeamDialogState {
  open: boolean;
  teamName: string;
  description: string;
}

interface AddMemberDialogState {
  open: boolean;
  selectedMemberIds: string[];
}

interface UpdateLeadDialogState {
  open: boolean;
  selectedUserId: string;
}

const TeamSettingsDrawer: React.FC<TeamSettingsDrawerProps> = ({
  open,
  onClose,
  team,
  members,
  onAddMember,
  onRemoveMember,
  onUpdateTeam,
  onUpdateTeamLead,
  canManageTeams,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<TeamMemberDetail[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Dialog states
  const [editTeamDialog, setEditTeamDialog] = useState<EditTeamDialogState>({
    open: false,
    teamName: "",
    description: "",
  });

  const [addMemberDialog, setAddMemberDialog] = useState<AddMemberDialogState>({
    open: false,
    selectedMemberIds: [],
  });

  const [updateLeadDialog, setUpdateLeadDialog] =
    useState<UpdateLeadDialogState>({
      open: false,
      selectedUserId: "",
    });

  // Get available members to add (not already in team)
  const availableMembers = members.filter(
    (member) =>
      !teamMembers.some(
        (teamMember) => teamMember?.memberId?.toString() === member.id,
      ),
  );

  // Function to fetch team members
  const fetchTeamMembers = async () => {
    if (!team?.id) {
      setTeamMembers([]);
      return;
    }

    try {
      setLoadingMembers(true);
      const members = await teamsApi.getTeamMembers(team.id);
      console.log("Fetched team members:", members);
      setTeamMembers(members);
    } catch (err: any) {
      console.error("Failed to fetch team members:", err);
      setError(err.message || "Failed to load team members");
      setTeamMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Fetch team members when team changes
  useEffect(() => {
    fetchTeamMembers();
  }, [team?.id]);

  const handleEditTeam = () => {
    if (!team) return;

    setEditTeamDialog({
      open: true,
      teamName: team.team_name,
      description: team.description || "",
    });
  };

  const handleSaveTeamEdit = async () => {
    if (!team) return;

    try {
      setLoading(true);
      setError("");

      await onUpdateTeam({
        team_name: editTeamDialog.teamName,
        description: editTeamDialog.description,
      });

      setEditTeamDialog({ ...editTeamDialog, open: false });
    } catch (err: any) {
      setError(err.message || "Failed to update team");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setAddMemberDialog({
      open: true,
      selectedMemberIds: [],
    });
  };

  const handleSaveAddMember = async () => {
    try {
      setLoading(true);
      setError("");

      await onAddMember(addMemberDialog.selectedMemberIds);

      // Refresh team members after adding
      await fetchTeamMembers();

      setAddMemberDialog({ ...addMemberDialog, open: false });
    } catch (err: any) {
      setError(err.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = () => {
    const currentLead = teamMembers.find((m) => m?.isTeamLead);
    setUpdateLeadDialog({
      open: true,
      selectedUserId: currentLead?.memberId?.toString() || "",
    });
  };

  const handleSaveUpdateLead = async () => {
    try {
      setLoading(true);
      setError("");

      await onUpdateTeamLead(updateLeadDialog.selectedUserId);

      // Refresh team members after updating lead
      await fetchTeamMembers();

      setUpdateLeadDialog({ ...updateLeadDialog, open: false });
    } catch (err: any) {
      setError(err.message || "Failed to update team lead");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this member from the team?",
      )
    ) {
      try {
        setLoading(true);
        setError("");

        await onRemoveMember(userId);

        // Refresh team members after removing
        await fetchTeamMembers();
      } catch (err: any) {
        setError(err.message || "Failed to remove member");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!canManageTeams) {
    return null;
  }

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          "& .MuiDrawer-paper": {
            width: 400,
            p: 0,
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "#f5f5f5",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SettingsIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Team Settings
                </Typography>
              </Box>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {team && (
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Avatar sx={{ bgcolor: "#36B37E", width: 32, height: 32 }}>
                    <GroupIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {team.team_name}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {team.description || "No description"}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    size="small"
                    label={`${teamMembers.length} members`}
                    variant="outlined"
                  />
                  {teamMembers.find((m) => m?.isTeamLead) && (
                    <Chip
                      size="small"
                      label={`Lead: ${teamMembers.find((m) => m?.isTeamLead)?.name || "Unknown"}`}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            )}
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ m: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Settings Menu */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <List sx={{ p: 1 }}>
              <ListItem disablePadding>
                <ListItemButton onClick={handleEditTeam} disabled={loading}>
                  <ListItemIcon>
                    <EditIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Update Team Details"
                    secondary="Edit team name and description"
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleAddMember}
                  disabled={loading || availableMembers.length === 0}
                >
                  <ListItemIcon>
                    <PersonAddIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Add Team Member"
                    secondary={
                      availableMembers.length === 0
                        ? "No available members to add"
                        : `${availableMembers.length} members available`
                    }
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleUpdateLead}
                  disabled={loading || teamMembers.length === 0}
                >
                  <ListItemIcon>
                    <LeadIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Update Team Lead"
                    secondary="Change the team leader"
                  />
                </ListItemButton>
              </ListItem>

              <Divider sx={{ my: 1 }} />

              {/* Team Members List */}
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Team Members
                </Typography>

                {loadingMembers ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 2 }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : teamMembers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No members in this team
                  </Typography>
                ) : (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {teamMembers
                      .filter(
                        (member) => member && member.memberId && member.name,
                      )
                      .map((member) => (
                        <Box
                          key={member.memberId}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 1,
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar
                              sx={{ width: 24, height: 24, fontSize: 12 }}
                            >
                              {member.name
                                ?.split(" ")
                                .map((n) => n?.[0])
                                .join("")
                                .toUpperCase() || "U"}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {member.name || "Unknown"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {member.email || "No email"}
                              </Typography>
                              {member.isTeamLead && (
                                <Chip
                                  size="small"
                                  label="Team Lead"
                                  color="primary"
                                  sx={{ height: 16, fontSize: "0.7rem", ml: 1 }}
                                />
                              )}
                            </Box>
                          </Box>

                          <IconButton
                            size="small"
                            onClick={() =>
                              handleRemoveMember(
                                member.memberId?.toString() || "",
                              )
                            }
                            disabled={loading}
                            sx={{ color: "error.main" }}
                          >
                            <PersonRemoveIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                  </Box>
                )}
              </Box>
            </List>
          </Box>
        </Box>
      </Drawer>

      {/* Edit Team Dialog */}
      <Dialog
        open={editTeamDialog.open}
        onClose={() => setEditTeamDialog({ ...editTeamDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Team Details</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Team Name"
            fullWidth
            variant="outlined"
            value={editTeamDialog.teamName}
            onChange={(e) =>
              setEditTeamDialog({ ...editTeamDialog, teamName: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editTeamDialog.description}
            onChange={(e) =>
              setEditTeamDialog({
                ...editTeamDialog,
                description: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setEditTeamDialog({ ...editTeamDialog, open: false })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveTeamEdit}
            variant="contained"
            disabled={loading || !editTeamDialog.teamName.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog
        open={addMemberDialog.open}
        onClose={() => setAddMemberDialog({ ...addMemberDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Team Members</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Select Members</InputLabel>
            <Select
              multiple
              value={addMemberDialog.selectedMemberIds}
              onChange={(e) =>
                setAddMemberDialog({
                  ...addMemberDialog,
                  selectedMemberIds:
                    typeof e.target.value === "string"
                      ? e.target.value.split(",")
                      : e.target.value,
                })
              }
              label="Select Members"
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const member = availableMembers.find((m) => m.id === value);
                    return (
                      <Chip
                        key={value}
                        label={
                          member
                            ? `${member.first_name} ${member.last_name}`
                            : "Unknown"
                        }
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {availableMembers.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                      {member.first_name?.[0] || "U"}
                      {member.last_name?.[0] || "N"}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {member.first_name || "Unknown"}{" "}
                        {member.last_name || "Name"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.email}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setAddMemberDialog({ ...addMemberDialog, open: false })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAddMember}
            variant="contained"
            disabled={loading || addMemberDialog.selectedMemberIds.length === 0}
          >
            Add Members
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Lead Dialog */}
      <Dialog
        open={updateLeadDialog.open}
        onClose={() =>
          setUpdateLeadDialog({ ...updateLeadDialog, open: false })
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Team Lead</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Select New Team Lead</InputLabel>
            <Select
              value={updateLeadDialog.selectedUserId}
              onChange={(e) =>
                setUpdateLeadDialog({
                  ...updateLeadDialog,
                  selectedUserId: e.target.value,
                })
              }
              label="Select New Team Lead"
            >
              {teamMembers
                .filter((member) => member && member.memberId && member.name)
                .map((member) => (
                  <MenuItem
                    key={member.memberId}
                    value={member.memberId.toString()}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {member.name
                          ?.split(" ")
                          .map((n) => n?.[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {member.name || "Unknown"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.email || "No email"}
                        </Typography>
                        {member.isTeamLead && (
                          <Typography variant="caption" color="primary">
                            Current Lead
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setUpdateLeadDialog({ ...updateLeadDialog, open: false })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveUpdateLead}
            variant="contained"
            disabled={loading || !updateLeadDialog.selectedUserId}
          >
            Update Lead
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TeamSettingsDrawer;
