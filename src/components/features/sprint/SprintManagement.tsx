import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Tooltip,
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
  Badge,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Comment as CommentIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  CalendarMonth as CalendarIcon,
  Assignment as TaskIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CompletedIcon,
  Schedule as InProgressIcon,
  PendingActions as TodoIcon,
} from "@mui/icons-material";
import type { Task, TaskStatus, TaskPriority, TaskType } from "@/types";
import { TaskService } from "@/services/TaskService";
import { SprintService } from "@/services/SprintService";
import type { SprintDTO } from "@/types/featurevise/sprint";

interface SprintProps {
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
const priorityOptions: TaskPriority[] = [
  "Highest",
  "High",
  "Medium",
  "Low",
  "Lowest",
];
const typeOptions: TaskType[] = ["Story", "Bug", "Task", "Epic"];

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
  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "Medium",
    status: "Backlog",
    type: "Task",
    assignee: "",
    reporter: "",
    dueDate: "",
    storyPoints: 3,
    labels: [],
    comments: [],
    sprintId: undefined,
  });

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
        setNewTaskData((prev) => ({ ...prev, sprintId: res.data.id }));
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
  const handleTaskSave = async () => {
    if (!newTaskData.title) return;

    if (editTask) {
      await TaskService.updateTask(
        projectId,
        Number(editTask.id),
        newTaskData,
        templateType,
      );
    } else {
      await TaskService.createTask(
        projectId,
        newTaskData as Omit<Task, "id">,
        templateType,
      );
    }

    setOpenTaskDialog(false);
    setEditTask(null);
    resetTaskForm();
    fetchTasks();
  };

  const handleDelete = async (taskId: number) => {
    await TaskService.deleteTask(projectId, taskId, templateType);
    fetchTasks();
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    await TaskService.updateTaskStatus(
      projectId,
      taskId,
      newStatus,
      templateType,
    );
    fetchTasks();
  };

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

  const resetTaskForm = () => {
    setNewTaskData({
      title: "",
      description: "",
      priority: "Medium",
      status: "Backlog",
      type: "Task",
      assignee: "",
      reporter: "",
      dueDate: "",
      storyPoints: 3,
      labels: [],
      comments: [],
      sprintId: latestSprint?.id ?? undefined,
    });
  };

  useEffect(() => {
    fetchTasks();
    fetchSprints();
    fetchLatestSprint();
  }, [projectId, templateType]);

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
        return <CompletedIcon sx={{ color: "#4caf50" }} />;
      case "active":
        return <InProgressIcon sx={{ color: "#ff9800" }} />;
      case "planned":
        return <TodoIcon sx={{ color: "#2196f3" }} />;
      default:
        return <TaskIcon />;
    }
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

  const filteredTasks = tasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.reporter?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">Sprint Management - {projectName}</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenSprintDialog(true)}
          >
            New Sprint
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenTaskDialog(true)}
          >
            New Task
          </Button>
        </Stack>
      </Box>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
        >
          <Tab label="Sprint Board" icon={<TaskIcon />} />
          <Tab
            label={
              <Badge badgeContent={sprints.length} color="primary">
                All Sprints
              </Badge>
            }
            icon={<CalendarIcon />}
          />
        </Tabs>
      </Box>

      {/* Active Sprint Info */}
      {activeSprint && currentTab === 0 && (
        <Card sx={{ mb: 3, bgcolor: "primary.50" }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="h6">{activeSprint.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeSprint.startDate} - {activeSprint.endDate}
                </Typography>
                {activeSprint.goal && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Goal: {activeSprint.goal}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={activeSprint.status}
                  color={
                    activeSprint.status === "active" ? "success" : "default"
                  }
                />
                <IconButton
                  onClick={() => {
                    setEditSprint(activeSprint);
                    setNewSprintData(activeSprint);
                    setOpenSprintDialog(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Content based on current tab */}
      {currentTab === 0 ? (
        // Sprint Board Tab - Professional Jira-like interface
        <Box>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 300,
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              {/* Search Bar */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search tasks by title, assignee, or reporter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 3 }}
              />

              {/* Active Sprint Section */}
              {activeSprint && (
                <Card sx={{ mb: 3, border: "2px solid #4caf50" }}>
                  <CardContent>
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
                        {getSprintStatusIcon("active")}
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            🚀 {activeSprint.name} (Active)
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {activeSprint.startDate} - {activeSprint.endDate}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        onClick={() => {
                          setEditSprint(activeSprint);
                          setNewSprintData(activeSprint);
                          setOpenSprintDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>

                    {activeSprint.goal && (
                      <Typography
                        variant="body2"
                        sx={{ mb: 2, fontStyle: "italic" }}
                      >
                        🎯 Goal: {activeSprint.goal}
                      </Typography>
                    )}

                    {/* Active Sprint Progress */}
                    {(() => {
                      const progress = getSprintProgress(activeSprint.id);
                      const storyPoints = getSprintStoryPoints(activeSprint.id);
                      return (
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2">
                              Progress: {progress.completed}/{progress.total}{" "}
                              tasks completed
                            </Typography>
                            <Typography variant="body2">
                              {storyPoints.completed}/{storyPoints.total} story
                              points
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress.percentage}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ mt: 1, display: "block" }}
                          >
                            {progress.percentage}% Complete
                          </Typography>
                        </Box>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* All Sprints with Tasks */}
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                Sprint Tasks Overview
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
                                setNewTaskData(task);
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
                    <Card sx={{ mt: 3, border: "1px solid #ff9800" }}>
                      <CardContent>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          sx={{ mb: 2, color: "#f57c00" }}
                        >
                          📋 Unassigned Tasks ({unassignedTasks.length})
                        </Typography>
                        <Grid container spacing={2}>
                          {unassignedTasks.map((task) => (
                            <Grid item xs={12} md={6} lg={4} key={task.id}>
                              <Card sx={{ border: "1px solid #ffcc80" }}>
                                <CardContent sx={{ pb: 1 }}>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    sx={{ mb: 1 }}
                                  >
                                    {task.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                  >
                                    {task.description || "No description"}
                                  </Typography>

                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ mb: 2, flexWrap: "wrap", gap: 0.5 }}
                                  >
                                    <Chip label={task.type} size="small" />
                                    <Chip label={task.priority} size="small" />
                                    <Chip
                                      label={task.status}
                                      color="primary"
                                      size="small"
                                    />
                                  </Stack>
                                </CardContent>

                                <CardActions sx={{ pt: 0 }}>
                                  <Button
                                    size="small"
                                    onClick={() => {
                                      setEditTask(task);
                                      setNewTaskData({
                                        ...task,
                                        sprintId: latestSprint?.id,
                                      });
                                      setOpenTaskDialog(true);
                                    }}
                                  >
                                    Assign to Sprint
                                  </Button>
                                </CardActions>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              })()}
            </>
          )}
        </Box>
      ) : (
        // All Sprints Tab - Simple Professional View
        <Box sx={{ p: 3 }}>
          {/* Simple Header */}
          <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
            Sprint Overview
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
                              setNewTaskData(task);
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

      {/* Task Dialog */}
      <Dialog
        open={openTaskDialog}
        onClose={() => setOpenTaskDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editTask ? "Edit Task" : "Create Task"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            margin="dense"
            value={newTaskData.title}
            onChange={(e) =>
              setNewTaskData({ ...newTaskData, title: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Description"
            margin="dense"
            multiline
            value={newTaskData.description}
            onChange={(e) =>
              setNewTaskData({ ...newTaskData, description: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Assignee"
            margin="dense"
            value={newTaskData.assignee}
            onChange={(e) =>
              setNewTaskData({ ...newTaskData, assignee: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Reporter"
            margin="dense"
            value={newTaskData.reporter}
            onChange={(e) =>
              setNewTaskData({ ...newTaskData, reporter: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            margin="dense"
            value={newTaskData.dueDate?.slice(0, 10) || ""}
            onChange={(e) =>
              setNewTaskData({ ...newTaskData, dueDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            fullWidth
            label="Priority"
            margin="dense"
            value={newTaskData.priority}
            onChange={(e) =>
              setNewTaskData({
                ...newTaskData,
                priority: e.target.value as TaskPriority,
              })
            }
          >
            {priorityOptions.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Status"
            margin="dense"
            value={newTaskData.status}
            onChange={(e) =>
              setNewTaskData({
                ...newTaskData,
                status: e.target.value as TaskStatus,
              })
            }
          >
            {statusOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Type"
            margin="dense"
            value={newTaskData.type}
            onChange={(e) =>
              setNewTaskData({
                ...newTaskData,
                type: e.target.value as TaskType,
              })
            }
          >
            {typeOptions.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Story Points"
            type="number"
            margin="dense"
            value={newTaskData.storyPoints ?? ""}
            onChange={(e) =>
              setNewTaskData({
                ...newTaskData,
                storyPoints: Number(e.target.value),
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleTaskSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

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
