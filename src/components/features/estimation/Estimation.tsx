import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface EstimationProps {
  projectId: string;
  projectName: string;
}

const Estimation: React.FC<EstimationProps> = () => {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  // Fibonacci sequence for planning poker
  const fibonacciCards = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
  
  const stories = [
    {
      id: 1,
      title: 'User Authentication System',
      description: 'Implement login, logout, and session management',
      complexity: 'Medium',
      estimatedPoints: 8,
      consensus: true,
      votes: [8, 8, 5, 8, 8]
    },
    {
      id: 2,
      title: 'Dashboard Analytics',
      description: 'Create charts and metrics for project overview',
      complexity: 'High',
      estimatedPoints: null,
      consensus: false,
      votes: [13, 21, 8, 13, 5]
    },
    {
      id: 3,
      title: 'Profile Settings Page',
      description: 'Allow users to update their profile information',
      complexity: 'Low',
      estimatedPoints: 5,
      consensus: true,
      votes: [5, 5, 3, 5, 5]
    },
    {
      id: 4,
      title: 'Email Notifications',
      description: 'Send automated emails for various events',
      complexity: 'Medium',
      estimatedPoints: null,
      consensus: false,
      votes: [8, 13, 5, 8, 21]
    }
  ];

  const teamMembers = [
    { name: 'John Doe', avatar: 'JD' },
    { name: 'Jane Smith', avatar: 'JS' },
    { name: 'Mike Johnson', avatar: 'MJ' },
    { name: 'Sarah Wilson', avatar: 'SW' },
    { name: 'Alex Brown', avatar: 'AB' }
  ];

  const handleCardClick = (value: number) => {
    setSelectedCard(value);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Planning Poker Estimation
      </Typography>

      {/* Current Story Being Estimated */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Story: Dashboard Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Create charts and metrics for project overview
        </Typography>
        <Chip label="High Complexity" color="error" />
      </Paper>

      {/* Planning Poker Cards */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Your Estimate
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {fibonacciCards.map((value) => (
            <Card 
              key={value}
              sx={{ 
                width: 60,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: selectedCard === value ? '2px solid' : '1px solid',
                borderColor: selectedCard === value ? 'primary.main' : 'divider',
                backgroundColor: selectedCard === value ? 'primary.light' : 'background.paper',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
              onClick={() => handleCardClick(value)}
            >
              <Typography variant="h6" color={selectedCard === value ? 'white' : 'text.primary'}>
                {value}
              </Typography>
            </Card>
          ))}
          <Card 
            sx={{ 
              width: 60,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: selectedCard === -1 ? '2px solid' : '1px solid',
              borderColor: selectedCard === -1 ? 'primary.main' : 'divider',
              backgroundColor: selectedCard === -1 ? 'primary.light' : 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
            onClick={() => handleCardClick(-1)}
          >
            <HelpOutlineIcon color={selectedCard === -1 ? 'inherit' : 'action'} />
          </Card>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained">Submit Vote</Button>
          <Button variant="outlined">Reveal Cards</Button>
          <Button variant="outlined">Reset Votes</Button>
        </Box>
      </Paper>

      {/* Team Voting Status */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Team Voting Status
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {teamMembers.map((member) => (
            <Box key={member.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {member.avatar}
              </Avatar>
              <Typography variant="body2">{member.name}</Typography>
              <Chip 
                label="Voted" 
                size="small" 
                color="success" 
                variant="outlined"
              />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Stories Estimation Table */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Stories Estimation
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Story</TableCell>
                <TableCell>Complexity</TableCell>
                <TableCell>Estimates</TableCell>
                <TableCell>Final Points</TableCell>
                <TableCell>Consensus</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stories.map((story) => (
                <TableRow key={story.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{story.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {story.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={story.complexity} 
                      size="small"
                      color={getComplexityColor(story.complexity) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {story.votes.map((vote, index) => (
                        <Chip key={index} label={vote} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {story.estimatedPoints ? (
                      <Typography variant="h6" color="primary">
                        {story.estimatedPoints}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Pending
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {story.consensus ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <HelpOutlineIcon color="warning" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Estimation;
