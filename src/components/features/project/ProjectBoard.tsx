import React, { useState, useCallback, useMemo } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

import KanbanColumn from "../kanban/KanbanColumn";
import TaskCard from "../task/TaskCard";
import ProjectFilters from "./ProjectFilters";
import type { FilterState } from "./ProjectFilters";
import type { Project, Task } from "@/types";

// Constants for consistent styling and configuration
const BOARD_STYLES = {
  container: {
    p: 3,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    bgcolor: "#FAFBFC",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    mb: 3,
    p: 3,
    bgcolor: "white",
    borderRadius: 2,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  title: {
    fontWeight: 700,
    color: "#172B4D",
    display: "flex",
    alignItems: "center",
    gap: 1,
  },
  subtitle: {
    color: "#5E6C84",
    mt: 0.5,
  },
  createButton: {
    bgcolor: "#0052CC",
    "&:hover": { bgcolor: "#0747A6" },
    textTransform: "none",
    borderRadius: 2,
    px: 3,
    py: 1,
    fontWeight: 600,
  },
  boardContainer: {
    flex: 1,
    mt: 2,
    overflowX: "auto",
    overflowY: "hidden",
  },
  columnsContainer: {
    display: "flex",
    gap: 3,
    height: "100%",
    minWidth: "fit-content",
    pb: 2,
  },
  column: {
    minWidth: 320,
    maxWidth: 320,
    flex: "0 0 320px",
    display: "flex",
    flexDirection: "column",
  },
  columnHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    mb: 2,
    p: 2,
    bgcolor: "white",
    borderRadius: "8px 8px 0 0",
    borderBottom: "2px solid #DFE1E6",
  },
  columnTitle: {
    fontWeight: 700,
    color: "#172B4D",
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  taskCount: {
    bgcolor: "#F4F5F7",
    color: "#5E6C84",
    fontSize: "12px",
    fontWeight: 600,
    minWidth: "24px",
    height: "24px",
  },
  filterCard: {
    mb: 2,
    p: 2,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  dragOverlay: {
    transform: "rotate(5deg)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    borderRadius: 2,
  },
} as const;

// Status configuration with colors and order
const STATUS_CONFIG = [
  {
    value: "Backlog" as Task["status"],
    label: "Backlog",
    color: "#DDD",
    bgColor: "#F8F9FA",
    borderColor: "#DFE1E6",
  },
  {
    value: "Todo" as Task["status"],
    label: "To Do",
    color: "#0052CC",
    bgColor: "#E6F3FF",
    borderColor: "#B3D9FF",
  },
  {
    value: "In Progress" as Task["status"],
    label: "In Progress",
    color: "#FF8B00",
    bgColor: "#FFF4E6",
    borderColor: "#FFD6B3",
  },
  {
    value: "Review" as Task["status"],
    label: "Review",
    color: "#8B5CF6",
    bgColor: "#F3F0FF",
    borderColor: "#D6C7FF",
  },
  {
    value: "Done" as Task["status"],
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
  onDragEnd: (event: DragEndEvent) => void;
}

/**
 * ProjectBoard Component
 *
 * A beautiful Kanban-style board for task management with drag-and-drop functionality.
 * Features enhanced visual design, proper task filtering, and smooth interactions.
 */
const ProjectBoard: React.FC<ProjectBoardProps> = ({
  project,
  tasks,
  onTaskClick,
  onCreateTask,
  onDragEnd,
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

  // Memoized filtered tasks for performance
  const filteredTasks = useMemo(() => {
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

      // Assignee filter
      if (
        filters.assignee.length > 0 &&
        !filters.assignee.includes(task.assignee)
      ) {
        return false;
      }

      // Priority filter
      if (
        filters.priority.length > 0 &&
        !filters.priority.includes(task.priority)
      ) {
        return false;
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(task.type)) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }

      return true;
    });
  }, [tasks, searchTerm, filters]);

  // Event handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      setActiveTask(task || null);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      onDragEnd(event);
    },
    [onDragEnd]
  );

  const handleAddTask = useCallback(
    () => {
      onCreateTask();
    },
    [onCreateTask]
  );

  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  // Main render
  return (
    <Box sx={BOARD_STYLES.container}>
      {/* Enhanced Board Header */}
      <Box sx={BOARD_STYLES.header}>
        <Box>
          <Box sx={BOARD_STYLES.headerContent}>
            <ViewColumnIcon sx={{ color: "#0052CC", fontSize: 28 }} />
            <Typography variant="h4" sx={BOARD_STYLES.title}>
              Board
            </Typography>
            <Chip
              label={`${filteredTasks.length} tasks`}
              size="small"
              sx={{
                bgcolor: "#E6F3FF",
                color: "#0052CC",
                fontWeight: 600,
              }}
            />
          </Box>
          <Typography variant="body1" sx={BOARD_STYLES.subtitle}>
            Plan, track, and manage your team's work in a visual workflow
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Tooltip title="Toggle Filters">
            <IconButton
              onClick={toggleFilters}
              sx={{
                bgcolor: showFilters ? "#E6F3FF" : "transparent",
                color: showFilters ? "#0052CC" : "#5E6C84",
                "&:hover": { bgcolor: "#E6F3FF", color: "#0052CC" },
              }}
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateTask}
            sx={BOARD_STYLES.createButton}
          >
            Create Issue
          </Button>
        </Box>
      </Box>

      {/* Collapsible Filters */}
      {showFilters && (
        <Card sx={BOARD_STYLES.filterCard}>
          <ProjectFilters
            onSearchChange={setSearchTerm}
            onFiltersChange={setFilters}
            teamMembers={project.teamMembers}
          />
        </Card>
      )}

      {/* Enhanced Kanban Board */}
      <Box sx={BOARD_STYLES.boardContainer}>
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <Box sx={BOARD_STYLES.columnsContainer}>
            {STATUS_CONFIG.map((statusConfig) => {
              const statusTasks = filteredTasks.filter(
                (task) => task.status === statusConfig.value
              );

              return (
                <Box key={statusConfig.value} sx={BOARD_STYLES.column}>
                  {/* Enhanced Column Header */}
                  <Box
                    sx={{
                      ...BOARD_STYLES.columnHeader,
                      borderLeft: `4px solid ${statusConfig.color}`,
                      bgcolor: statusConfig.bgColor,
                    }}
                  >
                    <Typography sx={BOARD_STYLES.columnTitle}>
                      {statusConfig.label}
                    </Typography>
                    <Chip
                      label={statusTasks.length}
                      size="small"
                      sx={{
                        ...BOARD_STYLES.taskCount,
                        bgcolor: statusConfig.color,
                        color: "white",
                      }}
                    />
                  </Box>

                  {/* Enhanced Column Content */}
                  <Box
                    sx={{
                      flex: 1,
                      bgcolor: statusConfig.bgColor,
                      borderRadius: "0 0 8px 8px",
                      border: `1px solid ${statusConfig.borderColor}`,
                      borderTop: "none",
                      minHeight: "200px",
                    }}
                  >
                    <KanbanColumn
                      id={statusConfig.value}
                      title={statusConfig.label}
                      tasks={statusTasks}
                      onTaskClick={onTaskClick}
                      onAddTask={handleAddTask}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Enhanced Drag Overlay */}
          <DragOverlay>
            {activeTask ? (
              <Box sx={BOARD_STYLES.dragOverlay}>
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
