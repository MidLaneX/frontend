import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Stack,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Badge,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  CalendarMonth as CalendarIcon,
  CheckCircle as CompletedIcon,
  Assignment as TaskIcon,
  BugReport as BugIcon,
  AutoStories as StoryIcon,
  EmojiEvents as EpicIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Timeline as TimelineIcon,
  Block as BlockedIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { SprintService } from '@/services/SprintService';
import { TaskService } from '@/services/TaskService';
import type { SprintDTO } from '@/types/featurevise/sprint';
import type { Task, TaskStatus, TaskType, TaskPriority } from '@/types';

interface TimelineProps {
  projectId: number;
}

interface TimelineEvent {
  id: string;
  type: 'sprint' | 'task' | 'milestone';
  title: string;
  description: string;
  date: Date;
  status?: string;
  assignee?: string;
  taskType?: TaskType;
  sprintId?: number;
  priority?: string;
  storyPoints?: number;
  tags?: string[];
  metadata?: any;
}

interface ProjectStats {
  totalSprints: number;
  completedSprints: number;
  activeSprints: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  blockedTasks: number;
  completionRate: number;
  averageVelocity: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
}

const EnhancedProjectTimeline: React.FC<TimelineProps> = ({ projectId }) => {
  const theme = useTheme();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use static methods
      const [sprintsResponse, tasks] = await Promise.all([
        SprintService.getAllSprints(projectId),
        TaskService.getTasksByProjectId(projectId),
      ]);

      const sprints = sprintsResponse.data;
      const timelineEvents: TimelineEvent[] = [];

      // Add sprint events
      sprints.forEach((sprint: SprintDTO) => {
        // Sprint start event
        if (sprint.startDate) {
          timelineEvents.push({
            id: `sprint-start-${sprint.id}`,
            type: 'sprint',
            title: `Sprint "${sprint.name}" Started`,
            description: `Sprint ${sprint.name} began. Goal: ${sprint.goal || 'Not specified'}`,
            date: new Date(sprint.startDate),
            status: 'in-progress',
            sprintId: sprint.id,
            tags: ['sprint-start', 'planning'],
            metadata: { sprint, sprintPhase: 'start' },
          });
        }

        // Sprint end event
        if (sprint.endDate) {
          timelineEvents.push({
            id: `sprint-end-${sprint.id}`,
            type: 'sprint',
            title: `Sprint "${sprint.name}" ${sprint.status === 'Completed' ? 'Completed' : 'Ended'}`,
            description: `Sprint ${sprint.name} finished`,
            date: new Date(sprint.endDate),
            status: sprint.status === 'Completed' ? 'completed' : 'planned',
            sprintId: sprint.id,
            tags: ['sprint-end', 'retrospective'],
            metadata: { sprint, sprintPhase: 'end' },
          });
        }

        // Sprint milestone event
        if (sprint.status === 'Completed' && sprint.endDate) {
          timelineEvents.push({
            id: `sprint-milestone-${sprint.id}`,
            type: 'milestone',
            title: `Milestone: Sprint "${sprint.name}" Delivered`,
            description: `Successfully delivered sprint "${sprint.name}"`,
            date: new Date(sprint.endDate),
            status: 'completed',
            sprintId: sprint.id,
            tags: ['milestone', 'delivery'],
            metadata: { sprint, type: 'sprint-completion' },
          });
        }
      });

      // Add task events
      tasks.forEach((task: Task) => {
        // Task creation event
        const createdDate = new Date(); // Using current date as fallback
        timelineEvents.push({
          id: `task-created-${task.id}`,
          type: 'task',
          title: `${task.type} Created: ${task.title}`,
          description: task.description || 'No description provided',
          date: createdDate,
          status: 'todo',
          assignee: task.assignee || 'Unassigned',
          taskType: task.type,
          priority: task.priority,
          storyPoints: task.storyPoints || 0,
          tags: ['task-created', task.type],
          metadata: { task, phase: 'creation' },
        });

        // Task completion event (if completed)
        if (task.status === 'Done') {
          timelineEvents.push({
            id: `task-completed-${task.id}`,
            type: 'task',
            title: `${task.type} Completed: ${task.title}`,
            description: `Task completed by ${task.assignee || 'Unknown'}. ${task.storyPoints ? `+${task.storyPoints} story points` : ''}`,
            date: createdDate,
            status: 'completed',
            assignee: task.assignee || 'Unassigned',
            taskType: task.type,
            priority: task.priority,
            storyPoints: task.storyPoints || 0,
            tags: ['task-completed', 'delivery'],
            metadata: { task, phase: 'completion' },
          });
        }

        // Task blocked event
        if (task.status === 'Blocked') {
          timelineEvents.push({
            id: `task-blocked-${task.id}`,
            type: 'task',
            title: `${task.type} Blocked: ${task.title}`,
            description: `Task is currently blocked and requires attention.`,
            date: createdDate,
            status: 'blocked',
            assignee: task.assignee || 'Unassigned',
            taskType: task.type,
            priority: 'High',
            storyPoints: task.storyPoints || 0,
            tags: ['task-blocked', 'blocker'],
            metadata: { task, phase: 'blocked' },
          });
        }

        // Due date warnings
        if (task.dueDate && task.status !== 'Done') {
          const dueDate = new Date(task.dueDate);
          const now = new Date();
          const isOverdue = dueDate < now;
          
          if (isOverdue) {
            timelineEvents.push({
              id: `task-overdue-${task.id}`,
              type: 'task',
              title: `⚠️ ${task.type} Overdue: ${task.title}`,
              description: `Task is ${Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days overdue`,
              date: dueDate,
              status: 'blocked',
              assignee: task.assignee || 'Unassigned',
              taskType: task.type,
              priority: 'Highest',
              storyPoints: task.storyPoints || 0,
              tags: ['overdue', 'warning'],
              metadata: { task, phase: 'overdue' },
            });
          }
        }
      });

      // Sort events by date (newest first)
      timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
      setEvents(timelineEvents);

      // Calculate statistics
      const completedSprints = sprints.filter((s: SprintDTO) => s.status === 'Completed').length;
      const activeSprints = sprints.filter((s: SprintDTO) => s.status === 'Active').length;
      const completedTasks = tasks.filter((t: Task) => t.status === 'Done').length;
      const inProgressTasks = tasks.filter((t: Task) => t.status === 'In Progress').length;
      const todoTasks = tasks.filter((t: Task) => t.status === 'To Do').length;
      const blockedTasks = tasks.filter((t: Task) => t.status === 'Blocked').length;
      
      const totalStoryPoints = tasks.reduce((sum: number, task: Task) => sum + (task.storyPoints || 0), 0);
      const completedStoryPoints = tasks
        .filter((task: Task) => task.status === 'Done')
        .reduce((sum: number, task: Task) => sum + (task.storyPoints || 0), 0);

      const projectStats: ProjectStats = {
        totalSprints: sprints.length,
        completedSprints,
        activeSprints,
        totalTasks: tasks.length,
        completedTasks,
        inProgressTasks,
        todoTasks,
        blockedTasks,
        completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
        averageVelocity: completedSprints > 0 ? Math.round(completedTasks / completedSprints) : 0,
        totalStoryPoints,
        completedStoryPoints,
      };

      setStats(projectStats);
    } catch (err) {
      console.error('Error fetching timeline data:', err);
      setError('Failed to load timeline data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimelineData();
  }, [projectId]);

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.assignee?.toLowerCase().includes(query)
      );
    }

    // Event type filter
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === eventTypeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    // Date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateRangeFilter) {
        case 'last-week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last-month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last-quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(event => event.date >= startDate);
    }

    return filtered;
  }, [events, searchQuery, eventTypeFilter, statusFilter, dateRangeFilter]);

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'sprint':
        return event.status === 'completed' ? <CompletedIcon /> : <CalendarIcon />;
      case 'task':
        if (event.status === 'completed') return <CompletedIcon />;
        if (event.status === 'blocked') return <BlockedIcon />;
        if (event.taskType === 'Bug') return <BugIcon />;
        if (event.taskType === 'Story') return <StoryIcon />;
        if (event.taskType === 'Epic') return <EpicIcon />;
        return <TaskIcon />;
      case 'milestone':
        return <FlagIcon />;
      default:
        return <TaskIcon />;
    }
  };

  const getEventColor = (event: TimelineEvent) => {
    if (event.status === 'completed') return 'success';
    if (event.status === 'blocked') return 'error';
    if (event.priority === 'Highest') return 'error';
    if (event.priority === 'High') return 'warning';
    if (event.type === 'sprint') return 'primary';
    if (event.type === 'milestone') return 'secondary';
    return 'info';
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Highest': return '#FF4444';
      case 'High': return '#FF8800';
      case 'Medium': return '#FFBB33';
      case 'Low': return '#00C851';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={fetchTimelineData} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon color="primary" sx={{ fontSize: 40 }} />
            Enhanced Project Timeline
            <Chip 
              label={`${filteredEvents.length} events`} 
              size="small" 
              variant="outlined" 
              sx={{ ml: 2 }} 
            />
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Timeline">
              <IconButton onClick={fetchTimelineData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<ViewIcon />}
              sx={{ textTransform: 'none' }}
            >
              View Project
            </Button>
          </Box>
        </Box>

        {/* Project Statistics */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: alpha(theme.palette.success.main, 0.05), 
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                height: '100%'
              }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                      <CompletedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h5">{stats.completionRate}%</Typography>
                      <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                      <Typography variant="caption" color="success.main">
                        {stats.completedTasks}/{stats.totalTasks} tasks
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: alpha('#FFAB00', 0.05), 
                border: `1px solid ${alpha('#FFAB00', 0.2)}`,
                height: '100%'
              }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: '#FFAB00' }}>
                      <CalendarIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h5">{stats.activeSprints}</Typography>
                      <Typography variant="body2" color="text.secondary">Active Sprints</Typography>
                      <Typography variant="caption" color="warning.main">
                        {stats.completedSprints} completed
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: alpha('#6554C0', 0.05), 
                border: `1px solid ${alpha('#6554C0', 0.2)}`,
                height: '100%'
              }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: '#6554C0' }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h5">{stats.averageVelocity}</Typography>
                      <Typography variant="body2" color="text.secondary">Avg Velocity</Typography>
                      <Typography variant="caption" color="text.secondary">
                        tasks per sprint
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: alpha(theme.palette.error.main, 0.05), 
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                height: '100%'
              }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Badge badgeContent={stats.blockedTasks} color="error">
                      <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                        <BlockedIcon />
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="h5">{stats.totalStoryPoints}</Typography>
                      <Typography variant="body2" color="text.secondary">Story Points</Typography>
                      <Typography variant="caption" color="error.main">
                        {stats.blockedTasks} blocked
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            Filters & Search
          </Typography>
          
          <Stack spacing={3}>
            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search events, assignees, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              size="small"
            />

            {/* Filter Controls */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    value={eventTypeFilter}
                    label="Event Type"
                    onChange={(e) => setEventTypeFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Events</MenuItem>
                    <MenuItem value="sprint">Sprints</MenuItem>
                    <MenuItem value="task">Tasks</MenuItem>
                    <MenuItem value="milestone">Milestones</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="todo">Todo</MenuItem>
                    <MenuItem value="blocked">Blocked</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateRangeFilter}
                    label="Date Range"
                    onChange={(e) => setDateRangeFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="last-week">Last Week</MenuItem>
                    <MenuItem value="last-month">Last Month</MenuItem>
                    <MenuItem value="last-quarter">Last Quarter</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '40px' }}>
                  <Typography variant="body2" color="text.secondary">
                    {filteredEvents.length} of {events.length} events
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setSearchQuery('');
                      setEventTypeFilter('all');
                      setStatusFilter('all');
                      setDateRangeFilter('all');
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </Paper>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.grey[100], 0.5) }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No timeline events found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or check back later for updates.
          </Typography>
        </Paper>
      ) : (
        <Timeline position="alternate">
          {filteredEvents.map((event, index) => (
            <TimelineItem key={event.id}>
              <TimelineOppositeContent sx={{ m: 'auto 0' }} variant="body2" color="text.secondary">
                <Stack alignItems={index % 2 === 0 ? 'flex-end' : 'flex-start'} spacing={1}>
                  <Typography variant="caption" fontWeight="bold">
                    {event.date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Typography>
                  <Typography variant="caption">
                    {event.date.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </Typography>
                  {event.tags && (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {event.tags.slice(0, 2).map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ height: 16, fontSize: 10 }}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color={getEventColor(event) as any} variant="outlined" sx={{ p: 1 }}>
                  {getEventIcon(event)}
                </TimelineDot>
                {index < filteredEvents.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 2, 
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      transform: 'translateY(-1px)',
                      transition: 'all 0.2s ease-in-out',
                    }
                  }}
                >
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        {event.title}
                      </Typography>
                      {event.priority && (
                        <Chip
                          label={event.priority.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: getPriorityColor(event.priority),
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: 10,
                          }}
                        />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      {event.description}
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                      {event.assignee && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {event.assignee}
                          </Typography>
                        </Stack>
                      )}

                      {event.storyPoints && event.storyPoints > 0 && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <TrendingUpIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {event.storyPoints} SP
                          </Typography>
                        </Stack>
                      )}

                      {event.taskType && (
                        <Chip
                          label={event.taskType}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: 10 }}
                        />
                      )}

                      <Chip
                        label={event.status?.replace('-', ' ').toUpperCase() || 'UNKNOWN'}
                        size="small"
                        color={getEventColor(event) as any}
                        variant="filled"
                        sx={{ height: 20, fontSize: 10, fontWeight: 'bold' }}
                      />
                    </Stack>
                  </Stack>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Box>
  );
};

export default EnhancedProjectTimeline;
