import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Business as OrganizationIcon,
  Group as TeamIcon,
  Folder as ProjectIcon,
  Person as ProfileIcon,
  Info as AboutIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';

const drawerWidth = 280;

interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { userProfile, user } = useAuth();
  const { getCurrentPlanData } = useSubscriptionLimits();
  const currentPlanData = getCurrentPlanData();

  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { name: 'Organizations', icon: <OrganizationIcon />, path: '/organizations' },
    { name: 'Teams', icon: <TeamIcon />, path: '/teams' },
    { name: 'Projects', icon: <ProjectIcon />, path: '/projects' },
  ];

  const settingsItems: NavigationItem[] = [
    { name: 'Profile & Settings', icon: <ProfileIcon />, path: '/account/settings' },
    { name: 'About', icon: <AboutIcon />, path: '/about' },
    { name: 'Help', icon: <HelpIcon />, path: '/help' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const renderNavigationItem = (item: NavigationItem) => (
    <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        component={Link}
        to={item.path}
        selected={isActivePath(item.path)}
        sx={{
          mx: 2,
          borderRadius: 3,
          py: 1.5,
          px: 2,
          minHeight: 48,
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0 0%, #7b1fa2 100%)',
              boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 36,
            color: isActivePath(item.path) ? 'white' : 'text.secondary',
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.name}
          primaryTypographyProps={{
            fontSize: 15,
            fontWeight: isActivePath(item.path) ? 700 : 500,
            color: isActivePath(item.path) ? 'white' : 'text.primary',
          }}
        />
      </ListItemButton>
    </ListItem>
  );

  const renderSettingsItem = (item: NavigationItem) => (
    <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        component={Link}
        to={item.path}
        selected={isActivePath(item.path)}
        sx={{
          mx: 2,
          borderRadius: 2,
          py: 1,
          px: 2,
          minHeight: 40,
          '&.Mui-selected': {
            backgroundColor: 'action.selected',
            color: 'primary.main',
            '& .MuiListItemIcon-root': {
              color: 'primary.main',
            },
          },
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          transition: 'all 0.2s ease',
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 32,
            color: isActivePath(item.path) ? 'primary.main' : 'text.secondary',
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.name}
          primaryTypographyProps={{
            fontSize: 13,
            fontWeight: isActivePath(item.path) ? 600 : 400,
            color: isActivePath(item.path) ? 'primary.main' : 'text.secondary',
          }}
        />
      </ListItemButton>
    </ListItem>
  );

  // Function to get user initials
  const getUserInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name.charAt(0).toUpperCase()}${userProfile.last_name.charAt(0).toUpperCase()}`;
    }
    if (userProfile?.first_name) {
      return userProfile.first_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Function to get full name
  const getFullName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    return user?.name || 'User';
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
          backgroundColor: 'background.paper',
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.06)',
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(156, 39, 176, 0.03) 100%)',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
          }}
        >
          <Typography
            sx={{
              color: 'white',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            {getUserInitials()}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              fontSize: '1rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {getFullName()}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'success.main',
                mr: 1,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 },
                },
              }}
            />
            Online
          </Typography>
        </Box>
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        <Box sx={{ px: 2, mb: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: '0.7rem',
              px: 2,
            }}
          >
            Main Menu
          </Typography>
        </Box>
        <List sx={{ px: 0 }}>
          {navigationItems.map(renderNavigationItem)}
        </List>

        <Divider sx={{ mx: 3, my: 3, opacity: 0.6 }} />

        {/* Settings Navigation */}
        <Box sx={{ px: 2, mb: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: '0.7rem',
              px: 2,
            }}
          >
            Settings
          </Typography>
        </Box>
        <List sx={{ px: 0 }}>
          {settingsItems.map(renderSettingsItem)}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 3,
          borderTop: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.06)',
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(156, 39, 176, 0.03) 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.primary',
                fontWeight: 700,
                fontSize: '0.75rem',
                display: 'block',
              }}
            >
              ProjectFlow
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.7rem',
              }}
            >
              v2.1.0
            </Typography>
          </Box>
          <Chip 
            label={currentPlanData.name} 
            size="small" 
            sx={{ 
              bgcolor: currentPlanData.color,
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 700,
              height: 20,
            }} 
          />
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;