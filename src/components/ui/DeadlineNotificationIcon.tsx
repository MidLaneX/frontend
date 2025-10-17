import React, { useState, useEffect } from "react";
import {
  Badge,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Box,
  Typography,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  NotificationsActive as NotificationIcon,
  Warning as WarningIcon,
  CheckCircle as DoneIcon,
} from "@mui/icons-material";
import type { Task } from "@/types";

interface DeadlineNotificationIconProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

interface TaskWithDeadline {
  task: Task;
  daysUntilDue: number;
  hoursUntilDue: number;
  isDueTomorrow: boolean;
  isDueToday: boolean;
}

/**
 * Simple deadline notification icon for project board
 * Shows tasks due within 1 day (excluding Done status)
 * Red badge for urgent tasks
 */
const DeadlineNotificationIcon: React.FC<DeadlineNotificationIconProps> = ({
  tasks,
  onTaskClick,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [urgentTasks, setUrgentTasks] = useState<TaskWithDeadline[]>([]);
  const open = Boolean(anchorEl);

  // Calculate urgent tasks (due within 1 day, not done)
  useEffect(() => {
    console.log("🔔 DeadlineNotificationIcon: Calculating urgent tasks", {
      totalTasks: tasks.length,
      tasksWithDueDate: tasks.filter(t => t.dueDate).length,
      tasksNotDone: tasks.filter(t => t.status !== "Done").length,
      tasksWithAssignee: tasks.filter(t => t.assignee).length,
    });

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const urgent = tasks
      .filter((task) => {
        // Must have due date, not be done, and have assignee
        if (!task.dueDate || task.status === "Done" || !task.assignee) {
          return false;
        }

        const dueDate = new Date(task.dueDate);
        
        // Only include if due date is within next 24 hours
        const isWithin24Hours = dueDate <= tomorrow && dueDate >= now;
        
        if (task.dueDate) {
          console.log("📅 Task deadline check:", {
            title: task.title,
            dueDate: task.dueDate,
            dueDateParsed: dueDate,
            status: task.status,
            assignee: task.assignee,
            now: now,
            tomorrow: tomorrow,
            isWithin24Hours,
            hoursDiff: (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60),
          });
        }
        
        return isWithin24Hours;
      })
      .map((task) => {
        const dueDate = new Date(task.dueDate);
        const diffTime = dueDate.getTime() - now.getTime();
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const isDueToday = diffDays === 0;
        const isDueTomorrow = diffDays === 1;

        return {
          task,
          daysUntilDue: diffDays,
          hoursUntilDue: diffHours,
          isDueTomorrow,
          isDueToday,
        };
      })
      .sort((a, b) => a.hoursUntilDue - b.hoursUntilDue);

    console.log("🔔 DeadlineNotificationIcon: Urgent tasks calculated", {
      urgentCount: urgent.length,
      urgentTasks: urgent.map(u => ({
        title: u.task.title,
        dueDate: u.task.dueDate,
        hoursUntilDue: u.hoursUntilDue,
        status: u.task.status,
      })),
    });

    setUrgentTasks(urgent);
  }, [tasks]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTaskClick = (task: Task) => {
    handleClose();
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  const formatDueTime = (taskDeadline: TaskWithDeadline): string => {
    if (taskDeadline.isDueToday) {
      return `Due today (${taskDeadline.hoursUntilDue}h)`;
    }
    if (taskDeadline.isDueTomorrow) {
      return "Due tomorrow";
    }
    return `Due in ${taskDeadline.hoursUntilDue} hours`;
  };

  const getUrgencyColor = (taskDeadline: TaskWithDeadline): "error" | "warning" => {
    return taskDeadline.isDueToday ? "error" : "warning";
  };

  console.log("🔔 DeadlineNotificationIcon render:", {
    urgentTasksCount: urgentTasks.length,
    willShow: urgentTasks.length > 0,
    totalTasksReceived: tasks.length,
  });

  // Don't show icon if no urgent tasks
  if (urgentTasks.length === 0) {
    return null;
  }

  return (
    <>
      <Tooltip title={`${urgentTasks.length} task(s) due within 24 hours`} arrow>
        <IconButton
          onClick={handleClick}
          size="medium"
          sx={{
            color: "error.main",
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%, 100%": {
                opacity: 1,
                transform: "scale(1)",
              },
              "50%": {
                opacity: 0.8,
                transform: "scale(1.1)",
              },
            },
            "&:hover": {
              bgcolor: "error.lighter",
            },
          }}
        >
          <Badge
            badgeContent={urgentTasks.length}
            color="error"
            max={99}
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.75rem",
                fontWeight: 700,
                minWidth: 20,
                height: 20,
                borderRadius: "10px",
                border: "2px solid white",
                boxShadow: "0 2px 8px rgba(211, 47, 47, 0.4)",
              },
            }}
          >
            <NotificationIcon sx={{ fontSize: 24 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            overflow: "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            borderRadius: 2,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Header */}
        <Box sx={{ p: 2, bgcolor: "error.lighter" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <WarningIcon sx={{ color: "error.main" }} />
            <Typography variant="h6" fontWeight={600} color="error.main">
              Urgent Deadlines
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Tasks due within 24 hours (excluding Done)
          </Typography>
        </Box>

        <Divider />

        {/* Task List */}
        {urgentTasks.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <DoneIcon sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No urgent deadlines
            </Typography>
          </Box>
        ) : (
          <>
            {urgentTasks.map((taskDeadline, index) => (
              <MenuItem
                key={taskDeadline.task.id}
                onClick={() => handleTaskClick(taskDeadline.task)}
                sx={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  py: 2,
                  px: 2.5,
                  borderLeft: 4,
                  borderColor: getUrgencyColor(taskDeadline) + ".main",
                  borderBottom: index < urgentTasks.length - 1 ? "1px solid" : "none",
                  borderBottomColor: "divider",
                  "&:hover": {
                    bgcolor: getUrgencyColor(taskDeadline) + ".lighter",
                  },
                }}
              >
                {/* Task Title */}
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{
                    mb: 0.5,
                    width: "100%",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {taskDeadline.task.title}
                </Typography>

                {/* Task Info */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                  <Chip
                    icon={<WarningIcon />}
                    label={formatDueTime(taskDeadline)}
                    color={getUrgencyColor(taskDeadline)}
                    size="small"
                    sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
                  />
                  <Chip
                    label={taskDeadline.task.priority}
                    size="small"
                    variant="outlined"
                    sx={{ height: 22, fontSize: "0.7rem" }}
                  />
                  <Chip
                    label={taskDeadline.task.status}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ height: 22, fontSize: "0.7rem" }}
                  />
                </Box>

                {/* Assignee & Due Date */}
                <Box sx={{ width: "100%" }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    👤 {taskDeadline.task.assignee}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    📅 {new Date(taskDeadline.task.dueDate).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </>
        )}

        {/* Footer */}
        <Divider />
        <Box
          sx={{
            p: 1.5,
            bgcolor: "grey.50",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Click on a task to view details
          </Typography>
        </Box>
      </Menu>
    </>
  );
};

export default DeadlineNotificationIcon;
