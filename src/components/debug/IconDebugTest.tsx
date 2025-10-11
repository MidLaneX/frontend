import React from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import RemoveIcon from '@mui/icons-material/Remove';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Debug component to test if Material-UI icons are rendering
 * Add this to your App.tsx temporarily to test: <IconDebugTest />
 */
const IconDebugTest: React.FC = () => {
  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 100,
        right: 20,
        padding: 2,
        zIndex: 9999,
        bgcolor: 'primary.main',
        color: 'white',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Icon Test
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
            <ChatIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption">Chat</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
            <RemoveIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption">Remove (Minimize)</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
            <CropSquareIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption">CropSquare (Fullscreen)</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
            <OpenInNewIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption">OpenInNew</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption">ChevronLeft</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
            <CloseFullscreenIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption">CloseFullscreen</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption">Close</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default IconDebugTest;
