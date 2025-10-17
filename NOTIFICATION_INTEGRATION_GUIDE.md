# Task Notification System Integration Guide

## Overview
This system automatically sends email notifications when:
1. **Task is created** - Notifications sent to both assignee and reporter
2. **Task status changes to "Review"** - Notification sent to reporter for review
3. **Task status changes to "In Progress"** - Notification sent to assignee
4. **Assignee/Reporter is changed** - Notification sent to new assignee/reporter

## Quick Start

### 1. Import the notification hook in your feature component:

```typescript
import { useTaskNotifications } from "@/hooks/useTaskNotifications";
```

### 2. Initialize the hook in your component:

```typescript
const YourFeatureComponent: React.FC<Props> = ({
  projectId,
  projectName,
  templateType,
}) => {
  const {
    sendTaskCreationNotifications,
    handleStatusChangeNotification,
    isSendingNotification,
  } = useTaskNotifications({
    projectId,
    projectName: projectName || `Project ${projectId}`,
    templateType,
  });

  // Your component logic...
};
```

### 3. Send notifications when creating a task:

```typescript
const handleSaveTask = async (taskData: Partial<Task>) => {
  try {
    // Create the task
    const createdTask = await TaskService.createTask(
      projectId,
      taskData as Omit<Task, "id">,
      templateType,
    );

    // Send notifications to assignee and reporter
    if (createdTask && (taskData.assignee || taskData.reporter)) {
      await sendTaskCreationNotifications(createdTask);
    }

    // Refresh tasks
    fetchTasks();
  } catch (error) {
    console.error("Failed to create task:", error);
  }
};
```

### 4. Send notifications when updating task status:

```typescript
const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
  // Get the task before updating
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  
  const oldStatus = task.status;

  try {
    // Update the status
    const updatedTask = await TaskService.updateTaskStatus(
      projectId,
      taskId,
      newStatus,
      templateType,
    );

    if (updatedTask) {
      // Send status change notifications
      await handleStatusChangeNotification(updatedTask, oldStatus, newStatus);
      
      // Update local state
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    }
  } catch (error) {
    console.error("Failed to update task status:", error);
  }
};
```

### 5. Send notifications when updating assignee/reporter:

```typescript
const handleUpdateTask = async (taskData: Partial<Task>) => {
  if (editTask) {
    const updatedTask = await TaskService.updateTask(
      projectId,
      Number(editTask.id),
      taskData,
      templateType,
    );

    if (updatedTask) {
      // Check if assignee or reporter changed
      const assigneeChanged = editTask.assignee !== taskData.assignee;
      const reporterChanged = editTask.reporter !== taskData.reporter;

      if (assigneeChanged && taskData.assignee) {
        await sendTaskCreationNotifications({
          ...updatedTask,
          assignee: taskData.assignee,
        } as Task);
      }

      if (reporterChanged && taskData.reporter) {
        await sendTaskCreationNotifications({
          ...updatedTask,
          reporter: taskData.reporter,
        } as Task);
      }
    }
  }
};
```

## Features Integrated

### ✅ Backlog (`/components/features/backlog/index.tsx`)
- ✅ Notifications on task creation
- ✅ Notifications on status change to "Review"
- ✅ Notifications on status change to "In Progress"
- ✅ Notifications on assignee/reporter change

### 🔲 Other Features (To be integrated)
You can easily integrate notifications into:
- `/components/features/board/` - Kanban board
- `/components/features/scrum_board/` - Scrum board
- `/components/features/sprint/` - Sprint management
- `/components/features/timeline/` - Timeline view
- And any other feature that manages tasks

## Notification Types

### 1. Task Assignment Notification
**Triggered when:**
- New task is created with assignee
- Assignee is changed
- Reporter is assigned/changed

**Email Template:** `task-assignment`

**Notification Data:**
```typescript
{
  assigneeName: "John Doe",
  assignerName: "Jane Manager",
  taskTitle: "Implement User Authentication",
  projectName: "Customer Portal",
  taskDescription: "Create a secure authentication system...",
  priority: "High",
  dueDate: "July 10, 2025",
  estimatedHours: "16",
  status: "To Do",
  taskUrl: "http://localhost:3000/projects/6/scrum?taskId=123"
}
```

### 2. Task Review Notification
**Triggered when:**
- Task status changes to "Review"

**Email Template:** `task-assignment` (reused with different context)

**Sent to:** Reporter (reviewer)

### 3. Task In Progress Notification
**Triggered when:**
- Task status changes to "In Progress"

**Sent to:** Assignee

## API Endpoint

**URL:** `http://localhost:8084/api/v1/notifications/send`

**Method:** `POST`

**Request Body:**
```json
{
  "recipients": ["developer@example.com"],
  "subject": "New Task Assignment: Task Title",
  "templateName": "task-assignment",
  "templateData": {
    "assigneeName": "John Doe",
    "assignerName": "Jane Manager",
    "taskTitle": "Task Title",
    "projectName": "Project Name",
    "taskDescription": "Task description...",
    "priority": "High",
    "dueDate": "July 10, 2025",
    "estimatedHours": "16",
    "status": "To Do",
    "taskUrl": "http://localhost:3000/projects/6/scrum?taskId=123"
  },
  "priority": "HIGH"
}
```

## Important Notes

### Email Format
The system supports two email formats:
1. **Plain email:** `user@example.com`
2. **Display name + email:** `John Doe <user@example.com>`

The `NotificationService` automatically extracts the email and display name.

### Non-blocking Notifications
Notifications are sent asynchronously and won't block the UI. If notification sending fails, the task operation will still succeed.

### Current User Context
The system uses the `AuthContext` to get the current user's name for the "assignerName" or "changedBy" field.

### Task URL Generation
Task URLs are automatically generated based on:
- Current origin (`window.location.origin`)
- Project ID
- Template type
- Task ID

Example: `http://localhost:3000/projects/6/scrum?taskId=123`

## Troubleshooting

### Notifications not sending?
1. Check that the notification service is running on `http://localhost:8084`
2. Check browser console for errors
3. Verify that assignee/reporter emails are valid
4. Check network tab for failed API calls

### Wrong user name in notifications?
1. Ensure user is logged in and `AuthContext` has user data
2. Check that `userProfile` is fetched (has first_name, last_name)
3. Verify `tokenManager` has correct user data

### Notifications sent multiple times?
1. Check that you're not calling notification functions multiple times
2. Use the `isSendingNotification` flag to prevent duplicate sends
3. Check for duplicate event handlers

## Testing

### Test Task Creation Notification:
```typescript
// Create a task with assignee
const taskData = {
  title: "Test Task",
  description: "Test description",
  assignee: "test@example.com",
  reporter: "reviewer@example.com",
  status: "Todo",
  priority: "High",
  type: "Task",
};

await handleSaveTask(taskData);
// Expected: 2 emails sent (one to assignee, one to reporter)
```

### Test Status Change Notification:
```typescript
// Change task status to "Review"
await handleStatusChange(taskId, "Review");
// Expected: 1 email sent to reporter
```

## Configuration

### Customize Notification Behavior
Edit `/src/hooks/useTaskNotifications.ts` to:
- Add more status-based notifications
- Customize email priorities
- Add custom notification logic
- Filter which notifications to send

Example - Add notification for "Done" status:
```typescript
if (newStatus === "Done" && task.reporter) {
  // Send completion notification to reporter
  await sendReviewNotification(task, task.reporter);
}
```

## File Structure
```
src/
├── api/
│   └── endpoints/
│       └── notifications.ts          # Notification API endpoint
├── services/
│   ├── NotificationService.ts        # Notification service logic
│   └── TaskService.ts                # Task service with notification integration
├── hooks/
│   └── useTaskNotifications.ts       # React hook for easy integration
└── components/
    └── features/
        ├── backlog/
        │   └── index.tsx             # ✅ Integrated
        ├── board/
        ├── scrum_board/
        └── ... (other features to integrate)
```

## Support
For issues or questions, check:
- Console logs (look for ✅ and ❌ prefixes)
- Network tab in browser DevTools
- Notification service logs
