// Test notification with working backend format
import axios from 'axios';

const testNotification = async () => {
  console.log('🧪 Testing notification service...\n');
  
  const payload = {
    "recipients": ["developer1@example.com"],
    "subject": "New Task Assignment: Test from Frontend",
    "templateName": "task-assignment",
    "templateData": {
      "assigneeName": "Alice Developer",
      "assignerName": "Bob Project Manager",
      "taskTitle": "Test Notification Integration",
      "projectName": "Customer Portal",
      "taskDescription": "Testing if notification service works from frontend",
      "priority": "High",
      "dueDate": "October 20, 2025",
      "estimatedHours": "8",
      "status": "To Do",
      "taskUrl": "http://localhost:5173/projects/1/backlog?taskId=123"
    },
    "priority": "NORMAL"
  };

  try {
    console.log('📤 Sending request to: http://localhost:8084/api/v1/notifications/send');
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    console.log('');
    
    const response = await axios.post(
      'http://localhost:8084/api/v1/notifications/send',
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Success!');
    console.log('📨 Response:', JSON.stringify(response.data, null, 2));
    console.log('');
    
  } catch (error) {
    console.log('❌ Error!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
};

testNotification();
