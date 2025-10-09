
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  Avatar,
  LinearProgress,
  Button,
  IconButton,
  Tooltip as MuiTooltip,
  CardHeader,
  useTheme,
  alpha,
  Container,
  Tab,
  Tabs,
  Badge,
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
  Tooltip,
  Legend,
} from 'recharts';
import {
  Assignment as TaskIcon,
  BugReport as BugIcon,
  AutoStories as StoryIcon,
  EmojiEvents as EpicIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
  Download as ExportIcon,
  Refresh as RefreshIcon,
  Assessment as AnalyticsIcon,
  Speed as VelocityIcon,
  PlayCircle as InProgressIcon,
  CheckCircle as DoneIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/types';
import { TaskService } from '@/services/TaskService';

interface EstimationProps {
  projectId: number;
  projectName?: string;
  templateType: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`estimation-tabpanel-${index}`}
      aria-labelledby={`estimation-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const COLORS = {
  status: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'],
  priority: ['#ff4444', '#ff8800', '#ffcc00', '#88cc00', '#44cc44'],
  type: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'],
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  'Backlog': '#8884d8',
  'Todo': '#82ca9d',
  'In Progress': '#ffc658',
  'Review': '#ff7c7c',
  'Done': '#8dd1e1',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  'Highest': '#ff4444',
  'High': '#ff8800',
  'Medium': '#ffcc00',
  'Low': '#88cc00',
  'Lowest': '#44cc44',
};

const TYPE_ICONS: Record<TaskType, React.ReactNode> = {
  'Task': <TaskIcon />,
  'Bug': <BugIcon />,
  'Story': <StoryIcon />,
  'Epic': <EpicIcon />,
};

const Estimation: React.FC<EstimationProps> = ({ projectId, projectName, templateType }) => {
  const theme = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  useEffect(() => {
    fetchTasks();
  }, [projectId, templateType]);

  // Calculate status distribution
  const statusData = React.useMemo(() => {
    const statusCount: Record<TaskStatus, number> = {
      'Backlog': 0,
      'Todo': 0,
      'In Progress': 0,
      'Review': 0,
      'Done': 0,
    };

    tasks.forEach(task => {
      statusCount[task.status]++;
    });

    return Object.entries(statusCount)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status,
        value: count,
        fill: STATUS_COLORS[status as TaskStatus],
      }));
  }, [tasks]);

  // Calculate priority distribution
  const priorityData = React.useMemo(() => {
    const priorityCount: Record<TaskPriority, number> = {
      'Highest': 0,
      'High': 0,
      'Medium': 0,
      'Low': 0,
      'Lowest': 0,
    };

    tasks.forEach(task => {
      priorityCount[task.priority]++;
    });

    return Object.entries(priorityCount)
      .filter(([_, count]) => count > 0)
      .map(([priority, count]) => ({
        name: priority,
        value: count,
        fill: PRIORITY_COLORS[priority as TaskPriority],
      }));
  }, [tasks]);

  // Calculate type distribution
  const typeData = React.useMemo(() => {
    const typeCount: Record<TaskType, number> = {
      'Story': 0,
      'Bug': 0,
      'Task': 0,
      'Epic': 0,
    };

    tasks.forEach(task => {
      typeCount[task.type]++;
    });

    return Object.entries(typeCount)
      .filter(([_, count]) => count > 0)
      .map(([type, count], index) => ({
        name: type,
        value: count,
        fill: COLORS.type[index % COLORS.type.length],
      }));
  }, [tasks]);

  // Calculate story points by status
  const storyPointsData = React.useMemo(() => {
    const pointsByStatus: Record<TaskStatus, number> = {
      'Backlog': 0,
      'Todo': 0,
      'In Progress': 0,
      'Review': 0,
      'Done': 0,
    };

    tasks.forEach(task => {
      pointsByStatus[task.status] += task.storyPoints || 0;
    });

    return Object.entries(pointsByStatus)
      .filter(([_, points]) => points > 0)
      .map(([status, points]) => ({
        status,
        points,
        fill: STATUS_COLORS[status as TaskStatus],
      }));
  }, [tasks]);

  // Recent activities - get tasks with upcoming due dates or recently commented tasks
  const recentActivities = React.useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    // Get tasks with upcoming due dates or recent comments
    const recentTasks = tasks.filter(task => {
      // Include tasks with due dates within the next week
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (dueDate >= now && dueDate <= weekFromNow) {
          return true;
        }
      }
      
      // Include tasks with recent comments (last 3 days)
      if (task.comments && task.comments.length > 0) {
        const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
        const hasRecentComment = task.comments.some(comment => {
          const commentDate = new Date(comment.timestamp);
          return commentDate >= threeDaysAgo;
        });
        if (hasRecentComment) return true;
      }
      
      // Include tasks that are currently in progress
      if (task.status === 'In Progress' || task.status === 'Review') {
        return true;
      }
      
      return false;
    });
    
    // Sort by priority, then due date, then status
    return recentTasks
      .sort((a, b) => {
        // Priority order: Highest, High, Medium, Low, Lowest
        const priorityOrder = { 'Highest': 5, 'High': 4, 'Medium': 3, 'Low': 2, 'Lowest': 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by due date (sooner first)
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        const dateDiff = aDate - bDate;
        if (dateDiff !== 0) return dateDiff;
        
        // Finally by status (In Progress, Review, then others)
        const statusOrder = { 'In Progress': 3, 'Review': 2, 'Todo': 1, 'Backlog': 0, 'Done': -1 };
        return statusOrder[b.status] - statusOrder[a.status];
      })
      .slice(0, 5);
  }, [tasks]);

  // Summary statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Done').length;
  const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
  const completedStoryPoints = tasks
    .filter(task => task.status === 'Done')
    .reduce((sum, task) => sum + (task.storyPoints || 0), 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>

        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Modern Header with Actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        p: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: `1px solid ${theme.palette.divider}`,
      }}>
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 1,
            }}
          >
            <AnalyticsIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Project Analytics
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            {projectName} • {templateType}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <MuiTooltip title="Refresh Data">
            <IconButton 
              onClick={fetchTasks}
              disabled={loading}
              sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </MuiTooltip>
          <MuiTooltip title="Export Data">
            <IconButton 
              sx={{ 
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.2) }
              }}
            >
              <ExportIcon />
            </IconButton>
          </MuiTooltip>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{ borderRadius: 2 }}
          >
            Filters
          </Button>
        </Stack>
      </Box>

      {/* Navigation Tabs */}
      <Paper 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ 
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            '& .MuiTab-root': {
              fontWeight: 500,
              minHeight: 64,
            }
          }}
        >
          <Tab 
            icon={<AnalyticsIcon />} 
            label="Overview" 
            iconPosition="start"
          />
          <Tab 
            icon={<VelocityIcon />} 
            label="Velocity" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
        }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      )}

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            border: `1px solid ${theme.palette.error.light}`,
          }}
        >
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          <TabPanel value={tabValue} index={0}>
            {/* Overview Tab Content */}
            {/* Enhanced Summary Cards */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 3, 
              mb: 4 
            }}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderRadius: 2,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      backgroundColor: theme.palette.primary.main, 
                      mr: 2,
                      width: 48,
                      height: 48,
                    }}>
                      <TaskIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {totalTasks}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Total Tasks
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(totalTasks / Math.max(totalTasks, 1)) * 100} 
                    sx={{ borderRadius: 1, height: 8 }}
                  />
                </CardContent>
              </Card>

              <Card 
                sx={{ 
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: 2,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      backgroundColor: theme.palette.success.main, 
                      mr: 2,
                      width: 48,
                      height: 48,
                    }}>
                      <DoneIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {completedTasks}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Completed
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={completionRate} 
                    color="success"
                    sx={{ borderRadius: 1, height: 8 }}
                  />
                </CardContent>
              </Card>

              <Card 
                sx={{ 
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  borderRadius: 2,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      backgroundColor: theme.palette.info.main, 
                      mr: 2,
                      width: 48,
                      height: 48,
                    }}>
                      <EpicIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {completedStoryPoints}/{totalStoryPoints}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Story Points
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0}
                    color="info"
                    sx={{ borderRadius: 1, height: 8 }}
                  />
                </CardContent>
              </Card>

              <Card 
                sx={{ 
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  borderRadius: 2,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      backgroundColor: theme.palette.warning.main, 
                      mr: 2,
                      width: 48,
                      height: 48,
                    }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color="warning.main">
                        {completionRate}%
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Progress
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={completionRate}
                    color="warning"
                    sx={{ borderRadius: 1, height: 8 }}
                  />
                </CardContent>
              </Card>
            </Box>

            {/* Enhanced Charts Section */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
              gap: 3, 
              mb: 4 
            }}>
              {/* Status Overview */}
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '440px',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper,
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InProgressIcon color="primary" />
                      <Typography variant="h6" fontWeight="600">
                        Status Distribution
                      </Typography>
                    </Box>
                  }
                  sx={{ p: 0, mb: 2 }}
                />
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="none"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                          boxShadow: theme.shadows[4],
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '60%',
                    backgroundColor: alpha(theme.palette.grey[100], 0.5),
                    borderRadius: 2,
                    border: `2px dashed ${theme.palette.grey[300]}`,
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      No status data available
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Priority Breakdown */}
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '440px',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper,
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon color="warning" />
                      <Typography variant="h6" fontWeight="600">
                        Priority Breakdown
                      </Typography>
                    </Box>
                  }
                  sx={{ p: 0, mb: 2 }}
                />
                {priorityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="none"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                          boxShadow: theme.shadows[4],
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '60%',
                    backgroundColor: alpha(theme.palette.grey[100], 0.5),
                    borderRadius: 2,
                    border: `2px dashed ${theme.palette.grey[300]}`,
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      No priority data available
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Work Types */}
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '440px',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper,
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TaskIcon color="info" />
                      <Typography variant="h6" fontWeight="600">
                        Work Types
                      </Typography>
                    </Box>
                  }
                  sx={{ p: 0, mb: 2 }}
                />
                {typeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="none"
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                          boxShadow: theme.shadows[4],
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '60%',
                    backgroundColor: alpha(theme.palette.grey[100], 0.5),
                    borderRadius: 2,
                    border: `2px dashed ${theme.palette.grey[300]}`,
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      No work type data available
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>

            {/* Enhanced Bar Chart and Activities */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
              gap: 3 
            }}>
              {/* Story Points by Status */}
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '480px',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper,
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EpicIcon color="info" />
                      <Typography variant="h6" fontWeight="600">
                        Story Points by Status
                      </Typography>
                    </Box>
                  }
                  sx={{ p: 0, mb: 2 }}
                />
                {storyPointsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={storyPointsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis 
                        dataKey="status" 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: theme.palette.divider }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: theme.palette.divider }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                          boxShadow: theme.shadows[4],
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="points" 
                        name="Story Points"
                        radius={[4, 4, 0, 0]}
                      >
                        {storyPointsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '60%',
                    backgroundColor: alpha(theme.palette.grey[100], 0.5),
                    borderRadius: 2,
                    border: `2px dashed ${theme.palette.grey[300]}`,
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      No story points data available
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Enhanced Recent Activities */}
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '480px',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper,
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon color="success" />
                      <Typography variant="h6" fontWeight="600">
                        Recent Activities
                      </Typography>
                    </Box>
                  }
                  action={
                    <Badge badgeContent={recentActivities.length} color="primary">
                      <ScheduleIcon color="action" />
                    </Badge>
                  }
                  sx={{ p: 0, mb: 2 }}
                />
                <List sx={{ maxHeight: '380px', overflow: 'auto' }}>
                  {recentActivities.length > 0 ? (
                    recentActivities.map((task, index) => (
                      <React.Fragment key={task.id}>
                        <ListItem 
                          alignItems="flex-start"
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            backgroundColor: alpha(theme.palette.primary.main, 0.02),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            }
                          }}
                        >
                          <Avatar
                            sx={{
                              mr: 2,
                              mt: 0.5,
                              width: 40,
                              height: 40,
                              backgroundColor: STATUS_COLORS[task.status],
                            }}
                          >
                            {TYPE_ICONS[task.type]}
                          </Avatar>
                          <ListItemText
                            primary={
                              <Box sx={{ mb: 1 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  noWrap 
                                  sx={{ fontWeight: 600, mb: 0.5 }}
                                >
                                  {task.title}
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                  <Chip 
                                    label={task.status} 
                                    size="small" 
                                    sx={{ 
                                      backgroundColor: STATUS_COLORS[task.status],
                                      color: 'white',
                                      fontWeight: 500,
                                      height: 20,
                                      fontSize: '0.7rem',
                                    }}
                                  />
                                  <Chip 
                                    label={task.priority} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ 
                                      borderColor: PRIORITY_COLORS[task.priority],
                                      color: PRIORITY_COLORS[task.priority],
                                      height: 20,
                                      fontSize: '0.7rem',
                                    }}
                                  />
                                </Stack>
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                  <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                    {task.assignee}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                  <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption">
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                                  </Typography>
                                  {task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && (
                                    <Chip 
                                      label="Due Soon" 
                                      size="small" 
                                      color="warning" 
                                      sx={{ height: 16, fontSize: '0.6rem' }}
                                    />
                                  )}
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                  <EpicIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption">
                                    {task.storyPoints || 0} points
                                  </Typography>
                                </Stack>
                                {task.comments && task.comments.length > 0 && (
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption">
                                      {task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}
                                    </Typography>
                                  </Stack>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < recentActivities.length - 1 && (
                          <Divider sx={{ my: 1, backgroundColor: alpha(theme.palette.divider, 0.5) }} />
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '200px',
                      backgroundColor: alpha(theme.palette.grey[100], 0.5),
                      borderRadius: 2,
                      border: `2px dashed ${theme.palette.grey[300]}`,
                    }}>
                      <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        No recent activities
                      </Typography>
                      <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
                        Tasks with upcoming deadlines, recent comments, or in progress will appear here
                      </Typography>
                    </Box>
                  )}
                </List>
              </Paper>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Velocity Tab Content */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3, 
              mb: 4 
            }}>
              {/* Team Performance Metrics */}
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper,
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VelocityIcon color="primary" />
                      <Typography variant="h6" fontWeight="600">
                        Team Performance
                      </Typography>
                    </Box>
                  }
                  sx={{ p: 0, mb: 3 }}
                />
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Story Points Completed vs Total
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0}
                    sx={{ height: 12, borderRadius: 2, mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {completedStoryPoints} of {totalStoryPoints} story points completed
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Task Completion Rate
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={completionRate}
                    color="success"
                    sx={{ height: 12, borderRadius: 2, mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {completedTasks} of {totalTasks} tasks completed ({completionRate}%)
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Average Story Points per Task
                  </Typography>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {totalTasks > 0 ? (totalStoryPoints / totalTasks).toFixed(1) : '0'}
                  </Typography>
                </Box>
              </Paper>

              {/* Workload Distribution */}
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper,
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="info" />
                      <Typography variant="h6" fontWeight="600">
                        Workload Distribution
                      </Typography>
                    </Box>
                  }
                  sx={{ p: 0, mb: 3 }}
                />

                <List>
                  {Object.entries(
                    tasks.reduce((acc, task) => {
                      const assignee = task.assignee || 'Unassigned';
                      if (!acc[assignee]) {
                        acc[assignee] = { tasks: 0, points: 0, completed: 0 };
                      }
                      acc[assignee].tasks++;
                      acc[assignee].points += task.storyPoints || 0;
                      if (task.status === 'Done') {
                        acc[assignee].completed++;
                      }
                      return acc;
                    }, {} as Record<string, { tasks: number; points: number; completed: number }>)
                  ).map(([assignee, stats]) => (
                    <ListItem key={assignee} sx={{ px: 0, py: 1 }}>
                      <ListItemText
                        primary={assignee}
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="caption">
                                {stats.tasks} tasks ({stats.points} points)
                              </Typography>
                              <Typography variant="caption" color="success.main">
                                {stats.completed} completed
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={stats.tasks > 0 ? (stats.completed / stats.tasks) * 100 : 0}
                              sx={{ height: 6, borderRadius: 1 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                  {tasks.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No task data available for workload analysis
                      </Typography>
                    </Box>
                  )}
                </List>
              </Paper>
            </Box>

            {/* Sprint Burndown Placeholder */}
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.background.paper,
                textAlign: 'center'
              }}
            >
              <VelocityIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Sprint Burndown Chart
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Coming soon! Track daily progress and velocity trends.
              </Typography>
              <Button variant="outlined" disabled>
                Configure Sprint Settings
              </Button>
            </Paper>
          </TabPanel>


        </>
      )}
    </Container>
  );
};

export default Estimation;
