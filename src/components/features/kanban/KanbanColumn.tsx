import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import TaskCard from "../task/TaskCard";
import type { Task } from "@/types";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: (status: string) => void;
}

interface DraggableTaskProps {
  task: Task;
  onClick?: () => void;
}

const DraggableTask: React.FC<DraggableTaskProps> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
};

const getColumnConfig = (title: string) => {
  switch (title.toLowerCase()) {
    case "backlog":
      return {
        color: "#8993A4",
        bgColor: "#F8F9FA",
        borderColor: "#DFE1E6",
        chipColor: "#5E6C84",
      };
    case "todo":
      return {
        color: "#0052CC",
        bgColor: "#F4F5F7",
        borderColor: "#DFE1E6",
        chipColor: "#0052CC",
      };
    case "in progress":
      return {
        color: "#FF8B00",
        bgColor: "#FFF7E6",
        borderColor: "#FFCC91",
        chipColor: "#FF8B00",
      };
    case "review":
      return {
        color: "#6554C0",
        bgColor: "#F3F0FF",
        borderColor: "#B3A0FF",
        chipColor: "#6554C0",
      };
    case "done":
      return {
        color: "#00875A",
        bgColor: "#E3FCEF",
        borderColor: "#ABF5D1",
        chipColor: "#00875A",
      };
    default:
      return {
        color: "#8993A4",
        bgColor: "#F8F9FA",
        borderColor: "#DFE1E6",
        chipColor: "#5E6C84",
      };
  }
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  onTaskClick,
  onAddTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const config = getColumnConfig(title);

  return (
    <Paper
      elevation={0}
      sx={{
        flex: "0 0 320px",
        mr: 3,
        bgcolor: "white",
        borderRadius: 2,
        border: isOver
          ? `2px solid ${config.color}`
          : `1px solid ${config.borderColor}`,
        minHeight: "600px",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
        boxShadow: isOver
          ? `0 4px 20px ${config.color}25`
          : "0 1px 3px rgba(9,30,66,0.25)",
        transform: isOver ? "scale(1.02)" : "scale(1)",
        "&:hover": {
          boxShadow: "0 2px 8px rgba(9,30,66,0.15)",
          transform: isOver ? "scale(1.02)" : "translateY(-1px)",
        },
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: `2px solid ${config.borderColor}`,
          bgcolor: config.bgColor,
          borderRadius: "8px 8px 0 0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: config.color,
              fontWeight: 700,
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={tasks.length}
              size="small"
              sx={{
                bgcolor: config.chipColor,
                color: "white",
                fontWeight: 700,
                fontSize: "12px",
                height: 24,
                minWidth: 24,
                borderRadius: "12px",
                "& .MuiChip-label": { px: 1 },
              }}
            />

            <Tooltip title={`Add ${title.toLowerCase()} task`} arrow>
              <IconButton
                size="small"
                onClick={() => onAddTask?.(id)}
                sx={{
                  p: 0.5,
                  color: config.color,
                  bgcolor: "rgba(255,255,255,0.7)",
                  "&:hover": {
                    bgcolor: "white",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Column options" arrow>
              <IconButton
                size="small"
                sx={{
                  p: 0.5,
                  color: config.color,
                  bgcolor: "rgba(255,255,255,0.7)",
                  "&:hover": {
                    bgcolor: "white",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <MoreHorizIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Progress Bar for visual feedback */}
        <Box
          sx={{
            height: 3,
            bgcolor: "rgba(255,255,255,0.5)",
            borderRadius: 1.5,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              bgcolor: config.color,
              width: `${Math.min(100, (tasks.length / 10) * 100)}%`,
              transition: "width 0.3s ease",
            }}
          />
        </Box>
      </Box>

      {/* Tasks Container */}
      <Box
        ref={setNodeRef}
        sx={{
          flexGrow: 1,
          p: 2,
          bgcolor: isOver ? `${config.color}10` : "transparent",
          transition: "background-color 0.2s ease",
          minHeight: "200px",
          borderRadius: isOver ? "0 0 8px 8px" : "none",
          position: "relative",
          "&::before": isOver
            ? {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: "0 0 8px 8px",
                border: `2px dashed ${config.color}`,
                pointerEvents: "none",
                opacity: 0.5,
              }
            : {},
        }}
      >
        {tasks.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              color: "#8993A4",
              fontSize: "14px",
              fontStyle: "italic",
            }}
          >
            {isOver ? "Drop task here" : `No ${title.toLowerCase()} tasks`}
          </Box>
        ) : (
          tasks.map((task, index) => (
            <Box
              key={task.id}
              sx={{
                mb: 2,
                animation: `fadeIn 0.3s ease ${index * 0.1}s both`,
                "@keyframes fadeIn": {
                  "0%": { opacity: 0, transform: "translateY(10px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              <DraggableTask task={task} onClick={() => onTaskClick?.(task)} />
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
};

export default KanbanColumn;
