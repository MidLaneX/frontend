import React, { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  ViewColumn as ViewColumnIcon,
} from "@mui/icons-material";

import KanbanColumn from "../kanban/KanbanColumn";
import TaskCard from "../task/TaskCard";
import ProjectFilters from "./ProjectFilters";
import type { FilterState } from "./ProjectFilters";
import type { Project, Task } from "@/types";

// Theme and styling constants
const THEME = {
  colors: {
    primary: "#0052CC",
    primaryHover: "#0747A6",
    secondary: "#172B4D",
    muted: "#5E6C84",
    background: "#FAFBFC",
    surface: "#FFFFFF",
    border: "#DFE1E6",
  },
  spacing: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
  },
  shadows: {
    light: "0 1px 3px rgba(0,0,0,0.1)",
    medium: "0 8px 25px rgba(0,0,0,0.15)",
  },
} as const;

// Board styling configuration
const styles = {
  container: {
    p: THEME.spacing.md,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    bgcolor: THEME.colors.background,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    mb: THEME.spacing.md,
    p: THEME.spacing.md,
    bgcolor: THEME.colors.surface,
    borderRadius: 2,
    boxShadow: THEME.shadows.light,
  },
  boardContainer: {
    flex: 1,
    mt: THEME.spacing.sm,
    overflowX: "auto",
    overflowY: "hidden",
  },
  columnsContainer: {
    display: "flex",
    gap: THEME.spacing.md,
    height: "100%",
    minWidth: "fit-content",
    pb: THEME.spacing.sm,
  },
} as const;

// Status configuration for Kanban columns
const COLUMN_CONFIG = [
  {
    value: "Backlog" as const,
    label: "Backlog",
    color: "#8993A4",
    bgColor: "#F8F9FA",
    borderColor: "#DFE1E6",
  },
  {
    value: "Todo" as const,
    label: "To Do",
    color: THEME.colors.primary,
    bgColor: "#E6F3FF",
    borderColor: "#B3D9FF",
  },
  {
    value: "In Progress" as const,
    label: "In Progress",
    color: "#FF8B00",
    bgColor: "#FFF4E6",
    borderColor: "#FFD6B3",
  },
  {
    value: "Review" as const,
    label: "Review",
    color: "#8B5CF6",
    bgColor: "#F3F0FF",
    borderColor: "#D6C7FF",
  },
  {
    value: "Done" as const,
    label: "Done",
    color: "#00875A",
    bgColor: "#E6F7F1",
    borderColor: "#B3E5D1",
  },
] as const;

interface ProjectBoardProps {
  project: Project;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCreateTask: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

// Custom hook for task filtering with improved performance
const useTaskFiltering = (
  tasks: Task[],
  searchTerm: string,
  filters: FilterState
) => {
  return useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.assignee.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filter checks with early returns for better performance
      if (
        filters.assignee.length > 0 &&
        !filters.assignee.includes(task.assignee)
      ) {
        return false;
      }
      if (
        filters.priority.length > 0 &&
        !filters.priority.includes(task.priority)
      ) {
        return false;
      }
      if (filters.type.length > 0 && !filters.type.includes(task.type)) {
        return false;
      }
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }

      return true;
    });
  }, [tasks, searchTerm, filters]);
};

// Helper function to group tasks by status
const useGroupedTasks = (filteredTasks: Task[]) => {
  return useMemo(() => {
    const grouped = new Map<string, Task[]>();

    // Initialize all columns with empty arrays
    COLUMN_CONFIG.forEach((config) => {
      grouped.set(config.value, []);
    });

    // Group tasks by status
    filteredTasks.forEach((task) => {
      const statusTasks = grouped.get(task.status) || [];
      statusTasks.push(task);
      grouped.set(task.status, statusTasks);
    });

    return grouped;
  }, [filteredTasks]);
};

// Header component for better organization
const BoardHeader: React.FC<{
  filteredTasksCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  onCreateTask: () => void;
}> = ({ filteredTasksCount, showFilters, onToggleFilters, onCreateTask }) => (
  <Box sx={styles.header}>
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <ViewColumnIcon sx={{ color: THEME.colors.primary, fontSize: 28 }} />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: THEME.colors.secondary,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          Board
        </Typography>
        <Chip
          label={`${filteredTasksCount} tasks`}
          size="small"
          sx={{
            bgcolor: "#E6F3FF",
            color: THEME.colors.primary,
            fontWeight: 600,
          }}
        />
      </Box>
      <Typography variant="body1" sx={{ color: THEME.colors.muted, mt: 0.5 }}>
        Plan, track, and manage your team's work in a visual workflow
      </Typography>
    </Box>

    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
      <Tooltip title="Toggle Filters">
        <IconButton
          onClick={onToggleFilters}
          sx={{
            bgcolor: showFilters ? "#E6F3FF" : "transparent",
            color: showFilters ? THEME.colors.primary : THEME.colors.muted,
            "&:hover": { bgcolor: "#E6F3FF", color: THEME.colors.primary },
          }}
        >
          <FilterListIcon />
        </IconButton>
      </Tooltip>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreateTask}
        sx={{
          bgcolor: THEME.colors.primary,
          "&:hover": { bgcolor: THEME.colors.primaryHover },
          textTransform: "none",
          borderRadius: 2,
          px: 3,
          py: 1,
          fontWeight: 600,
        }}
      >
        Create Issue
      </Button>
    </Box>
  </Box>
);

// Enhanced Column component with droppable functionality
const BoardColumn: React.FC<{
  config: (typeof COLUMN_CONFIG)[number];
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}> = ({ config, tasks, onTaskClick, onAddTask }) => {
  return (
    <Box
      sx={{
        minWidth: 320,
        maxWidth: 320,
        flex: "0 0 320px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <KanbanColumn
        id={config.value}
        title={config.label}
        tasks={tasks}
        onTaskClick={onTaskClick}
        onAddTask={onAddTask}
      />
    </Box>
  );
};

/**
 * ProjectBoard Component
 *
 * A modern, fully functional Kanban board with drag-and-drop capabilities.
 * Features proper task management, filtering, and responsive design.
 */
const ProjectBoard: React.FC<ProjectBoardProps> = ({
  project,
  tasks,
  onTaskClick,
  onCreateTask,
  onTaskUpdate,
}) => {
  // State management
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    assignee: [],
    priority: [],
    type: [],
    status: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Configure drag sensors for better UX
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  // Custom hooks
  const filteredTasks = useTaskFiltering(tasks, searchTerm, filters);
  const groupedTasks = useGroupedTasks(filteredTasks);

  // Drag and drop handlers with enhanced feedback
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const task = tasks.find((t) => t.id === active.id);
      setActiveTask(task || null);

      // Add visual feedback
      document.body.style.cursor = "grabbing";

      // Debug log
      console.log("Drag started:", { taskId: active.id, task });
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      // Reset cursor
      document.body.style.cursor = "default";

      console.log("Drag ended:", {
        taskId: active.id,
        targetColumnId: over?.id,
        hasValidTarget: !!over,
      });

      if (!over) {
        console.log("No valid drop target");
        return;
      }

      const taskId = active.id as string;
      const newStatus = over.id as Task["status"];

      // Find the task being moved
      const task = tasks.find((t) => t.id === taskId);
      if (!task) {
        console.error("Task not found:", taskId);
        return;
      }

      console.log(
        `Attempting to move task "${task.title}" from ${task.status} to ${newStatus}`
      );

      // Only update if status actually changed
      if (task.status !== newStatus) {
        console.log(
          `✅ Moving task "${task.title}" from ${task.status} to ${newStatus}`
        );
        onTaskUpdate(taskId, { status: newStatus });
      } else {
        console.log("❌ Task status unchanged, no update needed");
      }
    },
    [tasks, onTaskUpdate]
  );

  // UI event handlers
  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleTaskClick = useCallback(
    (task: Task) => {
      onTaskClick(task);
    },
    [onTaskClick]
  );

  return (
    <Box sx={styles.container}>
      {/* Board Header */}
      <BoardHeader
        filteredTasksCount={filteredTasks.length}
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        onCreateTask={onCreateTask}
      />

      {/* Collapsible Filters */}
      {showFilters && (
        <Card sx={{ mb: 2, p: 2, boxShadow: THEME.shadows.light }}>
          <ProjectFilters
            onSearchChange={setSearchTerm}
            onFiltersChange={setFilters}
            teamMembers={project.teamMembers}
          />
        </Card>
      )}

      {/* Enhanced Kanban Board with Working Drag & Drop */}
      <Box sx={styles.boardContainer}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Box sx={styles.columnsContainer}>
            {COLUMN_CONFIG.map((config) => {
              const columnTasks = groupedTasks.get(config.value) || [];

              return (
                <SortableContext
                  key={config.value}
                  items={columnTasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <BoardColumn
                    config={config}
                    tasks={columnTasks}
                    onTaskClick={handleTaskClick}
                    onAddTask={onCreateTask}
                  />
                </SortableContext>
              );
            })}
          </Box>

          {/* Enhanced Drag Overlay */}
          <DragOverlay>
            {activeTask ? (
              <Box
                sx={{
                  transform: "rotate(5deg)",
                  boxShadow: THEME.shadows.medium,
                  borderRadius: 2,
                  opacity: 0.9,
                  cursor: "grabbing",
                }}
              >
                <TaskCard task={activeTask} />
              </Box>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Box>
    </Box>
  );
};

export default ProjectBoard;
