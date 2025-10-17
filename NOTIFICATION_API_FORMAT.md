# 🎯 Notification API Integration - Exact Format Guide

## ✅ Working API Endpoint
```
POST http://localhost:8084/api/v1/notifications/send
```

## 📋 Exact Request Body Format

This is the **EXACT** format that your notification API expects:

```json
{
  "recipients": ["rashmikarathnayaka01@gmail.com"],
  "subject": "New Task Assignment: Implement User Authentication",
  "templateName": "task-assignment",
  "templateData": {
    "assigneeName": "Alice Developer",
    "assignerName": "Bob Project Manager",
    "taskTitle": "Implement User Authentication",
    "projectName": "Customer Portal",
    "taskDescription": "Create a secure authentication system using JWT tokens. Implement login, logout, and password reset functionality.",
    "priority": "High",
    "dueDate": "July 10, 2025",
    "estimatedHours": "16",
    "status": "To Do",
    "taskUrl": "https://example.com/tasks/auth-implementation"
  },
  "priority": "NORMAL"
}
```

## 🔄 How Frontend Maps Task Data to API Format

When a task is created in the frontend, it's automatically converted to this format:

### Task Object → API Request Mapping

| Task Field | API Field | Transformation | Example |
|------------|-----------|----------------|---------|
| `task.assignee` | `recipients[]` | Extract email from "Name \<email\>" | `"Alice <alice@example.com>"` → `["alice@example.com"]` |
| `task.title` | `subject` | Add prefix "New Task Assignment: " | `"Fix bug"` → `"New Task Assignment: Fix bug"` |
| `task.title` | `templateData.taskTitle` | Direct mapping | `"Fix bug"` |
| `task.assignee` | `templateData.assigneeName` | Extract name part | `"Alice <alice@example.com>"` → `"Alice"` |
| Current user | `templateData.assignerName` | Get from token | `"bob@example.com"` → `"Bob"` |
| `projectName` | `templateData.projectName` | From context | `"Customer Portal"` |
| `task.description` | `templateData.taskDescription` | Direct or default | `"Fix login bug"` or `"No description provided"` |
| `task.priority` | `templateData.priority` | Direct mapping | `"High"`, `"Medium"`, `"Low"` |
| `task.dueDate` | `templateData.dueDate` | Format to "Month Day, Year" | `"2025-07-10"` → `"July 10, 2025"` |
| `task.storyPoints` | `templateData.estimatedHours` | Calculate: points × 8 | `2` → `"16"` |
| `task.status` | `templateData.status` | Map "Todo" → "To Do" | `"Todo"` → `"To Do"` |
| Generated URL | `templateData.taskUrl` | Build from project/task ID | `"http://localhost:3000/projects/5/backlog?taskId=123"` |
| `task.priority` | `priority` | Map High/Highest → "HIGH" | `"High"` → `"HIGH"`, else `"NORMAL"` |

## 🚀 Integration Flow

### 1. Task Creation Flow
```typescript
// Step 1: User creates task in UI with assignee/reporter
const taskData = {
  title: "Implement User Authentication",
  assignee: "Alice Developer <alice@example.com>",
  reporter: "Bob Manager <bob@example.com>",
  priority: "High",
  storyPoints: 2,
  dueDate: "2025-07-10",
  // ... other fields
};

// Step 2: Task is saved to backend
const createdTask = await TaskService.createTask(projectId, taskData, templateType);

// Step 3: Notification hook is called
await sendTaskCreationNotifications(createdTask);

// Step 4: NotificationService formats data
NotificationService.sendTaskAssignmentNotification(
  task,
  projectName,
  "Alice Developer",
  "alice@example.com",
  "Bob Manager",
  "http://localhost:3000/projects/5/backlog?taskId=123"
);

// Step 5: API receives exact format
POST http://localhost:8084/api/v1/notifications/send
{
  "recipients": ["alice@example.com"],
  "subject": "New Task Assignment: Implement User Authentication",
  "templateName": "task-assignment",
  "templateData": { /* formatted as shown above */ },
  "priority": "HIGH"
}
```

### 2. Status Change to Review Flow
```typescript
// Step 1: User changes status to "Review"
handleStatusChange(taskId, "Review");

// Step 2: Notification hook detects status change
await handleStatusChangeNotification(task, "Todo", "Review");

// Step 3: Sends to reporter
NotificationService.sendTaskReviewNotification(
  task,
  projectName,
  reporterName,
  reporterEmail,
  currentUserName,
  taskUrl
);

// Step 4: API receives notification
POST http://localhost:8084/api/v1/notifications/send
{
  "recipients": ["reporter@example.com"],
  "subject": "Task Ready for Review: [Task Title]",
  "templateName": "task-assignment",
  "templateData": {
    // ... with status: "Review"
  },
  "priority": "NORMAL"
}
```

## 🧪 Testing the Integration

### Method 1: Use NotificationTester Component
```tsx
// Add to any page
import { NotificationTester } from '@/components/features';

<NotificationTester />
```

This will:
- Show a test form with email input
- Send a notification in the EXACT format shown above
- Display success/error messages
- Log the EXACT JSON being sent to console

### Method 2: Create a Task in Backlog
1. Go to Backlog page
2. Click "Add Task"
3. Fill in:
   - Title: "Test Notification Task"
   - Assignee: Select a team member with email
   - Reporter: Select a team member with email
   - Priority: High
   - Story Points: 2
4. Save task
5. Check browser console for logs (🎯, 📮, 📧, ✅)
6. Check email inbox

### Method 3: Change Status to Review
1. Find any task in backlog
2. Change status dropdown to "Review"
3. Check console for logs (📊, 🔍, ✅)
4. Reporter should receive email

## 📝 Console Output Example

When everything works correctly, you'll see:

```
🎯 Starting task creation notifications: {
  taskId: 123,
  taskTitle: "Implement User Authentication",
  hasAssignee: true,
  hasReporter: true,
  assignee: "Alice Developer <alice@example.com>",
  reporter: "Bob Manager <bob@example.com>"
}

📮 Queueing assignee notification...
📮 Queueing reporter notification...

🚀 Starting assignment notification process... {
  taskId: 123,
  taskTitle: "Implement User Authentication",
  assignee: "Alice Developer <alice@example.com>"
}

📧 Extracted notification details: {
  assigneeEmail: "alice@example.com",
  assigneeName: "Alice Developer",
  currentUserName: "Bob Manager",
  taskUrl: "http://localhost:3000/projects/5/backlog?taskId=123"
}

📨 Preparing task assignment notification: {
  taskId: 123,
  taskTitle: "Implement User Authentication",
  assigneeName: "Alice Developer",
  assigneeEmail: "alice@example.com",
  assignerName: "Bob Manager",
  projectName: "Customer Portal"
}

📬 Sending notification request to API: {
  "recipients": ["alice@example.com"],
  "subject": "New Task Assignment: Implement User Authentication",
  "templateName": "task-assignment",
  "templateData": {
    "assigneeName": "Alice Developer",
    "assignerName": "Bob Manager",
    "taskTitle": "Implement User Authentication",
    "projectName": "Customer Portal",
    "taskDescription": "Create a secure authentication system...",
    "priority": "High",
    "dueDate": "July 10, 2025",
    "estimatedHours": "16",
    "status": "To Do",
    "taskUrl": "http://localhost:3000/projects/5/backlog?taskId=123"
  },
  "priority": "HIGH"
}

✅ Task assignment notification sent successfully to alice@example.com
✅ Task creation notifications completed
```

## 🔍 Troubleshooting

### Issue: No console logs appear
**Solution**: The notification functions aren't being called
- Check if task has assignee/reporter selected
- Verify handleSave is called after task creation
- Check browser console for any JavaScript errors

### Issue: Console logs show but no API call
**Solution**: Check network connectivity
- Open DevTools → Network tab
- Look for POST request to `localhost:8084`
- Check if notification service is running
- Test with: `curl http://localhost:8084/api/v1/notifications/health`

### Issue: API returns 400/500 error
**Solution**: Check request format
- Copy the JSON from console log
- Compare with working example above
- Check for missing required fields
- Verify email format is valid

### Issue: Assignee/Reporter not extracted correctly
**Solution**: Check team member format
- Should be: `"Name <email@example.com>"` or just `"email@example.com"`
- Update team member data to include emails
- Check extractEmail/extractName helper functions

## 📊 Status Mapping

Frontend status values are mapped to match API format:

| Frontend Status | API Status |
|----------------|-----------|
| `"Todo"` | `"To Do"` |
| `"In Progress"` | `"In Progress"` |
| `"Review"` | `"Review"` |
| `"Done"` | `"Done"` |
| `"Backlog"` | `"Backlog"` |

## 🎯 Priority Mapping

| Task Priority | Email Priority |
|--------------|----------------|
| `"Highest"` | `"HIGH"` |
| `"High"` | `"HIGH"` |
| `"Medium"` | `"NORMAL"` |
| `"Low"` | `"NORMAL"` |
| `"Lowest"` | `"NORMAL"` |

---

**Updated**: 2025-10-13
**Status**: ✅ Ready for testing
**API Endpoint**: `http://localhost:8084/api/v1/notifications/send`
