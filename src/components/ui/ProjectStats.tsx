import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import {
  Work as ProjectIcon,
  Assignment as TaskIcon,
  CheckCircle as CompletedIcon,
  People as TeamIcon,
} from "@mui/icons-material";

interface ProjectStatsProps {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalTeamMembers: number;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({
  totalProjects,
  totalTasks,
  completedTasks,
  totalTeamMembers,
}) => {
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      title: "Projects",
      value: totalProjects,
      icon: ProjectIcon,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      shadowColor: "rgba(102, 126, 234, 0.2)",
    },
    {
      title: "Tasks",
      value: totalTasks,
      icon: TaskIcon,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      shadowColor: "rgba(240, 147, 251, 0.2)",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: CompletedIcon,
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      shadowColor: "rgba(16, 185, 129, 0.2)",
    },
    {
      title: "Team Members",
      value: totalTeamMembers,
      icon: TeamIcon,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      shadowColor: "rgba(102, 126, 234, 0.2)",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
        gap: 3,
        mb: 4,
      }}
    >
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Paper
            key={stat.title}
            sx={{
              p: 3,
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(20px)",
              borderRadius: 2.5,
              border: "1px solid rgba(255, 255, 255, 0.8)",
              boxShadow: `0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px ${stat.shadowColor}`,
              "&:hover": {
                boxShadow: `0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 12px ${stat.shadowColor}`,
                transform: "translateY(-4px)",
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: stat.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 12px ${stat.shadowColor}`,
                }}
              >
                <IconComponent sx={{ color: "#ffffff", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800,
                    fontSize: "1.8rem",
                    letterSpacing: "-0.02em",
                    color: "#1e293b",
                    mb: 0.5,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "#64748b",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                  }}
                >
                  {stat.title}
                </Typography>
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};

export default ProjectStats;
