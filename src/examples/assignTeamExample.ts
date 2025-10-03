// Example of how to use the assignTeamToProject functionality

import { ProjectService } from '../services/ProjectService';
import type { UserProjectDTO } from '../types/dto';

/**
 * Example function to assign a team to a project
 */
export const assignTeamExample = async () => {
  try {
    const projectId = 1; // Replace with actual project ID
    const templateType = 'scrum'; // or other template types like 'kanban', 'waterfall'
    const teamId = 101; // Replace with actual team ID

    console.log('Assigning team to project...');
    
    const result: UserProjectDTO[] = await ProjectService.assignTeamToProject(
      projectId,
      templateType,
      teamId
    );

    console.log('Team assignment successful!');
    console.log('User-Project assignments created:', result);

    // The result will be an array of UserProjectDTO objects
    // Each object represents a user from the team being assigned to the project
    result.forEach((userProject: UserProjectDTO) => {
      console.log(`User ${userProject.userId} assigned to project ${userProject.projectId} with role: ${userProject.role}`);
    });

    return result;
  } catch (error) {
    console.error('Failed to assign team to project:', error);
    throw error;
  }
};

/**
 * Example of how to use it in a React component
 */
export const useAssignTeam = () => {
  const assignTeam = async (projectId: number, templateType: string, teamId: number) => {
    try {
      const assignments = await ProjectService.assignTeamToProject(projectId, templateType, teamId);
      // Handle success - maybe show a success message, update UI, etc.
      console.log('Team assigned successfully:', assignments);
      return assignments;
    } catch (error: any) {
      // Handle error - show error message to user
      const errorMessage = error.response?.data?.message || error.message || 'Failed to assign team';
      console.error('Assignment failed:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  return { assignTeam };
};