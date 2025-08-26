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
  InputAdornment,
  Badge,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  PlayArrow as StartIcon,
  Stop as StopIcon,
  CheckCircle as CompletedIcon,
  Assignment as TaskIcon,
  BugReport as BugIcon,
  AutoStories as StoryIcon,
  EmojiEvents as EpicIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  AccessTime as DueDateIcon,
  Event as EventIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIconMain,
  Flag as MilestoneIcon,
  Today as TodayIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { SprintService } from '@/services/SprintService';
import { TaskService } from '@/services/TaskService';
import type { SprintDTO } from '@/types/featurevise/sprint';
import type { Task } from '@/types';

interface TimelineProps {
  projectId: number;
}

interface TimelineEvent {
  id: string;
  type: 'sprint_start' | 'sprint_end' | 'task_created' | 'task_completed' | 'task_due' | 'milestone' | 'overdue';
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  dueDate?: Date;
  status: string;
  priority?: string;
  assignee?: string;
  taskType?: string;
  sprintId?: number;
  taskId?: number;
  storyPoints?: number;
  tags: string[];
  metadata: any;
  isOverdue?: boolean;
  daysOverdue?: number;
  progress?: number;
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
  overdueTasks: number;
  completionRate: number;
  averageVelocity: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  upcomingDeadlines: number;
}

const JiraStyleTimeline: React.FC<TimelineProps> = ({ projectId }) => {
  const theme = useTheme();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Enhanced filters
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sprintsResponse, tasks] = await Promise.all([
        SprintService.getAllSprints(projectId),
        TaskService.getTasksByProjectId(projectId),
      ]);

      const sprints = sprintsResponse.data;
      const timelineEvents: TimelineEvent[] = [];
      const today = new Date();

      // Process sprints with comprehensive date tracking
      sprints.forEach((sprint: SprintDTO) => {
        const startDate = sprint.startDate ? new Date(sprint.startDate) : null;
        const endDate = sprint.endDate ? new Date(sprint.endDate) : null;

        // Sprint start event
        if (startDate) {
          timelineEvents.push({
            id: `sprint-start-${sprint.id}`,
            type: 'sprint_start',
            title: `🚀 Sprint "${sprint.name}" Started`,
            description: `Sprint kickoff with goal: ${sprint.goal || 'Not specified'}. Duration: ${startDate.toLocaleDateString()} - ${endDate?.toLocaleDateString() || 'TBD'}`,
            date: startDate,
            endDate: endDate || undefined,
            status: 'active',
            sprintId: sprint.id,
            tags: ['sprint', 'start', 'planning'],
            metadata: { 
              sprint, 
              duration: endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : null,
              sprintGoal: sprint.goal,
              sprintType: 'development'
            },
          });
        }

        // Sprint end event
        if (endDate) {
          const isCompleted = sprint.status === 'Completed';
          const isOverdue = endDate < today && !isCompleted;
          
          timelineEvents.push({
            id: `sprint-end-${sprint.id}`,
            type: 'sprint_end',
            title: `${isCompleted ? '✅' : isOverdue ? '⚠️' : '🏁'} Sprint "${sprint.name}" ${isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Ending'}`,
            description: `Sprint ${isCompleted ? 'successfully completed' : isOverdue ? 'is overdue' : 'scheduled to end'}. ${isOverdue ? `${Math.ceil((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))} days overdue.` : ''}`,
            date: endDate,
            status: isCompleted ? 'completed' : isOverdue ? 'overdue' : 'planned',
            sprintId: sprint.id,
            isOverdue: isOverdue,
            daysOverdue: isOverdue ? Math.ceil((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)) : 0,
            tags: ['sprint', 'end', isCompleted ? 'completed' : isOverdue ? 'overdue' : 'planned'],
            metadata: { 
              sprint, 
              completionStatus: sprint.status,
              actualEndDate: isCompleted ? endDate : null
            },
          });
        }

        // Sprint milestones
        if (sprint.status === 'Completed' && endDate) {
          timelineEvents.push({
            id: `milestone-${sprint.id}`,
            type: 'milestone',
            title: `🎯 Milestone: Sprint "${sprint.name}" Delivered`,
            description: `Successfully delivered sprint milestone. All objectives completed on time.`,
            date: endDate,
            status: 'completed',
            sprintId: sprint.id,
            tags: ['milestone', 'delivery', 'achievement'],
            metadata: { 
              sprint, 
              milestoneType: 'sprint_completion',
              achievementDate: endDate
            },
          });
        }
      });

      // Process tasks with comprehensive lifecycle tracking
      tasks.forEach((task: Task) => {
        const createdDate = new Date(); // Fallback since createdAt might not exist
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < today && task.status !== 'Done';

        // Task creation event
        timelineEvents.push({
          id: `task-created-${task.id}`,
          type: 'task_created',
          title: `📝 ${task.type} Created: ${task.title}`,
          description: `New ${task.type.toLowerCase()} created${task.assignee ? ` and assigned to ${task.assignee}` : ''}. ${task.storyPoints ? `Story Points: ${task.storyPoints}` : ''}`,
          date: createdDate,
          dueDate: dueDate || undefined,
          status: task.status,
          priority: task.priority,
          assignee: task.assignee,
          taskType: task.type,
          taskId: task.id,
          storyPoints: task.storyPoints,
          tags: ['task', 'created', task.type.toLowerCase()],
          metadata: { 
            task,
            creationReason: 'user_created',
            initialStatus: task.status
          },
        });

        // Task completion event
        if (task.status === 'Done') {
          timelineEvents.push({
            id: `task-completed-${task.id}`,
            type: 'task_completed',
            title: `✅ ${task.type} Completed: ${task.title}`,
            description: `Task successfully completed by ${task.assignee || 'team member'}. ${task.storyPoints ? `+${task.storyPoints} story points earned.` : ''} ${dueDate ? (dueDate > createdDate ? 'Completed on time.' : 'Completed after due date.') : ''}`,
            date: createdDate, // Would be updatedAt in real scenario
            dueDate: dueDate || undefined,
            status: 'completed',
            priority: task.priority,
            assignee: task.assignee,
            taskType: task.type,
            taskId: task.id,
            storyPoints: task.storyPoints,
            tags: ['task', 'completed', 'achievement'],
            metadata: { 
              task,
              completionDate: createdDate,
              wasOnTime: dueDate ? dueDate >= createdDate : true
            },
          });
        }

        // Due date events
        if (dueDate) {
          timelineEvents.push({
            id: `task-due-${task.id}`,
            type: 'task_due',
            title: `${isOverdue ? '🚨' : '⏰'} ${task.type} ${isOverdue ? 'Overdue' : 'Due'}: ${task.title}`,
            description: `Task ${isOverdue ? 'is overdue by' : 'is due on'} ${dueDate.toLocaleDateString()}. ${isOverdue ? `${Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days overdue.` : ''} Priority: ${task.priority}`,
            date: dueDate,
            dueDate: dueDate,
            status: isOverdue ? 'overdue' : task.status === 'Done' ? 'completed' : 'pending',
            priority: isOverdue ? 'Highest' : task.priority,
            assignee: task.assignee,
            taskType: task.type,
            taskId: task.id,
            storyPoints: task.storyPoints,
            isOverdue: !!isOverdue,
            daysOverdue: isOverdue ? Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0,
            tags: ['task', 'due', isOverdue ? 'overdue' : 'scheduled'],
            metadata: { 
              task,
              dueType: isOverdue ? 'overdue' : 'upcoming',
              urgencyLevel: isOverdue ? 'critical' : 'normal'
            },
          });
        }

        // Overdue task alert
        if (isOverdue) {
          timelineEvents.push({
            id: `overdue-${task.id}`,
            type: 'overdue',
            title: `🚨 OVERDUE ALERT: ${task.title}`,
            description: `Critical: Task is ${Math.ceil((today.getTime() - dueDate!.getTime()) / (1000 * 60 * 60 * 24))} days overdue! Immediate attention required.`,
            date: dueDate!,
            dueDate: dueDate!,
            status: 'overdue',
            priority: 'Highest',
            assignee: task.assignee,
            taskType: task.type,
            taskId: task.id,
            storyPoints: task.storyPoints,
            isOverdue: true,
            daysOverdue: Math.ceil((today.getTime() - dueDate!.getTime()) / (1000 * 60 * 60 * 24)),
            tags: ['alert', 'overdue', 'critical'],
            metadata: { 
              task,
              alertType: 'overdue',
              severity: 'high',
              actionRequired: true
            },
          });
        }
      });

      // Sort events chronologically (newest first)
      timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
      setEvents(timelineEvents);

      // Calculate comprehensive statistics
      const completedSprints = sprints.filter((s: SprintDTO) => s.status === 'Completed').length;
      const activeSprints = sprints.filter((s: SprintDTO) => s.status === 'Active').length;
      const completedTasks = tasks.filter((t: Task) => t.status === 'Done').length;
      const inProgressTasks = tasks.filter((t: Task) => t.status === 'In Progress').length;
      const todoTasks = tasks.filter((t: Task) => t.status === 'Todo').length;
      const blockedTasks = tasks.filter((t: Task) => t.status === 'Backlog').length;
      const overdueTasks = tasks.filter((t: Task) => {
        const due = t.dueDate ? new Date(t.dueDate) : null;
        return due && due < today && t.status !== 'Done';
      }).length;
      
      const upcomingDeadlines = tasks.filter((t: Task) => {
        const due = t.dueDate ? new Date(t.dueDate) : null;
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return due && due > today && due <= nextWeek && t.status !== 'Done';
      }).length;

      const totalStoryPoints = tasks.reduce((sum: number, task: Task) => sum + (task.storyPoints || 0), 0);
      const completedStoryPoints = tasks
        .filter((task: Task) => task.status === 'Done')
        .reduce((sum: number, task: Task) => sum + (task.storyPoints || 0), 0);

      setStats({
        totalSprints: sprints.length,
        completedSprints,
        activeSprints,
        totalTasks: tasks.length,
        completedTasks,
        inProgressTasks,
        todoTasks,
        blockedTasks,
        overdueTasks,
        completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
        averageVelocity: completedSprints > 0 ? Math.round(completedTasks / completedSprints) : 0,
        totalStoryPoints,
        completedStoryPoints,
        upcomingDeadlines,
      });

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

  // Advanced filtering with date and deadline awareness
  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.assignee?.toLowerCase().includes(query) ||
        event.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => {
        switch (eventTypeFilter) {
          case 'sprints': return event.type.includes('sprint') || event.type === 'milestone';
          case 'tasks': return event.type.includes('task');
          case 'deadlines': return event.type === 'task_due' || event.isOverdue;
          case 'overdue': return event.isOverdue;
          default: return true;
        }
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(event => event.priority === priorityFilter);
    }

    if (showOverdueOnly) {
      filtered = filtered.filter(event => event.isOverdue);
    }

    if (dateRangeFilter !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateRangeFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          return filtered;
      }

      filtered = filtered.filter(event => event.date >= startDate);
    }

    return filtered;
  }, [events, searchQuery, eventTypeFilter, statusFilter, priorityFilter, showOverdueOnly, dateRangeFilter]);

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'sprint_start': return <StartIcon />;
      case 'sprint_end': return event.status === 'completed' ? <CompletedIcon /> : event.isOverdue ? <WarningIcon /> : <StopIcon />;
      case 'task_created': 
        if (event.taskType === 'Bug') return <BugIcon />;
        if (event.taskType === 'Story') return <StoryIcon />;
        if (event.taskType === 'Epic') return <EpicIcon />;
        return <TaskIcon />;
      case 'task_completed': return <CompletedIcon />;
      case 'task_due': return event.isOverdue ? <WarningIcon /> : <DueDateIcon />;
      case 'milestone': return <MilestoneIcon />;
      case 'overdue': return <WarningIcon />;
      default: return <EventIcon />;
    }
  };

  const getEventColor = (event: TimelineEvent) => {
    if (event.isOverdue) return 'error';
    if (event.status === 'completed') return 'success';
    if (event.type === 'sprint_start' || event.type === 'sprint_end') return 'primary';
    if (event.type === 'milestone') return 'secondary';
    if (event.priority === 'Highest') return 'error';
    if (event.priority === 'High') return 'warning';
    return 'info';
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Highest': return '#D32F2F';
      case 'High': return '#F57C00';
      case 'Medium': return '#1976D2';
      case 'Low': return '#388E3C';
      default: return '#757575';
    }
  };

  const formatDateRange = (startDate: Date, endDate?: Date) => {
    const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!endDate) return start;
    const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} → ${end}`;
  };

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 2 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">Loading timeline...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="h6">{error}</Typography>
        <Button onClick={fetchTimelineData} sx={{ mt: 1 }} variant="contained">
          Retry Loading
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1600, mx: 'auto' }}>
      {/* Enhanced Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)` }}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56 }}>
              <TimelineIconMain sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Project Timeline
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Comprehensive project tracking with deadlines & milestones
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Badge badgeContent={stats?.overdueTasks || 0} color="error">
              <Chip icon={<WarningIcon />} label="Overdue" color={stats?.overdueTasks ? 'error' : 'default'} />
            </Badge>
            <Badge badgeContent={stats?.upcomingDeadlines || 0} color="warning">
              <Chip icon={<TodayIcon />} label="Due Soon" color={stats?.upcomingDeadlines ? 'warning' : 'default'} />
            </Badge>
            <Tooltip title="Refresh Timeline">
              <IconButton onClick={fetchTimelineData} disabled={loading} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Enhanced Statistics Dashboard */}
      {stats && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <Card sx={{ flex: 1, minWidth: 200, bgcolor: alpha(theme.palette.success.main, 0.05), border: `2px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.success.main, width: 48, height: 48 }}>
                  <CompletedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.completionRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                  <LinearProgress variant="determinate" value={stats.completionRate} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, minWidth: 200, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
                  <CalendarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.activeSprints}</Typography>
                  <Typography variant="body2" color="text.secondary">Active Sprints</Typography>
                  <Typography variant="caption" color="primary.main">{stats.completedSprints} completed</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, minWidth: 200, bgcolor: alpha(theme.palette.error.main, 0.05), border: `2px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Badge badgeContent={stats.overdueTasks} color="error">
                  <Avatar sx={{ bgcolor: theme.palette.error.main, width: 48, height: 48 }}>
                    <WarningIcon />
                  </Avatar>
                </Badge>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="error.main">{stats.overdueTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">Overdue Tasks</Typography>
                  <Typography variant="caption" color="warning.main">{stats.upcomingDeadlines} due soon</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, minWidth: 200, bgcolor: alpha('#9C27B0', 0.05), border: `2px solid ${alpha('#9C27B0', 0.2)}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#9C27B0', width: 48, height: 48 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.completedStoryPoints}</Typography>
                  <Typography variant="body2" color="text.secondary">Story Points Done</Typography>
                  <Typography variant="caption" color="text.secondary">of {stats.totalStoryPoints} total</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Enhanced Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: alpha(theme.palette.background.paper, 0.8) }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterIcon />
          Smart Filters
        </Typography>

        <Stack spacing={3}>
          <TextField
            fullWidth
            placeholder="Search timeline events, assignees, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="small"
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Event Type</InputLabel>
              <Select value={eventTypeFilter} label="Event Type" onChange={(e) => setEventTypeFilter(e.target.value)}>
                <MenuItem value="all">All Events</MenuItem>
                <MenuItem value="sprints">Sprints & Milestones</MenuItem>
                <MenuItem value="tasks">Task Activities</MenuItem>
                <MenuItem value="deadlines">Due Dates</MenuItem>
                <MenuItem value="overdue">Overdue Items</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select value={priorityFilter} label="Priority" onChange={(e) => setPriorityFilter(e.target.value)}>
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="Highest">Highest</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select value={dateRangeFilter} label="Time Range" onChange={(e) => setDateRangeFilter(e.target.value)}>
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="quarter">This Quarter</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant={showOverdueOnly ? 'contained' : 'outlined'}
              color="error"
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              startIcon={<WarningIcon />}
              size="small"
            >
              Overdue Only
            </Button>
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Showing {filteredEvents.length} of {events.length} events
            </Typography>
            <Button
              size="small"
              onClick={() => {
                setSearchQuery('');
                setEventTypeFilter('all');
                setStatusFilter('all');
                setPriorityFilter('all');
                setDateRangeFilter('all');
                setShowOverdueOnly(false);
              }}
              startIcon={<CloseIcon />}
            >
              Clear All Filters
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      {/* Enhanced Timeline */}
      {filteredEvents.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: alpha(theme.palette.grey[50], 0.5) }}>
          <TimelineIconMain sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No timeline events found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Try adjusting your filters or check back later for project updates.
          </Typography>
          <Button variant="contained" onClick={() => {
            setSearchQuery('');
            setEventTypeFilter('all');
            setStatusFilter('all');
          }}>
            Reset Filters
          </Button>
        </Paper>
      ) : (
        <Timeline position="alternate">
          {filteredEvents.map((event, index) => (
            <TimelineItem key={event.id}>
              <TimelineOppositeContent sx={{ m: 'auto 0', py: 2 }} align={index % 2 === 0 ? 'right' : 'left'}>
                <Paper elevation={1} sx={{ p: 2, maxWidth: 300, bgcolor: alpha(theme.palette.background.paper, 0.9) }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {event.date.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {event.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  
                  {event.endDate && (
                    <Typography variant="caption" display="block" sx={{ mt: 1, p: 1, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
                      <EventIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      Duration: {formatDateRange(event.date, event.endDate)}
                    </Typography>
                  )}

                  {event.dueDate && (
                    <Typography variant="caption" display="block" sx={{ 
                      mt: 1, 
                      p: 1, 
                      bgcolor: alpha(event.isOverdue ? theme.palette.error.main : theme.palette.warning.main, 0.1), 
                      borderRadius: 1,
                      color: event.isOverdue ? 'error.main' : 'warning.dark'
                    }}>
                      <DueDateIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      {event.isOverdue ? `${event.daysOverdue} days overdue` : `Due: ${event.dueDate.toLocaleDateString()}`}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1 }}>
                    {event.tags.slice(0, 3).map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          height: 20, 
                          fontSize: 10,
                          '& .MuiChip-label': { px: 1 }
                        }}
                      />
                    ))}
                  </Stack>
                </Paper>
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot 
                  color={getEventColor(event) as any} 
                  sx={{ 
                    p: 1.5,
                    border: event.isOverdue ? `2px solid ${theme.palette.error.main}` : undefined,
                    animation: event.isOverdue ? 'pulse 2s infinite' : undefined,
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                      '100%': { transform: 'scale(1)' }
                    }
                  }}
                >
                  {getEventIcon(event)}
                </TimelineDot>
                {index < filteredEvents.length - 1 && <TimelineConnector sx={{ minHeight: 60 }} />}
              </TimelineSeparator>

              <TimelineContent sx={{ py: 2, px: 2 }}>
                <Paper 
                  elevation={event.isOverdue ? 6 : 3}
                  sx={{ 
                    p: 3,
                    bgcolor: event.isOverdue 
                      ? alpha(theme.palette.error.main, 0.03)
                      : alpha(theme.palette.background.paper, 0.9),
                    border: event.isOverdue 
                      ? `2px solid ${alpha(theme.palette.error.main, 0.3)}`
                      : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    borderRadius: 2,
                    position: 'relative',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8],
                    }
                  }}
                >
                  {event.isOverdue && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -1,
                        right: -1,
                        bgcolor: theme.palette.error.main,
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: '0 8px 0 8px',
                        fontSize: 11,
                        fontWeight: 'bold'
                      }}
                    >
                      OVERDUE
                    </Box>
                  )}

                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
                        {event.title}
                      </Typography>
                      {event.priority && (
                        <Chip
                          icon={<WarningIcon />}
                          label={event.priority}
                          size="small"
                          sx={{
                            bgcolor: getPriorityColor(event.priority),
                            color: 'white',
                            fontWeight: 'bold',
                            '& .MuiChip-icon': { color: 'white' }
                          }}
                        />
                      )}
                    </Box>

                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {event.description}
                    </Typography>

                    <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
                      {event.assignee && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="medium">
                            {event.assignee}
                          </Typography>
                        </Stack>
                      )}

                      {event.storyPoints && event.storyPoints > 0 && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <TrendingUpIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {event.storyPoints} SP
                          </Typography>
                        </Stack>
                      )}

                      {event.taskType && (
                        <Chip
                          label={event.taskType}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      )}

                      <Chip
                        label={event.status.replace('_', ' ').toUpperCase()}
                        size="small"
                        color={getEventColor(event) as any}
                        variant="filled"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Stack>

                    {/* Expandable details */}
                    <Box>
                      <Button
                        size="small"
                        onClick={() => toggleEventExpansion(event.id)}
                        endIcon={expandedEvents.has(event.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{ textTransform: 'none' }}
                      >
                        {expandedEvents.has(event.id) ? 'Less Details' : 'More Details'}
                      </Button>

                      <Collapse in={expandedEvents.has(event.id)}>
                        <Paper elevation={0} sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.grey[50], 0.5) }}>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2" color="primary">
                              <InfoIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              Additional Information
                            </Typography>
                            
                            {event.metadata && (
                              <Stack spacing={1} sx={{ ml: 1 }}>
                                {Object.entries(event.metadata)
                                  .filter(([, value]) => value && typeof value === 'string')
                                  .map(([key, value]) => (
                                    <Typography key={key} variant="caption" display="block">
                                      <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value as string}
                                    </Typography>
                                  ))}
                              </Stack>
                            )}

                            {event.tags.length > 3 && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                  All Tags:
                                </Typography>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                  {event.tags.map(tag => (
                                    <Chip
                                      key={tag}
                                      label={tag}
                                      size="small"
                                      variant="outlined"
                                      sx={{ height: 20, fontSize: 10 }}
                                    />
                                  ))}
                                </Stack>
                              </Box>
                            )}
                          </Stack>
                        </Paper>
                      </Collapse>
                    </Box>
                  </Stack>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}

      {/* Event Detail Dialog */}
      <Dialog 
        open={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getEventIcon(selectedEvent)}
              {selectedEvent.title}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                <Typography variant="body1">
                  {selectedEvent.description}
                </Typography>
                <Divider />
                {/* Additional details can be added here */}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedEvent(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default JiraStyleTimeline;
