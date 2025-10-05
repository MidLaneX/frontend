# Team Assignment in Project Dashboard

This document explains the team assignment functionality integrated into the project dashboard and components.

## Features Added

### 1. Team Assignment During Project Creation

In the **CreateProjectModal**, users can now:
- Select a team to assign during project creation (optional)
- Choose from a list of available teams with member count information
- If no team is selected, the project is created without any team assignment

### 2. Team Assignment for Existing Projects

In **ProjectCard** components, users can:
- Click the "More Options" (⋮) menu button
- Select "Assign Team" to open the team assignment modal
- Choose from available teams and assign them to the project
- See immediate feedback when assignment is successful

### 3. Teams Data Management

- **useTeams Hook**: Centralized hook for managing teams data
- Mock teams data included for development/testing
- Easy to replace with real API calls when backend is ready

## Components Updated

### CreateProjectModal (`src/components/ui/CreateProjectModal.tsx`)
- Added team selection dropdown in the project details step
- Integrated with useTeams hook for dynamic team data
- Shows team names with member counts

### ProjectCard (`src/components/ui/ProjectCard.tsx`)
- Added context menu with "Assign Team" option
- Integrated AssignTeamModal for team assignment
- Added callback to refresh project data after assignment
- Uses useTeams hook for consistent team data

### Dashboard (`src/pages/Dashboard.tsx`)
- Handles team assignment during project creation
- Automatically assigns selected team after project creation
- Provides refresh callback to ProjectCard components
- Enhanced error handling for team assignment

### AssignTeamModal (`src/components/features/AssignTeamModal.tsx`)
- Existing modal component now integrated into project dashboard
- Shows project information and team selection
- Provides success/error feedback

## Data Flow

### Project Creation with Team Assignment:
1. User creates project and selects team (optional)
2. Project is created via `ProjectService.createProject()`
3. If team was selected, `ProjectService.assignTeamToProject()` is called
4. Team members are automatically assigned to the new project
5. Dashboard updates with new project data

### Team Assignment for Existing Projects:
1. User clicks "More Options" → "Assign Team" on project card
2. AssignTeamModal opens with available teams
3. User selects team and confirms assignment
4. `ProjectService.assignTeamToProject()` is called
5. Project data is refreshed to show updated team information

## Usage Examples

### Basic Project Creation with Team:
```typescript
// User creates project through UI
const projectData = {
  name: "New Project",
  type: "Software",
  templateType: "scrum",
  teamId: "101" // Optional team selection
};

// Dashboard handles the creation and team assignment
await handleCreateProject(projectData);
```

### Assign Team to Existing Project:
```typescript
// User clicks "Assign Team" from project card menu
// AssignTeamModal opens and user selects team
const assignments = await ProjectService.assignTeamToProject(
  projectId,
  templateType,
  teamId
);
```

## Mock Teams Data

Current mock teams include:
- Development Team Alpha (8 members)
- Development Team Beta (6 members)  
- Design Team (4 members)
- QA Team (5 members)
- DevOps Team (3 members)
- Data Team (4 members)

## Backend Integration

The implementation is ready for backend integration:
- API calls are already configured in `ProjectService`
- Mock data can be easily replaced with real API calls
- Error handling is in place for failed team assignments
- Success callbacks update UI appropriately

## UI/UX Features

- **Progressive Enhancement**: Team assignment is optional during creation
- **Context Menus**: Easy access to team assignment from project cards
- **Visual Feedback**: Loading states, success/error messages
- **Data Consistency**: Centralized teams data management
- **Responsive Design**: Works well on different screen sizes

## Future Enhancements

1. **Team Management**: Add, edit, delete teams functionality
2. **Role-based Assignment**: Assign users with specific roles
3. **Bulk Operations**: Assign multiple teams or projects at once
4. **Team Details**: Show team member details in assignment modal
5. **Assignment History**: Track team assignment changes over time