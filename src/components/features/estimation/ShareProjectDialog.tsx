import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Checkbox,
  alpha,
} from "@mui/material";
import {
  Email as EmailIcon,
  Send as SendIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { OrganizationService } from "@/services/OrganizationService";
import { ProjectService } from "@/services/ProjectService";
import { NotificationService } from "@/services/NotificationService";
import type { TeamMemberDetail } from "@/types/api/organizations";
import type { Task } from "@/types";

interface ShareProjectDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: number;
  projectName: string;
  templateType: string;
  tasks: Task[];
}

const ShareProjectDialog: React.FC<ShareProjectDialogProps> = ({
  open,
  onClose,
  projectId,
  projectName,
  templateType,
  tasks,
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMemberDetail[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [customEmail, setCustomEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchTeamMembers();
    }
  }, [open, projectId]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const assignedTeamId = await ProjectService.getAssignedTeam(
        projectId,
        templateType
      );

      if (assignedTeamId) {
        const members = await OrganizationService.getTeamMembers(
          String(assignedTeamId)
        );
        setTeamMembers(members);
      }
    } catch (error) {
      console.error("Failed to fetch team members:", error);
      setError("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMember = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  };

  const handleAddCustomEmail = () => {
    if (customEmail && isValidEmail(customEmail)) {
      if (!selectedEmails.includes(customEmail)) {
        setSelectedEmails([...selectedEmails, customEmail]);
      }
      setCustomEmail("");
      setError(null);
    } else {
      setError("Please enter a valid email address");
    }
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSend = async () => {
    if (selectedEmails.length === 0) {
      setError("Please select at least one recipient");
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Calculate project statistics
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === "Done").length;
      const inProgressTasks = tasks.filter(
        (t) => t.status === "In Progress"
      ).length;
      const pendingTasks = tasks.filter(
        (t) => t.status === "Todo" || t.status === "Backlog"
      ).length;

      const totalStoryPoints = tasks.reduce(
        (sum, task) => sum + (task.storyPoints || 0),
        0
      );
      const completedStoryPoints = tasks
        .filter((task) => task.status === "Done")
        .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

      const progressPercentage =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Get milestones from completed epics
      const milestones = tasks
        .filter((t) => t.type === "Epic" && t.status === "Done")
        .slice(0, 5)
        .map((epic) => ({
          name: epic.title,
          date: epic.dueDate
            ? new Date(epic.dueDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "N/A",
          status: "Completed",
        }));

      // Get next steps from pending high-priority tasks
      const nextSteps = tasks
        .filter(
          (t) =>
            (t.status === "Todo" || t.status === "In Progress") &&
            (t.priority === "High" || t.priority === "Highest")
        )
        .slice(0, 5)
        .map((task) => task.title);

      // Send project status update
      await NotificationService.sendProjectStatusUpdate(selectedEmails, {
        projectName,
        updateType: "Progress Report",
        updatedBy: "Project Manager", // You can get this from current user
        updateDescription: `Project progress: ${completedTasks} of ${totalTasks} tasks completed (${progressPercentage}%). ${completedStoryPoints} of ${totalStoryPoints} story points delivered.`,
        progressPercentage,
        milestones:
          milestones.length > 0
            ? milestones
            : [
                {
                  name: "Project Initiated",
                  date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                  status: "Completed",
                },
              ],
        tasksCompleted: completedTasks,
        tasksInProgress: inProgressTasks,
        tasksPending: pendingTasks,
        nextSteps:
          nextSteps.length > 0
            ? nextSteps
            : ["Continue with planned tasks", "Monitor progress"],
        projectUrl: `${window.location.origin}/projects/${projectId}`,
        additionalNotes: `This is an automated project status report for ${projectName}.`,
      });

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to send project update:", error);
      setError("Failed to send project update. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSelectedEmails([]);
    setCustomEmail("");
    setError(null);
    setSuccess(false);
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
          borderRadius: 3,
          maxHeight: "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EmailIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Share Project Report
          </Typography>
        </Box>
        <Button
          onClick={handleClose}
          size="small"
          sx={{ minWidth: "auto", p: 1 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        {success ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
            }}
          >
            <CheckCircleIcon
              sx={{ fontSize: 64, color: "success.main", mb: 2 }}
            />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Report Sent Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Project status report has been sent to {selectedEmails.length}{" "}
              recipient(s)
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Send project status report for <strong>{projectName}</strong> to
              team members or custom email addresses.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Custom Email Input */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Add Email Address
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter email address..."
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddCustomEmail();
                    }
                  }}
                  type="email"
                />
                <Button
                  variant="outlined"
                  onClick={handleAddCustomEmail}
                  disabled={!customEmail}
                  sx={{ minWidth: 80 }}
                >
                  Add
                </Button>
              </Box>
            </Box>

            {/* Team Members List */}
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  py: 4,
                }}
              >
                <CircularProgress size={40} />
              </Box>
            ) : teamMembers.length > 0 ? (
              <>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Team Members ({teamMembers.length})
                </Typography>
                <List
                  sx={{
                    maxHeight: 300,
                    overflow: "auto",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  {teamMembers.map((member) => (
                    <ListItem
                      key={member.memberId}
                      onClick={() => handleToggleMember(member.email)}
                      sx={{
                        borderRadius: 1,
                        mx: 0.5,
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      <Checkbox
                        checked={selectedEmails.includes(member.email)}
                        sx={{ mr: 1 }}
                      />
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            width: 36,
                            height: 36,
                          }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.name}
                        secondary={member.email}
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: "caption" }}
                      />
                      {member.isTeamLead && (
                        <Chip
                          label="Lead"
                          size="small"
                          color="warning"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                No team members found. Add custom email addresses above.
              </Alert>
            )}

            {/* Selected Recipients */}
            {selectedEmails.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Selected Recipients ({selectedEmails.length})
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedEmails.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      onDelete={() =>
                        setSelectedEmails((prev) =>
                          prev.filter((e) => e !== email)
                        )
                      }
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={handleClose} disabled={sending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={
              sending ? <CircularProgress size={16} /> : <SendIcon />
            }
            onClick={handleSend}
            disabled={sending || selectedEmails.length === 0}
            sx={{ minWidth: 120 }}
          >
            {sending ? "Sending..." : "Send Report"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ShareProjectDialog;
