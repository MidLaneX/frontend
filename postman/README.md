# Postman API Testing Guide

This folder contains Postman collections and environments for testing the Project Management API.

## Files

- **Project_Management_API.postman_collection.json** - Complete API collection with all endpoints
- **Local_Environment.postman_environment.json** - Environment for local development (localhost:3000)
- **Production_Environment.postman_environment.json** - Environment for production (midlanex.duckdns.org)

## How to Import into Postman

### Option 1: Import via Postman App
1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop all 3 JSON files or click **Choose Files**
4. Click **Import**

### Option 2: Import via File Menu
1. Open Postman
2. Go to **File** → **Import**
3. Select the JSON files from this folder
4. Click **Open**

## Setting Up Environment

After importing:

1. Click the **Environments** dropdown (top right)
2. Select either:
   - **Local Development** - for testing against localhost:3000
   - **Production** - for testing against midlanex.duckdns.org

## Environment Variables

Each environment contains these variables:

| Variable | Description | Local Value | Production Value |
|----------|-------------|-------------|------------------|
| `baseUrl` | API base URL | `http://localhost:3000/api` | `https://midlanex.duckdns.org/api` |
| `userId` | Default user ID for testing | `5` | `5` |
| `orgId` | Default organization ID | `1` | `1` |

You can modify these values in Postman:
1. Click the environment name
2. Click **Edit**
3. Change the values as needed

## API Endpoints Included

### 1. Health Check
- **API Health Check** - `GET /health`
- **Root Endpoint** - `GET /`

### 2. Projects
- **Get All Projects (User)** - `GET /projects/user/:userId?orgId={{orgId}}&templateType=scrum`
- **Get Project by ID** - `GET /projects/:projectId`
- **Create Project** - `POST /projects`
- **Update Project** - `PUT /projects/:projectId`
- **Delete Project** - `DELETE /projects/:projectId`

### 3. Tasks
- **Get All Tasks (Project)** - `GET /tasks/project/:projectId?templateType=scrum`
- **Get Task by ID** - `GET /tasks/:taskId?templateType=scrum`
- **Create Task** - `POST /tasks?templateType=scrum`
- **Update Task** - `PUT /tasks/:taskId?templateType=scrum`
- **Delete Task** - `DELETE /tasks/:taskId?templateType=scrum`

### 4. Sprints
- **Get All Sprints (Project)** - `GET /sprints/project/:projectId?templateType=scrum`
- **Get Latest Sprint** - `GET /sprints/project/:projectId/latest?templateType=scrum`
- **Create Sprint** - `POST /sprints?templateType=scrum`

### 5. Organizations
- **Get All Organizations** - `GET /organizations`
- **Get Organization by ID** - `GET /organizations/:orgId`
- **Create Organization** - `POST /organizations`

## Quick Test Guide

### Test 1: Check if Backend is Running

1. Select your environment (Local or Production)
2. Open **Health Check** → **Root Endpoint**
3. Click **Send**
4. ✅ Success: You should get a response (status 200 or 404 with HTML)
5. ❌ Error: Backend is not running or not accessible

### Test 2: Fetch Projects

1. Open **Projects** → **Get All Projects (User)**
2. The request is pre-configured with:
   - `userId`: 5
   - `orgId`: 1
   - `templateType`: scrum
3. Click **Send**
4. ✅ Success: You should see an array of projects
5. ❌ Error: Check console for error details

### Test 3: Create a Task

1. Open **Tasks** → **Create Task**
2. Review the request body (pre-filled with sample data)
3. Modify fields as needed:
   ```json
   {
     "projectId": 1,
     "title": "Test Task",
     "description": "This is a test task",
     "priority": "Medium",
     "status": "Todo",
     "type": "Task",
     "assignee": "John Doe",
     "reporter": "Jane Smith",
     "dueDate": "2025-12-31",
     "storyPoints": 3,
     "sprintId": 1
   }
   ```
4. Click **Send**
5. ✅ Success: You should get the created task with an ID
6. ❌ Error: Check the error message

## Common Issues & Solutions

### Issue 1: Cannot connect to API
**Error:** `Error: connect ECONNREFUSED`

**Solution:**
- For Local: Make sure your backend server is running on port 3000
- For Production: Check if the server is accessible
- Try the Health Check request first

### Issue 2: 404 Not Found
**Error:** `404 Not Found`

**Solution:**
- Verify the endpoint URL is correct
- Check if the backend has that route implemented
- Make sure you're using the correct HTTP method (GET/POST/PUT/DELETE)

### Issue 3: 401 Unauthorized
**Error:** `401 Unauthorized`

**Solution:**
- Add authentication headers if your API requires them
- Check if you need to add a Bearer token

### Issue 4: Empty Response
**Error:** Returns `[]` (empty array)

**Solution:**
- Database might be empty
- Check if the userId or orgId exists in the database
- Try creating some data first using the POST requests

## Tips for Testing

1. **Start Simple**: Test health check first, then GET requests, then POST requests
2. **Check Variables**: Make sure userId and orgId are set correctly for your database
3. **Update IDs**: After creating resources, update the path variables (projectId, taskId) with the returned IDs
4. **Save Responses**: Use Postman's "Save as Example" feature to save successful responses
5. **Use Console**: Open Postman Console (View → Show Postman Console) to see detailed request/response logs

## Customizing Requests

### Change User or Organization ID
1. Click on the request
2. Go to **Params** tab
3. Modify `userId` or `orgId` values
4. Or update the environment variables globally

### Change Request Body
1. Click on a POST or PUT request
2. Go to **Body** tab
3. Modify the JSON as needed
4. Click **Send**

### Add Headers
1. Click on any request
2. Go to **Headers** tab
3. Add new headers (e.g., Authorization, X-Custom-Header)

## Backend Setup

If testing locally, make sure your backend is running:

```powershell
# Using the manage-backend script
.\manage-backend.ps1 -Action start

# Or manually
cd path\to\backend
npm install
npm start
```

The backend should be accessible at `http://localhost:3000/api`

## Need Help?

- Check the Postman documentation: https://learning.postman.com/
- Verify your backend logs for error details
- Use Postman Console to debug requests
- Check Network tab in browser DevTools to compare with frontend requests
