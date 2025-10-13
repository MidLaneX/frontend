import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Tooltip,
  LinearProgress,
  Alert,
  CircularProgress,
  TableSortLabel,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  MoreVert as MoreVertIcon,
  Assignment as TaskIcon,
  BugReport as BugIcon,
  AutoStories as StoryIcon,
  Category as EpicIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import { TaskService } from "@/services/TaskService";
import type { Task, TaskStatus, TaskPriority, TaskType } from "@/types";

interface ListProps {
  projectId: string;
  projectName?: string;
  templateType?: string;
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

type SortField =
  | "title"
  | "status"
  | "priority"
  | "assignee"
  | "dueDate"
  | "createdAt";
type SortDirection = "asc" | "desc";

const List: React.FC<ListProps> = ({
  projectId,
  projectName,
  templateType = "traditional",
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  // Sorting and filtering
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "All">(
    "All",
  );
  const [typeFilter, setTypeFilter] = useState<TaskType | "All">("All");

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTaskForMenu, setSelectedTaskForMenu] = useState<Task | null>(
    null,
  );

  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "Medium",
    status: "Todo",
    type: "Task",
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

  // Filtered and sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      const matchesSearch =
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.reporter?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;
      const matchesType = typeFilter === "All" || task.type === typeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle date sorting
      if (sortField === "dueDate" || sortField === "createdAt") {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      // Handle priority sorting (convert to numeric)
      if (sortField === "priority") {
        const priorityOrder = {
          Highest: 5,
          High: 4,
          Medium: 3,
          Low: 2,
          Lowest: 1,
        };
        aValue = priorityOrder[aValue as TaskPriority] || 0;
        bValue = priorityOrder[bValue as TaskPriority] || 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    tasks,
    searchQuery,
    statusFilter,
    priorityFilter,
    typeFilter,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = async (taskId: number) => {
    try {
      await TaskService.deleteTask(Number(projectId), taskId, templateType);
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
      setError("Failed to delete task.");
    }
  };

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

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await TaskService.updateTaskStatus(
        Number(projectId),
        taskId,
        newStatus,
        templateType,
      );
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task status:", error);
      setError("Failed to update task status.");
    }
  };

  const resetForm = () => {
    setNewTaskData({
      title: "",
      description: "",
      priority: "Medium",
      status: "Todo",
      type: "Task",
      assignee: "",
      reporter: "",
      dueDate: "",
      storyPoints: 3,
      labels: [],
      comments: [],
    });
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedTasks(
        new Set(filteredAndSortedTasks.map((task) => Number(task.id))),
      );
    } else {
      setSelectedTasks(new Set());
    }
  };

  const handleSelectTask = (taskId: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case "Epic":
        return <EpicIcon sx={{ color: "#8b5a2b", fontSize: 18 }} />;
      case "Story":
        return <StoryIcon sx={{ color: "#4caf50", fontSize: 18 }} />;
      case "Bug":
        return <BugIcon sx={{ color: "#f44336", fontSize: 18 }} />;
      case "Task":
        return <TaskIcon sx={{ color: "#2196f3", fontSize: 18 }} />;
      default:
        return <TaskIcon sx={{ color: "#2196f3", fontSize: 18 }} />;
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

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "Backlog":
        return { color: "#757575", bg: "rgba(117, 117, 117, 0.1)" };
      case "Todo":
        return { color: "#1976d2", bg: "rgba(25, 118, 210, 0.1)" };
      case "In Progress":
        return { color: "#ff9800", bg: "rgba(255, 152, 0, 0.1)" };
      case "Review":
        return { color: "#9c27b0", bg: "rgba(156, 39, 176, 0.1)" };
      case "Done":
        return { color: "#4caf50", bg: "rgba(76, 175, 80, 0.1)" };
      default:
        return { color: "#757575", bg: "rgba(117, 117, 117, 0.1)" };
    }
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
        <Typography sx={{ ml: 2 }}>Loading tasks...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fafbfc",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ViewListIcon sx={{ color: "primary.main" }} />
          <Typography variant="h5" fontWeight={600}>
            Task List
          </Typography>
          {projectName && (
            <Typography variant="body2" color="text.secondary">
              • {projectName}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            borderRadius: 3,
            px: 3,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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

      {/* Filters and Search */}
      <Box
        sx={{ p: 3, bgcolor: "white", borderBottom: 1, borderColor: "divider" }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 300 }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) =>
                setStatusFilter(e.target.value as TaskStatus | "All")
              }
            >
              <MenuItem value="All">All</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) =>
                setPriorityFilter(e.target.value as TaskPriority | "All")
              }
            >
              <MenuItem value="All">All</MenuItem>
              {priorityOptions.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) =>
                setTypeFilter(e.target.value as TaskType | "All")
              }
            >
              <MenuItem value="All">All</MenuItem>
              {typeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
          {selectedTasks.size > 0 && ` • ${selectedTasks.size} selected`}
        </Typography>
      </Box>

      {/* Task Table */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <TableContainer component={Paper} elevation={0} sx={{ height: "100%" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedTasks.size > 0 &&
                      selectedTasks.size < filteredAndSortedTasks.length
                    }
                    checked={
                      filteredAndSortedTasks.length > 0 &&
                      selectedTasks.size === filteredAndSortedTasks.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Type</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === "title"}
                    direction={sortField === "title" ? sortDirection : "asc"}
                    onClick={() => handleSort("title")}
                  >
                    Title
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === "status"}
                    direction={sortField === "status" ? sortDirection : "asc"}
                    onClick={() => handleSort("status")}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === "priority"}
                    direction={sortField === "priority" ? sortDirection : "asc"}
                    onClick={() => handleSort("priority")}
                  >
                    Priority
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === "assignee"}
                    direction={sortField === "assignee" ? sortDirection : "asc"}
                    onClick={() => handleSort("assignee")}
                  >
                    Assignee
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === "dueDate"}
                    direction={sortField === "dueDate" ? sortDirection : "asc"}
                    onClick={() => handleSort("dueDate")}
                  >
                    Due Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Story Points</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedTasks.map((task) => {
                const isSelected = selectedTasks.has(Number(task.id));
                const statusColor = getStatusColor(task.status);

                return (
                  <TableRow
                    key={task.id}
                    hover
                    selected={isSelected}
                    sx={{ "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectTask(Number(task.id))}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={task.type}>
                        {getTaskIcon(task.type)}
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {task.title}
                      </Typography>
                      {task.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {task.description.length > 50
                            ? `${task.description.substring(0, 50)}...`
                            : task.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.status}
                        size="small"
                        sx={{
                          bgcolor: statusColor.bg,
                          color: statusColor.color,
                          fontWeight: 500,
                          border: `1px solid ${statusColor.color}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<FlagIcon sx={{ fontSize: 14 }} />}
                        label={task.priority}
                        size="small"
                        sx={{
                          bgcolor: `${getPriorityColor(task.priority)}15`,
                          color: getPriorityColor(task.priority),
                          fontWeight: 500,
                          border: `1px solid ${getPriorityColor(task.priority)}50`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {task.assignee ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {task.assignee.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2">
                            {task.assignee}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CalendarIcon
                            sx={{ fontSize: 16, color: "text.secondary" }}
                          />
                          <Typography variant="body2">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No due date
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.storyPoints || 0}
                        size="small"
                        variant="outlined"
                        sx={{ minWidth: 40 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
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
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(Number(task.id))}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Create/Edit Task Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
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
          {editTask ? "Edit Task" : "Create New Task"}
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Title"
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
                <InputLabel>Type</InputLabel>
                <Select
                  value={newTaskData.type}
                  label="Type"
                  onChange={(e) =>
                    setNewTaskData({
                      ...newTaskData,
                      type: e.target.value as TaskType,
                    })
                  }
                >
                  {typeOptions.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
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
                label="Reporter"
                fullWidth
                value={newTaskData.reporter}
                onChange={(e) =>
                  setNewTaskData({ ...newTaskData, reporter: e.target.value })
                }
              />
            </Box>

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
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editTask ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default List;
