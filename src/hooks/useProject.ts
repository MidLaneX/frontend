import { useState, useEffect } from 'react';
import type { Project } from '../types';
import type { ProjectDTO } from '../types/dto';
import { projectsApi } from '../api/endpoints/projects';

interface UseProjectProps {
  projectId: number;
  template?: string;
}

interface UseProjectResult {
  project: Project | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch a single project with template-specific features
 * 
 * This hook fetches project data from the API and converts the ProjectDTO
 * response to the frontend Project type while preserving template-specific features.
 * 
 * @param projectId - The ID of the project to fetch
 * @param template - The template type (scrum, kanban, etc.) - defaults to 'scrum'
 */
export const useProject = ({ 
  projectId, 
  template = 'scrum' 
}: UseProjectProps): UseProjectResult => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    if (!projectId) {
      setError('Project ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching project ${projectId} with template: ${template}`);
      const response = await projectsApi.getProject(projectId, template);
      const projectDto: ProjectDTO = response.data;
      
      console.log('Project API Response:', projectDto);

      // Convert ProjectDTO to frontend Project type
      const frontendProject: Project = {
        id: projectDto.id || projectId,
        name: projectDto.name,
        templateType: projectDto.templateType,
        features: projectDto.features || [], // Dynamic features from API
        key: generateProjectKey(projectDto.name),
        description: projectDto.name, // Use name as description for now
        timeline: {
          start: new Date().toISOString().split('T')[0],
          end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days from now
        },
        teamMembers: [], // Default empty array (could be extended from API if needed)
        type: 'Software' as const, // Default type (could be extended from API if needed)
        tasks: [] // Default empty tasks (will be loaded separately if needed)
      };

      console.log('Converted to frontend Project:', frontendProject);
      setProject(frontendProject);
      
    } catch (err) {
      console.error('Failed to fetch project:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project';
      setError(errorMessage);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchProject();
  };

  useEffect(() => {
    fetchProject();
  }, [projectId, template]);

  return {
    project,
    loading,
    error,
    refetch
  };
};

/**
 * Helper function to generate project key from project name
 */
function generateProjectKey(name: string): string {
  if (!name) return 'PRJ';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 3);
}
