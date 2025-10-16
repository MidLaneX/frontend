import React, { useState, useEffect } from 'react'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar, 
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Divider,
  Chip,
  Tooltip
} from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import NotificationsIcon from '@mui/icons-material/Notifications'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import WorkIcon from '@mui/icons-material/Work'
import FilterListIcon from '@mui/icons-material/FilterList'
import FolderIcon from '@mui/icons-material/Folder'
import AddIcon from '@mui/icons-material/Add'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import QuickSearch from '@/components/ui/QuickSearch'
import { useAuth } from '@/context/AuthContext'
import { useSubscription } from '@/context/SubscriptionContext'
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits'

const Navbar: React.FC = () => {
  const location = useLocation()
  const { logout, userProfile, fetchUserProfile, user } = useAuth()
  const { currentPlan } = useSubscription()
  const { getCurrentPlanData } = useSubscriptionLimits()
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null)
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null)
  const [createMenuAnchor, setCreateMenuAnchor] = useState<null | HTMLElement>(null)

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget)
  }

  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget)
  }

  const handleCreateClick = (event: React.MouseEvent<HTMLElement>) => {
    setCreateMenuAnchor(event.currentTarget)
  }

  const handleCloseMenus = () => {
    setProfileMenuAnchor(null)
    setNotificationsAnchor(null)
    setCreateMenuAnchor(null)
  }

  const handleLogout = () => {
    logout()
    handleCloseMenus()
  }

  // Fetch user profile when component mounts
  useEffect(() => {
    if (user && !userProfile) {
      fetchUserProfile()
    }
  }, [user, userProfile, fetchUserProfile])

  const isActiveRoute = (path: string) => {
    return location.pathname === path
  }

  // Function to get initials from user name
  const getUserInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name.charAt(0).toUpperCase()}${userProfile.last_name.charAt(0).toUpperCase()}`
    }
    if (userProfile?.first_name) {
      return userProfile.first_name.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U' // Default fallback
  }

  // Function to get full name from user profile
  const getFullName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`
    }
    if (userProfile?.first_name) {
      return userProfile.first_name
    }
    return user?.name || 'User'
  }

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Toolbar sx={{ minHeight: '68px !important', px: { xs: 2, md: 4 } }}>
        {/* Logo and Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: { xs: 2, md: 6 } }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            }}
          >
            <Typography sx={{ 
              color: 'white', 
              fontWeight: 900, 
              fontSize: 18,
            }}>
              P
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/dashboard" 
            sx={{ 
              textDecoration: 'none',
              color: 'text.primary',
              fontWeight: 800,
              fontSize: '20px',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              '&:hover': {
                transform: 'scale(1.02)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            ProjectFlow
          </Typography>
        </Box>
        
        {/* Navigation Links */}
        {/* <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Tooltip title="View your assigned work" arrow>
            <Button 
              color="inherit" 
              component={Link} 
              to="/dashboard"
              startIcon={<WorkIcon sx={{ fontSize: '18px !important' }} />}
              sx={{ 
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                px: 2.5,
                py: 1.25,
                borderRadius: 2,
                bgcolor: isActiveRoute('/dashboard') ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: isActiveRoute('/dashboard') ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.12)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.3s ease',
                minWidth: 'auto'
              }}
            >
              Your work
            </Button>
          </Tooltip>
          
          <Tooltip title="Browse all projects" arrow>
            <Button 
              color="inherit" 
              component={Link} 
              to="/projects"
              startIcon={<FolderIcon sx={{ fontSize: '18px !important' }} />}
              sx={{ 
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                px: 2.5,
                py: 1.25,
                borderRadius: 2,
                bgcolor: isActiveRoute('/projects') ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: isActiveRoute('/projects') ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.12)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.3s ease',
                minWidth: 'auto'
              }}
            >
              Projects
            </Button>
          </Tooltip>

          <Tooltip title="Filter and search" arrow>
            <Button 
              color="inherit"
              startIcon={<FilterListIcon sx={{ fontSize: '18px !important' }} />}
              sx={{ 
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                px: 2.5,
                py: 1.25,
                borderRadius: 2,
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.12)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.3s ease',
                minWidth: 'auto'
              }}
            >
              Filters
            </Button>
          </Tooltip>

          <Tooltip title="View dashboards and reports" arrow>
            <Button 
              color="inherit"
              component={Link}
              to="/"
              startIcon={<DashboardIcon sx={{ fontSize: '18px !important' }} />}
              sx={{ 
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                px: 2.5,
                py: 1.25,
                borderRadius: 2,
                bgcolor: isActiveRoute('/') ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: isActiveRoute('/') ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.12)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.3s ease',
                minWidth: 'auto'
              }}
            >
              Dashboards
            </Button>
          </Tooltip>
        </Box> */}
        
        {/* Search - Centered */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mx: 4 }}>
          <QuickSearch />
        </Box>
        
        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Create Button with Dropdown */}
          <Tooltip title="Create new item" arrow>
            <Button
              variant="contained"
              onClick={handleCreateClick}
              endIcon={<KeyboardArrowDownIcon sx={{ ml: 0.5 }} />}
              startIcon={<AddIcon />}
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                color: 'white',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '14px',
                px: 3,
                py: 1.25,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                border: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #7b1fa2 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Create
            </Button>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications" arrow>
            <IconButton 
              onClick={handleNotificationsClick}
              sx={{ 
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': { 
                  bgcolor: 'action.selected',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <Badge 
                badgeContent={3} 
                color="error" 
                sx={{ 
                  '& .MuiBadge-badge': { 
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                    border: '2px solid',
                    borderColor: 'background.paper',
                  } 
                }}
              >
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Help */}
          <Tooltip title="Help and support" arrow>
            <IconButton 
              component={Link}
              to="/help"
              sx={{ 
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': { 
                  bgcolor: 'action.selected',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <HelpOutlineIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          
          {/* Profile */}
          <Tooltip title="Your profile and settings" arrow>
            <IconButton onClick={handleProfileClick} sx={{ p: 0, ml: 1 }}>
              <Avatar 
                sx={{ 
                  width: 38, 
                  height: 38, 
                  background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                  fontWeight: 700,
                  fontSize: '16px',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  border: '2px solid',
                  borderColor: 'background.paper',
                  '&:hover': {
                    transform: 'scale(1.08)',
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {getUserInitials()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Create Menu */}
        <Menu
          anchorEl={createMenuAnchor}
          open={Boolean(createMenuAnchor)}
          onClose={handleCloseMenus}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 280,
              maxWidth: 320,
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.08)',
              overflow: 'visible',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 20,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                borderLeft: '1px solid rgba(0,0,0,0.08)',
                borderTop: '1px solid rgba(0,0,0,0.08)'
              }
            }
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #DFE1E6' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#172B4D', mb: 0.5 }}>
              Create new
            </Typography>
            <Typography variant="body2" sx={{ color: '#5E6C84', fontSize: '12px' }}>
              Choose what you'd like to create
            </Typography>
          </Box>
          <MenuItem 
            onClick={handleCloseMenus}
            component={Link}
            to="/organizations"
            sx={{ py: 2, px: 2.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box sx={{ 
                bgcolor: '#E3FCEF', 
                borderRadius: 1.5, 
                p: 1, 
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FolderIcon sx={{ color: '#00875A', fontSize: 20 }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  Project
                </Typography>
                <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                  Create a new project
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <MenuItem 
            onClick={handleCloseMenus}
            component={Link}
            to="/organizations"
            sx={{ py: 2, px: 2.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box sx={{ 
                bgcolor: '#DEEBFF', 
                borderRadius: 1.5, 
                p: 1, 
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <WorkIcon sx={{ color: '#1976d2', fontSize: 20 }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  Team
                </Typography>
                <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                  Create a new team
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <MenuItem 
            onClick={handleCloseMenus}
            component={Link}
            to="/organizations"
            sx={{ py: 2, px: 2.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box sx={{ 
                bgcolor: '#FFF4E6', 
                borderRadius: 1.5, 
                p: 1, 
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DashboardIcon sx={{ color: '#9c27b0', fontSize: 20 }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  Organization
                </Typography>
                <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                  Create a new organization
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleCloseMenus}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 380,
              maxWidth: 420,
              maxHeight: 480,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              '-ms-overflow-style': 'none',
              'scrollbar-width': 'none'
            }
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px', color: 'text.primary' }}>
                Notifications
              </Typography>
              <Chip 
                label="3 new" 
                size="small" 
                sx={{ 
                  bgcolor: 'error.main', 
                  color: 'white', 
                  fontWeight: 600, 
                  fontSize: '11px' 
                }} 
              />
            </Box>
          </Box>
          <MenuItem onClick={handleCloseMenus} sx={{ py: 2.5, px: 3, alignItems: 'flex-start', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 36, height: 36, fontSize: '14px' }}>
                  JM
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                    Task assigned to you
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px', lineHeight: 1.4 }}>
                    <strong>John Miller</strong> assigned <strong>PROJ-123: Fix dashboard bug</strong> to you
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '11px', mt: 1, display: 'block' }}>
                    2 hours ago
                  </Typography>
                </Box>
                <Chip 
                  label="New" 
                  size="small" 
                  sx={{ bgcolor: 'success.main', color: 'white', fontSize: '10px', fontWeight: 600 }} 
                />
              </Box>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleCloseMenus} sx={{ py: 2.5, px: 3, alignItems: 'flex-start', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2, width: 36, height: 36, fontSize: '14px' }}>
                  ✓
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                    Sprint completed successfully
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px', lineHeight: 1.4 }}>
                    <strong>Sprint 23</strong> has been completed with 18/20 tasks resolved
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '11px', mt: 1, display: 'block' }}>
                    1 day ago
                  </Typography>
                </Box>
              </Box>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleCloseMenus} sx={{ py: 2.5, px: 3, alignItems: 'flex-start' }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2, width: 36, height: 36, fontSize: '14px' }}>
                  !
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                    Review required
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px', lineHeight: 1.4 }}>
                    Project <strong>E-Commerce Platform</strong> is waiting for your review
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '11px', mt: 1, display: 'block' }}>
                    3 days ago
                  </Typography>
                </Box>
              </Box>
            </Box>
          </MenuItem>
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Button 
              size="small" 
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600, 
                color: 'primary.main',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              View all notifications
            </Button>
          </Box>
        </Menu>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={handleCloseMenus}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 280,
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.08)'
            }
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid #DFE1E6' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ 
                bgcolor: '#FF5722', 
                mr: 2, 
                width: 48, 
                height: 48, 
                fontSize: '18px',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(255,87,34,0.3)'
              }}>
                {getUserInitials()}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#172B4D' }}>
                  {getFullName()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#5E6C84', fontSize: '13px' }}>
                  {userProfile?.email || user?.email || 'user@example.com'}
                </Typography>
                <Chip 
                  label={getCurrentPlanData().name} 
                  size="small" 
                  sx={{ 
                    bgcolor: getCurrentPlanData().color, 
                    color: 'white', 
                    fontSize: '10px', 
                    fontWeight: 600,
                    mt: 0.5
                  }} 
                />
              </Box>
            </Box>
          </Box>
          <MenuItem onClick={handleCloseMenus} component={Link} to="/account/settings" sx={{ py: 2, px: 3 }}>
            <SettingsIcon sx={{ mr: 2.5, fontSize: 22, color: '#5E6C84' }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D' }}>
                Account settings
              </Typography>
              <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                Manage your account
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleCloseMenus} sx={{ py: 2, px: 3 }}>
            <HelpOutlineIcon sx={{ mr: 2.5, fontSize: 22, color: '#5E6C84' }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D' }}>
                Help & support
              </Typography>
              <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                Get help and support
              </Typography>
            </Box>
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem 
            onClick={handleLogout} 
            sx={{ 
              py: 2, 
              px: 3, 
              color: '#DE350B',
              '&:hover': { bgcolor: '#FFEBE6' }
            }}
          >
            <LogoutIcon sx={{ mr: 2.5, fontSize: 22 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Log out
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Sign out of your account
              </Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
