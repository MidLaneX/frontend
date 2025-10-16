import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
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
  Error as IssueIcon,
  CheckCircle as ApprovalIcon,
  MoreHoriz as OtherIcon,
} from "@mui/icons-material";
import { TaskService } from "@/services/TaskService";
import { TaskFormDialog } from "@/components/features";
import type { Task, TaskPriority, TaskType } from "@/types";

interface CalendarProps {
  projectId: string;
  projectName?: string;
  templateType?: string;
}


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

  const handleTaskSave = async (taskData: Partial<Task>) => {
    try {
      if (editTask) {
        await TaskService.updateTask(
          Number(projectId),
          Number(editTask.id),
          taskData,
          templateType,
        );
      } else {
        await TaskService.createTask(
          Number(projectId),
          taskData as Omit<Task, "id">,
          templateType,
        );
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
        return <EpicIcon sx={{ fontSize: 12, color: "#8b5a2b" }} />;
      case "Story":
        return <StoryIcon sx={{ fontSize: 12, color: "#4caf50" }} />;
      case "Bug":
        return <BugIcon sx={{ fontSize: 12, color: "#f44336" }} />;
      case "Task":
        return <TaskIcon sx={{ fontSize: 12, color: "#2196f3" }} />;
      case "Issue":
        return <IssueIcon sx={{ fontSize: 12, color: "#ff9800" }} />;
      case "Approval":
        return <ApprovalIcon sx={{ fontSize: 12, color: "#9c27b0" }} />;
      case "Other":
        return <OtherIcon sx={{ fontSize: 12, color: "#607d8b" }} />;
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
    
    // Check if any task is due (deadline highlighting)
    const hasDeadline = dayTasks.some(task => task.status !== "Done");
    const isPastDeadline = date < today && hasDeadline;

    return (
      <Box
        sx={{
          minHeight: 140,
          border: "1px solid #e0e0e0",
          bgcolor: isPastDeadline
            ? "#ffebee" // Light red for past deadlines
            : isCurrentDay
              ? "#e8eaf6" // Light indigo for today
              : isCurrentMonth
                ? "white"
                : "#f5f5f5",
          cursor: isCurrentMonth ? "pointer" : "default",
          p: 1,
          borderColor: isSelectedDay
            ? "#5e35b1" // Deep purple for selected
            : isPastDeadline
              ? "#e57373" // Red for overdue
              : isCurrentDay
                ? "#3f51b5" // Indigo for today
                : "#e0e0e0",
          borderWidth: isSelectedDay || isCurrentDay || isPastDeadline ? 2 : 1,
          "&:hover": isCurrentMonth
            ? {
                bgcolor: "#ede7f6", // Light purple on hover
                borderColor: "#5e35b1",
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
        sx={{ 
          bgcolor: "white", 
          border: "2px solid #5e35b1", // Deep purple border
          borderRadius: 1,
          boxShadow: "0 4px 6px rgba(94, 53, 177, 0.1)"
        }}
      >
        {/* Week day headers */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {weekDays.map((day) => (
            <Box
              key={day}
              sx={{
                p: 2,
                textAlign: "center",
                background: "linear-gradient(135deg, #5e35b1 0%, #3f51b5 100%)", // Purple to indigo gradient
                color: "white",
                borderRight: "1px solid rgba(255,255,255,0.2)",
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
        <Paper 
          sx={{ 
            mx: 3, 
            mb: 3, 
            p: 2, 
            background: "linear-gradient(135deg, #ede7f6 0%, #e8eaf6 100%)", // Light purple to light indigo
            border: "1px solid #b39ddb",
            boxShadow: "0 2px 4px rgba(94, 53, 177, 0.1)"
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#5e35b1" }}>
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

      {/* Task Form Dialog */}
      <TaskFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditTask(null);
        }}
        onSave={handleTaskSave}
        editTask={editTask}
        projectId={Number(projectId)}
        templateType={templateType}
      />
    </Box>
  );
};

export default Calendar;
