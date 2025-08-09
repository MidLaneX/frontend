import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface ScrumBoardProps {
  projectId: string;
  projectName: string;
}

const ScrumBoard: React.FC<ScrumBoardProps> = () => {
  const columns = [
    {
      id: 'product_backlog',
      title: 'Product Backlog',
      color: '#f5f5f5',
      items: [
        {
          id: 1,
          title: 'User Registration System',
          description: 'Implement complete user registration with email verification',
          storyPoints: 8,
          assignee: 'John Doe',
          priority: 'High'
        },
        {
          id: 2,
          title: 'Mobile Responsive Design',
          description: 'Make the application responsive for mobile devices',
          storyPoints: 13,
          assignee: 'Jane Smith',
          priority: 'Medium'
        }
      ]
    },
    {
      id: 'sprint_backlog',
      title: 'Sprint Backlog',
      color: '#e3f2fd',
      items: [
        {
          id: 3,
          title: 'Login Form Validation',
          description: 'Add client-side and server-side validation',
          storyPoints: 5,
          assignee: 'Mike Johnson',
          priority: 'High'
        },
        {
          id: 4,
          title: 'Dashboard Layout',
          description: 'Create the main dashboard layout',
          storyPoints: 8,
          assignee: 'Sarah Wilson',
          priority: 'High'
        }
      ]
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      color: '#fff3e0',
      items: [
        {
          id: 5,
          title: 'User Profile Page',
          description: 'Design and implement user profile management',
          storyPoints: 13,
          assignee: 'Alex Brown',
          priority: 'Medium'
        }
      ]
    },
    {
      id: 'review',
      title: 'Review',
      color: '#f3e5f5',
      items: [
        {
          id: 6,
          title: 'Password Reset Flow',
          description: 'Implement forgot password functionality',
          storyPoints: 5,
          assignee: 'Emily Davis',
          priority: 'Medium'
        }
      ]
    },
    {
      id: 'done',
      title: 'Done',
      color: '#e8f5e8',
      items: [
        {
          id: 7,
          title: 'Project Setup',
          description: 'Initial project setup and configuration',
          storyPoints: 3,
          assignee: 'David Lee',
          priority: 'High'
        },
        {
          id: 8,
          title: 'Database Schema',
          description: 'Design and create database schema',
          storyPoints: 8,
          assignee: 'Lisa Kim',
          priority: 'High'
        }
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Scrum Board
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Story
        </Button>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        overflowX: 'auto',
        minHeight: '70vh',
        pb: 2
      }}>
        {columns.map((column) => (
          <Paper 
            key={column.id} 
            sx={{ 
              minWidth: 300,
              flex: '0 0 300px',
              backgroundColor: column.color,
              p: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                {column.title}
              </Typography>
              <Chip 
                label={column.items.length} 
                size="small" 
                variant="outlined"
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {column.items.map((item) => (
                <Card key={item.id} sx={{ cursor: 'pointer' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 'bold' }}>
                        {item.title}
                      </Typography>
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip 
                          label={`${item.storyPoints} SP`} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          label={item.priority} 
                          size="small" 
                          color={getPriorityColor(item.priority) as any}
                        />
                      </Box>
                      
                      <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                        {item.assignee.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                sx={{ 
                  borderStyle: 'dashed',
                  borderColor: 'grey.400',
                  color: 'text.secondary',
                  '&:hover': {
                    borderStyle: 'dashed',
                    borderColor: 'primary.main'
                  }
                }}
              >
                Add Item
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default ScrumBoard;
