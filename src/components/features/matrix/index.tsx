import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  Tooltip,
  LinearProgress,
  Divider,
  Grid,
  Badge,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  AccountTree as MatrixIcon,
  People as TeamIcon,
  Person as PersonIcon,
  Assignment as TaskIcon,
  CalendarToday as CalendarIcon,
  Business as DepartmentIcon,
  Group as ProjectTeamIcon,
  Visibility as OverviewIcon,
  SwapVert as DualReportIcon,
} from "@mui/icons-material";
import { TaskService } from "@/services/TaskService";
import type { Task, TaskStatus, TaskPriority } from "@/types";

interface MatrixProps {
  projectId: string;
  projectName?: string;
  templateType?: string;
}

const departmentTypes = [
  { name: "Engineering", color: "#1976d2" },
  { name: "Product", color: "#9c27b0" },
  { name: "Marketing", color: "#f57c00" },
  { name: "Sales", color: "#4caf50" },
  { name: "Design", color: "#e91e63" },
  { name: "Operations", color: "#607d8b" },
];

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
const matrixTypes = [
  "Cross-functional Task",
  "Department Specific",
  "Collaboration",
  "Resource Request",
  "Report",
];

const Matrix: React.FC<MatrixProps> = ({
  projectId,
  projectName,
  templateType = "matrix",
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "Medium",
    status: "Todo",
    type: "Cross-functional Task",
    assignee: "",
    reporter: "",
    dueDate: "",
    storyPoints: 3,
    labels: [],
    comments: [],
  });

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

  const handleSave = async () => {
    if (!newTaskData.title) return;

    try {
      if (editTask) {
        await TaskService.updateTask(
          Number(projectId),
          Number(editTask.id),
          newTaskData,
          templateType,
        );
      } else {
        await TaskService.createTask(
          Number(projectId),
          newTaskData as Omit<Task, "id">,
          templateType,
        );
      }

      setOpenDialog(false);
      setEditTask(null);
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error("Failed to save task:", error);
      setError("Failed to save task.");
    }
  };

  const resetForm = () => {
    setNewTaskData({
      title: "",
      description: "",
      priority: "Medium",
      status: "Todo",
      type: "Cross-functional Task",
      assignee: "",
      reporter: "",
      dueDate: "",
      storyPoints: 3,
      labels: [],
      comments: [],
    });
  };

  const getTasksByDepartment = (department: string) => {
    return tasks.filter(
      (task) => task.labels && task.labels.includes(department),
    );
  };

  const getDepartmentProgress = (department: string) => {
    const deptTasks = getTasksByDepartment(department);
    if (deptTasks.length === 0) return 0;
    const completedTasks = deptTasks.filter((task) => task.status === "Done");
    return (completedTasks.length / deptTasks.length) * 100;
  };

  const getCrossFunctionalTasks = () => {
    return tasks.filter((task) => task.labels && task.labels.length > 1);
  };

  const getResourceUtilization = () => {
    const assignees = tasks.map((task) => task.assignee).filter(Boolean);
    const uniqueAssignees = [...new Set(assignees)];
    return uniqueAssignees.length;
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

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "Backlog":
        return "#757575";
      case "Todo":
        return "#1976d2";
      case "In Progress":
        return "#f57c00";
      case "Review":
        return "#9c27b0";
      case "Done":
        return "#4caf50";
      default:
        return "#757575";
    }
  };

  const renderTaskCard = (task: Task) => (
    <Card
      key={task.id}
      sx={{ mb: 2, borderRadius: 2, border: "1px solid #e0e0e0" }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {task.title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {task.labels && task.labels.length > 1 && (
              <Badge
                badgeContent={task.labels.length}
                color="warning"
                sx={{ mr: 1 }}
              >
                <DualReportIcon sx={{ fontSize: 16, color: "warning.main" }} />
              </Badge>
            )}
            <Chip
              label={task.priority}
              size="small"
              sx={{
                bgcolor: `${getPriorityColor(task.priority)}15`,
                color: getPriorityColor(task.priority),
                border: `1px solid ${getPriorityColor(task.priority)}50`,
              }}
            />
            <Chip
              label={task.status}
              size="small"
              sx={{
                bgcolor: `${getStatusColor(task.status)}15`,
                color: getStatusColor(task.status),
              }}
            />
            <IconButton
              size="small"
              onClick={() => {
                setEditTask(task);
                setNewTaskData({
                  title: task.title,
                  description: task.description,
                  priority: task.priority,
                  status: task.status,
                  type: task.type,
                  assignee: task.assignee,
                  reporter: task.reporter,
                  dueDate: task.dueDate,
                  storyPoints: task.storyPoints,
                  labels: task.labels,
                  comments: task.comments,
                });
                setOpenDialog(true);
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>

        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {task.description}
          </Typography>
        )}

        {task.labels && task.labels.length > 0 && (
          <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
            {task.labels.map((label) => {
              const dept = departmentTypes.find((d) => d.name === label);
              return (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  sx={{
                    bgcolor: dept ? `${dept.color}15` : "#f5f5f5",
                    color: dept ? dept.color : "text.secondary",
                    fontSize: 10,
                    height: 18,
                  }}
                />
              );
            })}
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {task.assignee && (
              <Tooltip title={`Assigned to ${task.assignee}`}>
                <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                  {task.assignee.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            )}
            {task.dueDate && (
              <Chip
                icon={<CalendarIcon sx={{ fontSize: 12 }} />}
                label={new Date(task.dueDate).toLocaleDateString()}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: 10 }}
              />
            )}
          </Box>
          {task.storyPoints && (
            <Chip
              label={`${task.storyPoints} pts`}
              size="small"
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 600,
                bgcolor: "primary.50",
                color: "primary.main",
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );

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
        <Typography sx={{ ml: 2 }}>
          Loading matrix organization workspace...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8f9fa",
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid #e0e0e0",
          bgcolor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <MatrixIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Matrix Organization
            </Typography>
            {projectName && (
              <Typography variant="body2" color="text.secondary">
                {projectName} - Cross-functional collaboration
              </Typography>
            )}
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Add Task
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Matrix Metrics Dashboard */}
      <Paper sx={{ m: 3, p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Matrix Organization Metrics
        </Typography>
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Box sx={{ flex: 1, minWidth: 200, textAlign: "center" }}>
            <DualReportIcon
              sx={{ fontSize: 32, color: "warning.main", mb: 1 }}
            />
            <Typography variant="h4" fontWeight={600} color="warning.main">
              {getCrossFunctionalTasks().length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cross-functional Tasks
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200, textAlign: "center" }}>
            <DepartmentIcon
              sx={{ fontSize: 32, color: "primary.main", mb: 1 }}
            />
            <Typography variant="h4" fontWeight={600} color="primary.main">
              {departmentTypes.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Departments
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200, textAlign: "center" }}>
            <TeamIcon sx={{ fontSize: 32, color: "success.main", mb: 1 }} />
            <Typography variant="h4" fontWeight={600} color="success.main">
              {getResourceUtilization()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Team Members
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200, textAlign: "center" }}>
            <TaskIcon sx={{ fontSize: 32, color: "info.main", mb: 1 }} />
            <Typography variant="h4" fontWeight={600} color="info.main">
              {tasks.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Tasks
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Department Filter and Matrix View */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          px: 3,
          pb: 3,
          overflow: "hidden",
        }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Department Matrix View
            </Typography>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  label="Filter by Department"
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <MenuItem value="">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <OverviewIcon sx={{ fontSize: 18 }} />
                      All Departments
                    </Box>
                  </MenuItem>
                  {departmentTypes.map((dept) => (
                    <MenuItem key={dept.name} value={dept.name}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: dept.color,
                          }}
                        />
                        {dept.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {selectedDepartment ? (
            /* Single Department View */
            <Box sx={{ flex: 1, overflow: "auto" }}>
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      bgcolor: departmentTypes.find(
                        (d) => d.name === selectedDepartment,
                      )?.color,
                    }}
                  />
                  <Typography variant="h6" fontWeight={600}>
                    {selectedDepartment} Department
                  </Typography>
                  <Chip
                    label={`${getTasksByDepartment(selectedDepartment).length} tasks`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={getDepartmentProgress(selectedDepartment)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "grey.200",
                    mb: 2,
                  }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {getDepartmentProgress(selectedDepartment).toFixed(0)}%
                  complete
                </Typography>

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setNewTaskData({
                      ...newTaskData,
                      labels: [selectedDepartment],
                    });
                    setOpenDialog(true);
                  }}
                  sx={{ mb: 2 }}
                >
                  Add Task to {selectedDepartment}
                </Button>
              </Box>

              {getTasksByDepartment(selectedDepartment).length > 0 ? (
                getTasksByDepartment(selectedDepartment).map((task) =>
                  renderTaskCard(task),
                )
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <TaskIcon sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    No tasks in {selectedDepartment} department
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Start by adding tasks to this department
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setNewTaskData({
                        ...newTaskData,
                        labels: [selectedDepartment],
                      });
                      setOpenDialog(true);
                    }}
                  >
                    Add First Task
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            /* All Departments Grid View */
            <Box sx={{ flex: 1, overflow: "auto" }}>
              <Grid container spacing={3}>
                {departmentTypes.map((dept) => {
                  const deptTasks = getTasksByDepartment(dept.name);
                  const progress = getDepartmentProgress(dept.name);

                  return (
                    <Grid item xs={12} md={6} lg={4} key={dept.name}>
                      <Card
                        sx={{
                          height: "100%",
                          cursor: "pointer",
                          transition: "transform 0.2s",
                          "&:hover": { transform: "translateY(-2px)" },
                          border: `2px solid ${dept.color}20`,
                        }}
                        onClick={() => setSelectedDepartment(dept.name)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                bgcolor: dept.color,
                              }}
                            />
                            <Typography variant="h6" fontWeight={600}>
                              {dept.name}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Progress
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {progress.toFixed(0)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{
                                height: 4,
                                borderRadius: 2,
                                bgcolor: "grey.200",
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: dept.color,
                                },
                              }}
                            />
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Chip
                              label={`${deptTasks.length} tasks`}
                              size="small"
                              sx={{
                                bgcolor: `${dept.color}15`,
                                color: dept.color,
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Click to view
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Create/Edit Task Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editTask ? "Edit Task" : "Create New Task"}</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Task Title"
              fullWidth
              value={newTaskData.title}
              onChange={(e) =>
                setNewTaskData({ ...newTaskData, title: e.target.value })
              }
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newTaskData.description}
              onChange={(e) =>
                setNewTaskData({ ...newTaskData, description: e.target.value })
              }
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Department(s)</InputLabel>
                <Select
                  multiple
                  value={newTaskData.labels || []}
                  label="Department(s)"
                  onChange={(e) =>
                    setNewTaskData({
                      ...newTaskData,
                      labels:
                        typeof e.target.value === "string"
                          ? [e.target.value]
                          : e.target.value,
                    })
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {departmentTypes.map((dept) => (
                    <MenuItem key={dept.name} value={dept.name}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: dept.color,
                          }}
                        />
                        {dept.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTaskData.priority}
                  label="Priority"
                  onChange={(e) =>
                    setNewTaskData({
                      ...newTaskData,
                      priority: e.target.value as TaskPriority,
                    })
                  }
                >
                  {priorityOptions.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newTaskData.type}
                  label="Type"
                  onChange={(e) =>
                    setNewTaskData({ ...newTaskData, type: e.target.value })
                  }
                >
                  {matrixTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newTaskData.status}
                  label="Status"
                  onChange={(e) =>
                    setNewTaskData({
                      ...newTaskData,
                      status: e.target.value as TaskStatus,
                    })
                  }
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Story Points"
                type="number"
                fullWidth
                value={newTaskData.storyPoints}
                onChange={(e) =>
                  setNewTaskData({
                    ...newTaskData,
                    storyPoints: Number(e.target.value),
                  })
                }
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Assignee"
                fullWidth
                value={newTaskData.assignee}
                onChange={(e) =>
                  setNewTaskData({ ...newTaskData, assignee: e.target.value })
                }
              />

              <TextField
                label="Due Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newTaskData.dueDate}
                onChange={(e) =>
                  setNewTaskData({ ...newTaskData, dueDate: e.target.value })
                }
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editTask ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Matrix;
