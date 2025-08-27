import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import TaskDetailModal from "../task/TaskDetailModal";
import CreateIssueModal from "../CreateIssueModal";
import ProjectNavigation from "./ProjectNavigation";
import { ProjectService } from "@/services/ProjectService";
import type { Task, Project } from "@/types";

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
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching project:', projectId);
        const projectData = await ProjectService.getProjectById(parseInt(projectId), 'scrum');
        console.log('Fetched project data:', projectData);
        
        if (projectData) {
          setProject(projectData);
          setTasks(projectData.tasks || []);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

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
          String(task.id) === taskId ? { ...task, ...updates } : task
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
        id: Date.now(), // Generate unique numeric ID
        comments: [],
      };
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setIsCreateModalOpen(false);
    },
    []
  );

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
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={STYLES.notFoundContainer}>
        <Typography variant="h6" color="error">
          {error || 'Project not found'}
        </Typography>
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
