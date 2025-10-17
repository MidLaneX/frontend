# 📧 Notification System - Assignee & Reporter Emails

## ✅ What Happens When You Create a Task

When you create a task and assign team members, **TWO separate emails** are sent:

### 1. **Assignee Notification** 👤
**Sent to**: The person assigned to do the work  
**Subject**: `New Task Assignment: [Task Title]`  
**Purpose**: Notify the assignee they have work to do

### 2. **Reporter Notification** 📝
**Sent to**: The person who will track/report on the task  
**Subject**: `You are the Reporter for: [Task Title]`  
**Purpose**: Notify the reporter they need to monitor this task

---

## 🎯 Complete Flow

### When Creating a Task:

```
User Creates Task
    ├─ Assignee: "Alice <alice@example.com>"
    └─ Reporter: "Bob <bob@example.com>"
         ↓
Task Saved to Backend
         ↓
Notification Hook Triggered
         ↓
    ┌────┴────┐
    │         │
    ▼         ▼
Assignee    Reporter
Email       Email
```

### Email Details:

**📧 Email to Assignee (Alice):**
```
To: alice@example.com
Subject: New Task Assignment: Implement User Authentication
Template: task-assignment

Content:
- You have been assigned a new task
- Task Title: Implement User Authentication
- Assigned by: Bob Project Manager
- Priority: High
- Due Date: October 20, 2025
- Estimated Hours: 16
- [View Task Button]
```

**📧 Email to Reporter (Bob):**
```
To: bob@example.com
Subject: You are the Reporter for: Implement User Authentication
Template: task-assignment

Content:
- You have been assigned as reporter
- Task Title: Implement User Authentication
- Created by: Current User
- Priority: High
- Due Date: October 20, 2025
- Status: To Do
- [View Task Button]
```

---

## 🔄 When Status Changes to "Review"

**Additional email sent to Reporter:**

```
To: reporter@example.com
Subject: Task Ready for Review: [Task Title]
Template: task-assignment

Content:
- Task is now ready for your review
- Task Title: [Task Title]
- Changed by: [Current User]
- Priority: [Priority]
- Status: Review
- [Review Task Button]
```

---

## 💻 Console Output

When you create a task with both assignee and reporter:

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
  currentUserName: "Current User"
}

📬 Sending notification request to API: {
  "recipients": ["alice@example.com"],
  "subject": "New Task Assignment: Implement User Authentication",
  "templateName": "task-assignment",
  ...
}

✅ Assignment notification process completed

🚀 Starting reporter notification process... {
  taskId: 123,
  taskTitle: "Implement User Authentication",
  reporter: "Bob Manager <bob@example.com>"
}

📧 Reporter notification details: {
  reporterEmail: "bob@example.com",
  reporterName: "Bob Manager",
  currentUserName: "Current User"
}

📬 Sending reporter notification request to API: {
  "recipients": ["bob@example.com"],
  "subject": "You are the Reporter for: Implement User Authentication",
  "templateName": "task-assignment",
  ...
}

✅ Reporter notification process completed
✅ Task creation notifications completed
```

---

## 🧪 Testing

### Test Scenario 1: Create Task with Both Assignee & Reporter

1. **Go to Backlog page**
2. **Click "Add Task"**
3. **Fill in form**:
   - Title: "Test Notification Task"
   - Assignee: Select team member (e.g., "Alice Developer <alice@example.com>")
   - Reporter: Select team member (e.g., "Bob Manager <bob@example.com>")
   - Priority: High
   - Story Points: 2
   - Description: "Testing notifications"
4. **Save task**
5. **Check**:
   - Browser console for logs (🎯, 📮, 🚀, ✅)
   - Network tab → 2 POST requests to `localhost:8084`
   - Alice's email inbox → "New Task Assignment" email
   - Bob's email inbox → "You are the Reporter for" email

### Test Scenario 2: Create Task with Only Assignee

1. **Create task** with assignee but **no reporter**
2. **Result**: Only assignee receives email
3. **Console shows**: "⚠️ No reporter, skipping reporter notification"

### Test Scenario 3: Create Task with Only Reporter

1. **Create task** with reporter but **no assignee**
2. **Result**: Only reporter receives email
3. **Console shows**: "⚠️ No assignee, skipping assignee notification"

### Test Scenario 4: Change Status to Review

1. **Find existing task** with reporter
2. **Change status** to "Review"
3. **Result**: Reporter receives "Task Ready for Review" email
4. **Console shows**: "🔍 Sending review notification to reporter..."

---

## 📊 Notification Matrix

| Scenario | Assignee Email? | Reporter Email? | Review Email? |
|----------|----------------|-----------------|---------------|
| Create task with assignee only | ✅ Yes | ❌ No | ❌ No |
| Create task with reporter only | ❌ No | ✅ Yes | ❌ No |
| Create task with both | ✅ Yes | ✅ Yes | ❌ No |
| Change status to Review | ❌ No | ❌ No | ✅ Yes (to reporter) |

---

## 🔍 Subject Lines

| Notification Type | Subject Line |
|------------------|--------------|
| Assignee Notification | `New Task Assignment: [Task Title]` |
| Reporter Notification | `You are the Reporter for: [Task Title]` |
| Review Notification | `Task Ready for Review: [Task Title]` |

---

## 📋 Required Data Format

Team members must be in one of these formats:

✅ **Valid formats:**
- `"Alice Developer <alice@example.com>"` (Preferred)
- `"alice@example.com"` (Works, name extracted from email)

❌ **Invalid formats:**
- `"Alice Developer"` (No email - notification skipped)
- `""` (Empty - notification skipped)

---

## 🎯 API Requests

### Assignee Notification API Call:
```json
POST http://localhost:8084/api/v1/notifications/send
{
  "recipients": ["alice@example.com"],
  "subject": "New Task Assignment: Implement User Authentication",
  "templateName": "task-assignment",
  "templateData": {
    "assigneeName": "Alice Developer",
    "assignerName": "Bob Project Manager",
    "taskTitle": "Implement User Authentication",
    "projectName": "Customer Portal",
    "taskDescription": "Create a secure authentication system...",
    "priority": "High",
    "dueDate": "October 20, 2025",
    "estimatedHours": "16",
    "status": "To Do",
    "taskUrl": "http://localhost:3000/projects/5/backlog?taskId=123"
  },
  "priority": "HIGH"
}
```

### Reporter Notification API Call:
```json
POST http://localhost:8084/api/v1/notifications/send
{
  "recipients": ["bob@example.com"],
  "subject": "You are the Reporter for: Implement User Authentication",
  "templateName": "task-assignment",
  "templateData": {
    "assigneeName": "Bob Manager",
    "assignerName": "Current User",
    "taskTitle": "Implement User Authentication",
    "projectName": "Customer Portal",
    "taskDescription": "Create a secure authentication system...",
    "priority": "High",
    "dueDate": "October 20, 2025",
    "estimatedHours": "16",
    "status": "To Do",
    "taskUrl": "http://localhost:3000/projects/5/backlog?taskId=123"
  },
  "priority": "HIGH"
}
```

---

## ✅ Summary

**When you create a task:**
1. ✅ **Assignee gets email** → "New Task Assignment: [Title]"
2. ✅ **Reporter gets email** → "You are the Reporter for: [Title]"
3. ✅ **Both emails sent simultaneously** using `Promise.all()`
4. ✅ **Different subject lines** to distinguish roles
5. ✅ **Same template** (task-assignment) with role-appropriate content

**When status changes to Review:**
1. ✅ **Reporter gets email** → "Task Ready for Review: [Title]"
2. ✅ **Assignee does NOT get email** (they changed it)

---

**Updated**: 2025-10-13  
**Status**: ✅ Fully Implemented  
**Both Assignee & Reporter**: Receive notifications with distinct subject lines
