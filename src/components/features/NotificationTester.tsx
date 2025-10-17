import React, { useState } from 'react';
import { Box, Button, TextField, Alert, CircularProgress, Paper, Typography } from '@mui/material';
import { notificationsApi } from '@/api/endpoints/notifications';

/**
 * Test component to verify notification service connectivity
 * This helps debug if notifications are working
 */
const NotificationTester: React.FC = () => {
  const [email, setEmail] = useState('test@example.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const testNotification = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Testing notification service...');
      
      const testData = {
        recipients: [email],
        subject: 'New Task Assignment: Test Task from Frontend',
        templateName: 'task-assignment' as const,
        templateData: {
          assigneeName: 'Test User',
          assignerName: 'System Administrator',
          taskTitle: 'Test Task - Notification Service Check',
          projectName: 'Test Project Portal',
          taskDescription: 'This is a test notification to verify the service is working correctly. If you receive this email, the notification system is functioning properly.',
          priority: 'High',
          dueDate: 'October 20, 2025',
          estimatedHours: '16',
          status: 'To Do',
          taskUrl: window.location.href,
        },
        priority: 'NORMAL' as const,
      };

      console.log('📧 EXACT JSON being sent to API:');
      console.log(JSON.stringify(testData, null, 2));

      const response = await notificationsApi.sendNotification(testData);
      
      console.log('✅ Test notification response:', response);
      
      setResult({
        type: 'success',
        message: `✅ Notification sent successfully! Check ${email} for the test email. Response: ${JSON.stringify(response)}`,
      });
    } catch (error: any) {
      console.error('❌ Test notification failed:', error);
      
      let errorMessage = 'Failed to send notification. ';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage += 'Cannot connect to notification service. Make sure it\'s running on http://localhost:8084';
      } else if (error.response) {
        errorMessage += `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else {
        errorMessage += error.message;
      }
      
      setResult({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        maxWidth: 600, 
        mx: 'auto', 
        mt: 4,
        border: '2px dashed #1976d2',
      }}
    >
      <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
        🧪 Notification Service Tester
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Use this to test if the notification service is working properly.
        Make sure the service is running on <strong>http://localhost:8084</strong>
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Test Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          size="small"
          helperText="Enter an email address to send a test notification"
        />
        
        <Button
          variant="contained"
          onClick={testNotification}
          disabled={loading || !email}
          sx={{ minWidth: 150 }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Testing...
            </>
          ) : (
            'Send Test'
          )}
        </Button>
      </Box>

      {result && (
        <Alert severity={result.type} sx={{ mt: 2 }}>
          {result.message}
        </Alert>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary" component="div">
          <strong>What this does:</strong>
          <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
            <li>Tests connection to notification service</li>
            <li>Sends a real email using task-assignment template</li>
            <li>Shows detailed error messages if it fails</li>
            <li>Logs everything to browser console</li>
          </ul>
        </Typography>
      </Box>
    </Paper>
  );
};

export default NotificationTester;
