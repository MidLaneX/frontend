import React from 'react';
import { Box, Typography, Paper, Card, CardContent } from '@mui/material';

interface SummaryProps {
  projectId: string;
  projectName: string;
}

const Summary: React.FC<SummaryProps> = ({ projectId, projectName }) => {
  const summaryData = {
    totalTasks: 25,
    completedTasks: 12,
    inProgress: 8,
    blockedTasks: 2,
  };

  const completionRate = (summaryData.completedTasks / summaryData.totalTasks) * 100;

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Summary - {projectName}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Project ID: {projectId}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Tasks
              </Typography>
              <Typography variant="h4">
                {summaryData.totalTasks}
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                {summaryData.completedTasks}
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h4" color="info.main">
                {summaryData.inProgress}
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completion Rate
              </Typography>
              <Typography variant="h4" color="primary.main">
                {Math.round(completionRate)}%
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Paper>
    </Box>
  );
};

export default Summary;
