# 🔍 Notification Debug Guide

## ✅ What We Confirmed

1. **Notification service is RUNNING** ✅
   - Port 8084 is listening
   - API format is correct
   - Test notification sent successfully
   
2. **Code has NO ERRORS** ✅
   - NotificationService.ts compiles
   - Backlog component compiles
   - All imports work

3. **Dev server is RUNNING** ✅
   - Frontend running without errors

---

## 🧪 How to Test & Debug

### Step 1: Open Browser Console
1. Open http://localhost:5173
2. Press F12 (Open DevTools)
3. Go to **Console** tab
4. Go to **Network** tab

### Step 2: Create a Task
1. Navigate to a project's backlog
2. Click "Create Task" button
3. Fill in:
   - **Title**: Test Notification
   - **Assignee**: Select someone (make sure email is visible)
   - **Reporter**: Select someone else
4. Click Save

### Step 3: Check Console Logs

**You SHOULD see these logs:**

```
💾 handleSave called with taskData: {...}
➕ Creating new task
✅ Task created: {...}
📧 Sending notification to assignee...
NotificationService: Sending assignment notification
📧 Notification API Request: {url: "http://localhost:8084/api/v1/notifications/send", ...}
✅ Notification API Response: {status: 200, data: {...}}
NotificationService: Assignment notification sent successfully
📧 Sending notification to reporter...
NotificationService: Sending reporter notification
📧 Notification API Request: {url: "http://localhost:8084/api/v1/notifications/send", ...}
✅ Notification API Response: {status: 200, data: {...}}
NotificationService: Reporter notification sent successfully
```

**If you DON'T see these logs, check:**

### Problem 1: No "handleSave" log
- ❌ Task creation isn't being called
- ✅ Make sure you're clicking the Save button
- ✅ Check if there are any errors before this point

### Problem 2: "Creating new task" but no "Task created"
- ❌ Backend API is failing
- ✅ Check if backend is running on port 8080
- ✅ Check console for backend errors

### Problem 3: "Task created" but no "Sending notification" logs
- ❌ Assignee/Reporter not set
- ✅ Make sure you selected someone in the form
- ✅ Check if `createdTask.assignee` and `createdTask.reporter` have values

### Problem 4: "Sending notification" but no "NotificationService:" log
- ❌ NotificationService not imported or executing
- ✅ Check browser console for import errors
- ✅ Refresh the page (hard refresh: Ctrl+Shift+R)

### Problem 5: "NotificationService:" log but API error
- ❌ Network issue or wrong format
- ✅ Check Network tab for failed requests (red)
- ✅ Click on the failed request to see error details

---

## 📊 Check Network Tab

1. Filter by "send" or "notification"
2. You should see POST requests to: `http://localhost:8084/api/v1/notifications/send`
3. Click on each request
4. Check:
   - **Status**: Should be 200 OK
   - **Request Payload**: Should match the format below
   - **Response**: Should have `success: true`

**Expected Request Format:**
```json
{
  "recipients": ["developer1@example.com"],
  "subject": "New Task Assignment: Test Task",
  "templateName": "task-assignment",
  "templateData": {
    "assigneeName": "Alice Developer",
    "assignerName": "Bob Manager",
    "taskTitle": "Test Task",
    "projectName": "My Project",
    "taskDescription": "Test description",
    "priority": "High",
    "dueDate": "October 20, 2025",
    "estimatedHours": "8",
    "status": "To Do",
    "taskUrl": "http://localhost:5173/projects/1/backlog?taskId=123"
  },
  "priority": "NORMAL"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "requestId": "some-uuid",
  "timestamp": 1760370593393
}
```

---

## 🚨 Common Issues

### Issue 1: "Cannot find module '@/services/NotificationService'"
**Fix:** Hard refresh browser (Ctrl+Shift+R) or restart dev server

### Issue 2: No network requests at all
**Possible causes:**
- Assignee/Reporter not selected in form
- Task creation failed before reaching notification code
- JavaScript error preventing execution

**Fix:** Check console for red errors

### Issue 3: Network request fails (404 or 500)
**Possible causes:**
- Notification service not running
- Wrong URL (check if it's hitting localhost:8084)
- CORS issue

**Fix:**
```bash
# Check if notification service is running
Test-NetConnection -ComputerName localhost -Port 8084
# Should show: TcpTestSucceeded : True
```

### Issue 4: Request format is wrong
**Possible causes:**
- NotificationService code not updated
- Old cached version in browser

**Fix:** 
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Restart dev server

---

## 🧪 Manual Test (Bypass UI)

Open browser console on http://localhost:5173 and run:

```javascript
// Test notification directly from browser console
const testNotification = async () => {
  const response = await fetch('http://localhost:8084/api/v1/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipients: ["test@example.com"],
      subject: "Test from Browser Console",
      templateName: "task-assignment",
      templateData: {
        assigneeName: "Test User",
        assignerName: "System",
        taskTitle: "Manual Test",
        projectName: "Test Project",
        taskDescription: "Testing from console",
        priority: "High",
        dueDate: "October 20, 2025",
        estimatedHours: "8",
        status: "To Do",
        taskUrl: "http://localhost:5173"
      },
      priority: "NORMAL"
    })
  });
  const data = await response.json();
  console.log('Result:', data);
};

testNotification();
```

**Expected output:**
```
Result: {success: true, message: "Notification sent successfully", requestId: "...", timestamp: ...}
```

---

## 📝 What to Report

If notifications still don't work, please share:

1. **Console logs** (copy all from Console tab)
2. **Network tab screenshot** showing the requests
3. **Any red errors** in the console
4. **Task data** you're using (assignee, reporter values)

---

## ✅ Success Checklist

- [ ] Port 8084 is listening (Test-NetConnection shows True)
- [ ] Dev server running without errors (npm run dev)
- [ ] No red errors in browser console
- [ ] Task has assignee AND reporter selected
- [ ] Console shows "📧 Sending notification..." logs
- [ ] Network tab shows POST to localhost:8084
- [ ] Response status is 200 OK
- [ ] Response has `success: true`
- [ ] Email received (check spam folder)

---

## 🎯 Quick Test Command

Run this to verify everything:

```powershell
# Check notification service
Test-NetConnection -ComputerName localhost -Port 8084

# Test notification API directly
node test-notification.js
```

Both should succeed! ✅
