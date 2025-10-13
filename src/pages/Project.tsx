import React from "react";
import Box from "@mui/material/Box";
import ProjectPage from "@/components/features/project/Project";

const Project: React.FC = () => {
  return (
    <Box
      sx={{
        bgcolor: "#f7f8f9",
        minHeight: "calc(100vh - 64px)", // Account for navbar
        overflow: "auto",
        p: 0,
      }}
    >
      <ProjectPage />
    </Box>
  );
};

export default Project;
