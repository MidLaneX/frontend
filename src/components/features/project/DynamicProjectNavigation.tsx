import React, { useState, useEffect, Suspense, lazy, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Tabs,
  Tab,
  Alert,
  Paper,
  Typography,
  CircularProgress,
  Container,
  alpha,
  useTheme,
} from "@mui/material";
import type { Project, Task } from "@/types";
import { DeadlineNotificationIcon } from "@/components/ui";
import { TaskService } from "@/services/TaskService";

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children?: React.ReactNode;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error("Error loading feature component:", error, info);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

interface DynamicProjectNavigationProps {
  project: Project;
}

const normalizeFeaturePath = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "_"); // consistent with folder names

const FeaturePlaceholder = ({ featureName }: { featureName?: string }) => (
  <Container maxWidth="xl" sx={{ py: 4 }}>
    <Paper 
      sx={{ 
        p: 6, 
        textAlign: "center",
        borderRadius: 3,
        border: `2px dashed #e0e0e0`,
        bgcolor: "white"
      }}
    >
      <Typography variant="h5" fontWeight={600} gutterBottom color="text.primary">
        {(featureName || "Unknown").replace(/_/g, " ")} Feature
      </Typography>
      <Typography variant="body1" color="text.secondary">
        This feature is under development or missing.
      </Typography>
    </Paper>
  </Container>
);

const DynamicProjectNavigation: React.FC<DynamicProjectNavigationProps> = ({
  project,
}) => {
  const theme = useTheme();
  const {
    featureName: paramFeatureName,
    projectId: projectId,
    templateType: templateType,
  } = useParams<{
    featureName?: string;
    projectId?: string;
    templateType?: string;
  }>();

  const navigate = useNavigate();
  const features = project.features || [];
  
  // State for tasks to track deadlines
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  console.log(" DynamicProjectNavigation Debug:", {
    project,
    features,
    projectFeaturesLength: project.features?.length,
    paramFeatureName,
    projectId,
    templateType,
  });

  const normalizedFeatures = React.useMemo(
    () =>
      features.map((f) => ({
        name: f,
        path: normalizeFeaturePath(f),
      })),
    [features],
  );

  // Initialize activeTab with empty string, will be set by useEffect
  const [activeTab, setActiveTab] = useState<string>("");

  // Fetch tasks for deadline tracking
  useEffect(() => {
    if (!project.id) {
      console.log("⚠️ No project ID, skipping task fetch for deadlines");
      return;
    }

    const fetchTasks = async () => {
      setLoadingTasks(true);
      try {
        const numericProjectId = typeof project.id === "string" ? parseInt(project.id) : project.id;
        if (numericProjectId == null || isNaN(numericProjectId)) {
          console.warn("Invalid project ID for fetching tasks:", project.id);
          setTasks([]);
          setLoadingTasks(false);
          return;
        }
        console.log("📥 Fetching tasks for deadline tracking, projectId:", numericProjectId);
        
        const fetchedTasks = await TaskService.getTasksByProjectId(numericProjectId);
        
        console.log("📥 Tasks fetched for deadline tracking:", {
          count: fetchedTasks.length,
          tasksWithDueDate: fetchedTasks.filter((t: Task) => t.dueDate).length,
          tasks: fetchedTasks.map((t: Task) => ({
            id: t.id,
            title: t.title,
            dueDate: t.dueDate,
            status: t.status,
            assignee: t.assignee,
          })),
        });
        
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("❌ Failed to fetch tasks for deadline tracking:", error);
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
    
    // Refresh tasks every 5 minutes
    const interval = setInterval(fetchTasks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [project.id]);

  // Sync activeTab with URL param and navigate if needed
  useEffect(() => {
    if (normalizedFeatures.length === 0) return;

    console.log("useEffect triggered:", {
      paramFeatureName,
      normalizedFeatures: normalizedFeatures.map((f) => f.path),
      currentActiveTab: activeTab,
    });

    // If we have a feature in URL and it's valid, use it
    if (
      paramFeatureName &&
      normalizedFeatures.some((f) => f.path === paramFeatureName)
    ) {
      if (activeTab !== paramFeatureName) {
        console.log(" Setting activeTab to valid URL param:", paramFeatureName);
        setActiveTab(paramFeatureName);
      }
    } else {
      // If no valid feature in URL, use first feature and navigate to it
      const firstFeaturePath = normalizedFeatures[0].path;
      if (activeTab !== firstFeaturePath) {
        console.log(" Setting activeTab to first feature:", firstFeaturePath);
        setActiveTab(firstFeaturePath);

        // Only navigate if we don't already have a feature in the URL
        if (projectId && templateType && !paramFeatureName) {
          console.log(" Navigating to first feature:", firstFeaturePath);
          navigate(
            `/projects/${projectId}/${templateType}/${firstFeaturePath}`,
            { replace: true },
          );
        }
      }
    }
  }, [paramFeatureName, normalizedFeatures, projectId, templateType, navigate]);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: string) => {
      console.log(" Tab clicked:", {
        newValue,
        currentActiveTab: activeTab,
        projectId,
        templateType,
      });

      setActiveTab(newValue);
      if (projectId && templateType) {
        const newPath = `/projects/${projectId}/${templateType}/${newValue}`;
        console.log(" Navigating to:", newPath);
        navigate(newPath);
      }
    },
    [navigate, projectId, templateType, activeTab],
  );

  const renderFeatureContent = () => {
    const activeFeature = normalizedFeatures.find((f) => f.path === activeTab);
    if (!activeFeature) return <FeaturePlaceholder featureName={activeTab} />;

    console.log(" Loading feature:", {
      activeFeature,
      importPath: `../${activeFeature.path}/index.tsx`,
      projectId:
        typeof project.id === "string" ? parseInt(project.id) : project.id,
      projectName: project.name,
      templateType: project.templateType,
    });

    // IMPORTANT: Use correct relative path for dynamic import
    // From: src/components/features/project/
    // To:   src/components/features/backlog/index, src/components/features/sprint/index, etc.
    const FeatureComponent = lazy(() =>
      import(`../${activeFeature.path}/index.tsx`).catch((error) => {
        console.error(
          ` Failed to load component for ${activeFeature.path}:`,
          error,
        );
        return {
          default: () => (
            <FeaturePlaceholder featureName={activeFeature.path} />
          ),
        };
      }),
    );

    return (
      <ErrorBoundary
        fallback={<FeaturePlaceholder featureName={activeFeature.path} />}
      >
        <Suspense
          fallback={
            <Container maxWidth="xl" sx={{ py: 6 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 8,
                  bgcolor: "white",
                  borderRadius: 3,
                }}
              >
                <CircularProgress size={48} sx={{ mb: 2, color: theme.palette.primary.main }} />
                <Typography variant="h6" color="text.secondary">
                  Loading {activeFeature.name}...
                </Typography>
              </Box>
            </Container>
          }
        >
          <FeatureComponent
            projectId={project.id?.toString() || "unknown"}
            projectName={project.name || "Unknown Project"}
            templateType={templateType}
          />
        </Suspense>
      </ErrorBoundary>
    );
  };

  if (features.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert 
          severity="info"
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-icon': { fontSize: 28 }
          }}
        >
          No features available for this project
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Modern Tabs Navigation with Deadline Notification */}
      <Box 
        sx={{ 
          bgcolor: "white",
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Tabs
              value={
                activeTab && normalizedFeatures.some((f) => f.path === activeTab)
                  ? activeTab
                  : normalizedFeatures[0]?.path || false
              }
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Project Features Navigation"
              sx={{
                flex: 1,
                '& .MuiTab-root': {
                  textTransform: "capitalize",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  minHeight: 56,
                  color: theme.palette.text.secondary,
                  transition: "all 0.2s ease",
                  '&:hover': {
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  },
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                },
              }}
            >
              {normalizedFeatures.map((feature) => (
                <Tab
                  key={feature.path}
                  value={feature.path}
                  label={feature.name.replace(/_/g, " ")}
                />
              ))}
            </Tabs>
            
            {/* Deadline Notification Icon */}
            <Box sx={{ px: 2 }}>
              <DeadlineNotificationIcon 
                tasks={tasks}
                onTaskClick={(task) => {
                  // Navigate to backlog feature with task highlighted
                  const backlogFeature = normalizedFeatures.find(f => 
                    f.path === "backlog" || f.path === "scrum_board"
                  );
                  if (backlogFeature && projectId && templateType) {
                    navigate(
                      `/projects/${projectId}/${templateType}/${backlogFeature.path}?taskId=${task.id}`
                    );
                  }
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Feature Content */}
      <Box>{renderFeatureContent()}</Box>
    </Box>
  );
};

export default DynamicProjectNavigation;
