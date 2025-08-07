# Backend Integration Update

## Summary
Successfully updated the frontend to work with your backend DTOs and API structure.

## Changes Made

### 1. Created DTO Types (`src/types/dto.ts`)
```typescript
// Matches your Java DTOs exactly
export interface ProjectDTO {
  id?: number;
  userId: number;
  name: string;
  templateType: string;
  features: string[];
}

export interface UserProjectRequestDTO {
  userId: number;
  role: string;
}

export interface UserProjectDTO {
  id: number;
  projectId: number;
  userId: number;
  role: string; // ADMIN, MEMBER, etc.
}
```

### 2. Updated API Endpoints (`src/api/endpoints/projects.ts`)
- **getProjects**: POST to `/projects/projectsOfUser` with proper payload structure
- **createProject**: Uses ProjectDTO structure  
- **updateProject**: Converts frontend data to ProjectDTO format

### 3. Updated ProjectService (`src/services/ProjectService.ts`)
- **getAllProjects**: Default userId=3, role='MEMBER', templateType='scrum'
- **createProject**: Automatically sets default values:
  - userId: 3 (default)
  - templateType: 'scrum'
  - features: [] (empty array)

### 4. Updated useProjects Hook (`src/hooks/useProjects.ts`)
- Default userId=3, role='MEMBER'
- Passes userId and role to all service calls
- Dependencies updated to reload when userId/role changes

### 5. Updated Components
- **Dashboard.tsx**: Gets userId/role from localStorage (defaults: userId=3, role='MEMBER')
- **Project.tsx**: Gets userId/role from localStorage (defaults: userId=3, role='MEMBER')

## Default Values Applied
As requested, the following defaults are set:
- **userId**: 3
- **templateType**: 'scrum'  
- **features**: [] (empty array)
- **role**: 'MEMBER'

## API Payload Structure

### Get Projects Request
```typescript
POST /projects/projectsOfUser
{
  "projectDTO": {
    "userId": 3,
    "name": "",
    "templateType": "scrum",
    "features": []
  },
  "userProjectRequestDTO": {
    "userId": 3,
    "role": "MEMBER"
  }
}
```

### Create Project Request
```typescript
POST /projects
{
  "userId": 3,
  "name": "Project Name",
  "templateType": "scrum",
  "features": []
}
```

## Frontend Attributes with Default Values
For frontend attributes that don't have backend data yet, we use defaults:
- **Project.type**: Will use 'Software' as default
- **Project.key**: Will be generated from project name
- **Project.description**: Will use empty string or project name
- **Project.timeline**: Will use default dates
- **Project.teamMembers**: Will use empty array
- **Project.tasks**: Will use empty array

## Usage in Components
```typescript
// Get user data from localStorage or use defaults
const userId = parseInt(localStorage.getItem('userId') || '3');
const role = localStorage.getItem('role') || 'MEMBER';

// Use the hook
const { projects, loading, error } = useProjects({ userId, role });
```

## Environment Configuration
Make sure your `.env.local` has the correct backend URL:
```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

## Ready to Test!
Your frontend is now properly configured to work with your backend DTOs. The integration handles:
1. ✅ Proper DTO structure for requests
2. ✅ Default values where backend data is missing  
3. ✅ Type safety maintained
4. ✅ Error handling for API failures
5. ✅ Loading states for better UX
