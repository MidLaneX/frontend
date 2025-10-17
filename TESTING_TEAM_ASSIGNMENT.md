# 🧪 Quick Testing Guide - Team Assignment

## Start Testing in 3 Steps

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Test Basic Team Assignment
1. Navigate to Dashboard
2. Find a project card
3. Click "Assign Team" button
4. Select a team from dropdown
5. Click "Assign Team"
6. ✅ Should see success message
7. ✅ Modal should auto-close after 2 seconds

### 3. Test New Team Detection
1. **Open AssignTeamModal** (don't close it)
2. In another tab/window, create a new team
3. Wait 2-3 seconds
4. ✅ New team should appear in the dropdown automatically
5. Select and assign the new team
6. ✅ Assignment should succeed

## 🔍 What to Verify

### Check Network Requests
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Assign a team
4. Find the request: `POST /projects/.../assignTeamToProject`
5. ✅ Verify URL contains: `&userId={number}`

**Expected URL Format:**
```
/projects/123/assignTeamToProject?templateType=scrum&teamId=5&userId=5
                                                                  ^^^^^^
                                                            This should be present!
```

### Check Console Logs
You should see logs like:
```
API: Assigning team to project: {userId: 5, projectId: 123, templateType: "scrum", teamId: 5}
ProjectService: Assigning team to project: {userId: 5, projectId: 123, ...}
ProjectService: Team assignment successful!
```

### Check Auto-Refresh
1. Open AssignTeamModal
2. Open Console
3. You should see periodic logs (every 2 seconds):
   - `API: Fetching teams with URL: ...`
4. Close the modal
5. ✅ Logs should stop (interval cleared)

## ✅ Success Criteria

- [ ] Teams dropdown loads successfully
- [ ] Can select a team
- [ ] Assignment succeeds with success message
- [ ] Network request includes `userId` parameter
- [ ] Modal auto-closes after success
- [ ] New teams appear within 2-3 seconds
- [ ] No console errors
- [ ] Auto-refresh stops when modal closes

## 🐛 Common Issues & Solutions

### Issue: "userId is undefined"
**Solution:** 
- Check localStorage: `localStorage.getItem("userId")`
- If null, login again to set userId
- Default fallback is "5"

### Issue: "Teams don't load"
**Solution:**
- Check orgId in localStorage
- Verify teamsApi.getTeams() is called
- Check Network tab for API errors

### Issue: "New teams don't appear"
**Solution:**
- Wait at least 2 seconds
- Check if auto-refresh interval is running
- Verify modal is still open
- Check Console for fetch errors

### Issue: "Assignment fails"
**Solution:**
- Check if user has permission (must be owner/admin)
- Verify teamId is valid
- Check backend API is running
- Check Network tab for error response

## 📊 Expected Behavior

### Timeline for New Team Detection:
```
0s:  CreateTeamModal: Create new team
     Backend: Team created (ID: 123)
     
2s:  AssignTeamModal: Auto-refresh triggers
     API: Fetch teams
     Backend: Returns teams including new team (ID: 123)
     UI: Dropdown updates with new team
     
3s:  User: Sees new team in dropdown
     User: Selects and assigns team
     
5s:  Success message displayed
     
7s:  Modal auto-closes
```

### Performance Metrics:
- **Team Detection:** < 2 seconds
- **Assignment Time:** < 1 second
- **Success Message:** 2 seconds
- **Modal Close:** Automatic

## 🎯 Test Scenarios

### Scenario 1: Fresh Assignment
- Project has no team assigned
- Assign Team A
- ✅ Should succeed immediately

### Scenario 2: Team Reassignment
- Project 1 has Team A
- Assign Team A to Project 2
- ✅ Should show warning
- ✅ Should allow reassignment
- ✅ Team A moved from Project 1 to Project 2

### Scenario 3: Create Then Assign
- Create new Team B
- Immediately open AssignTeamModal
- Wait 2 seconds
- ✅ Team B should appear
- Assign Team B
- ✅ Should succeed

### Scenario 4: Multiple Teams
- Create Team C, D, E
- Open AssignTeamModal
- ✅ All teams should appear within 2 seconds each
- Assign any team
- ✅ Should succeed

## 📝 Test Results Template

Copy this to document your test results:

```
=== TEST RESULTS ===
Date: __________
Tester: __________

✅ Basic Assignment: PASS / FAIL
✅ userId in API: PASS / FAIL
✅ New Team Detection: PASS / FAIL
✅ Auto-Refresh Works: PASS / FAIL
✅ Cleanup on Close: PASS / FAIL
✅ Reassignment Warning: PASS / FAIL
✅ Success Message: PASS / FAIL
✅ Auto-Close: PASS / FAIL

Issues Found:
1. _______________
2. _______________

Notes:
_______________
```

---

**Happy Testing! 🚀**

**Need Help?**
- Check TEAM_ASSIGNMENT_FIX.md for detailed documentation
- Check browser console for error messages
- Check Network tab for API request details
