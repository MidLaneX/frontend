import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface QuickSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const QuickSearch: React.FC<QuickSearchProps> = ({ onSearch, placeholder = "Search issues, projects..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleQuickSearchClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const quickSearchOptions = [
    'Recently viewed',
    'Assigned to me',
    'Created by me',
    'Recently updated',
    'Done issues',
    'All projects'
  ];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        size="small"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        sx={{
          minWidth: 300,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'rgba(255,255,255,0.1)',
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255,255,255,0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'white',
            },
          },
          '& .MuiInputBase-input': {
            color: 'white',
            '&::placeholder': {
              color: 'rgba(255,255,255,0.7)',
              opacity: 1,
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
            </InputAdornment>
          ),
        }}
      />
      
      <Button
        onClick={handleQuickSearchClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          color: 'white',
          textTransform: 'none',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
        }}
      >
        Filters
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
          }
        }}
      >
        {quickSearchOptions.map((option) => (
          <MenuItem key={option} onClick={handleClose}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default QuickSearch;
