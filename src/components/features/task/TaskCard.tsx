import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import type { Task } from "@/types";
import BugReportIcon from '@mui/icons-material/BugReport';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EpicIcon from '@mui/icons-material/Flag';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import RemoveIcon from '@mui/icons-material/Remove';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'Highest':
      return <KeyboardDoubleArrowUpIcon sx={{ fontSize: 16, color: '#DE350B' }} />
    case 'High':
      return <KeyboardArrowUpIcon sx={{ fontSize: 16, color: '#FF5630' }} />
    case 'Medium':
      return <RemoveIcon sx={{ fontSize: 16, color: '#FF8B00' }} />
    case 'Low':
      return <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#36B37E' }} />
    case 'Lowest':
      return <KeyboardDoubleArrowDownIcon sx={{ fontSize: 16, color: '#00875A' }} />
    default:
      return <RemoveIcon sx={{ fontSize: 16, color: '#6B778C' }} />
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Bug':
      return <BugReportIcon sx={{ fontSize: 16, color: '#DE350B' }} />
    case 'Story':
      return <AutoStoriesIcon sx={{ fontSize: 16, color: '#36B37E' }} />
    case 'Epic':
      return <EpicIcon sx={{ fontSize: 16, color: '#6554C0' }} />
    case 'Task':
    default:
      return <TaskAltIcon sx={{ fontSize: 16, color: '#0052CC' }} />
  }
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        mb: 1,
        cursor: isDragging ? "grabbing" : "grab",
        bgcolor: "white",
        boxShadow: isDragging
          ? "0 8px 25px rgba(0,82,204,0.25)"
          : "0 1px 2px rgba(9,30,66,0.25)",
        borderRadius: 1,
        transform: isDragging ? "rotate(5deg)" : "none",
        transition: isDragging ? "none" : "all 0.2s ease",
        border: isDragging ? "2px solid #0052CC" : "1px solid transparent",
        "&:hover": {
          boxShadow: "0 2px 4px rgba(9,30,66,0.25)",
          transform: isDragging ? "rotate(5deg)" : "translateY(-2px)",
        },
        "&:active": {
          cursor: "grabbing",
        },
      }}
    >
      <CardContent
        sx={{ p: 2, "&:last-child": { pb: 2 } }}
        onClick={handleClick}
      >
        <Typography
          variant="body2"
          sx={{
            color: "#172B4D",
            fontWeight: 500,
            mb: 1,
            lineHeight: 1.3,
            cursor: "pointer",
          }}
        >
          {task.title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {getTypeIcon(task.type)}
            {getPriorityIcon(task.priority)}
            <Typography
              variant="caption"
              sx={{
                color: "#5E6C84",
                fontWeight: 500,
                bgcolor: "#F4F5F7",
                px: 1,
                py: 0.5,
                borderRadius: 0.5,
              }}
            >
              {task.id}
            </Typography>
            {task.storyPoints && (
              <Typography
                variant="caption"
                sx={{
                  color: "#0052CC",
                  fontWeight: 600,
                  bgcolor: "#E3FCEF",
                  px: 1,
                  py: 0.5,
                  borderRadius: 0.5,
                  minWidth: 20,
                  textAlign: "center",
                }}
              >
                {task.storyPoints}
              </Typography>
            )}
          </Box>

          <Avatar
            sx={{
              width: 24,
              height: 24,
              fontSize: 10,
              bgcolor: "#0052CC",
            }}
          >
            {task.assignee
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
