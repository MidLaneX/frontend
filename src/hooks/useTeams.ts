import { useState, useEffect } from "react";

interface MockTeam {
  id: number;
  name: string;
  description?: string;
  memberCount?: number;
}

// Mock teams data - in a real app, this would come from an API
// Using team IDs that match backend (1, 2, 3, etc.)
const mockTeams: Team[] = [
  {
    id: 1,
    name: "Development Team Alpha",
    description: "Frontend & Backend developers",
    memberCount: 8,
  },
  {
    id: 2,
    name: "Development Team Beta",
    description: "Mobile app developers",
    memberCount: 6,
  },
  {
    id: 3,
    name: "Design Team",
    description: "UI/UX designers and researchers",
    memberCount: 4,
  },
  {
    id: 4,
    name: "QA Team",
    description: "Quality assurance engineers",
    memberCount: 5,
  },
  {
    id: 5,
    name: "DevOps Team",
    description: "Infrastructure and deployment",
    memberCount: 3,
  },
  {
    id: 6,
    name: "Data Team",
    description: "Data scientists and analysts",
    memberCount: 4,
  },
];

export const useTeams = () => {
  const [teams, setTeams] = useState<MockTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchTeams = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // const response = await TeamsService.getAllTeams();
        // setTeams(response.data);

        // For now, use mock data
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
        setTeams(mockTeams);
      } catch (err: any) {
        setError(err.message || "Failed to load teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const getTeamById = (id: number): Team | undefined => {
    return teams.find((team) => team.id === id);
  };

  const getTeamOptions = () => {
    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      label: `${team.name} (${team.memberCount} members)`,
    }));
  };

  return {
    teams,
    loading,
    error,
    getTeamById,
    getTeamOptions,
  };
};
