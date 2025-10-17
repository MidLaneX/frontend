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
  Alert,
  CircularProgress,
  Avatar,
  Tooltip,
  LinearProgress,
  AvatarGroup,
  Stack,
  Fab,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as PendingIcon,
  Flag as MilestoneIcon,
  TrendingUp as ProgressIcon,
  People as TeamIcon,
  CalendarToday as CalendarIcon,
  Schedule as DueDateIcon,
  Timeline as TimelineIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import { TaskService } from "@/services/TaskService";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { TaskFormDialog } from "@/components/features";

interface StartupProps {
  projectId: string;
  projectName?: string;
  templateType?: string;
}

interface Milestone {
  epic: Task;
  tasks: Task[];
  progress: number;
  completedTasks: number;
  totalTasks: number;
  isOverdue: boolean;
  daysRemaining: number;
}

const Startup: React.FC<StartupProps> = ({
  projectId,
  projectName,
  templateType = "startup",
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);

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

  const handleSave = async (taskData: Partial<Task>) => {
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

  const getMilestones = (): Milestone[] => {
    const epics = tasks.filter((task) => task.type === "Epic");
    
    return epics.map((epic) => {
      const epicTasks = tasks.filter((task) => task.epic === epic.title);
      const completedTasks = epicTasks.filter((task) => task.status === "Done").length;
      const totalTasks = epicTasks.length;
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      const dueDate = epic.dueDate ? new Date(epic.dueDate) : null;
      const today = new Date();
      const isOverdue = dueDate ? dueDate < today && epic.status !== "Done" : false;
      const daysRemaining = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      return {
        epic,
        tasks: epicTasks,
        progress,
        completedTasks,
        totalTasks,
        isOverdue,
        daysRemaining,
      };
    }).sort((a, b) => {
      const dateA = a.epic.dueDate ? new Date(a.epic.dueDate).getTime() : 0;
      const dateB = b.epic.dueDate ? new Date(b.epic.dueDate).getTime() : 0;
      return dateA - dateB;
    });
  };

  const getTotalProgress = () => {
    const completedTasks = tasks.filter((task) => task.status === "Done" && task.type !== "Epic").length;
    const totalTasks = tasks.filter((task) => task.type !== "Epic").length;
    return totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0";
  };

  const getCompletedMilestones = () => {
    return tasks.filter((task) => task.type === "Epic" && task.status === "Done").length;
  };

  const getTotalMilestones = () => {
    return tasks.filter((task) => task.type === "Epic").length;
  };

  const getTeamMembers = () => {
    const assignees = tasks.map((task) => task.assignee).filter(Boolean);
    return [...new Set(assignees)];
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

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "Backlog":
        return { main: "#64748b", light: "#f1f5f9" };
      case "Todo":
        return { main: "#3b82f6", light: "#eff6ff" };
      case "In Progress":
        return { main: "#f97316", light: "#fff7ed" };
      case "Review":
        return { main: "#a855f7", light: "#faf5ff" };
      case "Done":
        return { main: "#10b981", light: "#f0fdf4" };
      default:
        return { main: "#64748b", light: "#f1f5f9" };
    }
  };

  // Get color for milestone status
  const getMilestoneStatusColor = (milestone: Milestone) => {
    if (milestone.progress === 100) {
      return {
        main: "#10b981",
        light: "#d1fae5",
        border: "#6ee7b7",
        bg: "#ecfdf5",
        text: "#065f46",
      };
    }
    if (milestone.isOverdue) {
      return {
        main: "#ef4444",
        light: "#fee2e2",
        border: "#fca5a5",
        bg: "#fef2f2",
        text: "#991b1b",
      };
    }
    return {
      main: "#6366f1",
      light: "#e0e7ff",
      border: "#a5b4fc",
      bg: "#eef2ff",
      text: "#3730a3",
    };
  };

  const renderTaskCard = (task: Task) => (
    <Card
      key={task.id}
      sx={{
        mb: 1.5,
        borderRadius: 2,
        border: "1px solid #e5e7eb",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transform: "translateX(4px)",
        },
        transition: "all 0.2s ease",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              {task.status === "Done" ? (
                <CompletedIcon sx={{ fontSize: 18, color: "#10b981" }} />
              ) : (
                <PendingIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
              )}
              <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                {task.title}
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  setEditTask(task);
                  setOpenDialog(true);
                }}
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>

            {task.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  ml: 3.5,
                  mb: 1,
                }}
              >
                {task.description}
              </Typography>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 3.5, flexWrap: "wrap" }}>
              <Chip
                label={task.status}
                size="small"
                sx={{
                  height: 20,
                  fontSize: 10,
                  fontWeight: 600,
                  bgcolor: getStatusColor(task.status).light,
                  color: getStatusColor(task.status).main,
                  border: `1px solid ${getStatusColor(task.status).main}40`,
                }}
              />
              <Chip
                label={task.priority}
                size="small"
                sx={{
                  height: 20,
                  fontSize: 10,
                  fontWeight: 600,
                  bgcolor: getPriorityColor(task.priority).light,
                  color: getPriorityColor(task.priority).main,
                  border: `1px solid ${getPriorityColor(task.priority).border}`,
                }}
              />
              {task.assignee && (
                <Tooltip title={task.assignee}>
                  <Avatar sx={{ width: 20, height: 20, fontSize: 10 }}>
                    {task.assignee.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              )}
              {task.dueDate && (
                <Chip
                  icon={<CalendarIcon sx={{ fontSize: 10 }} />}
                  label={new Date(task.dueDate).toLocaleDateString()}
                  size="small"
                  sx={{ height: 20, fontSize: 10 }}
                />
              )}
            </Box>
          </Box>
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
        <Typography sx={{ ml: 2 }}>Loading milestone timeline...</Typography>
      </Box>
    );
  }

  const milestones = getMilestones();
  const teamMembers = getTeamMembers();

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #f8fafc 0%, #e5e7eb 100%)",
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: "2px solid #e5e7eb",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TimelineIcon sx={{ color: "#6366f1", fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="#1e293b">
              Milestone Timeline
            </Typography>
            {projectName && (
              <Typography variant="body2" color="#64748b" fontWeight={500}>
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
            borderRadius: 3,
            px: 4,
            py: 1.2,
            textTransform: "none",
            fontWeight: 700,
            bgcolor: "#6366f1",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
            "&:hover": {
              bgcolor: "#4f46e5",
              boxShadow: "0 6px 16px rgba(99, 102, 241, 0.4)",
            },
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

      {/* Project Overview Metrics */}
      <Paper sx={{ m: 3, p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: "#1e293b" }}>
          Project Overview
        </Typography>
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Box sx={{ 
                p: 1.5, 
                bgcolor: "#dcfce7", 
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <ProgressIcon sx={{ fontSize: 28, color: "#10b981" }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700} color="#10b981">
                  {getTotalProgress()}%
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Overall Progress
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Box sx={{ 
                p: 1.5, 
                bgcolor: "#e0e7ff", 
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <MilestoneIcon sx={{ fontSize: 28, color: "#6366f1" }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700} color="#6366f1">
                  {getCompletedMilestones()}/{getTotalMilestones()}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Milestones Completed
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Box sx={{ 
                p: 1.5, 
                bgcolor: "#dbeafe", 
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <TeamIcon sx={{ fontSize: 28, color: "#3b82f6" }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700} color="#3b82f6">
                  {teamMembers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Team Members
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Milestone Timeline */}
      <Box sx={{ m: 3, position: "relative" }}>
        {milestones.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <MilestoneIcon sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              No Milestones Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create Epic tasks with due dates to start building your project timeline
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(99,102,241,0.25)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  boxShadow: "0 6px 16px rgba(99,102,241,0.3)",
                },
              }}
            >
              Create First Milestone
            </Button>
          </Paper>
        ) : (
          <Box sx={{ position: "relative" }}>
            {/* Timeline vertical line */}
            <Box
              sx={{
                position: "absolute",
                left: 40,
                top: 0,
                bottom: 0,
                width: 3,
                background: "linear-gradient(180deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
                borderRadius: 1.5,
                opacity: 0.2,
              }}
            />

            {/* Render each milestone */}
            {milestones.map((milestone, index) => {
              const statusColor = getMilestoneStatusColor(milestone);
              const isExpanded = selectedMilestone === milestone.epic.id;

              return (
                <Box key={milestone.epic.id} sx={{ position: "relative", mb: 5 }}>
                  {/* Timeline marker */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: 28,
                      top: 20,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: milestone.progress === 100 
                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        : milestone.isOverdue
                        ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                        : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                      border: "4px solid white",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                    }}
                  >
                    {milestone.progress === 100 ? (
                      <CompletedIcon sx={{ fontSize: 14, color: "white" }} />
                    ) : (
                      <CircleIcon sx={{ fontSize: 8, color: "white" }} />
                    )}
                  </Box>

                  {/* Milestone Card */}
                  <Paper
                    sx={{
                      ml: 8,
                      p: 3,
                      borderRadius: 3,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                      border: `2px solid ${statusColor.border}`,
                      background: `linear-gradient(135deg, ${statusColor.light} 0%, white 100%)`,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                        transform: "translateX(4px)",
                      },
                    }}
                    onClick={() => setSelectedMilestone(isExpanded ? null : milestone.epic.id)}
                  >
                    {/* Milestone Header */}
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                          <MilestoneIcon sx={{ fontSize: 24, color: statusColor.main }} />
                          <Typography variant="h6" fontWeight={700} color="#1e293b">
                            {milestone.epic.title}
                          </Typography>
                        </Box>
                        {milestone.epic.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {milestone.epic.description}
                          </Typography>
                        )}
                      </Box>

                      {/* Due Date Badge */}
                      <Chip
                        icon={<DueDateIcon sx={{ fontSize: 16 }} />}
                        label={
                          milestone.isOverdue
                            ? `Overdue by ${Math.abs(milestone.daysRemaining)} days`
                            : milestone.daysRemaining === 0
                            ? "Due Today"
                            : `${milestone.daysRemaining} days left`
                        }
                        size="small"
                        sx={{
                          bgcolor: milestone.isOverdue ? "#fee2e2" : milestone.daysRemaining <= 7 ? "#fef3c7" : "#dbeafe",
                          color: milestone.isOverdue ? "#dc2626" : milestone.daysRemaining <= 7 ? "#f59e0b" : "#3b82f6",
                          fontWeight: 600,
                          borderRadius: 2,
                          px: 1,
                        }}
                      />
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color={statusColor.main}>
                          {milestone.completedTasks}/{milestone.totalTasks} tasks · {milestone.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={milestone.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "#f1f5f9",
                          "& .MuiLinearProgress-bar": {
                            background: `linear-gradient(90deg, ${statusColor.main} 0%, ${statusColor.light} 100%)`,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>

                    {/* Team Members */}
                    {milestone.tasks.length > 0 && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          Team:
                        </Typography>
                        <AvatarGroup 
                          max={5} 
                          sx={{ 
                            "& .MuiAvatar-root": { 
                              width: 28, 
                              height: 28, 
                              fontSize: 12,
                              border: "2px solid white",
                            } 
                          }}
                        >
                          {Array.from(new Set(milestone.tasks.map(t => t.assignee).filter(Boolean))).map((assigneeId) => {
                            const member = teamMembers.find(m => m === assigneeId);
                            return member ? (
                              <Avatar 
                                key={assigneeId}
                                sx={{ 
                                  bgcolor: statusColor.main,
                                  fontWeight: 600,
                                }}
                              >
                                {member.charAt(0).toUpperCase()}
                              </Avatar>
                            ) : null;
                          })}
                        </AvatarGroup>
                      </Box>
                    )}

                    {/* Expanded Tasks View */}
                    {isExpanded && milestone.tasks.length > 0 && (
                      <Box sx={{ mt: 3, pt: 3, borderTop: "2px dashed #e2e8f0" }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: "#475569" }}>
                          Associated Tasks
                        </Typography>
                        <Stack spacing={2}>
                          {milestone.tasks.map((task) => renderTaskCard(task))}
                        </Stack>
                      </Box>
                    )}
                  </Paper>

                  {/* Connecting line to next milestone */}
                  {index < milestones.length - 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 40,
                        top: 60,
                        width: 3,
                        height: 60,
                        bgcolor: statusColor.border,
                        opacity: 0.3,
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Floating Add Button */}
      <Fab
        color="primary"
        aria-label="add milestone"
        onClick={() => setOpenDialog(true)}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
          "&:hover": {
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            boxShadow: "0 6px 24px rgba(99,102,241,0.5)",
          },
        }}
      >
        <AddIcon />
      </Fab>

      {/* Create/Edit Task Dialog */}
      <TaskFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditTask(null);
        }}
        onSave={handleSave}
        editTask={editTask}
        projectId={Number(projectId)}
        templateType={templateType}
        defaultStatus="Todo"
        title="Startup Task"
        subtitle={`Add tasks to your ${projectName} startup project`}
      />
    </Box>
  );
};

export default Startup;
