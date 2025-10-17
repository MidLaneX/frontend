# 🧪 Testing Guide - Project Report Sharing

## ✅ What to Test

### 1. Share Project Report Feature

#### Test Steps:
1. **Open Estimation Page**
   ```
   Navigate to: Projects → Select any project → Click "Estimation" tab
   ```

2. **Click "Share Report" Button**
   - Located at top-right corner
   - Blue button with share icon
   
3. **Verify Dialog Opens**
   - Title: "Share Project Report"
   - Should show team members list (if team assigned)
   - Should have email input field

4. **Test Team Member Selection**
   - ✅ Click checkboxes next to team members
   - ✅ Verify selected emails appear as chips at bottom
   - ✅ Click again to deselect

5. **Test Custom Email**
   - Type: `test@example.com`
   - Click "Add" button
   - Verify email appears in selected recipients
   - Try invalid email (no @ or .com) → Should show error

6. **Test Send Report**
   - Select at least 1 recipient
   - Click "Send Report" button
   - Should show "Sending..." with spinner
   - After 2-3 seconds: Success message with checkmark
   - Dialog auto-closes after 2 seconds

7. **Check Console Logs**
   ```
   Expected logs:
   📊 Sending project status update to: ["email1@test.com", "email2@test.com"]
   📧 Notification API Request: ...
   ✅ Notification API Response: { success: true, message: "Notification sent successfully" }
   ```

8. **Check Network Tab**
   - Open DevTools → Network tab
   - Filter: XHR
   - Look for POST to `http://localhost:8084/api/v1/notifications/send`
   - Status should be: `200 OK`
   - Response: `{ "success": true, "message": "..." }`

9. **Verify Email Payload**
   In Network tab, check the Request Payload:
   ```json
   {
     "recipients": ["test@example.com"],
     "subject": "Project Status Update: Project Name",
     "templateName": "project-update",
     "templateData": {
       "projectName": "...",
       "progressPercentage": 60,
       "tasksCompleted": 15,
       "tasksInProgress": 5,
       "tasksPending": 5,
       // ... more data
     },
     "priority": "NORMAL"
   }
   ```

---

### 2. PDF Download Feature

#### Test Steps:
1. **Click PDF Icon Button**
   - Red icon button next to "Share Report"
   - Has PDF document icon

2. **Verify Print Dialog Opens**
   - Browser's native print dialog should appear
   - Preview should show clean layout

3. **Check Print Preview**
   ✅ Should include:
   - Project name and title
   - All summary cards (Total Tasks, Completed, etc.)
   - All charts (status, priority, type, story points)
   - Recent activities list
   
   ❌ Should NOT include:
   - Navigation bar
   - Buttons (Share, Download, Refresh)
   - Tabs
   - Any interactive elements

4. **Save as PDF**
   - In print dialog, select "Save as PDF" as destination
   - Choose location and filename
   - Click "Save"
   - Verify PDF is created

5. **Open PDF**
   - Check all content is visible
   - Charts should be in color
   - Text should be readable
   - Layout should be professional

---

## 🎯 Expected Results

### Share Report - Success Criteria:
- ✅ Dialog opens smoothly
- ✅ Team members load from assigned team
- ✅ Can select/deselect members with checkboxes
- ✅ Can add custom emails
- ✅ Email validation works
- ✅ Selected recipients shown as chips
- ✅ Can remove selected recipients
- ✅ Send button disabled when no recipients
- ✅ API call succeeds (200 OK)
- ✅ Success message displays
- ✅ Dialog closes automatically

### PDF Download - Success Criteria:
- ✅ Print dialog opens
- ✅ Clean, professional layout
- ✅ All charts visible and colored
- ✅ No buttons/navigation in PDF
- ✅ Can save as PDF file
- ✅ PDF readable when opened

---

## 🔧 Troubleshooting

### Issue: Backend not receiving notification
**Solution:**
- Ensure backend is running on `http://localhost:8084`
- Check backend logs for incoming request
- Verify CORS settings allow frontend origin

### Issue: Team members not loading
**Solution:**
- Check if project has assigned team
- Open console for error messages
- Verify ProjectService.getAssignedTeam() works

### Issue: PDF shows buttons/tabs
**Solution:**
- Clear browser cache
- Ensure `print-styles.css` is imported
- Check `.no-print` class is applied to buttons

### Issue: Charts not in PDF
**Solution:**
- Some browsers need a moment to render charts
- Wait 2-3 seconds before printing
- Try different browser (Chrome recommended)

---

## 📧 Email Verification

If you have access to the email inbox:

1. **Check Inbox**
   - Email should arrive within seconds
   - Subject: "Project Status Update: [Project Name]"

2. **Verify Email Content**
   Should include:
   - Project name
   - Progress percentage
   - Tasks completed/in progress/pending
   - Milestones
   - Next steps
   - Link to project
   - Professional formatting

---

## 🎉 Quick Test Checklist

- [ ] Share button visible on Estimation page
- [ ] PDF button visible on Estimation page
- [ ] Share dialog opens
- [ ] Team members load (if team assigned)
- [ ] Can select team members
- [ ] Can add custom email
- [ ] Email validation works
- [ ] Can send report (API succeeds)
- [ ] Success message shows
- [ ] Print dialog opens for PDF
- [ ] PDF has clean layout
- [ ] Can save PDF file
- [ ] Console shows no errors
- [ ] Network shows 200 OK response

---

## 📊 Test Data Example

**Project with data:**
- At least 10 tasks
- Mix of statuses (Todo, In Progress, Done)
- Some Epic tasks for milestones
- Some high-priority tasks for next steps
- Assigned team with multiple members

This will generate a comprehensive report!
