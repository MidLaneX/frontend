import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import IconButton from '@mui/material/IconButton';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SummaryIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import BacklogIcon from '@mui/icons-material/FormatListBulleted';
import BoardIcon from '@mui/icons-material/ViewKanban';

import type { Project, Task } from '../types';
import { getInitials } from '../utils';
import ProjectSummary from './ProjectSummary';
import ProjectTimeline from './ProjectTimeline';
import ProjectBacklog from './ProjectBacklog';
import ProjectBoard from './ProjectBoard';

// Types
interface ProjectNavigationProps {
  project: Project;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCreateTask: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDragEnd: (event: any) => void;
}

type TabValue = 'summary' | 'timeline' | 'backlog' | 'board';

// Constants
const TAB_CONFIG = [
  { value: 'summary' as TabValue, label: 'Summary', icon: <SummaryIcon fontSize="small" /> },
  { value: 'timeline' as TabValue, label: 'Timeline', icon: <TimelineIcon fontSize="small" /> },
  { value: 'backlog' as TabValue, label: 'Backlog', icon: <BacklogIcon fontSize="small" /> },
  { value: 'board' as TabValue, label: 'Board', icon: <BoardIcon fontSize="small" /> },
] as const;

/**
 * ProjectNavigation Component
 * 
 * Provides horizontal navigation tabs for different project views (Summary, Timeline, Backlog, Board)
 * similar to Jira's interface. Includes project header with breadcrumbs and team member avatars.
 */
const ProjectNavigation: React.FC<ProjectNavigationProps> = ({
  project,
  tasks,
  onTaskClick,
  onCreateTask,
  onUpdateTask,
  onDragEnd
}) => {
  // State
  const [activeTab, setActiveTab] = useState<TabValue>('board');

  // Event handlers
  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  }, []);

  /**
   * Renders the content for the currently active tab
   */
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'summary':
        return <ProjectSummary project={project} tasks={tasks} />;
      case 'timeline':
        return <ProjectTimeline project={project} tasks={tasks} />;
      case 'backlog':
        return (
          <ProjectBacklog
            tasks={tasks}
            onTaskClick={onTaskClick}
            onCreateTask={onCreateTask}
            onUpdateTask={onUpdateTask}
          />
        );
      case 'board':
        return (
          <ProjectBoard 
            project={project} 
            tasks={tasks} 
            onTaskClick={onTaskClick}
            onCreateTask={onCreateTask}
            onDragEnd={onDragEnd}
          />
        );
      default:
        return <ProjectSummary project={project} tasks={tasks} />;
    }
  }, [activeTab, project, tasks, onTaskClick, onCreateTask, onUpdateTask, onDragEnd]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Project Header */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'white',
          px: 3,
          py: 2
        }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link 
            underline="hover" 
            color="inherit" 
            href="/dashboard"
            sx={{ fontSize: '14px', color: '#5E6C84' }}
          >
            Projects
          </Link>
          <Typography sx={{ fontSize: '14px', color: '#172B4D', fontWeight: 500 }}>
            {project.name}
          </Typography>
        </Breadcrumbs>

        {/* Project Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#172B4D' }}>
              {project.name}
            </Typography>
            <IconButton size="small">
              <StarBorderIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AvatarGroup max={5}>
              {project.teamMembers.map((member, index) => (
                <Avatar 
                  key={index}
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    fontSize: '0.875rem',
                    bgcolor: '#0052CC'
                  }}
                  title={`${member.name} - ${member.role}`}
                >
                  {getInitials(member.name)}
                </Avatar>
              ))}
            </AvatarGroup>
          </Box>
        </Box>

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            minHeight: 48,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              bgcolor: '#0052CC'
            },
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              color: '#5E6C84',
              '&.Mui-selected': {
                color: '#0052CC',
                fontWeight: 600
              },
              '&:hover': {
                color: '#172B4D'
              }
            }
          }}
        >
          {TAB_CONFIG.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon}
                  {tab.label}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#FAFBFC' }}>
        {renderTabContent()}
      </Box>
    </Box>
  );
};

export default ProjectNavigation;
