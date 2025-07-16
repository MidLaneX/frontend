import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import FolderIcon from '@mui/icons-material/Folder'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import KanbanColumn from './KanbanColumn.tsx'
import TaskCard from './TaskCard.tsx'
import TaskDetailModal from './TaskDetailModal.tsx'
import CreateIssueModal from './CreateIssueModal.tsx'
import ProjectFilters from './ProjectFilters.tsx'
import type { FilterState } from './ProjectFilters.tsx'
import { projects } from '../data.ts'
import type { Task } from '../data.ts'

const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const project = projects.find(p => p.id === projectId)
  
  if (!project) {
    return (
      <Box sx={{ 
        p: 6, 
        textAlign: 'center',
        bgcolor: '#FAFBFC',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <FolderIcon sx={{ fontSize: 64, color: '#DFE1E6', mb: 2 }} />
        <Typography variant="h5" sx={{ color: '#172B4D', fontWeight: 600, mb: 1 }}>
          Project not found
        </Typography>
        <Typography sx={{ color: '#5E6C84' }}>
          The project you're looking for doesn't exist or may have been moved.
        </Typography>
        <Button 
          variant="outlined" 
          href="/" 
          sx={{ mt: 3, textTransform: 'none' }}
        >
          Back to Projects
        </Button>
      </Box>
    )
  }

  const [tasks, setTasks] = useState<Task[]>(project.tasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    assignee: [],
    priority: [],
    type: [],
    status: []
  })

  const statuses: Task['status'][] = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done']

  // Calculate project metrics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'Done').length

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    )
  }

  const handleCreateIssue = (issueData: Omit<Task, 'id' | 'comments'>) => {
    const newTask: Task = {
      ...issueData,
      id: `task-${Date.now()}`,
      comments: []
    }
    setTasks(prev => [...prev, newTask])
  }

  const handleAddTask = (status: string) => {
    console.log('Adding task to column:', status)
    setIsCreateIssueOpen(true)
    // Pre-fill the status when creating new issue: status
  }

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !(task.description?.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false
    }
    
    // Assignee filter
    if (filters.assignee.length > 0 && !filters.assignee.includes(task.assignee)) {
      return false
    }
    
    // Priority filter
    if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false
    }
    
    // Type filter
    if (filters.type.length > 0 && !filters.type.includes(task.type)) {
      return false
    }
    
    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false
    }
    
    return true
  })

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as Task['status']

    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    )
  }

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      bgcolor: '#f9f9f9' // Softer background color
    }}>
      {/* Redesigned Header */}
      <Box sx={{ 
        bgcolor: 'white',
        borderBottom: '1px solid #e9e9e9',
        px: 3,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Breadcrumbs 
            separator="›"
            sx={{ 
              '& .MuiBreadcrumbs-separator': { color: '#999' },
              '& .MuiLink-root': { 
                color: '#555',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': { color: '#000' }
              }
            }}
          >
            <Link href="/">Projects</Link>
            <Typography sx={{ color: '#111', fontSize: '14px', fontWeight: 600 }}>
              {project.name}
            </Typography>
          </Breadcrumbs>
          <IconButton size="small" sx={{ color: '#777', '&:hover': { bgcolor: '#f0f0f0' } }}>
            <StarBorderIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AvatarGroup 
            max={5}
            sx={{ 
              '& .MuiAvatar-root': { 
                width: 28, 
                height: 28,
                fontSize: '12px',
                fontWeight: 600,
                border: '2px solid white'
              }
            }}
          >
            {project.teamMembers.map((member, index) => (
              <Avatar 
                key={index} 
                sx={{ bgcolor: '#4A90E2', cursor: 'pointer' }}
                title={member.name}
              >
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Avatar>
            ))}
          </AvatarGroup>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateIssueOpen(true)}
            sx={{
              bgcolor: '#4A90E2',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '13px',
              px: 2,
              py: 0.75,
              borderRadius: 1.5,
              boxShadow: 'none',
              '&:hover': { 
                bgcolor: '#357ABD',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }
            }}
          >
            Create Issue
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Filters Section */}
        <Box sx={{ 
          bgcolor: 'white',
          borderBottom: '1px solid #e9e9e9',
          px: 3,
          py: 1
        }}>
          <ProjectFilters
            onSearchChange={setSearchTerm}
            onFiltersChange={setFilters}
            teamMembers={project.teamMembers}
          />
        </Box>

        {/* Kanban Board */}
        <Box sx={{ 
          flexGrow: 1,
          p: 2,
          overflow: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none'
        }}>
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              height: '100%',
              minWidth: 'fit-content'
            }}>
              {statuses.map((status) => (
                <Box
                  key={status}
                  sx={{
                    width: 280,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'transparent'
                  }}
                >
                  {/* Modern Column Header */}
                  <Box sx={{
                    px: 1,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Typography sx={{ 
                      fontWeight: 600,
                      color: '#333',
                      fontSize: '14px'
                    }}>
                      {status}
                    </Typography>
                    <Typography sx={{
                      bgcolor: '#e9e9e9',
                      color: '#555',
                      fontWeight: 600,
                      fontSize: '12px',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1
                    }}>
                      {filteredTasks.filter(task => task.status === status).length}
                    </Typography>
                  </Box>

                  {/* Column Content */}
                  <KanbanColumn
                    id={status}
                    title={status}
                    tasks={filteredTasks.filter(task => task.status === status)}
                    onTaskClick={handleTaskClick}
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

      <TaskDetailModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={selectedTask} 
        onUpdateTask={handleUpdateTask}
      />
      
      <CreateIssueModal
        open={isCreateIssueOpen}
        onClose={() => setIsCreateIssueOpen(false)}
        onCreateIssue={handleCreateIssue}
        project={project}
      />
    </Box>
  )
}

export default ProjectPage
