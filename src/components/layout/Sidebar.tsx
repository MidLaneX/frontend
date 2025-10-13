import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import {
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Favorite as ForYouIcon,
  Info as AboutIcon,
  Help as HelpIcon,
  Business as OrganizationIcon,
} from "@mui/icons-material";

const drawerWidth = 280;

interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    { name: "For You", icon: <ForYouIcon />, path: "/welcome" },
    {
      name: "Organizations",
      icon: <OrganizationIcon />,
      path: "/organizations",
    },
    {
      name: "Profile & Settings",
      icon: <ProfileIcon />,
      path: "/account/settings",
    },
    { name: "About", icon: <AboutIcon />, path: "/about" },
    { name: "Help", icon: <HelpIcon />, path: "/help" },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const renderNavigationItem = (item: NavigationItem) => (
    <ListItem key={item.name} disablePadding>
      <ListItemButton
        component={Link}
        to={item.path}
        selected={isActivePath(item.path)}
        sx={{
          mx: 1,
          borderRadius: 1,
          "&.Mui-selected": {
            backgroundColor: "primary.light",
            color: "primary.contrastText",
            "&:hover": {
              backgroundColor: "primary.main",
            },
          },
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <ListItemIcon
          sx={{
            color: isActivePath(item.path) ? "primary.contrastText" : "inherit",
            minWidth: 40,
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.name}
          primaryTypographyProps={{
            fontSize: 14,
            fontWeight: isActivePath(item.path) ? 600 : 400,
          }}
        />
      </ListItemButton>
    </ListItem>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            backgroundColor: "primary.main",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          PM
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            Project Manager
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Workspace
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List sx={{ pt: 2, pb: 1 }}>
          {navigationItems.map(renderNavigationItem)}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="text.secondary" align="center">
          © 2025 Project Manager
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
