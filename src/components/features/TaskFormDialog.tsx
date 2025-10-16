import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  AccountTreeRounded as EpicIcon,
  BugReport as BugIcon,
  Task as TaskIcon,
  Star as StoryIcon,
  Timeline as SprintIcon,
  Person as PersonIcon,
  Error as IssueIcon,
  CheckCircle as ApprovalIcon,
  MoreHoriz as OtherIcon,
} from "@mui/icons-material";
import type { Task, TaskStatus, TaskPriority, TaskType } from "@/types";
import type { TeamMemberDetail } from "@/types/api/organizations";
import { TaskService } from "@/services/TaskService";
import { OrganizationService } from "@/services/OrganizationService";
import { ProjectService } from "@/services/ProjectService";
import { createUniqueDisplayName } from "@/utils/userAvatars";
import UserAvatar from "@/components/ui/UserAvatar";

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  editTask?: Task | null;
  projectId: number;
  templateType: string;
  defaultStatus?: TaskStatus;
  showSprintInfo?: boolean;
  sprintInfo?: {
    id: number;
    name: string;
  };
  title?: string;
  subtitle?: string;
}

const statusOptions: TaskStatus[] = [
  "Backlog",
  "Todo",
  "In Progress",
  "Review",
  "Done",
];
const priorityOptions: TaskPriority[] = [
  "Highest",
  "High",
  "Medium",
  "Low",
  "Lowest",
];
const typeOptions: TaskType[] = ["Story", "Bug", "Task", "Epic", "Issue", "Approval", "Other"];

const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
  open,
  onClose,
  onSave,
  editTask,
  projectId,
  templateType,
  defaultStatus = "Backlog",
  showSprintInfo = false,
  sprintInfo,
  title,
  subtitle,
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "Medium",
    status: defaultStatus,
    type: "Task",
    assignee: "",
    reporter: "",
    dueDate: "",
    epic: "",
    storyPoints: 3,
    labels: [],
    comments: [],
    sprintId: sprintInfo?.id || 0,
  });

  const [availableEpics, setAvailableEpics] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberDetail[]>([]);
  const [userDisplayNames, setUserDisplayNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available epics and team members
  useEffect(() => {
    const fetchEpics = async () => {
      try {
        const tasks = await TaskService.getTasksByProjectId(
          projectId,
          templateType,
        );
        const epics = tasks.filter((task) => task.type === "Epic");
        setAvailableEpics(epics);
      } catch (error) {
        console.error("Failed to fetch epics:", error);
      }
    };

    const fetchTeamMembers = async () => {
      try {
        setLoadingTeamMembers(true);
        // Get the assigned team ID for this project
        const assignedTeamId = await ProjectService.getAssignedTeam(
          projectId,
          templateType,
        );
        
        if (assignedTeamId) {
          // Fetch team members if team is assigned
          const members = await OrganizationService.getTeamMembers(
            String(assignedTeamId)
          );
          setTeamMembers(members);
          
          // Generate unique display names for all members
          const displayNames: Record<number, string> = {};
          members.forEach(member => {
            displayNames[member.memberId] = createUniqueDisplayName(member, members);
          });
          setUserDisplayNames(displayNames);
          
          console.log("Fetched team members for task dialog:", members);
          console.log("Generated display names:", displayNames);
        } else {
          // No team assigned to project
          setTeamMembers([]);
          setUserDisplayNames({});
          console.log("No team assigned to this project");
        }
      } catch (error) {
        console.error("Failed to fetch team members:", error);
        setTeamMembers([]);
      } finally {
        setLoadingTeamMembers(false);
      }
    };

    if (open) {
      fetchEpics();
      fetchTeamMembers();
    }
  }, [open, projectId, templateType]);

  // Initialize form data when dialog opens or editTask changes
  useEffect(() => {
    if (editTask) {
      setFormData({
        ...editTask,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        status: defaultStatus,
        type: "Task",
        assignee: "",
        reporter: "",
        dueDate: "",
        epic: "",
        storyPoints: 3,
        labels: [],
        comments: [],
        sprintId: sprintInfo?.id || 0,
      });
    }
    setError(null);
  }, [editTask, defaultStatus, sprintInfo, open]);

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      setError("Task title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error("Error saving task:", error);
      setError("Failed to save task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      status: defaultStatus,
      type: "Task",
      assignee: "",
      reporter: "",
      dueDate: "",
      epic: "",
      storyPoints: 3,
      labels: [],
      comments: [],
      sprintId: sprintInfo?.id || 0,
    });
    setError(null);
    onClose();
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case "Epic":
        return <EpicIcon sx={{ color: "#8b5a2b" }} />;
      case "Story":
        return <StoryIcon sx={{ color: "#4caf50" }} />;
      case "Bug":
        return <BugIcon sx={{ color: "#f44336" }} />;
      case "Task":
        return <TaskIcon sx={{ color: "#2196f3" }} />;
      case "Issue":
        return <IssueIcon sx={{ color: "#ff9800" }} />;
      case "Approval":
        return <ApprovalIcon sx={{ color: "#9c27b0" }} />;
      case "Other":
        return <OtherIcon sx={{ color: "#607d8b" }} />;
      default:
        return <TaskIcon sx={{ color: "#2196f3" }} />;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "Highest":
        return "#d32f2f";
      case "High":
        return "#f57c00";
      case "Medium":
        return "#1976d2";
      case "Low":
        return "#388e3c";
      case "Lowest":
        return "#7b1fa2";
      default:
        return "#1976d2";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {title || (editTask ? "Edit Task" : "Create Task")}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}

        {/* Sprint Info */}
        {showSprintInfo && sprintInfo && !editTask && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1.5,
              bgcolor: "primary.50",
              border: "1px solid",
              borderColor: "primary.200",
              borderRadius: 2,
              mt: 1,
            }}
          >
            <SprintIcon sx={{ fontSize: 16, color: "primary.main" }} />
            <Typography variant="caption" color="primary.main" fontWeight={500}>
              This task will be assigned to: <strong>{sprintInfo.name}</strong>
            </Typography>
          </Box>
        )}

        {/* Team Assignment Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 1.5,
            bgcolor: teamMembers.length > 0 ? "success.50" : "warning.50",
            border: "1px solid",
            borderColor: teamMembers.length > 0 ? "success.200" : "warning.200",
            borderRadius: 2,
            mt: 1,
          }}
        >
          <PersonIcon sx={{ 
            fontSize: 16, 
            color: teamMembers.length > 0 ? "success.main" : "warning.main" 
          }} />
          <Typography 
            variant="caption" 
            color={teamMembers.length > 0 ? "success.main" : "warning.main"} 
            fontWeight={500}
          >
            {loadingTeamMembers 
              ? "Loading team members..." 
              : teamMembers.length > 0 
                ? `${teamMembers.length} team member${teamMembers.length !== 1 ? 's' : ''} available for assignment`
                : "No team assigned to this project - tasks can be created without assignee/reporter"
            }
          </Typography>
        </Box>

        {/* Epic Assignment Info */}
        {availableEpics.length > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1.5,
              bgcolor: "info.50",
              border: "1px solid",
              borderColor: "info.200",
              borderRadius: 2,
              mt: 1,
            }}
          >
            <EpicIcon sx={{ fontSize: 16, color: "info.main" }} />
            <Typography variant="caption" color="info.main" fontWeight={500}>
              {availableEpics.length} epic
              {availableEpics.length !== 1 ? "s" : ""} available for assignment
            </Typography>
          </Box>
        )}
      </DialogTitle>

      <DialogContent sx={{ pt: "12px !important" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Task Title"
          margin="normal"
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          error={!formData.title?.trim()}
          helperText={!formData.title?.trim() ? "Title is required" : ""}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Description"
          margin="normal"
          multiline
          rows={3}
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Task Type</InputLabel>
            <Select
              value={formData.type || "Task"}
              label="Task Type"
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as TaskType })
              }
            >
              {typeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {getTaskIcon(type)}
                    {type}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority || "Medium"}
              label="Priority"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as TaskPriority,
                })
              }
            >
              {priorityOptions.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: getPriorityColor(priority),
                      }}
                    />
                    {priority}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={formData.status || defaultStatus}
            label="Status"
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as TaskStatus })
            }
          >
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Story Points - Enhanced Visibility */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            border: "2px solid",
            borderColor: "primary.main",
            borderRadius: 3,
            backgroundColor: "primary.50",
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="primary.main"
            sx={{ mb: 1 }}
          >
            📊 Story Points Estimation
          </Typography>
          <TextField
            label="Story Points"
            type="number"
            value={formData.storyPoints ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, storyPoints: Number(e.target.value) })
            }
            inputProps={{ min: 0, max: 100 }}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                  borderWidth: 2,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.dark",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.dark",
                },
              },
              "& .MuiInputBase-input": {
                fontWeight: 700,
                fontSize: "1.2rem",
                textAlign: "center",
                color: "primary.main",
              },
              "& .MuiInputLabel-root": {
                fontWeight: 600,
                color: "primary.main",
              },
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: "block", textAlign: "center" }}
          >
            💡 Use Fibonacci scale: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89
          </Typography>
        </Box>

        {/* Epic Assignment */}
        {availableEpics.length > 0 && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Assign to Epic (Optional)</InputLabel>
            <Select
              value={formData.epic || ""}
              label="Assign to Epic (Optional)"
              onChange={(e) =>
                setFormData({ ...formData, epic: e.target.value })
              }
            >
              <MenuItem value="">
                <em>No Epic</em>
              </MenuItem>
              {availableEpics.map((epic) => (
                <MenuItem key={epic.id} value={epic.title}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EpicIcon sx={{ fontSize: 16, color: "#8b5a2b" }} />
                    <Typography variant="body2" noWrap>
                      {epic.title}
                    </Typography>
                    {epic.storyPoints && (
                      <Chip
                        label={`${epic.storyPoints} SP`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 16, fontSize: "0.7rem" }}
                      />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Team Members Assignment */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Assignee</InputLabel>
            <Select
              value={formData.assignee || ""}
              label="Assignee"
              onChange={(e) =>
                setFormData({ ...formData, assignee: e.target.value })
              }
              disabled={loadingTeamMembers}
              renderValue={(selected) => {
                if (!selected) return <em>Unassigned</em>;
                const member = teamMembers.find(m => m.email === selected);
                if (!member) return selected;
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <UserAvatar 
                      user={member} 
                      size={20} 
                      showTooltip={false} 
                      showLeadBadge={false}
                      allUsers={teamMembers}
                    />
                    <Typography variant="body2">
                      @{userDisplayNames[member.memberId]}
                    </Typography>
                  </Box>
                );
              }}
            >
              <MenuItem value="">
                <em>{teamMembers.length === 0 ? "No team members available" : "Unassigned"}</em>
              </MenuItem>
              {teamMembers.map((member) => (
                <MenuItem key={member.memberId} value={member.email}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}>
                    <UserAvatar 
                      user={member} 
                      size={32} 
                      showTooltip={false}
                      displayName={userDisplayNames[member.memberId]}
                      allUsers={teamMembers}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {member.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{userDisplayNames[member.memberId]}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {loadingTeamMembers && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                <CircularProgress size={16} />
              </Box>
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Reporter</InputLabel>
            <Select
              value={formData.reporter || ""}
              label="Reporter"
              onChange={(e) =>
                setFormData({ ...formData, reporter: e.target.value })
              }
              disabled={loadingTeamMembers}
              renderValue={(selected) => {
                if (!selected) return <em>No reporter</em>;
                const member = teamMembers.find(m => m.email === selected);
                if (!member) return selected;
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <UserAvatar 
                      user={member} 
                      size={20} 
                      showTooltip={false} 
                      showLeadBadge={false}
                      allUsers={teamMembers}
                    />
                    <Typography variant="body2">
                      @{userDisplayNames[member.memberId]}
                    </Typography>
                  </Box>
                );
              }}
            >
              <MenuItem value="">
                <em>{teamMembers.length === 0 ? "No team members available" : "No reporter"}</em>
              </MenuItem>
              {teamMembers.map((member) => (
                <MenuItem key={member.memberId} value={member.email}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}>
                    <UserAvatar 
                      user={member} 
                      size={32} 
                      showTooltip={false}
                      displayName={userDisplayNames[member.memberId]}
                      allUsers={teamMembers}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {member.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{userDisplayNames[member.memberId]}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {loadingTeamMembers && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                <CircularProgress size={16} />
              </Box>
            )}
          </FormControl>
        </Box>

        <TextField
          fullWidth
          label="Due Date"
          type="date"
          value={formData.dueDate?.slice(0, 10) || ""}
          onChange={(e) =>
            setFormData({ ...formData, dueDate: e.target.value })
          }
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || !formData.title?.trim()}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Saving...
            </>
          ) : editTask ? (
            "Update Task"
          ) : (
            "Create Task"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskFormDialog;
