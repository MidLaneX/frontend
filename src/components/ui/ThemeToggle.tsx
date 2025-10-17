import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useTheme } from "@/context/useTheme";
import { ENV } from "@/config/env";

const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useTheme();

  // Don't render if theme toggle is disabled in environment
  if (!ENV.ENABLE_THEME_TOGGLE) {
    return null;
  }

  return (
    <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        size="medium"
        sx={{
          ml: 1,
          p: 1.5,
          borderRadius: 2,
          bgcolor: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.1)",
          transition: "all 0.3s ease",
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.15)",
            transform: "scale(1.05)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          },
        }}
      >
        {mode === "dark" ? (
          <Brightness7 sx={{ fontSize: 22 }} />
        ) : (
          <Brightness4 sx={{ fontSize: 22 }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
