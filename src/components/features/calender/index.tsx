import React, { useState, useEffect } from "react";
import {
  Box,
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
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  Today as TodayIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Assignment as TaskIcon,
  BugReport as BugIcon,
  AutoStories as StoryIcon,
  Category as EpicIcon,
} from "@mui/icons-material";
import { TaskService } from "@/services/TaskService";
import type { Task, TaskStatus, TaskPriority, TaskType } from "@/types";

interface CalendarProps {
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

const Calendar: React.FC<CalendarProps> = ({
  projectId,
  projectName,
  templateType = "traditional",
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

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

  useEffect(() => {
    if (selectedDate) {
      setNewTaskData((prev) => ({
        ...prev,
        dueDate: selectedDate.toISOString().split("T")[0],
      }));
    }
  }, [selectedDate]);

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
      type: "Task",
      assignee: "",
      reporter: "",
      dueDate: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
      storyPoints: 3,
      labels: [],
      comments: [],
    });
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case "Epic":
        return <EpicIcon sx={{ fontSize: 12, color: "#8b5a2b" }} />;
      case "Story":
        return <StoryIcon sx={{ fontSize: 12, color: "#4caf50" }} />;
      case "Bug":
        return <BugIcon sx={{ fontSize: 12, color: "#f44336" }} />;
      case "Task":
        return <TaskIcon sx={{ fontSize: 12, color: "#2196f3" }} />;
      default:
        return <TaskIcon sx={{ fontSize: 12, color: "#2196f3" }} />;
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

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStr =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");

    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      // Extract just the date part without time zone conversion
      const taskDateStr = task.dueDate.split("T")[0];
      return taskDateStr === dateStr;
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(new Date(year, month + (direction === "next" ? 1 : -1), 1));
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const renderDay = (dayNumber: number, isCurrentMonth = true) => {
    const date = new Date(year, month, dayNumber);
    const dayTasks = isCurrentMonth ? getTasksForDate(date) : [];
    const isCurrentDay = isToday(date) && isCurrentMonth;
    const isSelectedDay = isSelected(date) && isCurrentMonth;

    return (
      <Box
        sx={{
          minHeight: 140,
          border: "1px solid #e0e0e0",
          bgcolor: isCurrentDay
            ? "#e3f2fd"
            : isCurrentMonth
              ? "white"
              : "#f5f5f5",
          cursor: isCurrentMonth ? "pointer" : "default",
          p: 1,
          borderColor: isSelectedDay
            ? "#1976d2"
            : isCurrentDay
              ? "#2196f3"
              : "#e0e0e0",
          borderWidth: isSelectedDay || isCurrentDay ? 2 : 1,
          "&:hover": isCurrentMonth
            ? {
                bgcolor: "#f0f7ff",
                borderColor: "#1976d2",
              }
            : {},
          position: "relative",
        }}
        onClick={() => {
          if (isCurrentMonth) {
            setSelectedDate(date);
          }
        }}
      >
        {/* Day number */}
        <Typography
          variant="body2"
          fontWeight={isCurrentDay ? 700 : isCurrentMonth ? 600 : 400}
          color={
            isCurrentDay
              ? "primary.main"
              : isCurrentMonth
                ? "text.primary"
                : "text.disabled"
          }
          sx={{ mb: 1 }}
        >
          {dayNumber}
        </Typography>

        {/* Tasks */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {dayTasks.slice(0, 4).map((task) => (
            <Chip
              key={task.id}
              icon={getTaskIcon(task.type)}
              label={
                task.title.length > 18
                  ? `${task.title.substring(0, 18)}...`
                  : task.title
              }
              size="small"
              onClick={(e) => {
                e.stopPropagation();
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
              sx={{
                fontSize: 11,
                height: 22,
                bgcolor: `${getPriorityColor(task.priority)}15`,
                color: getPriorityColor(task.priority),
                border: `1px solid ${getPriorityColor(task.priority)}50`,
                "&:hover": {
                  bgcolor: `${getPriorityColor(task.priority)}25`,
                },
                "& .MuiChip-label": {
                  px: 0.5,
                  fontSize: 11,
                  fontWeight: 500,
                },
                "& .MuiChip-icon": {
                  fontSize: 12,
                  ml: 0.5,
                },
              }}
            />
          ))}
          {dayTasks.length > 4 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 10, textAlign: "center", fontWeight: 500 }}
            >
              +{dayTasks.length - 4} more
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  const renderCalendar = () => {
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days = [];

    // Add previous month days to fill the first week
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(renderDay(prevMonthDays - i, false));
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(renderDay(day, true));
    }

    // Add next month days to fill the last week
    const totalCells = 42; // 6 rows × 7 days
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push(renderDay(day, false));
    }

    return (
      <Box
        sx={{ bgcolor: "white", border: "2px solid #1976d2", borderRadius: 1 }}
      >
        {/* Week day headers */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {weekDays.map((day) => (
            <Box
              key={day}
              sx={{
                p: 2,
                textAlign: "center",
                bgcolor: "#1976d2",
                color: "white",
                borderRight: "1px solid white",
                "&:last-child": { borderRight: "none" },
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Calendar grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {days}
        </Box>
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
        <Typography sx={{ ml: 2 }}>Loading calendar...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
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
          <CalendarIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Calendar
            </Typography>
            {projectName && (
              <Typography variant="body2" color="text.secondary">
                {projectName}
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
          Create Task
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Navigation */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          p: 3,
        }}
      >
        <IconButton
          onClick={() => navigateMonth("prev")}
          sx={{ bgcolor: "white", boxShadow: 1 }}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ minWidth: 300, textAlign: "center" }}
        >
          {currentDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Typography>

        <IconButton
          onClick={() => navigateMonth("next")}
          sx={{ bgcolor: "white", boxShadow: 1 }}
        >
          <ChevronRightIcon />
        </IconButton>

        <Button
          variant="outlined"
          startIcon={<TodayIcon />}
          onClick={() => setCurrentDate(new Date())}
          sx={{ ml: 2, borderRadius: 2, textTransform: "none" }}
        >
          Today
        </Button>
      </Box>

      {/* Calendar */}
      <Box sx={{ flex: 1, px: 3, pb: 3, overflow: "auto" }}>
        {renderCalendar()}
      </Box>

      {/* Selected Date Info */}
      {selectedDate && (
        <Paper sx={{ mx: 3, mb: 3, p: 2, bgcolor: "primary.50" }}>
          <Typography variant="subtitle1" fontWeight={600} color="primary.main">
            Selected:{" "}
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getTasksForDate(selectedDate).length} task(s) due this day
          </Typography>
        </Paper>
      )}

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

export default Calendar;
