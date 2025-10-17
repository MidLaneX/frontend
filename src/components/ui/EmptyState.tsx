import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Add as AddIcon, Work as ProjectIcon } from "@mui/icons-material";

interface EmptyStateProps {
  onCreateProject: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateProject }) => {
  return (
    <Paper
      sx={{
        p: 8,
        textAlign: "center",
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        borderRadius: 2.5,
        border: "1px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
      }}
    >
      <Box 
        sx={{ 
          mb: 3,
          display: "inline-flex",
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
          border: "2px solid rgba(102, 126, 234, 0.2)",
        }}
      >
        <ProjectIcon 
          sx={{ 
            fontSize: 64, 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }} 
        />
      </Box>
      <Typography
        variant="h5"
        sx={{ 
          mb: 2, 
          fontWeight: 800,
          fontSize: "1.6rem",
          letterSpacing: "-0.01em",
          color: "#1e293b",
        }}
      >
        No projects yet
      </Typography>
      <Typography
        variant="body1"
        sx={{ 
          mb: 4, 
          maxWidth: 400, 
          mx: "auto",
          color: "#64748b",
          fontSize: "0.95rem",
          fontWeight: 500,
          lineHeight: 1.7,
          letterSpacing: "0.01em",
        }}
      >
        Create your first project to start organizing your work and
        collaborating with your team.
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreateProject}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.95rem",
          letterSpacing: "0.02em",
          px: 4,
          py: 1.5,
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "#ffffff",
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          "&:hover": {
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            boxShadow: "0 6px 16px rgba(16, 185, 129, 0.35)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        Create Project
      </Button>
    </Paper>
  );
};

export default EmptyState;
