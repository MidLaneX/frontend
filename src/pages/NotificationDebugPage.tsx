import React from 'react';
import { Box, Container, Typography, Paper, Divider } from '@mui/material';
import { NotificationTester } from '@/components/features';

/**
 * Debug page for testing notification functionality
 * Access at: /debug-notifications
 */
const NotificationDebugPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          🔔 Notification System Debug
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          This page helps you test and debug the notification system integration.
          Make sure the notification service is running on <strong>http://localhost:8084</strong>
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
            📋 Pre-flight Checklist
          </Typography>
          <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
            <li>✅ Notification service running on port 8084</li>
            <li>✅ Frontend running on port 3000 (or configured port)</li>
            <li>✅ Browser console open (F12) to see logs</li>
            <li>✅ Network tab open to see API calls</li>
          </Box>
        </Box>

        <NotificationTester />

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
            📝 What to Check
          </Typography>
          <Box component="ol" sx={{ pl: 3, color: 'text.secondary' }}>
            <li>
              <strong>Console Logs:</strong> Look for logs with emojis (🎯, 📮, 🚀, ✅)
            </li>
            <li>
              <strong>Network Tab:</strong> Should show POST request to <code>localhost:8084/api/v1/notifications/send</code>
            </li>
            <li>
              <strong>Request Payload:</strong> Check the JSON being sent matches the expected format
            </li>
            <li>
              <strong>Response:</strong> Should return 200 OK if successful
            </li>
            <li>
              <strong>Email:</strong> Check inbox for test email (may take a few seconds)
            </li>
          </Box>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 1, border: '1px solid', borderColor: 'info.light' }}>
          <Typography variant="body2" color="info.dark">
            <strong>💡 Tip:</strong> If the test fails, check the error message and browser console for details.
            Common issues include: service not running, network connectivity, invalid email format, or missing configuration.
          </Typography>
        </Box>

        <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 1, border: '1px solid', borderColor: 'warning.light' }}>
          <Typography variant="body2" color="warning.dark">
            <strong>⚠️ Note:</strong> This sends a REAL email. Make sure to use a valid test email address
            that you have access to.
          </Typography>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          🔗 Quick Links
        </Typography>
        <Box component="ul" sx={{ pl: 3, '& li': { mb: 1 } }}>
          <li>
            <Typography variant="body2">
              <strong>API Endpoint:</strong>{' '}
              <code>http://localhost:8084/api/v1/notifications/send</code>
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Documentation:</strong> See <code>NOTIFICATION_API_FORMAT.md</code> for details
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Backlog Integration:</strong> Go to{' '}
              <a href="/projects/1/backlog" style={{ color: '#1976d2' }}>
                Backlog
              </a>{' '}
              to test in real workflow
            </Typography>
          </li>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotificationDebugPage;
