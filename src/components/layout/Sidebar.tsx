import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';

// Navigation Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import WorkIcon from '@mui/icons-material/Work';

import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 280;

interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  isActive?: boolean;
}

interface ProjectItem {
  id: string;
  name: string;
  key: string;
  avatar: string;
  type: 'Software' | 'Business' | 'Service Desk';
  starred: boolean;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [recentExpanded, setRecentExpanded] = useState(true);

  const mainNavigation: NavigationItem[] = [
    { name: 'Your work', icon: <WorkIcon />, path: '/', badge: 3 },
    { name: 'Projects', icon: <FolderIcon />, path: '/projects' },
    { name: 'Organizations', icon: <FolderIcon />, path: '/organizations' },
    { name: 'Filters', icon: <FormatListBulletedIcon />, path: '/filters' },
    { name: 'Dashboards', icon: <DashboardIcon />, path: '/dashboards' },
    { name: 'People', icon: <PeopleIcon />, path: '/people' },
  ];

  const recentProjects: ProjectItem[] = [
    {
      id: '1',
      name: 'E-Commerce Platform',
      key: 'ECP',
      avatar: '🛒',
      type: 'Software',
      starred: true
    },
    {
      id: '2',
      name: 'Mobile App Development',
      key: 'MAD',
      avatar: '📱',
      type: 'Software',
      starred: false
    },
    {
      id: '3',
      name: 'Marketing Campaign',
      key: 'MC',
      avatar: '📢',
      type: 'Business',
      starred: true
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const renderNavigationItem = (item: NavigationItem) => (
    <ListItem key={item.name} disablePadding>
      <ListItemButton
        component={Link}
        to={item.path}
        sx={{
          borderRadius: 1,
          mb: 0.5,
          backgroundColor: isActivePath(item.path) ? '#E3FCEF' : 'transparent',
          color: isActivePath(item.path) ? '#00875A' : '#172B4D',
          '&:hover': {
            backgroundColor: isActivePath(item.path) ? '#D3F2E0' : '#EBECF0'
          },
          '& .MuiListItemIcon-root': {
            color: isActivePath(item.path) ? '#00875A' : '#5E6C84'
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          {item.badge ? (
            <Badge badgeContent={item.badge} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem' } }}>
              {item.icon}
            </Badge>
          ) : (
            item.icon
          )}
        </ListItemIcon>
        <ListItemText
          primary={item.name}
          primaryTypographyProps={{
            fontSize: 14,
            fontWeight: isActivePath(item.path) ? 600 : 500
          }}
        />
      </ListItemButton>
    </ListItem>
  );

  const renderProjectItem = (project: ProjectItem) => (
    <ListItem key={project.id} disablePadding>
      <ListItemButton
        component={Link}
        to={`/projects/${project.id}`}
        sx={{
          borderRadius: 1,
          mb: 0.5,
          backgroundColor: location.pathname === `/projects/${project.id}` ? '#E3FCEF' : 'transparent',
          color: location.pathname === `/projects/${project.id}` ? '#00875A' : '#172B4D',
          '&:hover': {
            backgroundColor: location.pathname === `/projects/${project.id}` ? '#D3F2E0' : '#EBECF0'
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          <Avatar
            sx={{
              width: 24,
              height: 24,
              fontSize: 14,
              bgcolor: '#DFE1E6',
              color: '#172B4D'
            }}
          >
            {project.avatar}
          </Avatar>
        </ListItemIcon>
        <ListItemText
          primary={project.name}
          secondary={`${project.key} • ${project.type}`}
          primaryTypographyProps={{
            fontSize: 14,
            fontWeight: location.pathname === `/projects/${project.id}` ? 600 : 500
          }}
          secondaryTypographyProps={{
            fontSize: 12,
            color: '#5E6C84'
          }}
        />
        {project.starred && (
          <StarIcon sx={{ fontSize: 16, color: '#FFAB00', ml: 1 }} />
        )}
      </ListItemButton>
    </ListItem>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        zIndex: 1200,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "#F4F5F7",
          borderRight: "1px solid #DFE1E6",
          position: "fixed",
          top: "68px", // Start below the navbar
          left: 0,
          height: "calc(100vh - 68px)", // Subtract navbar height
          margin: 0,
          padding: 0,
        },
      }}
    >
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          margin: 0,
          padding: 0,
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        }}
      >
        {/* Main Navigation */}
        <Box sx={{ p: 2, flex: "0 0 auto" }}>
          <List dense>{mainNavigation.map(renderNavigationItem)}</List>
        </Box>

        <Divider />

        {/* Recent Section */}
        <Box sx={{ px: 2, py: 1, flex: "0 0 auto" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#5E6C84",
                display: "block",
              }}
            >
              RECENT
            </Typography>
            <IconButton
              size="small"
              onClick={() => setRecentExpanded(!recentExpanded)}
              sx={{ color: "#5E6C84" }}
            >
              {recentExpanded ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
          <Collapse in={recentExpanded}>
            <List dense>
              {recentProjects.slice(0, 3).map(renderProjectItem)}
            </List>
          </Collapse>
        </Box>

        <Divider />

        {/* Projects Section */}
        <Box
          sx={{
            px: 2,
            py: 1,
            flex: "1 1 auto",
            overflow: "auto",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            "-ms-overflow-style": "none",
            "scrollbar-width": "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#5E6C84",
                display: "block",
              }}
            >
              PROJECTS
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip title="Create project">
                <IconButton size="small" sx={{ color: "#5E6C84" }}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton
                size="small"
                onClick={() => setProjectsExpanded(!projectsExpanded)}
                sx={{ color: "#5E6C84" }}
              >
                {projectsExpanded ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </IconButton>
            </Box>
          </Box>
          <Collapse in={projectsExpanded}>
            <List dense>
              {recentProjects.map(renderProjectItem)}
              <ListItem disablePadding>
                <ListItemButton
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    color: "#5E6C84",
                    "&:hover": { backgroundColor: "#EBECF0" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <AddIcon sx={{ fontSize: 20, color: "#5E6C84" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="View all projects"
                    primaryTypographyProps={{ fontSize: 14 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
        </Box>

        {/* Bottom Section */}
        <Box sx={{ p: 2, flex: "0 0 auto", mt: "auto" }}>
          <Divider sx={{ mb: 2 }} />

          {/* Quick Actions */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#5E6C84",
                mb: 1,
                display: "block",
              }}
            >
              QUICK ACTIONS
            </Typography>
            <List dense>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    "&:hover": { backgroundColor: "#EBECF0" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <AssignmentIcon sx={{ fontSize: 20, color: "#5E6C84" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Create issue"
                    primaryTypographyProps={{ fontSize: 14 }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    "&:hover": { backgroundColor: "#EBECF0" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <BarChartIcon sx={{ fontSize: 20, color: "#5E6C84" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="View reports"
                    primaryTypographyProps={{ fontSize: 14 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>

          {/* Settings */}
          <List dense>
            <ListItem disablePadding>
              <ListItemButton
                sx={{
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "#EBECF0" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <SettingsIcon sx={{ fontSize: 20, color: "#5E6C84" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Settings"
                  primaryTypographyProps={{ fontSize: 14 }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;