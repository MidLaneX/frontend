import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Card,
  CardContent,
  CardActions,
  Tab,
  Tabs,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  CalendarMonth as CalendarIcon,
  Assignment as TaskIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CompletedIcon,
  Schedule as InProgressIcon,
  PendingActions as TodoIcon,
} from "@mui/icons-material";
import type { Task, TaskType } from "@/types";
import { TaskService } from "@/services/TaskService";
import { NotificationService } from "@/services/NotificationService";
import { tokenManager } from "@/utils/tokenManager";
import { SprintService } from "@/services/SprintService";
import type { SprintDTO } from "@/types/featurevise/sprint";
import { TaskFormDialog } from "@/components/features";

interface SprintProps {
  projectId: number;
  projectName?: string;
  templateType: string;
}

const SprintManagement: React.FC<SprintProps> = ({
  projectId,
  projectName,
  templateType,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Task management state
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  // Sprint management state
  const [sprints, setSprints] = useState<SprintDTO[]>([]);
  const [activeSprint, setActiveSprint] = useState<SprintDTO | null>(null);
  const [openSprintDialog, setOpenSprintDialog] = useState(false);
  const [editSprint, setEditSprint] = useState<SprintDTO | null>(null);
  const [sprintLoading, setSprintLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const [newSprintData, setNewSprintData] = useState<Partial<SprintDTO>>({
    name: "",
    startDate: "",
    endDate: "",
    goal: "",
    status: "planned",
  });

  const [latestSprint, setLatestSprint] = useState<SprintDTO | null>(null);

  // Fetch functions
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

  const fetchSprints = async () => {
    setSprintLoading(true);
    try {
      const response = await SprintService.getAllSprints(
        projectId,
        templateType,
      );
      if (response?.data) {
        setSprints(response.data);
        const active = response.data.find(
          (sprint: SprintDTO) => sprint.status === "active",
        );
        setActiveSprint(active || null);
      }
    } catch (error) {
      console.error("Failed to load sprints:", error);
    } finally {
      setSprintLoading(false);
    }
  };

  const fetchLatestSprint = async () => {
    try {
      const res = await SprintService.getLatestSprint(projectId, templateType);
      if (res?.data) {
        setLatestSprint(res.data);
      }
    } catch {
      console.error("Failed to load latest sprint.");
    }
  };

  // Sprint CRUD operations
  const handleCreateSprint = async () => {
    if (
      !newSprintData.name ||
      !newSprintData.startDate ||
      !newSprintData.endDate
    )
      return;

    try {
      await SprintService.createSprint(
        projectId,
        newSprintData as SprintDTO,
        templateType,
      );
      setOpenSprintDialog(false);
      setEditSprint(null);
      resetSprintForm();
      fetchSprints();
    } catch (error) {
      console.error("Failed to create sprint:", error);
    }
  };

  const handleUpdateSprint = async () => {
    if (!editSprint?.id || !newSprintData.name) return;

    try {
      await SprintService.updateSprint(
        projectId,
        editSprint.id,
        newSprintData,
        templateType,
      );
      setOpenSprintDialog(false);
      setEditSprint(null);
      resetSprintForm();
      fetchSprints();
    } catch (error) {
      console.error("Failed to update sprint:", error);
    }
  };

  const handleDeleteSprint = async (sprintId: number) => {
    try {
      await SprintService.deleteSprint(projectId, sprintId, templateType);
      fetchSprints();
    } catch (error) {
      console.error("Failed to delete sprint:", error);
    }
  };

  const handleSprintSave = async () => {
    if (editSprint) {
      await handleUpdateSprint();
    } else {
      await handleCreateSprint();
    }
  };

  // Task CRUD operations
  const handleTaskSave = async (taskData: Partial<Task>) => {
    if (!taskData.title) return;

    const currentUserName = tokenManager.getUserEmail()?.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "System";
    const currentProjectName = projectName || `Project ${projectId}`;

    if (editTask) {
      const updatedTask = await TaskService.updateTask(
        projectId,
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
        projectId,
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

    setOpenTaskDialog(false);
    setEditTask(null);
    fetchTasks();
  };

  const getTaskTypeColor = (type: TaskType) => {
    switch (type) {
      case "Epic":
        return "#8b5a2b";
      case "Story":
        return "#4caf50";
      case "Bug":
        return "#f44336";
      case "Task":
        return "#2196f3";
      default:
        return "#2196f3";
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchSprints();
    fetchLatestSprint();
  }, [projectId, templateType]);

  // Helper functions
  const resetSprintForm = () => {
    setNewSprintData({
      name: "",
      startDate: "",
      endDate: "",
      goal: "",
      status: "planned",
    });
  };

  // Helper functions for sprint task organization
  const getTasksBySprint = (sprintId: number | undefined) => {
    return tasks.filter((task) => task.sprintId === sprintId);
  };

  const getSprintProgress = (sprintId: number | undefined) => {
    const sprintTasks = getTasksBySprint(sprintId);
    if (sprintTasks.length === 0)
      return { completed: 0, total: 0, percentage: 0 };

    const completed = sprintTasks.filter(
      (task) => task.status === "Done",
    ).length;
    const total = sprintTasks.length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  };

  const getSprintStoryPoints = (sprintId: number | undefined) => {
    const sprintTasks = getTasksBySprint(sprintId);
    const totalPoints = sprintTasks.reduce(
      (sum, task) => sum + (task.storyPoints || 0),
      0,
    );
    const completedPoints = sprintTasks
      .filter((task) => task.status === "Done")
      .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

    return { total: totalPoints, completed: completedPoints };
  };

  const getUnassignedTasks = () => {
    return tasks.filter((task) => !task.sprintId);
  };

  const getSprintStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CompletedIcon sx={{ color: "#4caf50", fontSize: "1.2rem" }} />;
      case "active":
        return <InProgressIcon sx={{ color: "#ff9800", fontSize: "1.2rem" }} />;
      case "planned":
        return <TodoIcon sx={{ color: "#2196f3", fontSize: "1.2rem" }} />;
      default:
        return <TaskIcon fontSize="small" />;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
        p: 3,
      }}
    >
      <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            p: 3.5,
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(20px)",
            borderRadius: 2.5,
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(102, 126, 234, 0.04)",
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                mb: 0.5,
                fontWeight: 800,
                fontSize: "2.2rem",
                letterSpacing: "-0.02em",
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Sprint Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#64748b",
                fontSize: "0.95rem",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              {projectName || `Project ${projectId}`}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setOpenSprintDialog(true)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                letterSpacing: "0.02em",
                px: 3,
                py: 1.25,
                color: "#667eea",
                borderColor: "rgba(102, 126, 234, 0.3)",
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#667eea",
                  background: "rgba(102, 126, 234, 0.05)",
                },
              }}
            >
              New Sprint
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenTaskDialog(true)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                letterSpacing: "0.02em",
                px: 3.5,
                py: 1.25,
                background:
                  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  boxShadow: "0 6px 16px rgba(16, 185, 129, 0.35)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              New Task
            </Button>
          </Stack>
        </Box>

        {/* Tabs Navigation */}
        <Paper
          sx={{
            mb: 3,
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(20px)",
            borderRadius: 2.5,
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(102, 126, 234, 0.04)",
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                letterSpacing: "0.01em",
                minHeight: 56,
                color: "#64748b",
                "&.Mui-selected": {
                  color: "#667eea",
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                background:
                  "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              },
            }}
          >
            <Tab label="Sprint Board" icon={<TaskIcon />} iconPosition="start" />
            <Tab
              label={`All Sprints (${sprints.length})`}
              icon={<CalendarIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Active Sprint Banner - Show only on Sprint Board tab */}
        {activeSprint && currentTab === 0 && (
          <Paper
            sx={{
              mb: 3,
              p: 3,
              background:
                "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)",
              backdropFilter: "blur(20px)",
              borderRadius: 2.5,
              border: "2px solid rgba(102, 126, 234, 0.3)",
              boxShadow: "0 4px 16px rgba(102, 126, 234, 0.15)",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {getSprintStatusIcon("active")}
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                    🚀 {activeSprint.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    {new Date(activeSprint.startDate).toLocaleDateString()} -{" "}
                    {new Date(activeSprint.endDate).toLocaleDateString()}
                  </Typography>
                  {activeSprint.goal && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, fontStyle: "italic", color: "#64748b" }}
                    >
                      🎯 {activeSprint.goal}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {(() => {
                  const progress = getSprintProgress(activeSprint.id);
                  const storyPoints = getSprintStoryPoints(activeSprint.id);
                  return (
                    <Box sx={{ minWidth: 200 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {progress.completed}/{progress.total} tasks
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {storyPoints.completed}/{storyPoints.total} SP
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress.percentage}
                        sx={{
                          height: 8,
                          borderRadius: 1.5,
                          bgcolor: "rgba(255, 255, 255, 0.6)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 1.5,
                            background:
                              progress.percentage === 100
                                ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                                : "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                          },
                        }}
                      />
                    </Box>
                  );
                })()}
                <IconButton
                  onClick={() => {
                    setEditSprint(activeSprint);
                    setNewSprintData(activeSprint);
                    setOpenSprintDialog(true);
                  }}
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.7)",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            </Stack>
          </Paper>
        )}

      {/* Content based on current tab */}
      {currentTab === 0 ? (
        // Sprint Board Tab
        <Box>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 300,
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(20px)",
                borderRadius: 2.5,
                border: "1px solid rgba(255, 255, 255, 0.8)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
              }}
            >
              <CircularProgress sx={{ color: "#667eea" }} />
            </Box>
          ) : error ? (
            <Alert
              severity="error"
              sx={{
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(20px)",
                borderRadius: 2,
                border: "1px solid rgba(239, 68, 68, 0.2)",
                boxShadow: "0 4px 16px rgba(239, 68, 68, 0.12)",
              }}
            >
              {error}
            </Alert>
          ) : (
            <>
              {/* Search Bar */}
              <Paper
                sx={{
                  mb: 3,
                  p: 2,
                  background: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 2,
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search tasks by title, assignee, or reporter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#ffffff",
                      "& fieldset": {
                        borderColor: "rgba(100, 116, 139, 0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(102, 126, 234, 0.3)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />
              </Paper>

              {/* Sprint Accordion */}
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  mb: 3,
                  color: "#1e293b",
                  letterSpacing: "-0.01em",
                }}
              >
                All Sprints
              </Typography>

              {/* Sprints Accordion - Latest first */}
              {[...sprints].reverse().map((sprint, index) => {
                const sprintTasks = getTasksBySprint(sprint.id).filter(
                  (task) =>
                    task.title
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    task.assignee
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    task.reporter
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                );
                const progress = getSprintProgress(sprint.id);
                const storyPoints = getSprintStoryPoints(sprint.id);
                const isLatest = index === 0; // First item in reversed array is latest

                return (
                  <Accordion
                    key={sprint.id}
                    defaultExpanded={sprint.status === "active" || isLatest}
                    sx={{
                      mb: 2,
                      border: isLatest
                        ? "2px solid #1976d2"
                        : "1px solid #e0e0e0",
                      borderRadius: 2,
                      "&:before": { display: "none" },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        bgcolor: isLatest
                          ? "#e3f2fd"
                          : sprint.status === "active"
                            ? "#e8f5e8"
                            : sprint.status === "completed"
                              ? "#f0f0f0"
                              : "#fafafa",
                        "&:hover": { bgcolor: "#f5f5f5" },
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          mr: 2,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          {getSprintStatusIcon(sprint.status || "planned")}
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {isLatest && "⭐ "}
                              {sprint.name}
                              {isLatest && " (Latest)"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(sprint.startDate).toLocaleDateString()}{" "}
                              - {new Date(sprint.endDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Chip
                            label={sprint.status}
                            color={
                              sprint.status === "active"
                                ? "success"
                                : sprint.status === "completed"
                                  ? "primary"
                                  : "default"
                            }
                            size="small"
                          />
                          <Box sx={{ textAlign: "right" }}>
                            <Typography variant="body2" fontWeight={500}>
                              {progress.completed}/{progress.total} tasks
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {storyPoints.completed}/{storyPoints.total} SP
                            </Typography>
                          </Box>
                          <Box sx={{ width: 100 }}>
                            <LinearProgress
                              variant="determinate"
                              value={progress.percentage}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ fontSize: "0.7rem" }}
                            >
                              {progress.percentage}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails>
                      {sprint.goal && (
                        <Box
                          sx={{
                            mb: 3,
                            p: 2,
                            bgcolor: "#f8f9fa",
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            sx={{ mb: 1 }}
                          >
                            🎯 Sprint Goal:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {sprint.goal}
                          </Typography>
                        </Box>
                      )}

                      {sprintTasks.length === 0 ? (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          No tasks assigned to this sprint
                        </Alert>
                      ) : (
                        /* Task bars - thin and wide like sprint bars */
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          {sprintTasks.map((task) => (
                            <Paper
                              key={task.id}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                p: 1.5,
                                border: "1px solid #e0e0e0",
                                borderRadius: 1,
                                cursor: "pointer",
                                "&:hover": {
                                  bgcolor: "#f5f5f5",
                                  borderColor: "#d0d0d0",
                                },
                              }}
                              onClick={() => {
                                setEditTask(task);
                                setOpenTaskDialog(true);
                              }}
                            >
                              {/* Task type color indicator */}
                              <Box
                                sx={{
                                  width: 4,
                                  height: 24,
                                  bgcolor: getTaskTypeColor(task.type),
                                  borderRadius: 0.5,
                                  mr: 2,
                                  flexShrink: 0,
                                }}
                              />

                              {/* Task content */}
                              <Box
                                sx={{
                                  flex: 1,
                                  minWidth: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={500}
                                  sx={{
                                    flex: 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {task.title}
                                </Typography>

                                <Chip
                                  label={task.type}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    bgcolor: `${getTaskTypeColor(task.type)}20`,
                                    color: getTaskTypeColor(task.type),
                                    minWidth: 60,
                                  }}
                                />
                              </Box>
                            </Paper>
                          ))}
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}

              {/* Unassigned Tasks */}
              {(() => {
                const unassignedTasks = getUnassignedTasks().filter(
                  (task) =>
                    task.title
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    task.assignee
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    task.reporter
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                );

                if (unassignedTasks.length > 0) {
                  return (
                    <Paper
                      sx={{
                        mt: 3,
                        p: 3,
                        background: "rgba(255, 255, 255, 0.7)",
                        backdropFilter: "blur(20px)",
                        borderRadius: 2.5,
                        border: "2px solid rgba(255, 152, 0, 0.3)",
                        boxShadow: "0 4px 16px rgba(255, 152, 0, 0.15)",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          mb: 3,
                          color: "#f57c00",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        📋 Unassigned Tasks ({unassignedTasks.length})
                      </Typography>
                      <Box
                        sx={{
                          display: "grid",
                          gap: 2,
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(auto-fill, minmax(280px, 1fr))",
                          },
                        }}
                      >
                        {unassignedTasks.map((task) => (
                          <Card
                            key={task.id}
                            sx={{
                              border: "1px solid rgba(255, 204, 128, 0.5)",
                              background: "rgba(255, 255, 255, 0.9)",
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(255, 152, 0, 0.2)",
                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            <CardContent sx={{ pb: 1 }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                sx={{ mb: 1, color: "#1e293b" }}
                              >
                                {task.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  mb: 2,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                }}
                              >
                                {task.description || "No description"}
                              </Typography>

                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{ flexWrap: "wrap", gap: 0.5 }}
                              >
                                <Chip
                                  label={task.type}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: "0.7rem",
                                    bgcolor: `${getTaskTypeColor(task.type)}15`,
                                    color: getTaskTypeColor(task.type),
                                  }}
                                />
                                <Chip
                                  label={task.priority}
                                  size="small"
                                  sx={{ height: 22, fontSize: "0.7rem" }}
                                />
                                <Chip
                                  label={task.status}
                                  size="small"
                                  color="primary"
                                  sx={{ height: 22, fontSize: "0.7rem" }}
                                />
                              </Stack>
                            </CardContent>

                            <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                              <Button
                                size="small"
                                variant="text"
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 600,
                                  color: "#667eea",
                                }}
                                onClick={() => {
                                  setEditTask(task);
                                  setOpenTaskDialog(true);
                                }}
                              >
                                Assign to Sprint
                              </Button>
                            </CardActions>
                          </Card>
                        ))}
                      </Box>
                    </Paper>
                  );
                }
                return null;
              })()}
            </>
          )}
        </Box>
      ) : (
        // All Sprints Tab
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ mb: 3, color: "#1e293b", letterSpacing: "-0.01em" }}
          >
            All Sprints Overview
          </Typography>

          {sprintLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[...sprints].reverse().map((sprint, index) => {
                const sprintTasks = tasks.filter(
                  (task) => task.sprintId === sprint.id,
                );
                const isLatest = index === 0;

                return (
                  <Paper
                    key={sprint.id}
                    sx={{
                      p: 3,
                      border: isLatest
                        ? "2px solid #1976d2"
                        : "1px solid #e0e0e0",
                      borderRadius: 2,
                      position: "relative",
                    }}
                  >
                    {isLatest && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: -1,
                          right: -1,
                          bgcolor: "#1976d2",
                          color: "white",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "0 8px 0 8px",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                        }}
                      >
                        LATEST
                      </Box>
                    )}

                    {/* Sprint Header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        {getSprintStatusIcon(sprint.status || "planned")}
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {sprint.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(sprint.startDate).toLocaleDateString()} -{" "}
                            {new Date(sprint.endDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Chip
                          label={sprint.status?.toUpperCase()}
                          color={
                            sprint.status === "active"
                              ? "success"
                              : sprint.status === "completed"
                                ? "primary"
                                : sprint.status === "planned"
                                  ? "warning"
                                  : "default"
                          }
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {sprintTasks.length} tasks
                        </Typography>
                      </Box>
                    </Box>

                    {/* Sprint Goal */}
                    {sprint.goal && (
                      <Box
                        sx={{
                          mb: 2,
                          p: 1.5,
                          bgcolor: "#f8f9fa",
                          borderRadius: 1,
                          borderLeft: "4px solid #1976d2",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Goal: {sprint.goal}
                        </Typography>
                      </Box>
                    )}

                    {/* Tasks as thin bars */}
                    {sprintTasks.length > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {sprintTasks.map((task) => (
                          <Paper
                            key={task.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              p: 1,
                              border: "1px solid #e0e0e0",
                              borderRadius: 1,
                              cursor: "pointer",
                              "&:hover": {
                                bgcolor: "#f5f5f5",
                                borderColor: "#d0d0d0",
                              },
                            }}
                            onClick={() => {
                              setEditTask(task);
                              setOpenTaskDialog(true);
                            }}
                          >
                            {/* Task type color indicator */}
                            <Box
                              sx={{
                                width: 4,
                                height: 20,
                                bgcolor: getTaskTypeColor(task.type),
                                borderRadius: 0.5,
                                mr: 2,
                                flexShrink: 0,
                              }}
                            />

                            {/* Task content */}
                            <Box
                              sx={{
                                flex: 1,
                                minWidth: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{
                                  flex: 1,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {task.title}
                              </Typography>

                              <Chip
                                label={task.type}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.65rem",
                                  bgcolor: `${getTaskTypeColor(task.type)}20`,
                                  color: getTaskTypeColor(task.type),
                                  minWidth: 50,
                                }}
                              />
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    )}

                    {/* Actions */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                        mt: 2,
                      }}
                    >
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setEditSprint(sprint);
                          setNewSprintData(sprint);
                          setOpenSprintDialog(true);
                        }}
                        sx={{ textTransform: "none" }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() =>
                          sprint.id && handleDeleteSprint(sprint.id)
                        }
                        sx={{ textTransform: "none" }}
                      >
                        Delete
                      </Button>
                      {sprint.status === "planned" && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<StartIcon />}
                          onClick={() => {
                            if (sprint.id) {
                              SprintService.updateSprint(
                                projectId,
                                sprint.id,
                                { status: "active" },
                                templateType,
                              ).then(() => fetchSprints());
                            }
                          }}
                          sx={{ textTransform: "none" }}
                        >
                          Start
                        </Button>
                      )}
                      {sprint.status === "active" && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<StopIcon />}
                          onClick={() => {
                            if (sprint.id) {
                              SprintService.updateSprint(
                                projectId,
                                sprint.id,
                                { status: "completed" },
                                templateType,
                              ).then(() => fetchSprints());
                            }
                          }}
                          sx={{ textTransform: "none" }}
                        >
                          Complete
                        </Button>
                      )}
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}

          {/* Empty State */}
          {sprints.length === 0 && (
            <Paper
              sx={{
                p: 6,
                textAlign: "center",
                bgcolor: "#fafafa",
                border: "1px dashed #e0e0e0",
              }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No sprints found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first sprint to start organizing tasks
              </Typography>
              <Button
                variant="contained"
                onClick={() => setOpenSprintDialog(true)}
                sx={{ textTransform: "none" }}
              >
                Create Sprint
              </Button>
            </Paper>
          )}
        </Box>
      )}

      </Box>
      {/* End of maxWidth container */}

      {/* Task Dialog with TaskFormDialog */}
      <TaskFormDialog
        open={openTaskDialog}
        onClose={() => {
          setOpenTaskDialog(false);
          setEditTask(null);
        }}
        onSave={handleTaskSave}
        editTask={editTask}
        projectId={projectId}
        templateType={templateType}
        defaultStatus="Backlog"
        showSprintInfo={!!latestSprint}
        sprintInfo={latestSprint?.id ? { id: latestSprint.id, name: latestSprint.name } : undefined}
        title="Sprint Task"
        subtitle={`Manage tasks in ${projectName} sprint`}
      />

      {/* Sprint Dialog */}
      <Dialog
        open={openSprintDialog}
        onClose={() => setOpenSprintDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editSprint ? "Edit Sprint" : "Create Sprint"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Sprint Name"
            margin="dense"
            value={newSprintData.name}
            onChange={(e) =>
              setNewSprintData({ ...newSprintData, name: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            margin="dense"
            value={newSprintData.startDate || ""}
            onChange={(e) =>
              setNewSprintData({ ...newSprintData, startDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="End Date"
            type="date"
            margin="dense"
            value={newSprintData.endDate || ""}
            onChange={(e) =>
              setNewSprintData({ ...newSprintData, endDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Sprint Goal"
            margin="dense"
            multiline
            rows={3}
            value={newSprintData.goal || ""}
            onChange={(e) =>
              setNewSprintData({ ...newSprintData, goal: e.target.value })
            }
          />
          <TextField
            select
            fullWidth
            label="Status"
            margin="dense"
            value={newSprintData.status || "planned"}
            onChange={(e) =>
              setNewSprintData({ ...newSprintData, status: e.target.value })
            }
          >
            <MenuItem value="planned">Planned</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSprintDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSprintSave}>
            {editSprint ? "Update Sprint" : "Create Sprint"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SprintManagement;
