import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Alert, 
  CircularProgress, 
  Container,
  Card,
  CardContent,
  Chip,
  alpha,
  useTheme,
  IconButton,
  Tooltip
} from "@mui/material";
import { 
  FolderSpecial as ProjectIcon,
  Category as TemplateIcon,
  ArrowBack as BackIcon
} from "@mui/icons-material";
import type { Project } from "@/types";
import { ProjectService } from "@/services/ProjectService";
import DynamicProjectNavigation from "./DynamicProjectNavigation";

const ProjectPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { projectId: urlProjectId, templateType: urlTemplateType } = useParams<{
    projectId?: string;
    templateType?: string;
  }>();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectId = Number(urlProjectId);
  const templateType = urlTemplateType || "scrum"; // Default template type fallback

  useEffect(() => {
    if (!projectId || !templateType) {
      setError("Project ID or Template Type is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    ProjectService.getProjectById(projectId, templateType)
      .then((res) => {
        console.log("ProjectPage - Fetched project:", res);
        if (res) {
          console.log("ProjectPage - Project features:", res.features);
          setProject(res);
        } else {
          setError("Project not found.");
        }
      })
      .catch((err) => {
        console.error("Failed to load project:", err);
        setError("Failed to load project. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [projectId, templateType]);

  // Loading
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
          bgcolor: "#f8fafc",
        }}
      >
        <CircularProgress size={48} sx={{ mb: 2, color: theme.palette.primary.main }} />
        <Typography variant="h6" color="text.secondary">
          Loading project...
        </Typography>
      </Box>
    );
  }

  // Error
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-icon': { fontSize: 28 }
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  // Project not found
  if (!project) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert 
          severity="warning"
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-icon': { fontSize: 28 }
          }}
        >
          Project not found. Please check the project ID and try again.
        </Alert>
      </Container>
    );
  }

  // Project has no features
  if (!project.features || project.features.length === 0) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
        {/* Modern Header */}
        <Box
          sx={{
            bgcolor: "white",
            borderBottom: `1px solid ${theme.palette.divider}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ py: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Tooltip title="Back to Projects" arrow>
                  <IconButton
                    onClick={() => navigate("/dashboard")}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "white",
                      color: theme.palette.primary.main,
                      border: `2px solid ${theme.palette.primary.main}`,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      "&:hover": {
                        bgcolor: theme.palette.primary.main,
                        color: "white",
                        transform: "translateX(-3px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <BackIcon sx={{ fontSize: 24 }} />
                  </IconButton>
                </Tooltip>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  <ProjectIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="text.primary">
                    {project.name}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                    <Chip
                      icon={<TemplateIcon />}
                      label={project.templateType?.charAt(0).toUpperCase() + project.templateType?.slice(1)}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="md" sx={{ py: 6 }}>
          <Card
            sx={{
              borderRadius: 3,
              border: `2px dashed ${theme.palette.divider}`,
              bgcolor: "white",
            }}
          >
            <CardContent sx={{ p: 6, textAlign: "center" }}>
              <ProjectIcon sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
              <Typography variant="h5" fontWeight={600} gutterBottom>
                No Features Available
              </Typography>
              <Typography variant="body1" color="text.secondary">
                This project doesn't have any features configured yet.
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Success - Show the project with DynamicProjectNavigation
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Modern Header */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ py: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Tooltip title="Back to Projects" arrow>
                <IconButton
                  onClick={() => navigate("/dashboard")}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "white",
                    color: theme.palette.primary.main,
                    border: `2px solid ${theme.palette.primary.main}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    "&:hover": {
                      bgcolor: theme.palette.primary.main,
                      color: "white",
                      transform: "translateX(-3px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <BackIcon sx={{ fontSize: 24 }} />
                </IconButton>
              </Tooltip>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <ProjectIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {project.name}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                  <Chip
                    icon={<TemplateIcon />}
                    label={project.templateType?.charAt(0).toUpperCase() + project.templateType?.slice(1)}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Render dynamic feature-based UI */}
      <DynamicProjectNavigation project={project} />
    </Box>
  );
};

export default ProjectPage;
