import React, { useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import ProjectFilters from './ProjectFilters';
import type { FilterState } from './ProjectFilters';
import type { Project, Task } from '../types';

interface ProjectBoardProps {
  project: Project;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCreateTask: () => void;
  onDragEnd: (event: DragEndEvent) => void;
}

const ProjectBoard: React.FC<ProjectBoardProps> = ({
  project,
  tasks,
  onTaskClick,
  onCreateTask,
  onDragEnd
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    assignee: [],
    priority: [],
    type: [],
    status: []
  });

  const statuses: Task['status'][] = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    onDragEnd(event);
  };

  const handleAddTask = (_status: string) => {
    onCreateTask();
  };

  // Apply filters and search
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.assignee.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Assignee filter
    if (filters.assignee.length > 0 && !filters.assignee.includes(task.assignee)) {
      return false;
    }

    // Priority filter
    if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false;
    }

    // Type filter
    if (filters.type.length > 0 && !filters.type.includes(task.type)) {
      return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false;
    }

    return true;
  });

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Board Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#172B4D', mb: 1 }}>
            Board
          </Typography>
          <Typography variant="body2" sx={{ color: '#5E6C84' }}>
            Visualize your work and manage your team's workflow
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateTask}
          sx={{
            bgcolor: '#0052CC',
            '&:hover': { bgcolor: '#0747A6' },
            textTransform: 'none',
            borderRadius: 2
          }}
        >
          Create Issue
        </Button>
      </Box>

      {/* Filters */}
      <ProjectFilters
        onSearchChange={setSearchTerm}
        onFiltersChange={setFilters}
        teamMembers={project.teamMembers}
      />

      {/* Kanban Board */}
      <Box sx={{ flex: 1, mt: 2 }}>
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              height: '100%',
              overflowX: 'auto',
              pb: 2
            }}
          >
            {statuses.map((status) => (
              <Box key={status} sx={{ minWidth: 300, flex: '0 0 300px' }}>
                {/* Column Header */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                    px: 1
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: '#172B4D',
                      textTransform: 'uppercase',
                      fontSize: '12px',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {status}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#5E6C84',
                      bgcolor: '#F4F5F7',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    {filteredTasks.filter(task => task.status === status).length}
                  </Typography>
                </Box>

                {/* Column Content */}
                <KanbanColumn
                  id={status}
                  title={status}
                  tasks={filteredTasks.filter(task => task.status === status)}
                  onTaskClick={onTaskClick}
                  onAddTask={handleAddTask}
                />
              </Box>
            ))}
          </Box>
          
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </Box>
    </Box>
  );
};

export default ProjectBoard;
