import React, { useState, useEffect } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";
import { Add as AddIcon, ViewWeek as KanbanIcon } from "@mui/icons-material";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "../task/TaskCard";
import { TaskFormDialog } from "@/components/features";
import { TaskService } from "@/services/TaskService";
import type { Task, TaskStatus } from "@/types";

interface KanbanProps {
  projectId: number;
  projectName?: string;
  templateType?: string;
}

const statusColumns: TaskStatus[] = ["Backlog", "Todo", "In Progress", "Review", "Done"];

const Kanban: React.FC<KanbanProps> = ({ projectId, projectName, templateType = "kanban" }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("Todo");
  
  // Drag and drop states
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await TaskService.getTasksByProjectId(projectId, templateType);
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as number;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === taskId);

    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await TaskService.updateTask(projectId, taskId, { status: newStatus }, templateType);
    } catch (err) {
      console.error("Failed to update task status:", err);
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t))
      );
      setError("Failed to update task status.");
    }
  };

  const handleTaskSave = async (taskData: Partial<Task>) => {
    try {
      if (editTask) {
        await TaskService.updateTask(projectId, Number(editTask.id), taskData, templateType);
      } else {
        await TaskService.createTask(projectId, taskData as Omit<Task, "id">, templateType);
      }
      setOpenDialog(false);
      setEditTask(null);
      fetchTasks();
    } catch (err) {
      console.error("Failed to save task:", err);
      setError("Failed to save task.");
    }
  };

  const handleTaskClick = (task: Task) => {
    setEditTask(task);
    setOpenDialog(true);
  };

  const handleAddTask = (status: string) => {
    setEditTask(null);
    setDefaultStatus(status as TaskStatus);
    setOpenDialog(true);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Kanban board...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f4f5f7" }}>
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
          <KanbanIcon sx={{ color: "primary.main", fontSize: 32 }} />
          <Typography variant="h5" fontWeight={600}>
            Kanban Board
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
          onClick={() => handleAddTask("Todo")}
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

      {/* Kanban Board */}
      <Box sx={{ flexGrow: 1, overflow: "auto", p: 3 }}>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <Box
            sx={{
              display: "flex",
              gap: 3,
              minHeight: "calc(100vh - 200px)",
              pb: 3,
            }}
          >
            {statusColumns.map((status) => (
              <KanbanColumn
                key={status}
                id={status}
                title={status}
                tasks={getTasksByStatus(status)}
                onTaskClick={handleTaskClick}
                onAddTask={handleAddTask}
              />
            ))}
          </Box>

          <DragOverlay>
            {activeTask ? (
              <Box sx={{ transform: "rotate(5deg)", cursor: "grabbing" }}>
                <TaskCard task={activeTask} />
              </Box>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Box>

      {/* Task Dialog */}
      <TaskFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditTask(null);
        }}
        onSave={handleTaskSave}
        editTask={editTask}
        projectId={projectId}
        templateType={templateType}
        defaultStatus={defaultStatus}
        title="Kanban Task"
        subtitle={`Manage tasks in ${projectName} kanban board`}
      />
    </Box>
  );
};

export default Kanban;
