# Notification System Debugging Guide

## ✅ Enhanced with Detailed Logging

The notification system has been updated with comprehensive logging to help identify issues. Follow these steps to debug.

## 📋 Pre-flight Checklist

### 1. **Check Notification Service is Running**
```bash
# The notification service should be running on:
http://localhost:8084
```

**Test it:**
```bash
curl http://localhost:8084/api/v1/notifications/send
```

### 2. **Open Browser Developer Console**
Press `F12` or Right-click → Inspect → Console tab

### 3. **Clear Console for Clean Output**
Click the 🚫 icon in console or press `Ctrl + L`

## 🐛 Debugging Steps

### Step 1: Create a Task with Assignee/Reporter

1. Open the backlog feature
2. Click "New Task"
3. Fill in task details
4. **IMPORTANT:** Select assignee and/or reporter from dropdowns
5. Click "Create Task"

### Step 2: Check Console Output

You should see logs like this:

```
💾 handleSave called with taskData: {title: "Test", assignee: "user@example.com", ...}
➕ Creating new task
✅ Task created: {id: 123, ...}
📬 Sending task creation notifications...
🎯 Starting task creation notifications: {taskId: 123, hasAssignee: true, ...}
📮 Queueing assignee notification...
🚀 Starting assignment notification process...
📧 Extracted notification details: {assigneeEmail: "user@example.com", ...}
📨 Preparing task assignment notification: {taskId: 123, ...}
📬 Sending notification request: {recipients: ["user@example.com"], ...}
📧 Sending notification request: {url: "/send", method: "post", ...}
✅ Notification sent successfully
✅ Assignment notification process completed
✅ Task creation notifications completed
```

### Step 3: Check Status Change to "Review"

1. Find a task in the backlog
2. Change its status dropdown to "Review"
3. Watch the console

Expected output:
```
📊 Status change initiated: {taskId: 123, oldStatus: "Todo", newStatus: "Review", reporter: "reviewer@example.com"}
🔄 Updating task 123 status to "Review"
✅ Task status updated successfully
📬 Triggering status change notification...
📊 Status changed: {oldStatus: "Todo", newStatus: "Review", reporter: "reviewer@example.com"}
🔍 Sending review notification to reporter...
📨 Preparing task review notification: {taskId: 123, reviewerEmail: "reviewer@example.com", ...}
📬 Sending notification request: {recipients: ["reviewer@example.com"], ...}
✅ Notification sent successfully
✅ Status change notification completed
```

## 🔍 Common Issues & Solutions

### Issue 1: ⚠️ "No assignee email provided, skipping notification"

**Cause:** Assignee/reporter not selected or empty string

**Solution:**
- Make sure you select a team member from the dropdown
- Check that the team has members assigned
- Verify team is assigned to the project

### Issue 2: ❌ "Failed to send notification" with "Network Error"

**Cause:** Notification service not running or wrong URL

**Solution:**
```bash
# Check if service is running
curl http://localhost:8084/api/v1/notifications/send

# If not running, start it
# (Use your specific command to start the service)
```

### Issue 3: ⚠️ "No team assigned to this project"

**Cause:** Project doesn't have a team assigned

**Solution:**
1. Go to Organization → Teams
2. Create or select a team
3. Assign the team to your project
4. Add members to the team

### Issue 4: ℹ️ "No notifications to send (no assignee or reporter)"

**Cause:** Task created without assigning anyone

**Solution:**
- This is normal behavior
- Tasks without assignee/reporter don't send notifications
- Assign someone to trigger notifications

### Issue 5: ❌ "CORS error" or "Access-Control-Allow-Origin"

**Cause:** CORS not configured on notification service

**Solution:**
Configure your notification service to allow CORS from `http://localhost:3000`:

```java
// Spring Boot example
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE")
                        .allowCredentials(true);
            }
        };
    }
}
```

### Issue 6: ❌ "404 Not Found" on /api/v1/notifications/send

**Cause:** Wrong endpoint URL or service not properly configured

**Solution:**
- Verify the notification service endpoint
- Check if it's `/api/v1/notifications/send` or different
- Update `NOTIFICATION_BASE_URL` in `/src/api/endpoints/notifications.ts`

### Issue 7: 📧 Notification request sent but no email received

**Cause:** Email service not configured or wrong email addresses

**Solution:**
1. Check notification service logs
2. Verify email SMTP configuration
3. Check spam/junk folder
4. Verify email addresses are correct
5. Test with a simple curl command:

```bash
curl -X POST http://localhost:8084/api/v1/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["your-email@example.com"],
    "subject": "Test Notification",
    "templateName": "task-assignment",
    "templateData": {
      "assigneeName": "Test User",
      "assignerName": "System",
      "taskTitle": "Test Task",
      "projectName": "Test Project",
      "taskDescription": "Test",
      "priority": "High",
      "dueDate": "Not set",
      "estimatedHours": "8",
      "status": "Todo",
      "taskUrl": "http://localhost:3000"
    },
    "priority": "NORMAL"
  }'
```

## 🎯 Logging Symbols Guide

| Symbol | Meaning |
|--------|---------|
| 💾 | Save operation started |
| ➕ | Creating new item |
| ✏️ | Updating existing item |
| 📊 | Status change |
| 🔄 | Processing/Updating |
| 📧 | Email extraction |
| 📨 | Preparing notification |
| 📬 | Sending notification |
| 📮 | Queueing notification |
| ✅ | Success |
| ❌ | Error |
| ⚠️ | Warning |
| ℹ️ | Information |
| ⏭️ | Skipping |
| 🚀 | Starting process |
| 🎯 | Target operation |
| 🔍 | Review notification |
| 👤 | User information |
| 🔗 | URL generation |

## 📊 Expected Flow Diagram

### Task Creation with Notifications:
```
User clicks "Create Task"
    ↓
💾 handleSave called
    ↓
➕ Creating new task
    ↓
✅ Task created
    ↓
📬 Sending task creation notifications
    ↓
🎯 Starting task creation notifications
    ↓
📮 Queueing assignee notification
    ↓
📮 Queueing reporter notification
    ↓
🚀 Starting assignment notification process (x2)
    ↓
📧 Extracted notification details
    ↓
📨 Preparing task assignment notification
    ↓
📬 Sending notification request
    ↓
📧 Axios request logged
    ↓
✅ Notification sent successfully
    ↓
✅ Assignment notification process completed (x2)
    ↓
✅ Task creation notifications completed
```

### Status Change to Review:
```
User changes status to "Review"
    ↓
📊 Status change initiated
    ↓
🔄 Updating task status
    ↓
✅ Task status updated successfully
    ↓
📬 Triggering status change notification
    ↓
📊 Status changed
    ↓
🔍 Sending review notification to reporter
    ↓
📨 Preparing task review notification
    ↓
📬 Sending notification request
    ↓
📧 Axios request logged
    ↓
✅ Notification sent successfully
    ↓
✅ Status change notification completed
```

## 🛠️ Manual Testing Checklist

- [ ] Notification service running on port 8084
- [ ] Browser console open and cleared
- [ ] Team assigned to project
- [ ] Team members added
- [ ] Create task with assignee - Check console logs
- [ ] Create task with reporter - Check console logs
- [ ] Create task with both - Check console logs
- [ ] Change status to "Review" - Check console logs
- [ ] Change status to "In Progress" - Check console logs
- [ ] Check email inbox for notifications
- [ ] Check notification service logs

## 📝 Useful Console Commands

```javascript
// Check if tokenManager has user data
tokenManager.getUserEmail()

// Check current project context
console.log("Project ID:", projectId)
console.log("Project Name:", projectName)

// Force trigger a test notification (paste in console)
fetch('http://localhost:8084/api/v1/notifications/send', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    recipients: ["test@example.com"],
    subject: "Test",
    templateName: "task-assignment",
    templateData: {
      assigneeName: "Test",
      assignerName: "Test",
      taskTitle: "Test",
      projectName: "Test",
      taskDescription: "Test",
      priority: "High",
      dueDate: "Not set",
      estimatedHours: "8",
      status: "Todo",
      taskUrl: "http://localhost:3000"
    },
    priority: "NORMAL"
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## 🆘 Still Not Working?

1. **Take a screenshot of the console output**
2. **Check Network tab** in DevTools:
   - Look for requests to `localhost:8084`
   - Check if they're failing (red color)
   - Click on the request to see details
3. **Check notification service logs** for errors
4. **Verify the email format** - should be valid email addresses
5. **Test with curl** to rule out frontend issues

## 📞 Getting Help

When reporting issues, please provide:
1. Screenshots of browser console
2. Screenshots of Network tab
3. Notification service logs
4. Steps to reproduce
5. What you expected vs what happened
