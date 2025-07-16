import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonIcon from '@mui/icons-material/Person';
import FlagIcon from '@mui/icons-material/Flag';
import CategoryIcon from '@mui/icons-material/Category';

interface ProjectFiltersProps {
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: FilterState) => void;
  teamMembers: Array<{ name: string; avatar?: string; role: string }>;
}

export interface FilterState {
  assignee: string[];
  priority: string[];
  type: string[];
  status: string[];
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ 
  onSearchChange, 
  onFiltersChange, 
  teamMembers 
}) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    assignee: [],
    priority: [],
    type: [],
    status: []
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterType, setFilterType] = useState<keyof FilterState | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
    onSearchChange(value);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>, type: keyof FilterState) => {
    setAnchorEl(event.currentTarget);
    setFilterType(type);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
    setFilterType(null);
  };

  const handleFilterSelect = (value: string) => {
    if (!filterType) return;
    
    const newFilters = { ...filters };
    if (newFilters[filterType].includes(value)) {
      newFilters[filterType] = newFilters[filterType].filter(v => v !== value);
    } else {
      newFilters[filterType] = [...newFilters[filterType], value];
    }
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const removeFilter = (type: keyof FilterState, value: string) => {
    const newFilters = { ...filters };
    newFilters[type] = newFilters[type].filter(v => v !== value);
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      assignee: [],
      priority: [],
      type: [],
      status: []
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const getFilterOptions = () => {
    switch (filterType) {
      case 'assignee':
        return teamMembers.map(member => member.name);
      case 'priority':
        return ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
      case 'type':
        return ['Task', 'Story', 'Bug', 'Epic'];
      case 'status':
        return ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];
      default:
        return [];
    }
  };

  const getFilterIcon = (type: keyof FilterState) => {
    switch (type) {
      case 'assignee':
        return <PersonIcon fontSize="small" />;
      case 'priority':
        return <FlagIcon fontSize="small" />;
      case 'type':
        return <CategoryIcon fontSize="small" />;
      default:
        return <FilterListIcon fontSize="small" />;
    }
  };

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  return (
    <Box sx={{ mb: 3 }}>
      {/* Search and Filter Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search issues..."
          value={search}
          onChange={handleSearchChange}
          size="small"
          sx={{ 
            minWidth: 300,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#5E6C84' }} />
              </InputAdornment>
            ),
          }}
        />
        
        {(['assignee', 'priority', 'type', 'status'] as Array<keyof FilterState>).map((type) => (
          <Button
            key={type}
            variant="outlined"
            size="small"
            startIcon={getFilterIcon(type)}
            onClick={(e) => handleFilterClick(e, type)}
            sx={{
              textTransform: 'capitalize',
              bgcolor: filters[type].length > 0 ? '#E3FCEF' : 'white',
              borderColor: filters[type].length > 0 ? '#00875A' : '#DFE1E6',
              color: filters[type].length > 0 ? '#00875A' : '#5E6C84',
              '&:hover': {
                bgcolor: filters[type].length > 0 ? '#D3F2E0' : '#F4F5F7',
              }
            }}
          >
            {type}
            {filters[type].length > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 0.5,
                  py: 0.25,
                  bgcolor: filters[type].length > 0 ? '#00875A' : '#5E6C84',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '0.75rem',
                  minWidth: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {filters[type].length}
              </Box>
            )}
          </Button>
        ))}
        
        {hasActiveFilters && (
          <Button
            size="small"
            onClick={clearAllFilters}
            sx={{ 
              color: '#5E6C84',
              textTransform: 'none',
              textDecoration: 'underline'
            }}
          >
            Clear all
          </Button>
        )}
      </Box>

      {/* Active Filters */}
      {hasActiveFilters && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#5E6C84', mr: 1, py: 0.5 }}>
            Active filters:
          </Typography>
          {Object.entries(filters).map(([type, values]) =>
            values.map((value: string) => (
              <Chip
                key={`${type}-${value}`}
                label={`${type}: ${value}`}
                onDelete={() => removeFilter(type as keyof FilterState, value)}
                size="small"
                sx={{
                  bgcolor: '#E3FCEF',
                  color: '#00875A',
                  '& .MuiChip-deleteIcon': {
                    color: '#00875A'
                  }
                }}
              />
            ))
          )}
        </Box>
      )}

      {/* Filter Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            minWidth: 200,
            maxHeight: 300
          }
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#172B4D', mb: 1 }}>
            Filter by {filterType}
          </Typography>
          <Divider sx={{ mb: 1 }} />
        </Box>
        {getFilterOptions().map((option) => (
          <MenuItem
            key={option}
            onClick={() => handleFilterSelect(option)}
            sx={{
              bgcolor: filterType && filters[filterType].includes(option) ? '#E3FCEF' : 'transparent',
              color: filterType && filters[filterType].includes(option) ? '#00875A' : '#172B4D',
              '&:hover': {
                bgcolor: filterType && filters[filterType].includes(option) ? '#D3F2E0' : '#F4F5F7'
              }
            }}
          >
            {option}
            {filterType && filters[filterType].includes(option) && (
              <Box sx={{ ml: 'auto', color: '#00875A' }}>✓</Box>
            )}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default ProjectFilters;
