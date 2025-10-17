import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
  Alert,
  CircularProgress,
  Paper,
  Badge,
  LinearProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Assignment as TaskIcon,
  BugReport as BugIcon,
  AutoStories as StoryIcon,
  Category as EpicIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  ViewWeek as BoardIcon,
  Error as IssueIcon,
  CheckCircle as ApprovalIcon,
  MoreHoriz as OtherIcon,
} from "@mui/icons-material";
import { TaskService } from "@/services/TaskService";
import { NotificationService } from "@/services/NotificationService";
import { tokenManager } from "@/utils/tokenManager";
import { TaskFormDialog } from "@/components/features";
import type { Task, TaskStatus, TaskPriority, TaskType } from "@/types";

interface BoardProps {
  projectId: string;
  projectName?: string;
  templateType?: string;
}

const statusColumns: TaskStatus[] = ["Todo", "In Progress", "Done"];
const approvalColumn: TaskStatus = "Approvals";
const priorityOptions: TaskPriority[] = [
  "Highest",
  "High",
  "Medium",
  "Low",
  "Lowest",
];
const typeOptions: TaskType[] = ["Story", "Bug", "Task", "Epic", "Issue", "Approval", "Other"];

const Board: React.FC<BoardProps> = ({
  projectId,
  projectName,
  templateType = "traditional",
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  // Auto-scroll state for drag and drop
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await TaskService.getTasksByProjectId(
        Number(projectId),
        templateType,
      );
      setTasks(data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, templateType]);

  // Auto-scroll handler for drag and drop
  const handleDragUpdate = (update: any) => {
    if (!update.destination) {
      setDraggedOverColumn(null);
      return;
    }
    setDraggedOverColumn(update.destination.droppableId);
  };

  const handleDragEnd = async (result: DropResult) => {
    console.log("Drag end result:", result);

    if (!result.destination) {
      console.log("No destination - drag cancelled");
      return;
    }

    const { draggableId, destination, source } = result;
    // Extract actual task ID from draggableId (remove 'task-' prefix)
    const taskId = Number(draggableId.replace("task-", ""));
    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    // Check if status actually changed
    if (oldStatus === newStatus) {
      console.log("Same status - no update needed");
      return;
    }

    console.log(`Moving task ${taskId} from "${oldStatus}" to "${newStatus}"`);

    // Find the task to verify it exists
    const task = tasks.find((t) => Number(t.id) === taskId);
    if (!task) {
      console.error("Task not found:", taskId);
      setError(`Task ${taskId} not found`);
      return;
    }

    // Prevent moving Epic tasks
    if (task.type === "Epic") {
      setError("Epic tasks cannot be moved between columns. They are read-only.");
      return;
    }

    // Prevent moving tasks into Epic column
    if (newStatus === "Epic") {
      setError("Tasks cannot be moved into the Epic column. Only Epic-type tasks are displayed there.");
      return;
    }

    console.log("Found task:", {
      id: task.id,
      title: task.title,
      currentStatus: task.status,
      type: task.type,
    });

    // Optimistic update - immediately update the UI
    const originalTasks = [...tasks];
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        Number(t.id) === taskId ? { ...t, status: newStatus as TaskStatus } : t,
      ),
    );

    try {
      console.log(
        `Calling TaskService.updateTaskStatus(${projectId}, ${taskId}, "${newStatus}", "${templateType}")`,
      );

      const updatedTask = await TaskService.updateTaskStatus(
        Number(projectId),
        taskId,
        newStatus as TaskStatus,
        templateType,
      );

      if (!updatedTask) {
        throw new Error("No response from server");
      }

      console.log("Task status updated successfully:", updatedTask);

      // Clear any existing errors
      setError(null);
      setDraggedOverColumn(null);
    } catch (error) {
      console.error("Failed to update task status:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to update task status: ${errorMessage}`);

      // Revert optimistic update on error
      setTasks(originalTasks);
      setDraggedOverColumn(null);
    }
  };

  const handleSave = async (taskData: Partial<Task>) => {
    try {
      const currentUserName = tokenManager.getUserEmail()?.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "System";
      const currentProjectName = projectName || `Project ${projectId}`;
      
      if (editTask) {
        const updatedTask = await TaskService.updateTask(
          Number(projectId),
          Number(editTask.id),
          taskData,
          templateType,
        );
        
        // Send notification if assignee changed
        if (updatedTask && taskData.assignee && editTask.assignee !== taskData.assignee) {
          console.log("📧 Assignee changed, sending notification...");
          try {
            await NotificationService.sendTaskAssignmentNotification(
              updatedTask,
              currentProjectName,
              taskData.assignee,
              currentUserName
            );
          } catch (notifError) {
            console.error("Failed to send notification:", notifError);
          }
        }
      } else {
        const createdTask = await TaskService.createTask(
          Number(projectId),
          taskData as Omit<Task, "id">,
          templateType,
        );
        
        // Send notification to assignee when task is created
        if (createdTask && createdTask.assignee) {
          console.log("📧 Sending notification to assignee:", createdTask.assignee);
          try {
            await NotificationService.sendTaskAssignmentNotification(
              createdTask,
              currentProjectName,
              createdTask.assignee,
              currentUserName
            );
            console.log("✅ Assignee notification sent successfully");
          } catch (notifError) {
            console.error("❌ Failed to send notification:", notifError);
          }
        }
        
        // Send notification to reporter if set
        if (createdTask && createdTask.reporter) {
          console.log("📧 Sending notification to reporter:", createdTask.reporter);
          try {
            await NotificationService.sendReporterNotification(
              createdTask,
              currentProjectName,
              createdTask.reporter,
              currentUserName
            );
            console.log("✅ Reporter notification sent successfully");
          } catch (notifError) {
            console.error("❌ Failed to send reporter notification:", notifError);
          }
        }
      }

      setOpenDialog(false);
      setEditTask(null);
      fetchTasks();
    } catch (error) {
      console.error("Failed to save task:", error);
      setError("Failed to save task.");
    }
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case "Epic":
        return <EpicIcon sx={{ color: "#b45309", fontSize: 18 }} />;
      case "Story":
        return <StoryIcon sx={{ color: "#0d9488", fontSize: 18 }} />;
      case "Bug":
        return <BugIcon sx={{ color: "#e11d48", fontSize: 18 }} />;
      case "Task":
        return <TaskIcon sx={{ color: "#3b82f6", fontSize: 18 }} />;
      case "Issue":
        return <IssueIcon sx={{ color: "#f97316", fontSize: 18 }} />;
      case "Approval":
        return <ApprovalIcon sx={{ color: "#a855f7", fontSize: 18 }} />;
      case "Other":
        return <OtherIcon sx={{ color: "#6b7280", fontSize: 18 }} />;
      default:
        return <TaskIcon sx={{ color: "#3b82f6", fontSize: 18 }} />;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "Highest":
        return { main: "#e11d48", light: "#fff1f2", border: "#fecdd3" };
      case "High":
        return { main: "#f97316", light: "#fff7ed", border: "#fed7aa" };
      case "Medium":
        return { main: "#3b82f6", light: "#eff6ff", border: "#bfdbfe" };
      case "Low":
        return { main: "#14b8a6", light: "#f0fdfa", border: "#99f6e4" };
      case "Lowest":
        return { main: "#8b5cf6", light: "#faf5ff", border: "#e9d5ff" };
      default:
        return { main: "#3b82f6", light: "#eff6ff", border: "#bfdbfe" };
    }
  };

  const getColumnColor = (status: TaskStatus) => {
    switch (status) {
      case "Todo":
        return { 
          bg: "#f0f4ff", 
          border: "#4f46e5", 
          text: "#312e81",
          headerBg: "#e0e7ff",
          accent: "#6366f1"
        };
      case "In Progress":
        return { 
          bg: "#fff8f0", 
          border: "#f97316", 
          text: "#7c2d12",
          headerBg: "#fed7aa",
          accent: "#fb923c"
        };
      case "Approvals":
        return { 
          bg: "#faf5ff", 
          border: "#9333ea", 
          text: "#581c87",
          headerBg: "#e9d5ff",
          accent: "#a855f7"
        };
      case "Done":
        return { 
          bg: "#f0fdf4", 
          border: "#059669", 
          text: "#065f46",
          headerBg: "#d1fae5",
          accent: "#10b981"
        };
      default:
        return { 
          bg: "#f8fafc", 
          border: "#64748b", 
          text: "#334155",
          headerBg: "#e2e8f0",
          accent: "#94a3b8"
        };
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => {
      const matchesStatus = task.status === status;
      const matchesSearch =
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Exclude Epic tasks from regular columns
      const isNotEpic = task.type !== "Epic";

      // For Approvals column, only show Approval type tasks
      if (status === "Approvals") {
        return matchesStatus && matchesSearch && task.type === "Approval";
      }

      return matchesStatus && matchesSearch && isNotEpic;
    });
  };

  const renderTaskCard = (task: Task, index: number) => (
    <Draggable
      key={`task-${task.id}`}
      draggableId={`task-${task.id}`}
      index={index}
    >
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          elevation={snapshot.isDragging ? 8 : 1}
          sx={{
            mb: 2,
            borderRadius: 3,
            border: "2px solid",
            borderColor: snapshot.isDragging ? "#4f46e5" : "#e5e7eb",
            transition: "all 0.2s ease-in-out",
            transform: snapshot.isDragging ? "rotate(2deg)" : "none",
            cursor: "grab",
            "&:hover": {
              transform: snapshot.isDragging
                ? "rotate(2deg)"
                : "translateY(-2px)",
              boxShadow: "0 12px 24px rgba(79, 70, 229, 0.15)",
              borderColor: "#6366f1",
            },
            "&:active": {
              cursor: "grabbing",
            },
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          <CardContent sx={{ p: 2, pb: "16px !important" }}>
            {/* Header with type and priority */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {getTaskIcon(task.type)}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={500}
                >
                  {task.type}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  icon={<FlagIcon sx={{ fontSize: 12 }} />}
                  label={task.priority}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 600,
                    bgcolor: getPriorityColor(task.priority).light,
                    color: getPriorityColor(task.priority).main,
                    border: `1.5px solid ${getPriorityColor(task.priority).border}`,
                  }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditTask(task);
                    setOpenDialog(true);
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Title */}
            <Typography
              variant="body1"
              fontWeight={600}
              sx={{ mb: 1, lineHeight: 1.3 }}
            >
              {task.title}
            </Typography>

            {/* Description */}
            {task.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {task.description}
              </Typography>
            )}

            {/* Footer with assignee, due date, and story points */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {task.assignee ? (
                  <Tooltip title={`Assigned to ${task.assignee}`}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                      {task.assignee.charAt(0).toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ) : (
                  <Tooltip title="Unassigned">
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: 12,
                        bgcolor: "grey.300",
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 14 }} />
                    </Avatar>
                  </Tooltip>
                )}

                {task.dueDate && (
                  <Tooltip
                    title={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                  >
                    <Chip
                      icon={<CalendarIcon sx={{ fontSize: 12 }} />}
                      label={new Date(task.dueDate).toLocaleDateString()}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 20,
                        fontSize: 10,
                        "& .MuiChip-icon": { marginLeft: "4px" },
                      }}
                    />
                  </Tooltip>
                )}
              </Box>

              {task.storyPoints && (
                <Chip
                  label={task.storyPoints}
                  size="small"
                  sx={{
                    height: 24,
                    minWidth: 32,
                    fontSize: 11,
                    fontWeight: 700,
                    bgcolor: "#eff6ff",
                    color: "#3b82f6",
                    border: "2px solid #bfdbfe",
                    borderRadius: 2,
                  }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  // Render Epic Column (Non-Movable)
  const renderEpicColumn = () => {
    const epicTasks = tasks.filter((task) => task.type === "Epic");
    const columnColor = { 
      bg: "#fffbeb", 
      border: "#d97706", 
      text: "#78350f",
      headerBg: "#fef3c7",
      accent: "#f59e0b"
    };

    return (
      <Box key="Epic" sx={{ flex: 1, minWidth: 350, maxWidth: 400 }}>
        <Paper
          elevation={2}
          sx={{
            display: "flex",
            flexDirection: "column",
            bgcolor: columnColor.bg,
            border: `3px solid ${columnColor.border}`,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(202, 138, 4, 0.1)",
            minHeight: "700px",
          }}
        >
          {/* Column Header */}
          <Box
            sx={{
              p: 2.5,
              minHeight: 100,
              borderBottom: `3px solid ${columnColor.border}`,
              background: `linear-gradient(135deg, ${columnColor.headerBg} 0%, ${columnColor.bg} 100%)`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
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
                <EpicIcon sx={{ color: columnColor.border }} />
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: columnColor.text }}
                >
                  Epics (Read-Only)
                </Typography>
              </Box>
              <Badge
                badgeContent={epicTasks.length}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: columnColor.accent,
                    color: "white",
                    fontWeight: 700,
                    fontSize: 12,
                    height: 24,
                    minWidth: 24,
                    borderRadius: 2,
                  },
                }}
              >
                <Box />
              </Badge>
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 1, 
                color: columnColor.text,
                fontWeight: 500,
                fontSize: 11
              }}
            >
              Epic tasks cannot be moved or edited here
            </Typography>
          </Box>

          {/* Non-Droppable Area */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              minHeight: 400,
              maxHeight: "calc(100vh - 250px)",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(255, 255, 255, 0.3)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(255, 255, 255, 0.6)",
                borderRadius: "10px",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.8)",
                },
              },
            }}
          >
            {epicTasks.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "text.secondary",
                }}
              >
                <Typography variant="body2">No Epics</Typography>
              </Box>
            ) : (
              epicTasks.map((task) => (
                <Card
                  key={task.id}
                  sx={{
                    mb: 2,
                    cursor: "not-allowed",
                    opacity: 0.9,
                    border: `2px solid ${columnColor.border}50`,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #ffffff 0%, #fffef7 100%)",
                    "&:hover": {
                      boxShadow: "0 6px 16px rgba(202, 138, 4, 0.15)",
                      opacity: 1,
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    {/* Task Header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                          {getTaskIcon(task.type)}
                          <Typography variant="caption" color="text.secondary">
                            {task.type}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ color: "text.primary", mb: 1 }}
                        >
                          {task.title}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditTask(task);
                          setOpenDialog(true);
                        }}
                        sx={{ ml: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Task Details */}
                    {task.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          mb: 1,
                        }}
                      >
                        {task.description}
                      </Typography>
                    )}

                    {/* Task Footer */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        <Chip
                          label={task.status}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: 10,
                            fontWeight: 600,
                            bgcolor: "#f3f4f6",
                            color: "#4b5563",
                            border: "1.5px solid #e5e7eb",
                          }}
                        />
                        <Chip
                          label={task.priority}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: 10,
                            fontWeight: 600,
                            bgcolor: getPriorityColor(task.priority).light,
                            color: getPriorityColor(task.priority).main,
                            border: `1.5px solid ${getPriorityColor(task.priority).border}`,
                          }}
                        />
                      </Box>

                      {task.assignee && (
                        <Tooltip title={task.assignee}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 11 }}>
                            {task.assignee[0]?.toUpperCase()}
                          </Avatar>
                        </Tooltip>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </Paper>
      </Box>
    );
  };

  const renderColumn = (status: TaskStatus) => {
    const columnTasks = getTasksByStatus(status);
    const columnColor = getColumnColor(status);

    return (
      <Box key={status} sx={{ flex: 1, minWidth: 350, maxWidth: 400 }}>
        <Paper
          elevation={2}
          sx={{
            display: "flex",
            flexDirection: "column",
            bgcolor: columnColor.bg,
            border: `3px solid ${columnColor.border}30`,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: `0 4px 12px ${columnColor.border}15`,
            minHeight: "700px",
          }}
        >
          {/* Column Header */}
          <Box
            sx={{
              p: 2.5,
              minHeight: 100,
              borderBottom: `3px solid ${columnColor.border}40`,
              background: `linear-gradient(135deg, ${columnColor.headerBg} 0%, ${columnColor.bg} 100%)`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ 
                  color: columnColor.text,
                  fontSize: 18,
                  letterSpacing: 0.5
                }}
              >
                {status}
              </Typography>
              <Badge
                badgeContent={columnTasks.length}
                color="primary"
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: columnColor.accent,
                    color: "white",
                    fontWeight: 700,
                    fontSize: 12,
                    height: 24,
                    minWidth: 24,
                    borderRadius: 2,
                  },
                }}
              >
                <Box />
              </Badge>
            </Box>

            {(status === "Done" || status === "Approvals") && columnTasks.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={status === "Done" ? 100 : 75}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: `${columnColor.border}20`,
                    "& .MuiLinearProgress-bar": {
                      bgcolor: columnColor.accent,
                      borderRadius: 3,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ 
                    mt: 0.5, 
                    display: "block",
                    color: columnColor.text,
                    fontWeight: 600,
                    fontSize: 11
                  }}
                >
                  {status === "Done" 
                    ? `${columnTasks.length} task${columnTasks.length !== 1 ? 's' : ''} completed`
                    : `${columnTasks.length} task${columnTasks.length !== 1 ? 's' : ''} awaiting approval`
                  }
                </Typography>
              </Box>
            )}
          </Box>

          {/* Droppable Area */}
          <Droppable droppableId={status}>
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  flex: 1,
                  p: 2,
                  minHeight: 400,
                  maxHeight: "calc(100vh - 250px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                  scrollBehavior: "smooth",
                  bgcolor: snapshot.isDraggingOver
                    ? `${columnColor.border}25`
                    : "transparent",
                  transition: "all 0.3s ease",
                  borderRadius: "0 0 12px 12px",
                  border: snapshot.isDraggingOver 
                    ? `2px dashed ${columnColor.accent}` 
                    : "2px dashed transparent",
                  margin: snapshot.isDraggingOver ? 1 : 0,
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(255, 255, 255, 0.3)",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(255, 255, 255, 0.6)",
                    borderRadius: "10px",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.8)",
                    },
                  },
                }}
                onDragOver={(e) => {
                  if (snapshot.isDraggingOver) {
                    const element = e.currentTarget;
                    const rect = element.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const height = rect.height;
                    
                    // Auto-scroll when dragging near top or bottom
                    if (y < 100) {
                      element.scrollTop -= 10;
                    } else if (y > height - 100) {
                      element.scrollTop += 10;
                    }
                  }
                }}
              >
                {columnTasks.map((task, index) => renderTaskCard(task, index))}
                {provided.placeholder}

                {/* Add Task Button */}
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setOpenDialog(true);
                  }}
                  sx={{
                    mt: 2,
                    py: 1,
                    borderRadius: 2,
                    borderWidth: 2,
                    borderStyle: "dashed",
                    borderColor: `${columnColor.border}60`,
                    color: columnColor.text,
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: columnColor.accent,
                      bgcolor: `${columnColor.border}15`,
                      borderWidth: 2,
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  Add Task
                </Button>
              </Box>
            )}
          </Droppable>
        </Paper>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading board...</Typography>
      </Box>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragUpdate={handleDragUpdate}>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #f8fafc 0%, #e5e7eb 100%)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: "2px solid",
            borderColor: "#e5e7eb",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <BoardIcon sx={{ color: "#4f46e5", fontSize: 32 }} />
            <Typography 
              variant="h5" 
              fontWeight={700}
              sx={{ 
                color: "#1e293b",
                letterSpacing: 0.5
              }}
            >
              Task Board
            </Typography>
            {projectName && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: "#64748b",
                  fontWeight: 500,
                  pl: 1,
                  borderLeft: "2px solid #e5e7eb"
                }}
              >
                {projectName}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.2,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 15,
              bgcolor: "#4f46e5",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
              "&:hover": {
                bgcolor: "#4338ca",
                boxShadow: "0 6px 16px rgba(79, 70, 229, 0.4)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Create Task
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <Box
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderBottom: "2px solid #e5e7eb",
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search tasks by title, assignee, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              maxWidth: 500,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "white",
                fontWeight: 500,
                "&:hover fieldset": {
                  borderColor: "#4f46e5",
                },
                "&.Mui-focused fieldset": {
                  borderWidth: 2,
                },
              }
            }}
          />
        </Box>

        {/* Board Columns */}
        <Box 
          sx={{ 
            flex: 1, 
            display: "flex", 
            gap: 3, 
            p: 3, 
            overflowX: "auto",
            overflowY: "hidden",
            scrollBehavior: "smooth",
            "&::-webkit-scrollbar": {
              height: "10px",
            },
            "&::-webkit-scrollbar-track": {
              background: "rgba(255, 255, 255, 0.3)",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255, 255, 255, 0.6)",
              borderRadius: "10px",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.8)",
              },
            },
          }}
        >
          {/* Epic Column (Non-Movable) */}
          {renderEpicColumn()}
          
          {/* Approvals Column */}
          {renderColumn(approvalColumn)}
          
          {/* Regular Status Columns */}
          {statusColumns.map((status) => renderColumn(status))}
        </Box>

        {/* Task Form Dialog */}
        <TaskFormDialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setEditTask(null);
          }}
          onSave={handleSave}
          editTask={editTask}
          projectId={Number(projectId)}
          templateType={templateType || "kanban"}
          defaultStatus="Todo"
          title="Board Task"
          subtitle={`Add or edit tasks for your ${projectName || "project"} board`}
        />
      </Box>
    </DragDropContext>
  );
};

export default Board;
