import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import TaskDetailModal from "../task/TaskDetailModal";
import CreateIssueModal from "../CreateIssueModal";
import ProjectNavigation from "./ProjectNavigation";
import { projects } from "@/data/projects";
import type { Task } from "@/types";

// Constants for consistent styling
const STYLES = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    borderBottom: "1px solid #e0e0e0",
    p: 3,
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    mb: 2,
  },
  projectTitle: {
    fontWeight: 600,
    color: "#172b4d",
  },
  projectDescription: {
    color: "#5e6c84",
    lineHeight: 1.5,
  },
  notFoundContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
} as const;

/**
 * ProjectPage Component
 *
 * A comprehensive project management page that displays project details,
 * navigation tabs (Summary, Timeline, Backlog, Board), and handles task management.
 *
 * Features:
 * - Project header with title and description
 * - Horizontal navigation tabs similar to Jira
 * - Task creation and editing modals
 * - Drag and drop functionality
 * - Real-time task updates
 */
const ProjectPage: React.FC = () => {
  // Hooks
  const { projectId } = useParams<{ projectId: string }>();

  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Derived state
  const project = projects.find((p) => p.id === projectId);

  // Effects
  useEffect(() => {
    if (project) {
      setTasks(project.tasks || []);
    }
  }, [project]);

  // Event handlers
  /**
   * Handles task selection and opens the task detail modal
   */
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  }, []);

  /**
   * Opens the create task modal
   */
  const handleCreateTask = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  /**
   * Updates a specific task with partial updates
   */
  const handleUpdateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
    },
    []
  );

  /**
   * Creates a new task and adds it to the task list
   */
  const handleCreateIssue = useCallback(
    (issue: Omit<Task, "id" | "comments">) => {
      const newTask: Task = {
        ...issue,
        id: Date.now().toString(),
        comments: [],
      };
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setIsCreateModalOpen(false);
    },
    []
  );

  /**
   * Handles drag and drop end events for task reordering
   */
  const handleDragEnd = useCallback((event: unknown) => {
    // TODO: Implement drag end logic for task reordering
    console.log("Drag end:", event);
  }, []);

  /**
   * Closes the task detail modal
   */
  const handleCloseTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
  }, []);

  /**
   * Closes the create task modal
   */
  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  // Render guards
  if (!project) {
    return (
      <Box sx={STYLES.notFoundContainer}>
        <Typography variant="h6">Project not found</Typography>
      </Box>
    );
  }

  // Main render
  return (
    <Box sx={STYLES.container}>
      \{/* Project Navigation */}
      <ProjectNavigation
        project={project}
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onCreateTask={handleCreateTask}
        onUpdateTask={handleUpdateTask}
        onDragEnd={handleDragEnd}
      />
      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        open={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onUpdateTask={handleUpdateTask}
      />
      <CreateIssueModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreateIssue={handleCreateIssue}
        project={project}
      />
    </Box>
  );
};

export default ProjectPage;
