import React from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Stack, Chip } from '@mui/material';
import { Timeline, Dashboard, Assignment, CalendarToday } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DemoHomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Enhanced Timeline',
      description: 'Jira-style timeline with end dates, due dates, overdue alerts, and advanced filtering',
      icon: <Timeline fontSize="large" />,
      route: '/timeline',
      color: 'primary',
      badge: 'NEW',
    },
    {
      title: 'Dashboard',
      description: 'Project overview and management dashboard',
      icon: <Dashboard fontSize="large" />,
      route: '/dashboard',
      color: 'secondary',
    },
    {
      title: 'Project Management',
      description: 'Complete project management with sprints and tasks',
      icon: <Assignment fontSize="large" />,
      route: '/projects/1/scrum',
      color: 'success',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          Frontend Project Demo
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Explore the enhanced features including the new Jira-style timeline
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center">
        {features.map((feature, index) => (
          <Card 
            key={index}
            elevation={4}
            sx={{ 
              minWidth: 300,
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 8,
              }
            }}
            onClick={() => navigate(feature.route)}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Box sx={{ color: `${feature.color}.main`, mb: 2 }}>
                  {feature.icon}
                </Box>
                {feature.badge && (
                  <Chip 
                    label={feature.badge} 
                    size="small" 
                    color="error"
                    sx={{ 
                      position: 'absolute', 
                      top: -10, 
                      right: -10,
                      fontWeight: 'bold'
                    }} 
                  />
                )}
              </Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {feature.description}
              </Typography>
              <Button 
                variant="contained" 
                color={feature.color as any}
                size="large"
                fullWidth
                sx={{ mt: 2 }}
              >
                Explore
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box textAlign="center" mt={6}>
        <Typography variant="body2" color="text.secondary">
          Click on any card above to explore the features
        </Typography>
      </Box>
    </Container>
  );
};

export default DemoHomePage;
