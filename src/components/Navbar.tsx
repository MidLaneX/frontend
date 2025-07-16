import React, { useState } from 'react'
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
  Tooltip,
  Paper
} from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import NotificationsIcon from '@mui/icons-material/Notifications'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import AppsIcon from '@mui/icons-material/Apps'
import SettingsIcon from '@mui/icons-material/Settings'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import WorkIcon from '@mui/icons-material/Work'
import FilterListIcon from '@mui/icons-material/FilterList'
import FolderIcon from '@mui/icons-material/Folder'
import AddIcon from '@mui/icons-material/Add'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import QuickSearch from './QuickSearch.tsx'

const Navbar: React.FC = () => {
  const location = useLocation()
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null)
  const [appsMenuAnchor, setAppsMenuAnchor] = useState<null | HTMLElement>(null)
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null)
  const [createMenuAnchor, setCreateMenuAnchor] = useState<null | HTMLElement>(null)

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget)
  }

  const handleAppsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAppsMenuAnchor(event.currentTarget)
  }

  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget)
  }

  const handleCreateClick = (event: React.MouseEvent<HTMLElement>) => {
    setCreateMenuAnchor(event.currentTarget)
  }

  const handleCloseMenus = () => {
    setProfileMenuAnchor(null)
    setAppsMenuAnchor(null)
    setNotificationsAnchor(null)
    setCreateMenuAnchor(null)
  }

  const isActiveRoute = (path: string) => {
    return location.pathname === path
  }

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: '#0052CC',
        boxShadow: '0 4px 20px rgba(0,82,204,0.25)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Toolbar sx={{ minHeight: '68px !important', px: { xs: 2, md: 4 } }}>
        {/* Logo and Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: { xs: 2, md: 6 } }}>
          <Paper 
            elevation={0}
            sx={{ 
              width: 42, 
              height: 42, 
              bgcolor: 'white', 
              borderRadius: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mr: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <Typography sx={{ 
              color: '#0052CC', 
              fontWeight: 900, 
              fontSize: 20,
              background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              M
            </Typography>
          </Paper>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              textDecoration: 'none',
              color: 'white',
              fontWeight: 900,
              fontSize: '22px',
              letterSpacing: '-0.8px',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              '&:hover': {
                textShadow: '0 4px 8px rgba(0,0,0,0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            MidLineX
          </Typography>
        </Box>
        
        {/* Navigation Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
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
        </Box>
        
        {/* Search - Centered */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mx: 4 }}>
          <QuickSearch />
        </Box>
        
        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Create Button with Dropdown */}
          <Tooltip title="Create new item" arrow>
            <Button
              variant="contained"
              onClick={handleCreateClick}
              endIcon={<KeyboardArrowDownIcon sx={{ ml: 0.5 }} />}
              startIcon={<AddIcon />}
              sx={{
                bgcolor: '#00875A',
                color: 'white',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '14px',
                px: 2.5,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 3px 8px rgba(0,135,90,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: '#006644',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,135,90,0.5)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Create
            </Button>
          </Tooltip>

          {/* Apps Menu */}
          <Tooltip title="Atlassian products" arrow>
            <IconButton 
              color="inherit" 
              onClick={handleAppsClick}
              sx={{ 
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <AppsIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>
          
          {/* Notifications */}
          <Tooltip title="Notifications" arrow>
            <IconButton 
              color="inherit" 
              onClick={handleNotificationsClick}
              sx={{ 
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <Badge 
                badgeContent={3} 
                color="error" 
                sx={{ 
                  '& .MuiBadge-badge': { 
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  } 
                }}
              >
                <NotificationsIcon sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Help */}
          <Tooltip title="Help and support" arrow>
            <IconButton 
              color="inherit" 
              sx={{ 
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <HelpOutlineIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>
          
          {/* Profile */}
          <Tooltip title="Your profile and settings" arrow>
            <IconButton onClick={handleProfileClick} sx={{ p: 0, ml: 1 }}>
              <Avatar 
                sx={{ 
                  width: 38, 
                  height: 38, 
                  bgcolor: '#FF5722',
                  fontWeight: 700,
                  fontSize: '16px',
                  boxShadow: '0 4px 12px rgba(255,87,34,0.4)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    transform: 'scale(1.08)',
                    boxShadow: '0 6px 20px rgba(255,87,34,0.6)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                PB
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
          <MenuItem onClick={handleCloseMenus} sx={{ py: 2, px: 2.5 }}>
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
          <MenuItem onClick={handleCloseMenus} sx={{ py: 2, px: 2.5 }}>
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
                <WorkIcon sx={{ color: '#0052CC', fontSize: 20 }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  Issue
                </Typography>
                <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                  Track a task, bug, or feature
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleCloseMenus} sx={{ py: 2, px: 2.5 }}>
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
                <DashboardIcon sx={{ color: '#FF8B00', fontSize: 20 }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  Board
                </Typography>
                <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                  Visualize and advance work
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        </Menu>

        {/* Apps Menu */}
        <Menu
          anchorEl={appsMenuAnchor}
          open={Boolean(appsMenuAnchor)}
          onClose={handleCloseMenus}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 260,
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.08)'
            }
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #DFE1E6' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#172B4D' }}>
              Atlassian products
            </Typography>
          </Box>
          <MenuItem onClick={handleCloseMenus} sx={{ py: 2, px: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box sx={{ 
                bgcolor: '#0052CC', 
                borderRadius: 1.5, 
                p: 1, 
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>M</Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  MidLineX
                </Typography>
                <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                  Project management
                </Typography>
              </Box>
              <Chip 
                label="Current" 
                size="small" 
                sx={{ bgcolor: '#E3FCEF', color: '#00875A', fontWeight: 600, fontSize: '10px' }} 
              />
            </Box>
          </MenuItem>
          <MenuItem onClick={handleCloseMenus} sx={{ py: 2, px: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box sx={{ 
                bgcolor: '#172B4D', 
                borderRadius: 1.5, 
                p: 1, 
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>C</Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  Confluence
                </Typography>
                <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                  Team workspace
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleCloseMenus} sx={{ py: 2, px: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box sx={{ 
                bgcolor: '#0052CC', 
                borderRadius: 1.5, 
                p: 1, 
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>B</Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  Bitbucket
                </Typography>
                <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                  Git repository
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
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 380,
              maxWidth: 420,
              maxHeight: 480,
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.08)',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              '-ms-overflow-style': 'none',
              'scrollbar-width': 'none'
            }
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid #DFE1E6' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px', color: '#172B4D' }}>
                Notifications
              </Typography>
              <Chip 
                label="3 new" 
                size="small" 
                sx={{ bgcolor: '#DE350B', color: 'white', fontWeight: 600, fontSize: '11px' }} 
              />
            </Box>
          </Box>
          <MenuItem onClick={handleCloseMenus} sx={{ py: 2.5, px: 3, alignItems: 'flex-start', borderBottom: '1px solid #F4F5F7' }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Avatar sx={{ bgcolor: '#0052CC', mr: 2, width: 36, height: 36, fontSize: '14px' }}>
                  JM
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: '#172B4D' }}>
                    Task assigned to you
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5E6C84', fontSize: '13px', lineHeight: 1.4 }}>
                    <strong>John Miller</strong> assigned <strong>ECP-123: Fix login bug</strong> to you
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8993A4', fontSize: '11px', mt: 1, display: 'block' }}>
                    2 hours ago
                  </Typography>
                </Box>
                <Chip 
                  label="New" 
                  size="small" 
                  sx={{ bgcolor: '#00875A', color: 'white', fontSize: '10px', fontWeight: 600 }} 
                />
              </Box>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleCloseMenus} sx={{ py: 2.5, px: 3, alignItems: 'flex-start', borderBottom: '1px solid #F4F5F7' }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Avatar sx={{ bgcolor: '#00875A', mr: 2, width: 36, height: 36, fontSize: '14px' }}>
                  ✓
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: '#172B4D' }}>
                    Sprint completed successfully
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5E6C84', fontSize: '13px', lineHeight: 1.4 }}>
                    <strong>Sprint 23</strong> has been completed with 18/20 issues resolved
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8993A4', fontSize: '11px', mt: 1, display: 'block' }}>
                    1 day ago
                  </Typography>
                </Box>
              </Box>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleCloseMenus} sx={{ py: 2.5, px: 3, alignItems: 'flex-start' }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Avatar sx={{ bgcolor: '#FF5722', mr: 2, width: 36, height: 36, fontSize: '14px' }}>
                  !
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: '#172B4D' }}>
                    Code review required
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5E6C84', fontSize: '13px', lineHeight: 1.4 }}>
                    Pull request <strong>#456</strong> is waiting for your review
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8993A4', fontSize: '11px', mt: 1, display: 'block' }}>
                    3 days ago
                  </Typography>
                </Box>
              </Box>
            </Box>
          </MenuItem>
          <Box sx={{ p: 2, borderTop: '1px solid #DFE1E6', textAlign: 'center' }}>
            <Button 
              size="small" 
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600, 
                color: '#0052CC',
                '&:hover': { bgcolor: '#F4F5F7' }
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
                PB
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#172B4D' }}>
                  Parakrama Rathnayaka
                </Typography>
                <Typography variant="body2" sx={{ color: '#5E6C84', fontSize: '13px' }}>
                  Parakramawork@midlinex.com
                </Typography>
                <Chip 
                  label="Premium" 
                  size="small" 
                  sx={{ 
                    bgcolor: '#FFAB00', 
                    color: 'white', 
                    fontSize: '10px', 
                    fontWeight: 600,
                    mt: 0.5
                  }} 
                />
              </Box>
            </Box>
          </Box>
          <MenuItem onClick={handleCloseMenus} sx={{ py: 2, px: 3 }}>
            <PersonIcon sx={{ mr: 2.5, fontSize: 22, color: '#5E6C84' }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D' }}>
                Profile
              </Typography>
              <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                View and edit your profile
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleCloseMenus} sx={{ py: 2, px: 3 }}>
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
            onClick={handleCloseMenus} 
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
