# Team Assignment to Project

This document explains how to use the new team assignment functionality that allows you to assign entire teams to projects.

## Backend Endpoint

The backend provides the following endpoint:

```
POST /api/projects/{projectId}/assignTeamToProject?templateType={templateType}&teamId={teamId}
```

## Frontend Implementation

### 1. API Layer (`src/api/endpoints/projects.ts`)

Added the `assignTeamToProject` method:

```typescript
assignTeamToProject: (
  projectId: number,
  templateType: string,
  teamId: number,
) => {
  console.log("API: Assigning team to project:", {
    projectId,
    templateType,
    teamId,
  });
  return projectsApiClient.post<UserProjectDTO[]>(
    `/projects/${projectId}/assignTeamToProject?templateType=${templateType}&teamId=${teamId}`,
  );
};
```

### 2. Service Layer (`src/services/ProjectService.ts`)

Added the `assignTeamToProject` static method:

```typescript
static async assignTeamToProject(
  projectId: number,
  templateType: string,
  teamId: number
): Promise<UserProjectDTO[]> {
  try {
    console.log('ProjectService: Assigning team to project:', { projectId, templateType, teamId });
    const response = await projectsApi.assignTeamToProject(projectId, templateType, teamId);
    console.log('ProjectService: Team assignment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to assign team to project:', error);
    throw error;
  }
}
```

### 3. Types (`src/types/dto.ts`)

Updated the `UserProjectDTO` interface:

```typescript
export interface UserProjectDTO {
  id?: number | null;
  projectId: number;
  userId: number;
  role: string; // ADMIN, MEMBER, etc.
}
```

### 4. UI Component (`src/components/features/AssignTeamModal.tsx`)

Created a complete React component with Material-UI that provides:

- Team selection dropdown
- Loading states
- Error handling
- Success feedback
- Form validation

## Usage Examples

### Basic Usage in Service

```typescript
import { ProjectService } from "../services/ProjectService";

// Assign team ID 101 to project ID 1 with scrum template
const assignments = await ProjectService.assignTeamToProject(1, "scrum", 101);
console.log("Team members assigned:", assignments);
```

### Usage in React Component

```typescript
import { AssignTeamModal } from '../components/features';

function ProjectManagement() {
  const [modalOpen, setModalOpen] = useState(false);

  const availableTeams = [
    { id: 101, name: 'Development Team' },
    { id: 102, name: 'Design Team' },
    { id: 103, name: 'QA Team' }
  ];

  const handleSuccess = (assignments: UserProjectDTO[]) => {
    console.log('Team assigned successfully:', assignments);
    // Update your UI state here
  };

  return (
    <>
      <Button onClick={() => setModalOpen(true)}>
        Assign Team
      </Button>

      <AssignTeamModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={projectId}
        projectName="My Project"
        templateType="scrum"
        availableTeams={availableTeams}
        onSuccess={handleSuccess}
      />
    </>
  );
}
```

## Response Format

The API returns an array of `UserProjectDTO` objects representing each team member assigned to the project:

```typescript
[
  {
    id: 1,
    projectId: 1,
    userId: 501,
    role: "MEMBER",
  },
  {
    id: 2,
    projectId: 1,
    userId: 502,
    role: "MEMBER",
  },
];
```

## Error Handling

The service includes comprehensive error handling:

- Network errors
- Authentication errors
- Validation errors
- Server errors

All errors are logged and re-thrown for the calling component to handle appropriately.

## Requirements

To use this functionality, you need to:

1. Have valid authentication tokens
2. Provide a valid project ID
3. Provide a valid team ID
4. Specify the correct template type for the project

The backend will handle the creation of user-project relationships for all members of the specified team.
