import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, CircularProgress, Chip } from "@mui/material";
import type { SprintDTO } from "@/types/featurevise/sprint";
import { SprintService } from "@/services/SprintService";

// Helper functions for timeline calculations
const parseDate = (dateStr: string) => new Date(dateStr);

// Get week start (Monday)
const getWeekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

// Get month start
const getMonthStart = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

// Generate week markers between two dates (limited to sprint range)
const generateWeekMarkers = (startDate: Date, endDate: Date) => {
  const weeks = [];
  const current = getWeekStart(new Date(startDate));

  while (current <= endDate) {
    weeks.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  return weeks;
};

// Generate month markers between two dates (limited to sprint range)
const generateMonthMarkers = (startDate: Date, endDate: Date) => {
  const months = [];
  const current = getMonthStart(new Date(startDate));

  while (current <= endDate) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
};

// Format date for display
const formatDate = (date: Date, format: "short" | "month" | "week") => {
  switch (format) {
    case "short":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "month":
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    case "week":
      return `Week ${Math.ceil(date.getDate() / 7)}`;
    default:
      return date.toLocaleDateString();
  }
};

interface TimelinePageProps {
  projectId: string;
  projectName?: string;
  templateType?: string;
}

const TimeLine: React.FC<TimelinePageProps> = ({
  projectId,
  templateType = "scrum",
}) => {
  const [sprints, setSprints] = useState<SprintDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSprints() {
      setLoading(true);
      try {
        const numericProjectId = parseInt(projectId, 10);
        const response = await SprintService.getAllSprints(numericProjectId, templateType);
        setSprints(response.data);
      } catch (error) {
        console.error("Failed to fetch sprints", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSprints();
  }, [projectId, templateType]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (sprints.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No sprints to display
        </Typography>
      </Box>
    );
  }

  // Calculate timeline boundaries - limit to actual sprint dates
  const startDates = sprints.map((s) => parseDate(s.startDate));
  const endDates = sprints.map((s) => parseDate(s.endDate));
  const minDate = new Date(Math.min(...startDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...endDates.map((d) => d.getTime())));

  // Add small padding to the end for better visual appearance (1 day)
  const timelineEndDate = new Date(maxDate);
  timelineEndDate.setDate(timelineEndDate.getDate() + 1);

  const timelineDuration = timelineEndDate.getTime() - minDate.getTime();

  // Generate time markers only within the sprint timeline
  const weekMarkers = generateWeekMarkers(minDate, maxDate);
  const monthMarkers = generateMonthMarkers(minDate, maxDate);

  // Converts a date to a percentage position on the timeline
  const getPositionPercent = (dateStr: string) => {
    const date = parseDate(dateStr);
    return ((date.getTime() - minDate.getTime()) / timelineDuration) * 100;
  };

  // Color picker based on sprint status
  const getColorByStatus = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "planned":
        return { bg: "#1976d2", text: "white" };
      case "active":
        return { bg: "#2e7d32", text: "white" };
      case "completed":
        return { bg: "#9e9e9e", text: "white" };
      default:
        return { bg: "#757575", text: "white" };
    }
  };

  const HEADER_HEIGHT = 80;
  const SPRINT_HEIGHT = 50;
  const SPRINT_SPACING = 60;

  return (
    <Box sx={{ bgcolor: "#fafbfc", minHeight: "100vh" }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "white",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          color="text.primary"
          sx={{ mb: 1 }}
        >
          Project Timeline
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip
            label={`${sprints.length} sprints`}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.75rem", height: 20 }}
          />
          <Chip
            label={`${formatDate(minDate, "short")} - ${formatDate(maxDate, "short")}`}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontSize: "0.75rem", height: 20 }}
          />
        </Box>
      </Paper>

      {/* Timeline Container */}
      <Box sx={{ p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            height: sprints.length * SPRINT_SPACING + HEADER_HEIGHT + 40,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 2,
            overflowY: "auto",
            overflowX: "hidden", // Prevent horizontal scrolling beyond content
            bgcolor: "white",
          }}
        >
          {/* Timeline Content Container - Fixed width to prevent over-scrolling */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              minWidth: 800, // Minimum width for readability
            }}
          >
            {/* Month Headers */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 40,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "#f5f5f5",
              }}
            >
              {monthMarkers.map((month, i) => {
                const leftPercent = getPositionPercent(month.toISOString());
                return (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      left: `${leftPercent}%`,
                      top: 0,
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      px: 1,
                      borderLeft: i > 0 ? "1px solid #e0e0e0" : "none",
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="text.primary"
                    >
                      {formatDate(month, "month")}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Week Headers */}
            <Box
              sx={{
                position: "absolute",
                top: 40,
                left: 0,
                right: 0,
                height: 40,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "#fafafa",
              }}
            >
              {weekMarkers.map((week, i) => {
                const leftPercent = getPositionPercent(week.toISOString());
                return (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      left: `${leftPercent}%`,
                      top: 0,
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      px: 0.5,
                      borderLeft: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(week, "short")}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Week Grid Lines */}
            {weekMarkers.map((week, i) => {
              const leftPercent = getPositionPercent(week.toISOString());
              return (
                <Box
                  key={`week-line-${i}`}
                  sx={{
                    position: "absolute",
                    left: `${leftPercent}%`,
                    top: HEADER_HEIGHT,
                    bottom: 0,
                    width: 1,
                    bgcolor: "#f0f0f0",
                    zIndex: 1,
                  }}
                />
              );
            })}

            {/* Month Grid Lines */}
            {monthMarkers.map((month, i) => {
              if (i === 0) return null;
              const leftPercent = getPositionPercent(month.toISOString());
              return (
                <Box
                  key={`month-line-${i}`}
                  sx={{
                    position: "absolute",
                    left: `${leftPercent}%`,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    bgcolor: "#d0d0d0",
                    zIndex: 2,
                  }}
                />
              );
            })}

            {/* Sprint Bars */}
            {sprints.map((sprint, i) => {
              const leftPercent = getPositionPercent(sprint.startDate);
              const rightPercent = getPositionPercent(sprint.endDate);
              const widthPercent = rightPercent - leftPercent;
              const colors = getColorByStatus(sprint.status);

              return (
                <Box
                  key={sprint.id}
                  sx={{
                    position: "absolute",
                    top: HEADER_HEIGHT + 10 + i * SPRINT_SPACING,
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    height: SPRINT_HEIGHT,
                    bgcolor: colors.bg,
                    borderRadius: 1,
                    color: colors.text,
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    zIndex: 3,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(0,0,0,0.1)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    },
                  }}
                  title={`${sprint.name} (${formatDate(parseDate(sprint.startDate), "short")} - ${formatDate(parseDate(sprint.endDate), "short")}) - Status: ${sprint.status || "Unknown"}`}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sprint.name}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {sprint.status || "Unknown"}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default TimeLine;
