# 🧪 TEST NOTIFICATION IN BROWSER

## Step-by-Step Testing Guide

### Step 1: Open Your App
1. Go to http://localhost:3000 (or whatever port your dev server is on)
2. Press **F12** to open DevTools
3. Go to **Console** tab

### Step 2: Test Notification API Directly

Paste this code into the console and press Enter:

```javascript
// Test 1: Direct API call
fetch('http://localhost:8084/api/v1/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipients: ["test@example.com"],
    subject: "Test Notification",
    templateName: "task-assignment",
    templateData: {
      assigneeName: "Test User",
      assignerName: "You",
      taskTitle: "Test Task",
      projectName: "Test Project",
      taskDescription: "Testing",
      priority: "High",
      dueDate: "October 20, 2025",
      estimatedHours: "8",
      status: "To Do",
      taskUrl: "http://localhost:3000"
    },
    priority: "NORMAL"
  })
}).then(r => r.json()).then(d => {
  console.log('✅ API Test Result:', d);
  if (d.success) {
    console.log('🎉 Notification API is working!');
  } else {
    console.log('❌ API returned error:', d);
  }
}).catch(e => console.error('❌ API call failed:', e));
```

**Expected output:**
```
✅ API Test Result: {success: true, message: "Notification sent successfully", ...}
🎉 Notification API is working!
```

---

### Step 3: Create a Task and Watch the Console

Now create a task in your app:

1. Navigate to a project's backlog
2. Click "Create Task"
3. Fill in:
   - **Title**: Test Notification Task
   - **Assignee**: Select someone (**MUST select someone**)
   - **Reporter**: (optional for this test)
4. Click **Save**

### Step 4: Check Console Logs

You should see these logs in order:

```
✅ Expected logs:
➕ Creating new task
✅ Task created: {id: X, title: "...", assignee: "..."}
📧 Sending notification to assignee: "Name <email@example.com>"
NotificationService: Sending assignment notification {taskId: X, ...}
📧 Notification API Request: {...}
✅ Notification API Response: {status: 200, ...}
NotificationService: Assignment notification sent successfully
✅ Assignee notification sent successfully
```

### Step 5: Check Network Tab

1. Click on **Network** tab in DevTools
2. Filter by: `send`
3. You should see:
   - **POST** to `http://localhost:8084/api/v1/notifications/send`
   - **Status**: 200 OK
   - **Response**: `{success: true, ...}`

---

## ❌ If It Doesn't Work, Check These:

### Issue 1: No "Creating new task" log
**Problem**: Task creation form not submitting
**Fix**: Check if there are any validation errors or red errors in console

### Issue 2: "Task created" but assignee is null
**Problem**: Assignee not being saved
**Console shows**: `assignee: null` or `assignee: undefined`
**Fix**: 
- Make sure you SELECT someone in the assignee dropdown
- Check if the assignee dropdown is showing email addresses
- Check what `taskData` contains before creating the task

### Issue 3: "Sending notification" but no "NotificationService:" log
**Problem**: NotificationService not imported or executing
**Fix**:
- Hard refresh: **Ctrl+Shift+R**
- Restart dev server: Stop and run `npm run dev` again
- Check for import errors at the top of console

### Issue 4: "NotificationService:" log but API error
**Problem**: Network issue or wrong format
**Console shows**: Error message with details
**Fix**:
- Check if notification service is running: `Test-NetConnection -ComputerName localhost -Port 8084`
- Check Network tab for the failed request details
- Check if the payload format is correct

### Issue 5: API succeeds but no email
**Problem**: Email configuration in notification service
**Console shows**: ✅ Success message
**Fix**:
- Check SendGrid API key configuration in notification service
- Check spam folder
- Verify email address is valid

---

## 🔍 Debug Commands

### Check if notification service is running:
```powershell
Test-NetConnection -ComputerName localhost -Port 8084
```
Should show: `TcpTestSucceeded : True`

### Test notification directly:
```powershell
node test-notification.js
```
Should show: ✅ Success message

---

## 📋 Checklist

Before creating a task, verify:

- [ ] Dev server is running (http://localhost:3000)
- [ ] Notification service is running (port 8084)
- [ ] Backend is running (port 8080)
- [ ] Console is open (F12)
- [ ] Network tab is open (F12 → Network)
- [ ] You're looking at the right project's backlog

When creating a task:

- [ ] Title is filled
- [ ] **Assignee is selected** (this is required for notification!)
- [ ] Assignee dropdown shows email address
- [ ] Click Save

After creating:

- [ ] Check console for logs
- [ ] Check network tab for POST request
- [ ] Verify response is 200 OK

---

## 💡 Most Common Issue

**The #1 reason notifications don't send:**
```
The assignee field is not properly set when creating the task.
```

**How to verify:**
Look at the console log: `✅ Task created: {...}`

The task object should show:
```javascript
{
  id: 123,
  title: "Test",
  assignee: "John Doe <john@example.com>",  // ← Must have this!
  ...
}
```

If `assignee` is `null`, `undefined`, or an empty string, notifications won't send.

**Fix:**
- Make sure the assignee dropdown is populated with users
- Make sure you click on a user to select them
- Check if the dropdown shows email addresses in the format: "Name <email@example.com>"

---

## 🎯 Quick Diagnostic

Run this in the browser console while on the backlog page:

```javascript
// Check if NotificationService is available
console.log('NotificationService available?', typeof window.NotificationService !== 'undefined');

// Check notification API
fetch('http://localhost:8084/api/v1/notifications/send', {method: 'OPTIONS'})
  .then(r => console.log('✅ Notification API reachable'))
  .catch(e => console.log('❌ Cannot reach notification API:', e.message));
```

---

## 📞 Share This If It Doesn't Work

If notifications still don't work, copy and share:

1. **Console logs** (everything from "Creating new task" onwards)
2. **Network tab screenshot** (showing the send request or lack thereof)
3. **Task data**: What does the `✅ Task created:` log show?
4. **Assignee value**: What value is in `createdTask.assignee`?

This will help me debug the exact issue! 🔧
