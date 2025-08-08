import { useState, useEffect } from 'react';
import type { Project } from '../types';
import { ProjectService } from '../services/ProjectService'; // adjust path if needed

interface UseUserProjectFeaturesResult {
  features: Project['features'];  // whatever type features is
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch features of a project by its ID and templateType.
 * It uses ProjectService.getProjectById internally.
 */
export function useUserProjectFeatures(
  projectId: number,
  templateType: string
): UseUserProjectFeaturesResult {
  const [features, setFeatures] = useState<Project['features']>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId || !templateType) {
      setFeatures([]);
      setError('Project ID and templateType are required');
      return;
    }

    setLoading(true);
    setError(null);

    ProjectService.getProjectById(projectId, templateType)
      .then(project => {
        if (project && project.features) {
          setFeatures(project.features);
        } else {
          setFeatures([]);
          setError('No features found for this project');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch project features:', err);
        setError('Failed to load project features');
        setFeatures([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId, templateType]);

  return { features, loading, error };
}
