import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Button,
  ButtonGroup,
  Divider,
  Stack,
  LinearProgress,
  Tooltip,
  Fade,
  Grow,
  useTheme,
  alpha,
  Backdrop,
  Container,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import {
  Assignment as TaskIcon,
  BugReport as BugIcon,
  AutoStories as StoryIcon,
  EmojiEvents as EpicIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
  Insights as InsightsIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/types';
import { TaskService } from '@/services/TaskService';

interface EstimationProps {
  projectId: number;
  projectName?: string;
  templateType: string;
}

// Modern Color Palette - Better than Jira
const MODERN_THEME = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    dark: '#1f2937',
    light: '#f8fafc',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    error: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    info: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    glassmorphism: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 100%)',
  },
  shadows: {
    soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    medium: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    large: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(99, 102, 241, 0.3)',
  }
};

// Status Configuration with Modern Design
const STATUS_CONFIG = {
  'Backlog': { 
    color: '#64748b', 
    bg: '#f1f5f9', 
    icon: TaskIcon,
    gradient: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
    emoji: '📋'
  },
  'Todo': { 
    color: '#3b82f6', 
    bg: '#dbeafe', 
    icon: ScheduleIcon,
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    emoji: '⏳'
  },
  'In Progress': { 
    color: '#f59e0b', 
    bg: '#fef3c7', 
    icon: SpeedIcon,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    emoji: '🚀'
  },
  'Review': { 
    color: '#8b5cf6', 
    bg: '#ede9fe', 
    icon: AssessmentIcon,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    emoji: '👀'
  },
  'Done': { 
    color: '#10b981', 
    bg: '#d1fae5', 
    icon: CheckCircleIcon,
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    emoji: '✅'
  },
};

const PRIORITY_CONFIG = {
  'Highest': { color: '#dc2626', intensity: 100, emoji: '🔥', bg: '#fee2e2' },
  'High': { color: '#ea580c', intensity: 80, emoji: '⚡', bg: '#fed7aa' },
  'Medium': { color: '#ca8a04', intensity: 60, emoji: '⚖️', bg: '#fef3c7' },
  'Low': { color: '#16a34a', intensity: 40, emoji: '⬇️', bg: '#d1fae5' },
  'Lowest': { color: '#0369a1', intensity: 20, emoji: '❄️', bg: '#dbeafe' },
};

const TYPE_CONFIG = {
  'Epic': { color: '#8b5cf6', icon: EpicIcon, bg: '#ede9fe', emoji: '🏆' },
  'Story': { color: '#10b981', icon: StoryIcon, bg: '#d1fae5', emoji: '📖' },
  'Task': { color: '#3b82f6', icon: TaskIcon, bg: '#dbeafe', emoji: '⚙️' },
  'Bug': { color: '#ef4444', icon: BugIcon, bg: '#fee2e2', emoji: '🐛' },
};

const Estimation: React.FC<EstimationProps> = ({ projectId, projectName, templateType }) => {
  const theme = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'insights'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await TaskService.getTasksByProjectId(projectId, templateType);
      setTasks(data);
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setTimeout(() => setRefreshing(false), 1000);
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, templateType]);

  // Enhanced data processing with modern metrics
  const statusData = React.useMemo(() => {
    const statusCount: Record<TaskStatus, number> = {
      'Backlog': 0, 'Todo': 0, 'In Progress': 0, 'Review': 0, 'Done': 0,
    };

    tasks.forEach(task => statusCount[task.status]++);

    return Object.entries(statusCount)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status,
        value: count,
        fill: STATUS_CONFIG[status as TaskStatus]?.color || '#6366f1',
        percentage: Math.round((count / tasks.length) * 100),
        emoji: STATUS_CONFIG[status as TaskStatus]?.emoji || '📋',
      }));
  }, [tasks]);

  const priorityData = React.useMemo(() => {
    const priorityCount: Record<TaskPriority, number> = {
      'Highest': 0, 'High': 0, 'Medium': 0, 'Low': 0, 'Lowest': 0,
    };

    tasks.forEach(task => priorityCount[task.priority]++);

    return Object.entries(priorityCount)
      .filter(([_, count]) => count > 0)
      .map(([priority, count]) => ({
        name: priority,
        value: count,
        fill: PRIORITY_CONFIG[priority as TaskPriority]?.color || '#6366f1',
        intensity: PRIORITY_CONFIG[priority as TaskPriority]?.intensity || 50,
        emoji: PRIORITY_CONFIG[priority as TaskPriority]?.emoji || '⚖️',
      }));
  }, [tasks]);

  const typeData = React.useMemo(() => {
    const typeCount: Record<TaskType, number> = {
      'Story': 0, 'Bug': 0, 'Task': 0, 'Epic': 0,
    };

    tasks.forEach(task => typeCount[task.type]++);

    return Object.entries(typeCount)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        name: type,
        value: count,
        fill: TYPE_CONFIG[type as TaskType]?.color || '#6366f1',
        emoji: TYPE_CONFIG[type as TaskType]?.emoji || '⚙️',
      }));
  }, [tasks]);

  // Advanced metrics calculations
  const metrics = React.useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Done').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
    const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
    const completedStoryPoints = tasks
      .filter(task => task.status === 'Done')
      .reduce((sum, task) => sum + (task.storyPoints || 0), 0);
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const velocityRate = totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0;
    
    const highPriorityTasks = tasks.filter(task => 
      task.priority === 'Highest' || task.priority === 'High'
    ).length;
    
    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate < today && task.status !== 'Done';
    }).length;

    const avgStoryPoints = totalTasks > 0 ? Math.round((totalStoryPoints / totalTasks) * 10) / 10 : 0;
    
    // Team productivity score
    const productivityScore = Math.round(
      (completionRate * 0.4 + velocityRate * 0.4 + (100 - (overdueTasks / totalTasks * 100)) * 0.2)
    );

    return {
      totalTasks, completedTasks, inProgressTasks, totalStoryPoints, completedStoryPoints,
      completionRate, velocityRate, highPriorityTasks, overdueTasks, avgStoryPoints, productivityScore
    };
  }, [tasks]);

  // Loading state with modern design
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '60vh',
            background: MODERN_THEME.gradients.primary,
            borderRadius: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: MODERN_THEME.gradients.glassmorphism,
              backdropFilter: 'blur(10px)',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <CircularProgress 
              size={80} 
              thickness={2}
              sx={{ 
                color: 'white', 
                mb: 4,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
              }} 
            />
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
              Loading Analytics
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Preparing your project insights...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  // Error state with modern design
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 4,
            background: MODERN_THEME.gradients.error,
            border: 'none',
            color: 'white',
            '& .MuiAlert-icon': { 
              fontSize: 32,
              color: 'white'
            }
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleRefresh} 
            sx={{ 
              mt: 2,
              bgcolor: 'white',
              color: theme.palette.error.main,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)'
              }
            }}
            startIcon={<RefreshIcon />}
          >
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Modern Hero Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${MODERN_THEME.colors.primary}15 0%, ${MODERN_THEME.colors.secondary}15 100%)`,
          borderRadius: 6,
          p: 4,
          mb: 4,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(MODERN_THEME.colors.primary, 0.1)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: MODERN_THEME.gradients.glassmorphism,
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: MODERN_THEME.gradients.primary,
                  fontSize: '2rem',
                  boxShadow: MODERN_THEME.shadows.glow,
                }}
              >
                <AnalyticsIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 800, 
                    background: MODERN_THEME.gradients.primary,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                    fontSize: { xs: '2rem', md: '3rem' }
                  }}
                >
                  Project Analytics
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {projectName || `Project ${projectId}`} • {templateType.toUpperCase()}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <ButtonGroup variant="outlined" size="large">
                <Button 
                  startIcon={<DashboardIcon />}
                  onClick={() => setViewMode('overview')}
                  variant={viewMode === 'overview' ? 'contained' : 'outlined'}
                  sx={{ px: 3 }}
                >
                  Overview
                </Button>
                <Button 
                  startIcon={<InsightsIcon />}
                  onClick={() => setViewMode('insights')}
                  variant={viewMode === 'insights' ? 'contained' : 'outlined'}
                  sx={{ px: 3 }}
                >
                  Insights
                </Button>
              </ButtonGroup>
              
              <Divider orientation="vertical" flexItem />
              
              <Tooltip title="Refresh Data" arrow>
                <IconButton 
                  onClick={handleRefresh} 
                  disabled={refreshing}
                  sx={{
                    background: refreshing ? 'none' : MODERN_THEME.gradients.success,
                    color: 'white',
                    width: 56,
                    height: 56,
                    '&:hover': {
                      background: MODERN_THEME.gradients.success,
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.3s ease-in-out',
                    boxShadow: MODERN_THEME.shadows.medium,
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 28, animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Performance Score Bar */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 3, 
              p: 3, 
              background: alpha(theme.palette.background.paper, 0.7),
              borderRadius: 3,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Team Productivity Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={metrics.productivityScore}
                  sx={{
                    flex: 1,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: alpha(MODERN_THEME.colors.primary, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 6,
                      background: metrics.productivityScore > 80 
                        ? MODERN_THEME.gradients.success 
                        : metrics.productivityScore > 60 
                        ? MODERN_THEME.gradients.warning 
                        : MODERN_THEME.gradients.error,
                    },
                  }}
                />
                <Typography variant="h5" fontWeight={700} color="primary">
                  {metrics.productivityScore}%
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 3 }}>
              {[
                { label: 'Completion', value: `${metrics.completionRate}%`, color: MODERN_THEME.colors.success },
                { label: 'Velocity', value: `${metrics.velocityRate}%`, color: MODERN_THEME.colors.info },
                { label: 'On Time', value: `${100 - (metrics.overdueTasks / metrics.totalTasks * 100).toFixed(0)}%`, color: MODERN_THEME.colors.warning },
              ].map((stat) => (
                <Box key={stat.label} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: stat.color, fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Modern Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: 'Total Tasks',
            value: metrics.totalTasks,
            change: '+12%',
            icon: TaskIcon,
            gradient: MODERN_THEME.gradients.primary,
            color: MODERN_THEME.colors.primary,
            description: 'All project tasks'
          },
          {
            title: 'Completed',
            value: metrics.completedTasks,
            change: '+8%',
            icon: CheckCircleIcon,
            gradient: MODERN_THEME.gradients.success,
            color: MODERN_THEME.colors.success,
            description: 'Tasks finished'
          },
          {
            title: 'Story Points',
            value: `${metrics.completedStoryPoints}/${metrics.totalStoryPoints}`,
            change: `${metrics.velocityRate}%`,
            icon: TimelineIcon,
            gradient: MODERN_THEME.gradients.info,
            color: MODERN_THEME.colors.info,
            description: 'Points delivered'
          },
          {
            title: 'High Priority',
            value: metrics.highPriorityTasks,
            change: metrics.overdueTasks > 0 ? `-${metrics.overdueTasks}` : '✓',
            icon: WarningIcon,
            gradient: MODERN_THEME.gradients.warning,
            color: MODERN_THEME.colors.warning,
            description: 'Critical items'
          },
        ].map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Grid key={card.title} xs={12} sm={6} lg={3}>
              <Fade in timeout={600 + index * 200}>
                <Card
                  elevation={0}
                  sx={{
                    height: '200px',
                    background: `linear-gradient(135deg, ${card.color}08 0%, ${card.color}15 100%)`,
                    border: `2px solid ${alpha(card.color, 0.1)}`,
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: `0 20px 40px ${alpha(card.color, 0.2)}`,
                      border: `2px solid ${alpha(card.color, 0.3)}`,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100px',
                      height: '100px',
                      background: card.gradient,
                      borderRadius: '0 0 0 100px',
                      opacity: 0.1,
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h3" fontWeight={800} color={card.color} sx={{ mb: 0.5 }}>
                          {card.value}
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
                          {card.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {card.description}
                        </Typography>
                      </Box>
                      
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          background: card.gradient,
                          boxShadow: MODERN_THEME.shadows.medium,
                        }}
                      >
                        <IconComponent sx={{ fontSize: 32 }} />
                      </Avatar>
                    </Box>
                    
                    <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={card.change}
                        size="small"
                        sx={{
                          bgcolor: alpha(card.color, 0.1),
                          color: card.color,
                          fontWeight: 600,
                          '& .MuiChip-label': { px: 1.5 }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        vs last sprint
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          );
        })}
      </Grid>

      {/* Modern Charts Section */}
      <Grid container spacing={4}>
        {/* Status Distribution - Modern Donut Chart */}
        <Grid xs={12} md={6} lg={4}>
          <Fade in timeout={1000}>
            <Paper 
              sx={{ 
                p: 4, 
                borderRadius: 4, 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                boxShadow: MODERN_THEME.shadows.medium,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: '400px',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: MODERN_THEME.shadows.large,
                },
                transition: 'all 0.3s ease-in-out'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: alpha(MODERN_THEME.colors.primary, 0.1), mr: 2 }}>
                  <PieChartIcon sx={{ color: MODERN_THEME.colors.primary }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Task Status Distribution
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current workflow status
                  </Typography>
                </Box>
              </Box>

              {statusData.length > 0 ? (
                <Box sx={{ position: 'relative', height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.fill}
                            stroke="white"
                            strokeWidth={3}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload;
                            return (
                              <Box
                                sx={{
                                  bgcolor: 'background.paper',
                                  p: 2,
                                  borderRadius: 2,
                                  boxShadow: MODERN_THEME.shadows.medium,
                                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                }}
                              >
                                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {data.emoji} {data.name}
                                </Typography>
                                <Typography variant="h6" color="primary" fontWeight={700}>
                                  {data.value} tasks ({data.percentage}%)
                                </Typography>
                              </Box>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Label */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      pointerEvents: 'none'
                    }}
                  >
                    <Typography variant="h4" fontWeight={800} color="primary">
                      {metrics.totalTasks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Tasks
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '280px' 
                }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    📊 No Data Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start adding tasks to see insights
                  </Typography>
                </Box>
              )}
            </Paper>
          </Fade>
        </Grid>

        {/* Priority Heatmap */}
        <Grid xs={12} md={6} lg={4}>
          <Fade in timeout={1200}>
            <Paper 
              sx={{ 
                p: 4, 
                borderRadius: 4, 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                boxShadow: MODERN_THEME.shadows.medium,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: '400px',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: MODERN_THEME.shadows.large,
                },
                transition: 'all 0.3s ease-in-out'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: alpha(MODERN_THEME.colors.warning, 0.1), mr: 2 }}>
                  <FlagIcon sx={{ color: MODERN_THEME.colors.warning }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Priority Breakdown
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Task priority distribution
                  </Typography>
                </Box>
              </Box>

              {priorityData.length > 0 ? (
                <Box sx={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="20%" 
                      outerRadius="90%" 
                      data={priorityData}
                    >
                      <RadialBar 
                        dataKey="value" 
                        cornerRadius={10} 
                        fill="#8884d8"
                      />
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload;
                            return (
                              <Box
                                sx={{
                                  bgcolor: 'background.paper',
                                  p: 2,
                                  borderRadius: 2,
                                  boxShadow: MODERN_THEME.shadows.medium,
                                }}
                              >
                                <Typography variant="subtitle2">
                                  {data.emoji} {data.name} Priority
                                </Typography>
                                <Typography variant="h6" color="primary" fontWeight={700}>
                                  {data.value} tasks
                                </Typography>
                              </Box>
                            );
                          }
                          return null;
                        }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '280px' 
                }}>
                  <Typography variant="h6" color="text.secondary">
                    🎯 No Priority Data
                  </Typography>
                </Box>
              )}
            </Paper>
          </Fade>
        </Grid>

        {/* Task Types Visualization */}
        <Grid xs={12} md={6} lg={4}>
          <Fade in timeout={1400}>
            <Paper 
              sx={{ 
                p: 4, 
                borderRadius: 4, 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                boxShadow: MODERN_THEME.shadows.medium,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: '400px',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: MODERN_THEME.shadows.large,
                },
                transition: 'all 0.3s ease-in-out'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: alpha(MODERN_THEME.colors.info, 0.1), mr: 2 }}>
                  <AssessmentIcon sx={{ color: MODERN_THEME.colors.info }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Work Types
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Task category breakdown
                  </Typography>
                </Box>
              </Box>

              {typeData.length > 0 ? (
                <Stack spacing={2}>
                  {typeData.map((type, index) => (
                    <Grow in timeout={1600 + index * 200} key={type.name}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 3,
                          background: `linear-gradient(90deg, ${type.fill}15 0%, transparent 100%)`,
                          border: `1px solid ${alpha(type.fill, 0.2)}`,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            background: `linear-gradient(90deg, ${type.fill}25 0%, transparent 100%)`,
                            transform: 'translateX(8px)',
                          }
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: alpha(type.fill, 0.1),
                            mr: 2,
                          }}
                        >
                          <Typography variant="h5">
                            {type.emoji}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {type.name}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(type.value / metrics.totalTasks) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha(type.fill, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                bgcolor: type.fill,
                              },
                            }}
                          />
                        </Box>
                        
                        <Typography variant="h6" fontWeight={700} sx={{ ml: 2, color: type.fill }}>
                          {type.value}
                        </Typography>
                      </Box>
                    </Grow>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '280px' 
                }}>
                  <Typography variant="h6" color="text.secondary">
                    🔧 No Task Types
                  </Typography>
                </Box>
              )}
            </Paper>
          </Fade>
        </Grid>
      </Grid>

      {/* Add CSS animation for spinning refresh icon */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Container>
  );
};

export default Estimation;
