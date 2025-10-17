import React from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  useTheme,
  alpha,
} from "@mui/material";
import {
  // Speed as VelocityIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  // Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  ShowChart as ShowChartIcon,
  Star as StarIcon,
  WorkspacePremium as PremiumIcon,
  EmojiEvents as TrophyIcon,
  Groups as TeamIcon,
  // Assignment as TaskIcon,
  // BugReport as BugIcon,
  // AutoStories as StoryIcon,
  // EmojiEvents as EpicIcon,
  CheckCircle as CompletedIcon,
  Schedule as InProgressIcon,
  // PendingActions as PendingIcon,
  // DonutLarge as DonutLargeIcon,
} from "@mui/icons-material";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { Task } from "@/types";
import { TokenManager } from "@/utils/tokenManager";

interface VelocityProps {
  tasks: Task[];
}

// Real data will be calculated from actual task data

const Velocity: React.FC<VelocityProps> = ({ tasks }) => {
  const theme = useTheme();

  // Get current user ID for highlighting personal contributions
  const currentUserId = TokenManager.getInstance().getUserId();
  console.log("Current User ID:", currentUserId);

  // ------------------------------------
  // 1. Metric Calculations & User Identification
  // ------------------------------------
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "Done").length;
  const totalStoryPoints = tasks.reduce(
    (sum, task) => sum + (task.storyPoints || 0),
    0,
  );
  const completedStoryPoints = tasks
    .filter((task) => task.status === "Done")
    .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // // Calculate average velocity based on current sprint data only
  // const avgVelocity =
  //   totalTasks > 0
  //     ? (completedStoryPoints / Math.max(completedTasks, 1)).toFixed(1)
  //     : "0";

  // Enhanced workload distribution with detailed stats
  const workloadStats = tasks.reduce(
    (acc, task) => {
      const assignee = task.assignee || "Unassigned";
      if (!acc[assignee]) {
        acc[assignee] = {
          tasks: 0,
          points: 0,
          completed: 0,
          inProgress: 0,
          pending: 0,
          bugs: 0,
          stories: 0,
          epics: 0,
          regularTasks: 0,
          completedPoints: 0,
          avgPointsPerTask: 0,
        };
      }
      acc[assignee].tasks++;
      acc[assignee].points += task.storyPoints || 0;

      // Count by status
      if (task.status === "Done") {
        acc[assignee].completed++;
        acc[assignee].completedPoints += task.storyPoints || 0;
      } else if (task.status === "In Progress") {
        acc[assignee].inProgress++;
      } else {
        acc[assignee].pending++;
      }

      // Count by type
      if (task.type === "Bug") acc[assignee].bugs++;
      else if (task.type === "Story") acc[assignee].stories++;
      else if (task.type === "Epic") acc[assignee].epics++;
      else acc[assignee].regularTasks++;

      return acc;
    },
    {} as Record<
      string,
      {
        tasks: number;
        points: number;
        completed: number;
        inProgress: number;
        pending: number;
        bugs: number;
        stories: number;
        epics: number;
        regularTasks: number;
        completedPoints: number;
        avgPointsPerTask: number;
      }
    >,
  );

  // Calculate average points per task for each person
  Object.keys(workloadStats).forEach((assignee) => {
    const stats = workloadStats[assignee];
    stats.avgPointsPerTask = stats.tasks > 0 ? stats.points / stats.tasks : 0;
  });

  // Sort team members by performance (completed points)
  const sortedTeamMembers = Object.entries(workloadStats).sort(
    ([, a], [, b]) => b.completedPoints - a.completedPoints,
  );

  // // Helper function to check if assignee is current user
  // const isCurrentUser = (assignee: string): boolean => {
  //   if (!currentUserId || !assignee) return false;
  //   // Check if assignee matches current user ID (as string or number)
  //   return (
  //     assignee === String(currentUserId) ||
  //     assignee === currentUserId.toString()
  //   );
  // };

  // // Get current user's stats for highlighting
  // const currentUserStats = currentUserId
  //   ? workloadStats[String(currentUserId)] ||
  //     workloadStats[currentUserId.toString()]
  //   : null;

  // ------------------------------------
  // 2. Chart Data Preparation (Real Data Only)
  // ------------------------------------

  // Real velocity data based on current task statuses
  const statusData = {
    categories: ["Backlog", "Todo", "In Progress", "Done"],
    taskCounts: [
      tasks.filter((t) => t.status === "Backlog").length,
      tasks.filter((t) => t.status === "Todo").length,
      tasks.filter((t) => t.status === "In Progress").length,
      tasks.filter((t) => t.status === "Done").length,
    ],
    storyPoints: [
      tasks
        .filter((t) => t.status === "Backlog")
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0),
      tasks
        .filter((t) => t.status === "Todo")
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0),
      tasks
        .filter((t) => t.status === "In Progress")
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0),
      tasks
        .filter((t) => t.status === "Done")
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0),
    ],
  };

  const teamPerformanceData = {
    categories: Object.keys(workloadStats).slice(0, 8), // Show up to 8 assignees
    completedPoints: Object.values(workloadStats)
      .slice(0, 8)
      .map((stat) => stat.points - (stat.points - stat.completed)),
    totalPoints: Object.values(workloadStats)
      .slice(0, 8)
      .map((stat) => stat.points),
  };

  // ------------------------------------
  // 3. ApexCharts Configurations
  // ------------------------------------

  const statusChartOptions: ApexOptions = {
    chart: {
      height: 350,
      type: "bar",
      fontFamily: theme.typography.fontFamily,
      toolbar: { show: false },
      background: "transparent",
    },
    colors: [theme.palette.info.main, theme.palette.success.main],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 8,
      },
    },
    dataLabels: { enabled: false },
    grid: {
      show: true,
      strokeDashArray: 4,
      borderColor: alpha(theme.palette.divider, 0.3),
      padding: { left: 2, right: 2, top: -20 },
    },
    series: [
      { name: "Task Count", data: statusData.taskCounts },
      { name: "Story Points", data: statusData.storyPoints },
    ],
    xaxis: {
      categories: statusData.categories,
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: "12px" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: "12px" },
      },
    },
    legend: {
      show: true,
      position: "top",
      labels: { colors: theme.palette.text.primary },
    },
    tooltip: { theme: theme.palette.mode, style: { fontSize: "12px" } },
  };

  const teamPerformanceOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 300,
      fontFamily: theme.typography.fontFamily,
      toolbar: { show: false },
      background: "transparent",
    },
    colors: [theme.palette.success.main, alpha(theme.palette.info.main, 0.7)],
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: "70%",
        borderRadius: 6,
      },
    },
    dataLabels: { enabled: false },
    series: [
      { name: "Completed Tasks", data: teamPerformanceData.completedPoints },
      { name: "Total Points", data: teamPerformanceData.totalPoints },
    ],
    xaxis: {
      categories: teamPerformanceData.categories,
      labels: { style: { colors: theme.palette.text.secondary } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    grid: { show: false },
    legend: {
      show: true,
      position: "top",
      fontFamily: theme.typography.fontFamily,
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: theme.palette.mode,
      y: { formatter: (value) => `${value} points` },
    },
  };

  // Real progress tracking based on actual completion
  const progressData = {
    categories: ["Total", "In Progress", "Completed"],
    values: [
      totalStoryPoints,
      totalStoryPoints - completedStoryPoints,
      completedStoryPoints,
    ],
  };

  const progressChartOptions: ApexOptions = {
    chart: {
      type: "donut",
      height: 320,
      fontFamily: theme.typography.fontFamily,
      toolbar: { show: false },
      background: "transparent",
    },
    colors: [
      theme.palette.grey[400],
      theme.palette.warning.main,
      theme.palette.success.main,
    ],
    series: progressData.values,
    labels: progressData.categories,
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Points",
              formatter: () => `${totalStoryPoints}`,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    tooltip: {
      theme: theme.palette.mode,
      y: { formatter: (value) => `${value} story points` },
    },
    legend: {
      show: true,
      position: "bottom",
      fontFamily: theme.typography.fontFamily,
      labels: { colors: theme.palette.text.primary },
    },
  };

  // ------------------------------------
  // 4. Component Render
  // ------------------------------------

  return (
    <Box>
      {/* Top Performers Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ mb: 3, display: "flex", alignItems: "center" }}
        >
          <TrophyIcon sx={{ mr: 2, color: theme.palette.warning.main }} />
          Team Performance Dashboard
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
          {sortedTeamMembers.slice(0, 3).map(([assignee, stats], index) => {
            const medals = [
              {
                icon: <TrophyIcon />,
                color: theme.palette.warning.main,
                bg: alpha(theme.palette.warning.main, 0.1),
              },
              {
                icon: <StarIcon />,
                color: theme.palette.info.main,
                bg: alpha(theme.palette.info.main, 0.1),
              },
              {
                icon: <PremiumIcon />,
                color: theme.palette.success.main,
                bg: alpha(theme.palette.success.main, 0.1),
              },
            ];
            const medal = medals[index] || medals[2];

            return (
              <Card
                key={assignee}
                sx={{
                  flex: "1 1 300px",
                  minWidth: 280,
                  background: medal.bg,
                  border: `2px solid ${medal.color}`,
                  borderRadius: 3,
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: medal.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    zIndex: 1,
                  }}
                >
                  {medal.icon}
                </Box>

                <CardContent sx={{ p: 3, pt: 4 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    {assignee}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    #{index + 1} Top Performer
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color={medal.color}
                      >
                        {stats.completedPoints}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Points Done
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h5" fontWeight="bold">
                        {stats.completed}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tasks Done
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h5" fontWeight="bold">
                        {Math.round((stats.completed / stats.tasks) * 100)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Success Rate
                      </Typography>
                    </Box>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={(stats.completed / stats.tasks) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(medal.color, 0.2),
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                        backgroundColor: medal.color,
                      },
                    }}
                  />
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* Team Statistics Cards */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
        <Card
          sx={{
            flex: "1 1 200px",
            minWidth: 200,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            borderRadius: 3,
            "&:hover": { transform: "translateY(-4px)" },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CompletedIcon
                sx={{ fontSize: 36, color: theme.palette.primary.main, mr: 2 }}
              />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {completedStoryPoints}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Points Delivered
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: "1 1 200px",
            minWidth: 200,
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            borderRadius: 3,
            "&:hover": { transform: "translateY(-4px)" },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TrendingUpIcon
                sx={{ fontSize: 36, color: theme.palette.success.main, mr: 2 }}
              />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {completionRate}%
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Team Velocity
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: "1 1 200px",
            minWidth: 200,
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.15)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            borderRadius: 3,
            "&:hover": { transform: "translateY(-4px)" },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <InProgressIcon
                sx={{ fontSize: 36, color: theme.palette.info.main, mr: 2 }}
              />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {tasks.filter((t) => t.status === "In Progress").length}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  In Progress
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: "1 1 200px",
            minWidth: 200,
            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            borderRadius: 3,
            "&:hover": { transform: "translateY(-4px)" },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TeamIcon
                sx={{ fontSize: 36, color: theme.palette.warning.main, mr: 2 }}
              />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {Object.keys(workloadStats).length}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Active Members
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Individual Team Member Analysis */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ mb: 3, display: "flex", alignItems: "center" }}
        >
          <PersonIcon sx={{ mr: 2, color: theme.palette.info.main }} />
          Individual Contributions & Assignments
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {sortedTeamMembers.map(([assignee, stats]) => (
            <Card
              key={assignee}
              sx={{
                flex: "1 1 300px",
                minWidth: 280,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[8],
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.primary.main,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                      color: "white",
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                    }}
                  >
                    {assignee.charAt(0).toUpperCase()}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {assignee}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.avgPointsPerTask.toFixed(1)} avg pts/task
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.completed}/{stats.tasks} tasks
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(stats.completed / stats.tasks) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
                      },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      {stats.completedPoints}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Points Done
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6" fontWeight="bold">
                      {stats.points}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Points
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Charts Section */}
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 4 }}>
        <Paper
          sx={{
            flex: "2 1 400px",
            minWidth: 400,
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <TimelineIcon color="primary" />
            <Typography variant="h6" fontWeight="600">
              Task Distribution by Status
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Current task count and story points across all statuses
          </Typography>
          <ReactApexChart
            options={statusChartOptions}
            series={statusChartOptions.series}
            type="bar"
            height={350}
          />
        </Paper>

        <Paper
          sx={{
            flex: "1 1 300px",
            minWidth: 300,
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <TeamIcon color="info" />
            <Typography variant="h6" fontWeight="600">
              Team Summary
            </Typography>
          </Box>
          <List sx={{ p: 0 }}>
            {sortedTeamMembers.slice(0, 5).map(([assignee, stats], index) => (
              <ListItem key={assignee} sx={{ px: 0, py: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor:
                      index < 3
                        ? theme.palette.warning.main
                        : theme.palette.grey[400],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                    color: "white",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                  }}
                >
                  #{index + 1}
                </Box>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight="medium">
                      {assignee}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="success.main">
                      {stats.completedPoints} points •{" "}
                      {Math.round((stats.completed / stats.tasks) * 100)}% done
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Team Performance Charts */}
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 4 }}>
        <Paper
          sx={{
            flex: "1 1 400px",
            minWidth: 400,
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <PersonIcon color="info" />
            <Typography variant="h6" fontWeight="600">
              Team Performance
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Story points completed vs total by team member
          </Typography>
          <ReactApexChart
            options={teamPerformanceOptions}
            series={teamPerformanceOptions.series}
            type="bar"
            height={300}
          />
        </Paper>

        <Paper
          sx={{
            flex: "1 1 400px",
            minWidth: 400,
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <ShowChartIcon color="success" />
            <Typography variant="h6" fontWeight="600">
              Overall Progress
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Current project completion status
          </Typography>
          <ReactApexChart
            options={progressChartOptions}
            series={progressChartOptions.series}
            type="donut"
            height={300}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default Velocity;
