import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TaskCard from './TaskCard.tsx';
import type { Task } from '../data';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: (status: string) => void;
}

const getColumnConfig = (title: string) => {
  switch (title.toLowerCase()) {
    case 'backlog':
      return { 
        color: '#8993A4',
        bgColor: '#F8F9FA',
        borderColor: '#DFE1E6',
        chipColor: '#5E6C84'
      };
    case 'todo':
      return { 
        color: '#0052CC',
        bgColor: '#F4F5F7',
        borderColor: '#DFE1E6',
        chipColor: '#0052CC'
      };
    case 'in progress':
      return { 
        color: '#FF8B00',
        bgColor: '#FFF7E6',
        borderColor: '#FFCC91',
        chipColor: '#FF8B00'
      };
    case 'review':
      return { 
        color: '#6554C0',
        bgColor: '#F3F0FF',
        borderColor: '#B3A0FF',
        chipColor: '#6554C0'
      };
    case 'done':
      return { 
        color: '#00875A',
        bgColor: '#E3FCEF',
        borderColor: '#ABF5D1',
        chipColor: '#00875A'
      };
    default:
      return { 
        color: '#8993A4',
        bgColor: '#F8F9FA',
        borderColor: '#DFE1E6',
        chipColor: '#5E6C84'
      };
  }
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, tasks, onTaskClick, onAddTask }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const config = getColumnConfig(title);
  
  const completedTasks = tasks.filter(task => task.status === 'Done').length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <Paper
      ref={setNodeRef}
      elevation={0}
      sx={{
        width: 320,
        minWidth: 280,
        maxWidth: 360,
        flexShrink: 0,
        mr: 2,
        bgcolor: 'white',
        borderRadius: 3,
        border: `1px solid ${config.borderColor}`,
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        boxShadow: isOver ? '0 4px 20px rgba(0,82,204,0.15)' : '0 1px 3px rgba(9,30,66,0.25)',
        transform: isOver ? 'scale(1.02)' : 'scale(1)',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(9,30,66,0.15)',
          transform: 'translateY(-1px)'
        },
        '&:last-child': {
          mr: 0
        }
      }}
    >
      {/* Column Header */}
      <Box 
        ref={setNodeRef}
        sx={{ 
          p: 2.5, 
          borderBottom: `2px solid ${config.borderColor}`,
          bgcolor: config.bgColor,
          borderRadius: '12px 12px 0 0'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: config.color,
              fontWeight: 700,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={tasks.length}
              size="small"
              sx={{
                bgcolor: config.chipColor,
                color: 'white',
                fontWeight: 700,
                fontSize: '12px',
                height: 24,
                minWidth: 24,
                borderRadius: '12px',
                '& .MuiChip-label': { px: 1 }
              }}
            />
            
            <Tooltip title={`Add ${title.toLowerCase()} task`} arrow>
              <IconButton 
                size="small"
                onClick={() => onAddTask?.(id)}
                sx={{ 
                  p: 0.5,
                  color: config.color,
                  bgcolor: 'rgba(255,255,255,0.7)',
                  '&:hover': { 
                    bgcolor: 'white',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Progress Bar for columns with tasks */}
        {tasks.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: config.color, fontWeight: 600 }}>
                Progress
              </Typography>
              <Typography variant="caption" sx={{ color: config.color }}>
                {Math.round(progressPercentage)}%
              </Typography>
            </Box>
            <Box sx={{ 
              bgcolor: 'rgba(255,255,255,0.5)', 
              borderRadius: 2, 
              height: 4, 
              overflow: 'hidden' 
            }}>
              <Box sx={{ 
                width: `${progressPercentage}%`, 
                height: '100%', 
                bgcolor: config.color,
                transition: 'width 0.3s ease'
              }} />
            </Box>
          </Box>
        )}

            <Tooltip title="Column options" arrow>
              <IconButton 
                size="small"
                sx={{ 
                  p: 0.5,
                  color: config.color,
                  bgcolor: 'rgba(255,255,255,0.7)',
                  '&:hover': { 
                    bgcolor: 'white',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <MoreHorizIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Progress Bar for visual feedback */}
        <Box sx={{ 
          height: 3, 
          bgcolor: 'rgba(255,255,255,0.5)', 
          borderRadius: 1.5,
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            height: '100%', 
            bgcolor: config.color,
            width: `${Math.min(100, (tasks.length / 10) * 100)}%`,
            transition: 'width 0.3s ease'
          }} />
        </Box>
      </Box>
      
      {/* Tasks Container */}
      <Box 
        ref={setNodeRef}
        sx={{ 
          flexGrow: 1,
          p: 2,
          bgcolor: isOver ? `${config.bgColor}80` : 'transparent',
          transition: 'background-color 0.2s ease',
          minHeight: '200px',
          borderRadius: isOver ? '0 0 8px 8px' : 'none'
        }}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              color: '#8993A4',
              fontSize: '14px',
              fontStyle: 'italic'
            }}>
              {isOver ? 'Drop task here' : `No ${title.toLowerCase()} tasks`}
            </Box>
          ) : (
            tasks.map((task, index) => (
              <Box
                key={task.id}
                sx={{ 
                  mb: 2,
                  animation: `fadeIn 0.3s ease ${index * 0.1}s both`,
                  '@keyframes fadeIn': {
                    '0%': { opacity: 0, transform: 'translateY(10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' }
                  }
                }}
              >
                <TaskCard 
                  task={task} 
                  onClick={() => onTaskClick?.(task)}
                />
              </Box>
            ))
          )}
        </SortableContext>
      </Box>
    </Paper>
  );
};

export default KanbanColumn;
