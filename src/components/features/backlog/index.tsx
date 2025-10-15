import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Tooltip,
  TextField,
  MenuItem,
  Button,
  Stack,
  LinearProgress,
  Card,
  CardContent,
  Container,
  alpha,
  useTheme,
  InputAdornment,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PlayArrow as SprintIcon,
  Assignment as TasksIcon,
  Timeline as TimelineIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "react-beautiful-dnd";
import type { Task, TaskStatus } from "@/types";
import type { SprintDTO } from "@/types/featurevise/sprint";
import { TaskService } from "@/services/TaskService";
import { SprintService } from "@/services/SprintService";
import { TaskFormDialog } from "@/components/features";
import { NotificationService } from "@/services/NotificationService";
import { tokenManager } from "@/utils/tokenManager";

interface BacklogProps {
  projectId: number;
  projectName?: string;
  templateType: string;
}

const statusOptions: TaskStatus[] = [
  "Backlog",
  "Todo",
  "In Progress",
  "Review",
  "Done",
];

const Backlog: React.FC<BacklogProps> = ({
  projectId,
  projectName,
  templateType,
}) => {
  const theme = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestSprint, setLatestSprint] = useState<SprintDTO | null>(null);
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<number>>(
    new Set(),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  // Helper to get current user name
  const getCurrentUserName = () => {
    const userEmail = tokenManager.getUserEmail();
    if (userEmail) {
      const namePart = userEmail.split('@')[0];
      return namePart.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return "System";
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await TaskService.getTasksByProjectId(
        projectId,
        templateType,
      );
      setTasks(data);
    } catch {
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestSprint = async () => {
    try {
      const response = await SprintService.getLatestSprint(
        projectId,
        templateType,
      );
      setLatestSprint(response.data);
    } catch (error) {
      console.error("Failed to fetch latest sprint:", error);
      setLatestSprint(null);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchLatestSprint();
  }, [projectId, templateType]);

  const handleDelete = async (taskId: number) => {
    await TaskService.deleteTask(projectId, taskId, templateType);
    fetchTasks();
  };

  const handleSave = async (taskData: Partial<Task>) => {
    console.log("💾 handleSave called with taskData:", taskData);
    
    try {
      const currentUserName = getCurrentUserName();
      const currentProjectName = projectName || `Project ${projectId}`;
      
      if (editTask) {
        console.log("✏️ Updating existing task:", editTask.id);
        
        // Update existing task
        const updatedTask = await TaskService.updateTask(
          projectId,
          Number(editTask.id),
          taskData,
          templateType,
        );

        // Check if assignee or reporter changed to send notifications
        if (updatedTask) {
          const assigneeChanged = editTask.assignee !== taskData.assignee;
          const reporterChanged = editTask.reporter !== taskData.reporter;

          console.log("🔄 Change detection:", {
            assigneeChanged,
            reporterChanged,
            oldAssignee: editTask.assignee,
            newAssignee: taskData.assignee,
            oldReporter: editTask.reporter,
            newReporter: taskData.reporter,
          });

          // Send assignee notification if changed
          if (assigneeChanged && taskData.assignee) {
            console.log("📧 Sending notification to new assignee...");
            await NotificationService.sendTaskAssignmentNotification(
              updatedTask,
              currentProjectName,
              taskData.assignee,
              currentUserName
            );
          }

          // Send reporter notification if changed
          if (reporterChanged && taskData.reporter) {
            console.log("📧 Sending notification to new reporter...");
            await NotificationService.sendReporterNotification(
              updatedTask,
              currentProjectName,
              taskData.reporter,
              currentUserName
            );
          }
        }
      } else {
        console.log("➕ Creating new task", {
          assigneeSent: taskData.assignee,
          reporterSent: taskData.reporter,
        });
        
        // Create new task
        const createdTask = await TaskService.createTask(
          projectId,
          taskData as Omit<Task, "id">,
          templateType,
        );

        console.log("✅ Task created, received from backend:", {
          taskId: createdTask?.id,
          assigneeReceived: createdTask?.assignee,
          reporterReceived: createdTask?.reporter,
          assigneeIsEmail: createdTask?.assignee?.includes('@'),
          reporterIsEmail: createdTask?.reporter?.includes('@'),
        });

        // Send notifications to assignee and reporter
        if (createdTask) {
          if (createdTask.assignee) {
            console.log("📧 Sending notification to assignee:", createdTask.assignee);
            await NotificationService.sendTaskAssignmentNotification(
              createdTask,
              currentProjectName,
              createdTask.assignee,
              currentUserName
            );
          }

          if (createdTask.reporter) {
            console.log("📧 Sending notification to reporter...");
            await NotificationService.sendReporterNotification(
              createdTask,
              currentProjectName,
              createdTask.reporter,
              currentUserName
            );
          }
        }
      }

      setOpenDialog(false);
      setEditTask(null);
      fetchTasks();
    } catch (error) {
      console.error("❌ Failed to save task:", error);
      setError("Failed to save task. Please try again.");
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    // Prevent multiple simultaneous updates for the same task
    if (updatingTaskIds.has(taskId)) {
      console.log(`⏭️ Task ${taskId} is already being updated`);
      return;
    }

    // Get the task before updating to compare old status
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      console.error("❌ Task not found:", taskId);
      return;
    }
    const oldStatus = task.status;

    console.log(`📊 Status change initiated:`, {
      taskId,
      taskTitle: task.title,
      oldStatus,
      newStatus,
      reporter: task.reporter,
      assignee: task.assignee,
    });

    try {
      console.log(`🔄 Updating task ${taskId} status to "${newStatus}"`);

      // Add task to updating set
      setUpdatingTaskIds((prev) => new Set(prev.add(taskId)));

      const updatedTask = await TaskService.updateTaskStatus(
        projectId,
        taskId,
        newStatus,
        templateType,
      );

      if (updatedTask) {
        console.log("✅ Task status updated successfully:", updatedTask);
        
        // Update the local state with the response from the server
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === taskId ? { ...task, ...updatedTask } : task,
          ),
        );
        
        // Send notifications based on status change
        console.log("📬 Checking for status change notification...");
        const currentUserName = getCurrentUserName();
        const currentProjectName = projectName || `Project ${projectId}`;
        
        // Send review notification when status changes to "Review"
        if (newStatus === "Review" && updatedTask.reporter) {
          console.log("🔍 Sending review notification to reporter...");
          await NotificationService.sendReviewNotification(
            updatedTask,
            currentProjectName,
            updatedTask.reporter,
            currentUserName
          );
        }
        
        // Send notification when status changes to "In Progress"
        if (newStatus === "In Progress" && updatedTask.assignee) {
          console.log("🚀 Sending in-progress notification to assignee...");
          await NotificationService.sendTaskAssignmentNotification(
            updatedTask,
            currentProjectName,
            updatedTask.assignee,
            currentUserName
          );
        }
        
        // Clear any existing errors
        setError(null);
      } else {
        console.error("❌ Failed to update task status - no response from server");
        setError("Failed to update task status. Please try again.");
      }
    } catch (error: any) {
      console.error("❌ Error updating task status:", error);

      // Provide more specific error messages based on the error type
      let errorMessage = "Failed to update task status. Please try again.";

      if (
        error?.code === "ERR_NETWORK" ||
        error?.message?.includes("ERR_FAILED")
      ) {
        errorMessage =
          "Cannot connect to the server. Please check if the backend server is running at http://localhost:8080 and try again.";
      } else if (error?.response?.status === 401) {
        errorMessage =
          "You are not authorized to update this task. Please log in again.";
      } else if (error?.response?.status === 404) {
        errorMessage =
          "Task not found. It may have been deleted by another user.";
      } else if (error?.response?.status === 500) {
        errorMessage =
          "Server error occurred while updating the task. Please try again later.";
      } else if (error?.response?.data?.message) {
        errorMessage = `Failed to update task: ${error.response.data.message}`;
      }

      setError(errorMessage);
    } finally {
      // Remove task from updating set
      setUpdatingTaskIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination, source } = result;
    const taskId = Number(draggableId);
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      console.error("Task not found:", taskId);
      return;
    }

    // If dropped on sprint area from backlog
    if (
      destination.droppableId === "sprint" &&
      source.droppableId === "backlog" &&
      latestSprint &&
      latestSprint.id
    ) {
      try {
        console.log(`Assigning task ${taskId} to sprint ${latestSprint.id}`);
        await TaskService.updateTaskSprint(
          projectId,
          taskId,
          latestSprint.id,
          templateType,
        );
        console.log("Task assigned to sprint successfully");
        await fetchTasks(); // Refresh tasks immediately
      } catch (error) {
        console.error("Failed to assign task to sprint:", error);
        setError("Failed to assign task to sprint");
      }
    }

    // If dropped back to backlog from sprint
    else if (
      destination.droppableId === "backlog" &&
      source.droppableId === "sprint"
    ) {
      try {
        console.log(`Removing task ${taskId} from sprint`);
        // For removing from sprint, we'll use sprintId = null
        await TaskService.updateTaskSprint(
          projectId,
          taskId,
          null,
          templateType,
        );
        console.log("Task removed from sprint successfully");
        await fetchTasks(); // Refresh tasks immediately
      } catch (error) {
        console.error("Failed to remove task from sprint:", error);
        setError("Failed to remove task from sprint");
      }
    }

    // If moving within the same container (reordering), we don't need to update sprintId
    else if (destination.droppableId === source.droppableId) {
      console.log("Reordering within same container - no sprint update needed");
      // Could implement reordering logic here if needed
    }
  };

  // Separate tasks by sprint assignment - show ALL tasks correctly
  const backlogTasks = tasks.filter((task) => {
    // Task is in backlog if it has no sprintId, sprintId is 0, null, or undefined
    return !task.sprintId || task.sprintId === 0 || task.sprintId === null;
  });

  const sprintTasks = tasks.filter((task) => {
    // Task is in sprint if it has a valid sprintId that matches the latest sprint
    return (
      task.sprintId &&
      task.sprintId > 0 &&
      latestSprint &&
      task.sprintId === latestSprint.id
    );
  });

  // Apply search filtering
  const filteredBacklogTasks = backlogTasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.reporter?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredSprintTasks = sprintTasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.reporter?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Debug logging to help troubleshoot
  console.log("All tasks:", tasks.length);
  console.log("Latest sprint:", latestSprint);
  console.log(
    "Backlog tasks:",
    backlogTasks.length,
    backlogTasks.map((t) => ({
      id: t.id,
      title: t.title,
      sprintId: t.sprintId,
    })),
  );
  console.log(
    "Sprint tasks:",
    sprintTasks.length,
    sprintTasks.map((t) => ({
      id: t.id,
      title: t.title,
      sprintId: t.sprintId,
    })),
  );

  // Calculate sprint progress
  const sprintProgress = React.useMemo(() => {
    if (!sprintTasks.length) return 0;
    const completedTasks = sprintTasks.filter(
      (task) => task.status === "Done",
    ).length;
    return Math.round((completedTasks / sprintTasks.length) * 100);
  }, [sprintTasks]);

  const renderTaskCard = (task: Task) => {
    const priorityColors = {
      Highest: { color: "#d32f2f", bg: "rgba(211, 47, 47, 0.1)" },
      High: { color: "#f57c00", bg: "rgba(245, 124, 0, 0.1)" },
      Medium: { color: "#1976d2", bg: "rgba(25, 118, 210, 0.1)" },
      Low: { color: "#388e3c", bg: "rgba(56, 142, 60, 0.1)" },
      Lowest: { color: "#7b1fa2", bg: "rgba(123, 31, 162, 0.1)" },
    };

    const typeColors = {
      Story: { color: "#4caf50", bg: "rgba(76, 175, 80, 0.1)" },
      Bug: { color: "#f44336", bg: "rgba(244, 67, 54, 0.1)" },
      Task: { color: "#2196f3", bg: "rgba(33, 150, 243, 0.1)" },
      Epic: { color: "#9c27b0", bg: "rgba(156, 39, 176, 0.1)" },
    };

    const statusColors = {
      Backlog: { color: "#757575", bg: "rgba(117, 117, 117, 0.1)" },
      Todo: { color: "#1976d2", bg: "rgba(25, 118, 210, 0.1)" },
      "In Progress": { color: "#ff9800", bg: "rgba(255, 152, 0, 0.1)" },
      Review: { color: "#9c27b0", bg: "rgba(156, 39, 176, 0.1)" },
      Done: { color: "#4caf50", bg: "rgba(76, 175, 80, 0.1)" },
    };

    const priorityColor =
      priorityColors[task.priority as keyof typeof priorityColors] ||
      priorityColors.Medium;
    const typeColor =
      typeColors[task.type as keyof typeof typeColors] || typeColors.Task;
    const statusColor =
      statusColors[task.status as keyof typeof statusColors] ||
      statusColors.Todo;

    return (
      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.5),
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "grab",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
            borderColor: theme.palette.primary.main,
          },
          "&:active": {
            cursor: "grabbing",
          },
          bgcolor: "background.paper",
        }}
      >
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 1.5,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                lineHeight: 1.4,
                flex: 1,
                mr: 1.5,
              }}
            >
              {task.title}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
              <IconButton
                size="small"
                sx={{
                  color: theme.palette.primary.main,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
                onClick={() => {
                  setEditTask(task);
                  setOpenDialog(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: theme.palette.error.main,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                  },
                }}
                onClick={() => handleDelete(Number(task.id))}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Description */}
          {task.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.4,
              }}
            >
              {task.description}
            </Typography>
          )}

          {/* Tags */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
          >
            <Chip
              label={task.type}
              size="small"
              sx={{
                backgroundColor: typeColor.bg,
                color: typeColor.color,
                fontWeight: 600,
                fontSize: "0.75rem",
                height: 24,
                borderRadius: 1.5,
                "& .MuiChip-label": { px: 1.5 },
              }}
            />
            <Chip
              label={task.priority}
              size="small"
              sx={{
                backgroundColor: priorityColor.bg,
                color: priorityColor.color,
                fontWeight: 600,
                fontSize: "0.75rem",
                height: 24,
                borderRadius: 1.5,
                "& .MuiChip-label": { px: 1.5 },
              }}
            />
            <Chip
              label={`${task.storyPoints ?? 0} SP`}
              size="small"
              variant="outlined"
              sx={{
                fontSize: "0.75rem",
                height: 24,
                borderRadius: 1.5,
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: theme.palette.text.secondary,
                fontWeight: 600,
                "& .MuiChip-label": { px: 1.5 },
              }}
            />
          </Stack>

          {/* Assignee & Reporter */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              {task.assignee && (
                <Tooltip title={`Assigned to: ${task.assignee}`} arrow>
                  <Chip
                    label={task.assignee}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: "0.7rem",
                      height: 22,
                      borderRadius: 1.5,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    }}
                  />
                </Tooltip>
              )}
              {task.reporter && (
                <Tooltip title={`Reporter: ${task.reporter}`} arrow>
                  <Chip
                    label={task.reporter}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: "0.7rem",
                      height: 22,
                      borderRadius: 1.5,
                      borderColor: alpha(theme.palette.secondary.main, 0.3),
                      bgcolor: alpha(theme.palette.secondary.main, 0.04),
                    }}
                  />
                </Tooltip>
              )}
            </Box>
            {task.dueDate && (
              <Typography
                variant="caption"
                sx={{
                  color:
                    new Date(task.dueDate) < new Date()
                      ? theme.palette.error.main
                      : theme.palette.text.secondary,
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  whiteSpace: "nowrap",
                }}
              >
                Due: {task.dueDate.slice(0, 10)}
              </Typography>
            )}
          </Box>

          {/* Status Dropdown */}
          <TextField
            select
            size="small"
            fullWidth
            value={task.status}
            onChange={(e) => {
              const newStatus = e.target.value as TaskStatus;
              console.log(
                `Status changed for task ${task.id}: ${task.status} -> ${newStatus}`,
              );
              handleStatusChange(Number(task.id), newStatus);
            }}
            disabled={loading || updatingTaskIds.has(Number(task.id))}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                backgroundColor: statusColor.bg,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(statusColor.color, 0.3),
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: statusColor.color,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: statusColor.color,
                  borderWidth: 2,
                },
              },
              "& .MuiInputBase-input": {
                color: statusColor.color,
                fontWeight: 600,
                fontSize: "0.8rem",
                py: 1,
              },
              "& .MuiSelect-icon": {
                color: statusColor.color,
              },
            }}
          >
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor:
                        statusColors[status as keyof typeof statusColors]
                          ?.color || "#757575",
                    }}
                  />
                  {status}
                </Box>
              </MenuItem>
            ))}
          </TextField>

          {/* Show updating indicator */}
          {updatingTaskIds.has(Number(task.id)) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
              <CircularProgress size={14} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Updating status...
              </Typography>
            </Box>
          )}

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
              {task.labels.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  variant="outlined"
                  sx={{
                    mr: 0.5,
                    mb: 0.5,
                    fontSize: "0.7rem",
                    height: 20,
                    borderRadius: 1,
                    borderColor: alpha(theme.palette.text.secondary, 0.2),
                  }}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Modern Header */}
          <Box
            sx={{
              mb: 4,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
            }}
          >
            <Box>
              <Typography 
                variant="h4" 
                fontWeight="700" 
                color="text.primary"
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1.5,
                  mb: 0.5
                }}
              >
                <TasksIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                Backlog
              </Typography>
              {projectName && (
                <Typography variant="body1" color="text.secondary">
                  {projectName}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.2,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                "&:hover": {
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                },
              }}
            >
              New Task
            </Button>
          </Box>

          {/* Modern Search */}
          <Card sx={{ mb: 4, borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <CardContent sx={{ p: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search tasks by title, assignee, or reporter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.common.white, 0.8),
                    "&:hover": {
                      backgroundColor: theme.palette.common.white,
                    },
                    "& fieldset": {
                      borderColor: "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Modern Loading and Error States */}
          {loading ? (
            <Box 
              sx={{ 
                display: "flex", 
                flexDirection: "column",
                justifyContent: "center", 
                alignItems: "center",
                py: 12,
                bgcolor: "white",
                borderRadius: 3,
              }}
            >
              <CircularProgress size={48} sx={{ mb: 2, color: theme.palette.primary.main }} />
              <Typography variant="h6" color="text.secondary">
                Loading backlog...
              </Typography>
            </Box>
          ) : error ? (
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
                "& .MuiAlert-icon": { fontSize: 28 },
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          ) : (
          <>
            {/* Modern Two-Section Layout: Sprint and Backlog */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                gap: 3,
              }}
            >
              {/* Modern Sprint Section */}
              {latestSprint && (
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  {/* Sprint Header */}
                  <Box
                    sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                      color: "white",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <SprintIcon sx={{ fontSize: 28 }} />
                        <Box>
                          <Typography variant="h6" fontWeight="700">
                            {latestSprint.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ opacity: 0.9, mt: 0.5 }}
                          >
                            {new Date(
                              latestSprint.startDate,
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              latestSprint.endDate,
                            ).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="h4" fontWeight="700">
                          {sprintProgress}%
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Complete
                        </Typography>
                      </Box>
                    </Box>

                    {latestSprint.goal && (
                      <Typography
                        variant="body2"
                        sx={{ mt: 2, opacity: 0.9, fontStyle: "italic" }}
                      >
                        Goal: {latestSprint.goal}
                      </Typography>
                    )}

                    <LinearProgress
                      variant="determinate"
                      value={sprintProgress}
                      sx={{
                        mt: 2,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(255,255,255,0.3)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "white",
                          borderRadius: 4,
                        },
                      }}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {filteredSprintTasks.length} tasks in sprint
                      </Typography>
                      <Chip
                        label={`${sprintTasks.filter((t) => t.status === "Done").length} / ${sprintTasks.length} Done`}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.2)",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Sprint Drop Zone */}
                  <Droppable droppableId="sprint">
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          minHeight: "400px",
                          p: 3,
                          border: snapshot.isDraggingOver
                            ? `2px dashed ${theme.palette.secondary.main}`
                            : "2px dashed transparent",
                          borderRadius: 2,
                          backgroundColor: snapshot.isDraggingOver
                            ? alpha(theme.palette.secondary.main, 0.08)
                            : "transparent",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        {filteredSprintTasks.length === 0 ? (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              minHeight: "300px",
                              color: "text.secondary",
                              textAlign: "center",
                              py: 4,
                            }}
                          >
                            <TimelineIcon
                              sx={{
                                fontSize: 72,
                                opacity: 0.2,
                                mb: 2,
                                color: theme.palette.secondary.main,
                              }}
                            />
                            <Typography variant="h6" color="text.secondary" fontWeight={600} gutterBottom>
                              {snapshot.isDraggingOver
                                ? "Drop tasks here!"
                                : "No tasks in this sprint"}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1, maxWidth: 300 }}
                            >
                              {snapshot.isDraggingOver
                                ? "Release to add to sprint"
                                : "Drag tasks from Product Backlog to plan your sprint"}
                            </Typography>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            {filteredSprintTasks.map((task, index) => (
                              <Draggable
                                key={task.id}
                                draggableId={String(task.id)}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      transform: snapshot.isDragging
                                        ? `${provided.draggableProps.style?.transform} rotate(3deg) scale(1.02)`
                                        : provided.draggableProps.style
                                            ?.transform,
                                    }}
                                  >
                                    {renderTaskCard(task)}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </Box>
                        )}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Card>
              )}

              {/* Modern Product Backlog Section */}
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                {/* Backlog Header */}
                <Box
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: "white",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <TasksIcon sx={{ fontSize: 28 }} />
                      <Box>
                        <Typography variant="h6" fontWeight="700">
                          Product Backlog
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ opacity: 0.9 }}
                        >
                          Ready for sprint planning
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={`${filteredBacklogTasks.length} tasks`}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    />
                  </Box>
                </Box>

                {/* Backlog Drop Zone */}
                <Droppable droppableId="backlog">
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        minHeight: "400px",
                        p: 3,
                        border: snapshot.isDraggingOver
                          ? `2px dashed ${theme.palette.primary.main}`
                          : "2px dashed transparent",
                        borderRadius: 2,
                        backgroundColor: snapshot.isDraggingOver
                          ? alpha(theme.palette.primary.main, 0.08)
                          : "transparent",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      {filteredBacklogTasks.length === 0 ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: "300px",
                            color: "text.secondary",
                            textAlign: "center",
                            py: 4,
                          }}
                        >
                          <TasksIcon
                            sx={{
                              fontSize: 72,
                              opacity: 0.2,
                              mb: 2,
                              color: theme.palette.primary.main,
                            }}
                          />
                          <Typography variant="h6" color="text.secondary" fontWeight={600} gutterBottom>
                            {snapshot.isDraggingOver
                              ? "Drop tasks here!"
                              : "No tasks in backlog"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, maxWidth: 300 }}
                          >
                            {snapshot.isDraggingOver
                              ? "Release to move back to backlog"
                              : "Create new tasks or search with different criteria"}
                          </Typography>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          {filteredBacklogTasks.map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={String(task.id)}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    transform: snapshot.isDragging
                                      ? `${provided.draggableProps.style?.transform} rotate(-3deg) scale(1.02)`
                                      : provided.draggableProps.style
                                          ?.transform,
                                  }}
                                >
                                  {renderTaskCard(task)}
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </Box>
                      )}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Card>
            </Box>
          </>
        )}

        {/* Task Form Dialog */}
        <TaskFormDialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setEditTask(null);
          }}
          onSave={handleSave}
          editTask={editTask}
          projectId={projectId}
          templateType={templateType}
          defaultStatus="Backlog"
          title="Backlog Task"
          subtitle={`Add tasks to your ${projectName} backlog`}
        />
        </Container>
      </Box>
    </DragDropContext>
  );
};

export default Backlog;
