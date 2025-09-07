import React from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import {
  Work as ProjectIcon,
  Assignment as TaskIcon,
  CheckCircle as CompletedIcon,
  People as TeamIcon,
} from '@mui/icons-material';

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
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      title: 'Projects',
      value: totalProjects,
      icon: ProjectIcon,
      color: '#0052CC',
    },
    {
      title: 'Tasks',
      value: totalTasks,
      icon: TaskIcon,
      color: '#6554C0',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: CompletedIcon,
      color: '#00875A',
    },
    {
      title: 'Team Members',
      value: totalTeamMembers,
      icon: TeamIcon,
      color: '#FF5630',
    },
  ];

  return (
    <Box 
      sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(4, 1fr)'
        },
        gap: 3,
        mb: 4 
      }}
    >
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Paper
            key={stat.title}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid #DFE1E6',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <IconComponent sx={{ color: stat.color, fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={600} color="text.primary">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
