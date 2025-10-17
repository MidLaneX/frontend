import React from "react";
import {
  Box,
  Paper,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import {
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
} from "@mui/icons-material";

interface ProjectControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: string;
  onFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  projectCount: number;
}

const ProjectControls: React.FC<ProjectControlsProps> = ({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  projectCount,
}) => {
  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        borderRadius: 2.5,
        border: "1px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Left section - Title and count */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              fontSize: "1.1rem",
              letterSpacing: "0.01em",
              color: "#1e293b",
            }}
          >
            Projects
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: "#64748b",
              fontWeight: 600,
              fontSize: "0.85rem",
              px: 1.5,
              py: 0.5,
              background: "rgba(102, 126, 234, 0.1)",
              borderRadius: 1,
              border: "1px solid rgba(102, 126, 234, 0.2)",
            }}
          >
            {projectCount} {projectCount === 1 ? "project" : "projects"}
          </Typography>
        </Box>

        {/* Right section - Controls */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          {/* Search */}
          <TextField
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            size="small"
            sx={{ 
              minWidth: 200,
              "& .MuiOutlinedInput-root": {
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: 1.5,
                fontWeight: 500,
                fontSize: "0.9rem",
                "&:hover fieldset": {
                  borderColor: "rgba(102, 126, 234, 0.4)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#667eea",
                  borderWidth: "2px",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#667eea", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Filter by type */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ fontWeight: 600, fontSize: "0.9rem" }}>Type</InputLabel>
            <Select
              value={filterType}
              label="Type"
              onChange={(e) => onFilterChange(e.target.value)}
              sx={{
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: 1.5,
                fontWeight: 600,
                fontSize: "0.9rem",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(102, 126, 234, 0.4)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#667eea",
                  borderWidth: "2px",
                },
              }}
            >
              <MenuItem value="all" sx={{ fontWeight: 500 }}>All Types</MenuItem>
              <MenuItem value="software" sx={{ fontWeight: 500 }}>Software</MenuItem>
              <MenuItem value="business" sx={{ fontWeight: 500 }}>Business</MenuItem>
              <MenuItem value="classic" sx={{ fontWeight: 500 }}>Classic</MenuItem>
            </Select>
          </FormControl>

          {/* Sort by */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ fontWeight: 600, fontSize: "0.9rem" }}>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => onSortChange(e.target.value)}
              sx={{
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: 1.5,
                fontWeight: 600,
                fontSize: "0.9rem",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(102, 126, 234, 0.4)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#667eea",
                  borderWidth: "2px",
                },
              }}
            >
              <MenuItem value="name" sx={{ fontWeight: 500 }}>Name</MenuItem>
              <MenuItem value="progress" sx={{ fontWeight: 500 }}>Progress</MenuItem>
              <MenuItem value="date" sx={{ fontWeight: 500 }}>Date</MenuItem>
            </Select>
          </FormControl>

          {/* View toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && onViewModeChange(newMode)}
            size="small"
            sx={{
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: 1.5,
              "& .MuiToggleButton-root": {
                borderColor: "rgba(102, 126, 234, 0.2)",
                color: "#64748b",
                fontWeight: 600,
                "&.Mui-selected": {
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#ffffff",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a3f8c 100%)",
                  },
                },
                "&:hover": {
                  background: "rgba(102, 126, 234, 0.08)",
                },
              },
            }}
          >
            <ToggleButton value="grid" aria-label="grid view">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ListViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProjectControls;
