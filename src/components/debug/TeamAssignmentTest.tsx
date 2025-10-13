import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { ProjectService } from "../../services/ProjectService";

const TeamAssignmentTest: React.FC = () => {
  const testAssignTeam = async () => {
    try {
      console.log("Testing team assignment...");

      const result = await ProjectService.assignTeamToProject(
        1, // projectId
        "scrum", // templateType
        1, // teamId
      );

      console.log("Test successful! Result:", result);
      alert(
        `Team assignment successful! Assigned ${result.length} team members to project.`,
      );
    } catch (error) {
      console.error("Test failed:", error);
      alert(`Test failed: ${error}`);
    }
  };

  return (
    <Box sx={{ p: 2, border: "1px dashed #ccc", borderRadius: 1, m: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Team Assignment Test
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This will test assigning Team ID 1 to Project ID 1 with template 'scrum'
      </Typography>
      <Button
        variant="contained"
        onClick={testAssignTeam}
        sx={{ textTransform: "none" }}
      >
        Test Team Assignment
      </Button>
    </Box>
  );
};

export default TeamAssignmentTest;
