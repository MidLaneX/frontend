import React from 'react';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  templateType: string;
  tasks?: Array<{ status: string }>;
  teamMembers?: Array<{ name: string; avatar?: string }>;
  timeline: {
    start: string;
    end: string;
  };
}

interface ProjectCardProps {
  project: Project;
  isStarred: boolean;
  onToggleStar: (projectId: string, event: React.MouseEvent) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isStarred,
  onToggleStar,
}) => {
  const getProjectProgress = (project: Project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completed = project.tasks.filter(task => task.status === 'Done').length;
    return Math.round((completed / project.tasks.length) * 100);
  };

  const getProjectStatus = (project: Project) => {
    const now = new Date();
    const start = new Date(project.timeline.start);
    const end = new Date(project.timeline.end);
    
    if (now < start) return 'Not Started';
    if (now > end) return 'Completed';
    return 'In Progress';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return '#00875A';
      case 'Completed': return '#0052CC';
      case 'Not Started': return '#5E6C84';
      default: return '#5E6C84';
    }
  };

  const progress = getProjectProgress(project);
  const status = getProjectStatus(project);

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        border: '1px solid #DFE1E6',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <CardActionArea
        component={Link}
        to={`/projects/${project.id}/${project.templateType}`}
        sx={{ height: '100%' }}
      >
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1, mr: 2 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1, lineHeight: 1.3 }}>
                {project.name}
              </Typography>
              <Chip
                label={project.type}
                size="small"
                sx={{
                  fontSize: '0.75rem',
                  height: 24,
                  backgroundColor: '#E6F3FF',
                  color: '#0052CC',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={(e) => onToggleStar(project.id, e)}
                sx={{ color: isStarred ? '#FFAB00' : '#5E6C84' }}
              >
                {isStarred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
              </IconButton>
              <IconButton size="small" sx={{ color: '#5E6C84' }}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
            }}
          >
            {project.description}
          </Typography>

          {/* Progress */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: '#F4F5F7',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  backgroundColor: progress === 100 ? '#00875A' : '#0052CC',
                },
              }}
            />
          </Box>

          {/* Timeline */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {new Date(project.timeline.start).toLocaleDateString()} - {new Date(project.timeline.end).toLocaleDateString()}
            </Typography>
          </Box>

          {/* Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 12 } }}>
              {project.teamMembers?.slice(0, 3).map((member, index) => (
                <Tooltip key={index} title={member.name}>
                  <Avatar sx={{ bgcolor: '#0052CC' }}>
                    {member.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
            <Chip
              label={status}
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                backgroundColor: `${getStatusColor(status)}15`,
                color: getStatusColor(status),
                fontWeight: 500,
              }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProjectCard;
