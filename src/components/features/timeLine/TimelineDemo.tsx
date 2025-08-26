import React from 'react';
import { Box, Typography, Paper, Button, Stack } from '@mui/material';
import JiraStyleTimeline from '@/components/features/timeLine/JiraTimeline';
import { Timeline as TimelineIcon, Launch as LaunchIcon } from '@mui/icons-material';

const TimelineDemo: React.FC = () => {
  // Demo project ID
  const demoProjectId = 1;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      {/* Hero Section */}
      <Paper 
        elevation={4} 
        sx={{ 
          mx: 'auto', 
          maxWidth: 1200, 
          p: 4, 
          mb: 4, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Stack alignItems="center" spacing={3}>
          <TimelineIcon sx={{ fontSize: 80, opacity: 0.9 }} />
          <Typography variant="h3" fontWeight="bold">
            Enhanced Jira-Style Timeline
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 800, opacity: 0.9 }}>
            Complete project timeline with end dates, due dates, overdue alerts, 
            sprint tracking, milestone celebrations, and advanced filtering - 
            just like Jira!
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
              }}
              startIcon={<LaunchIcon />}
            >
              Explore Features
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Features Overview */}
      <Paper elevation={2} sx={{ mx: 'auto', maxWidth: 1200, p: 3, mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🚀 Enhanced Features
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              📅 Comprehensive Date Tracking
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Sprint start/end dates with duration tracking<br/>
              • Task due dates with overdue alerts<br/>
              • Milestone achievements with timestamps<br/>
              • Date range filtering and smart views
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" color="secondary" gutterBottom>
              🎯 Jira-Inspired UI/UX
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Alternating timeline layout<br/>
              • Color-coded priorities and statuses<br/>
              • Expandable event details<br/>
              • Interactive hover effects and animations
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" color="success.main" gutterBottom>
              🔍 Advanced Filtering
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Search by content, assignees, tags<br/>
              • Filter by event type, status, priority<br/>
              • Overdue-only view for urgent items<br/>
              • Smart date range selections
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Main Timeline */}
      <JiraStyleTimeline projectId={demoProjectId} />
    </Box>
  );
};

export default TimelineDemo;
