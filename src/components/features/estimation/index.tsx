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
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
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
} from '@mui/icons-material';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/types';
import { TaskService } from '@/services/TaskService';

interface EstimationProps {
  projectId: number;
  projectName?: string;
  templateType: string;
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Recent activities (last 5 tasks)
  const recentActivities = React.useMemo(() => {
    return tasks
      .slice()
      .sort((a, b) => new Date(b.dueDate || '').getTime() - new Date(a.dueDate || '').getTime())
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Project Analytics - {projectName}
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tasks
              </Typography>
              <Typography variant="h4">
                {totalTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed Tasks
              </Typography>
              <Typography variant="h4" color="success.main">
                {completedTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Story Points
              </Typography>
              <Typography variant="h4">
                {completedStoryPoints}/{totalStoryPoints}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completion Rate
              </Typography>
              <Typography variant="h4" color="primary.main">
                {completionRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Status Overview Circle Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Status Overview
            </Typography>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                No data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Priority Breakdown */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Priority Breakdown
            </Typography>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                No data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Work Types */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Types of Work
            </Typography>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                No data available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Story Points by Status Bar Chart */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Story Points by Status
            </Typography>
            {storyPointsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={storyPointsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="points" name="Story Points">
                    {storyPointsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                No data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon />
              Recent Activities
            </Typography>
            <List sx={{ maxHeight: '320px', overflow: 'auto' }}>
              {recentActivities.length > 0 ? (
                recentActivities.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <ListItem alignItems="flex-start">
                      <Box sx={{ mr: 2, mt: 0.5 }}>
                        {TYPE_ICONS[task.type]}
                      </Box>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle2" noWrap>
                              {task.title}
                            </Typography>
                            <Chip 
                              label={task.status} 
                              size="small" 
                              sx={{ 
                                backgroundColor: STATUS_COLORS[task.status],
                                color: 'white',
                              }}
                            />
                          </Stack>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Assignee: {task.assignee}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Priority: {task.priority} | Points: {task.storyPoints || 0}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                  No recent activities
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Estimation;
